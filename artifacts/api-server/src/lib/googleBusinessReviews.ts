import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  randomUUID,
} from "node:crypto";
import type { Request } from "express";
import { and, eq, lt } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  googleBusinessOauthStates,
  googleReviewSettings,
  testimonials,
} from "@workspace/db/schema";
import { getAdminFromRequest } from "./adminAuth";
import { logger } from "./logger";

const GBP_SCOPE = "https://www.googleapis.com/auth/business.manage";
const GBP_API_BASE = "https://mybusiness.googleapis.com/v4";
let autoSyncTimer: NodeJS.Timeout | undefined;
let autoSyncInProgress = false;

type GoogleReview = {
  name?: string;
  starRating?: string;
  comment?: string;
  createTime?: string;
  updateTime?: string;
  reviewer?: { displayName?: string; profilePhotoUrl?: string };
};

type GoogleReviewPage = {
  reviews?: GoogleReview[];
  totalReviewCount?: number;
  nextPageToken?: string;
};

type GoogleAccountPage = {
  accounts?: Array<{ name?: string }>;
  nextPageToken?: string;
};

type GoogleLocationPage = {
  locations?: Array<{
    name?: string;
    title?: string;
    storefrontAddress?: {
      addressLines?: string[];
      locality?: string;
      administrativeArea?: string;
      postalCode?: string;
    };
  }>;
  nextPageToken?: string;
};

export class GoogleBusinessProfileError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
    this.name = "GoogleBusinessProfileError";
  }
}

function getOAuthCredentials() {
  const clientId = process.env.GOOGLE_BUSINESS_PROFILE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_BUSINESS_PROFILE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new GoogleBusinessProfileError(
      "Google Business Profile OAuth credentials are not configured",
      503,
    );
  }
  return { clientId, clientSecret };
}

function getEncryptionKey() {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    throw new GoogleBusinessProfileError(
      "SESSION_SECRET is required to encrypt the Google connection",
      503,
    );
  }
  return createHash("sha256").update(sessionSecret).digest();
}

function encryptRefreshToken(refreshToken: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(refreshToken, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

function decryptRefreshToken(value: string) {
  const [version, ivPart, tagPart, encryptedPart] = value.split(".");
  if (version !== "v1" || !ivPart || !tagPart || !encryptedPart) {
    throw new GoogleBusinessProfileError(
      "The saved Google connection cannot be decrypted",
      503,
    );
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(ivPart, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedPart, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

function getRedirectUri(req: Request) {
  const host = (req.get("x-forwarded-host") ?? req.get("host") ?? "")
    .split(",")[0]
    .trim();
  const forwardedProtocol = req.get("x-forwarded-proto")?.split(",")[0].trim();
  const protocol = forwardedProtocol || req.protocol || "https";
  if (!host || /[\r\n/\\]/.test(host)) {
    throw new GoogleBusinessProfileError("Could not determine the OAuth callback URL");
  }
  return new URL(
    "/api/admin/google-reviews/oauth/callback",
    `${protocol}://${host}`,
  ).toString();
}

export async function createGoogleAuthorizationUrl(req: Request) {
  const { clientId } = getOAuthCredentials();
  const admin = await getAdminFromRequest(req);
  if (!admin) throw new GoogleBusinessProfileError("Admin session expired", 401);

  const redirectUri = getRedirectUri(req);
  const state = randomUUID();
  await db.delete(googleBusinessOauthStates)
    .where(lt(googleBusinessOauthStates.expiresAt, new Date()));
  await db.insert(googleBusinessOauthStates).values({
    stateHash: createHash("sha256").update(state).digest("hex"),
    adminId: admin.id,
    redirectUri,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", GBP_SCOPE);
  authorizationUrl.searchParams.set("access_type", "offline");
  authorizationUrl.searchParams.set("prompt", "consent");
  authorizationUrl.searchParams.set("include_granted_scopes", "true");
  authorizationUrl.searchParams.set("state", state);

  return { authorizationUrl: authorizationUrl.toString(), redirectUri };
}

async function exchangeAuthorizationCode(code: string, redirectUri: string) {
  const { clientId, clientSecret } = getOAuthCredentials();
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const result = (await response.json()) as {
    refresh_token?: string;
    error_description?: string;
  };
  if (!response.ok || !result.refresh_token) {
    throw new GoogleBusinessProfileError(
      result.error_description || "Google did not return a refresh token",
      502,
    );
  }
  return result.refresh_token;
}

export async function completeGoogleAuthorization(
  req: Request,
  state: string,
  code: string,
) {
  const [stateData] = await db.delete(googleBusinessOauthStates)
    .where(eq(
      googleBusinessOauthStates.stateHash,
      createHash("sha256").update(state).digest("hex"),
    ))
    .returning();
  if (!stateData || stateData.expiresAt <= new Date()) {
    throw new GoogleBusinessProfileError("Google authorization expired; try again", 400);
  }
  const admin = await getAdminFromRequest(req);
  if (!admin || admin.id !== stateData.adminId) {
    throw new GoogleBusinessProfileError("Admin session expired; try again", 401);
  }

  const refreshToken = await exchangeAuthorizationCode(code, stateData.redirectUri);
  const encryptedToken = encryptRefreshToken(refreshToken);
  await db.transaction(async (tx) => {
    const [existing] = await tx.select().from(googleReviewSettings).limit(1).for("update");
    const now = new Date();
    await tx.update(testimonials)
      .set({ active: false, updatedAt: now })
      .where(eq(testimonials.source, "google"));
    if (existing) {
      await tx.update(googleReviewSettings)
        .set({
          businessProfileRefreshToken: encryptedToken,
          businessAccountName: null,
          businessLocationName: null,
          businessLocationTitle: null,
          totalReviewCount: 0,
          lastSyncedAt: null,
          lastSyncError: null,
          updatedAt: now,
        })
        .where(eq(googleReviewSettings.id, existing.id));
    } else {
      await tx.insert(googleReviewSettings).values({
        businessProfileRefreshToken: encryptedToken,
        minRating: 4,
      });
    }
  });
}

async function getSettings() {
  const [settings] = await db.select().from(googleReviewSettings).limit(1);
  if (!settings) throw new GoogleBusinessProfileError("Google reviews settings are missing", 500);
  return settings;
}

async function getAccessToken(encryptedRefreshToken: string) {
  const { clientId, clientSecret } = getOAuthCredentials();
  const refreshToken = decryptRefreshToken(encryptedRefreshToken);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const result = (await response.json()) as {
    access_token?: string;
    error_description?: string;
  };
  if (!response.ok || !result.access_token) {
    throw new GoogleBusinessProfileError(
      result.error_description || "Google authorization needs to be reconnected",
      502,
    );
  }
  return result.access_token;
}

async function googleGet<T>(url: URL, accessToken: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const body = (await response.json()) as T & {
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new GoogleBusinessProfileError(
      body.error?.message || "Google Business Profile API request failed",
      response.status === 401 ? 401 : 502,
    );
  }
  return body;
}

export async function listGoogleBusinessLocations() {
  const settings = await getSettings();
  if (!settings.businessProfileRefreshToken) {
    throw new GoogleBusinessProfileError("Connect a Google Business Profile account first", 400);
  }
  const token = await getAccessToken(settings.businessProfileRefreshToken);
  const accounts: string[] = [];
  let accountsPageToken: string | undefined;
  do {
    const url = new URL("https://mybusinessaccountmanagement.googleapis.com/v1/accounts");
    url.searchParams.set("pageSize", "20");
    if (accountsPageToken) url.searchParams.set("pageToken", accountsPageToken);
    const page = await googleGet<GoogleAccountPage>(url, token);
    accounts.push(...(page.accounts ?? []).flatMap((account) => account.name ? [account.name] : []));
    accountsPageToken = page.nextPageToken;
  } while (accountsPageToken);

  const locations: Array<{
    accountName: string;
    locationName: string;
    title: string;
    address: string | null;
  }> = [];
  for (const accountName of accounts) {
    let pageToken: string | undefined;
    do {
      const accountId = accountName.replace(/^accounts\//, "");
      const url = new URL(
        `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${encodeURIComponent(accountId)}/locations`,
      );
      url.searchParams.set("readMask", "name,title,storefrontAddress");
      url.searchParams.set("pageSize", "100");
      if (pageToken) url.searchParams.set("pageToken", pageToken);
      const page = await googleGet<GoogleLocationPage>(url, token);
      for (const location of page.locations ?? []) {
        if (!location.name || !location.title) continue;
        const addressParts = [
          ...(location.storefrontAddress?.addressLines ?? []),
          location.storefrontAddress?.locality,
          location.storefrontAddress?.administrativeArea,
          location.storefrontAddress?.postalCode,
        ].filter((part): part is string => Boolean(part));
        locations.push({
          accountName,
          locationName: location.name,
          title: location.title,
          address: addressParts.length ? addressParts.join(", ") : null,
        });
      }
      pageToken = page.nextPageToken;
    } while (pageToken);
  }
  return locations;
}

function ratingFromGoogle(value?: string) {
  const ratings: Record<string, number> = {
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
  };
  return value ? ratings[value] ?? 0 : 0;
}

function validDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function fetchAllReviewPages(
  accountName: string,
  locationName: string,
  accessToken: string,
) {
  const accountId = accountName.replace(/^accounts\//, "");
  const locationId = locationName.replace(/^locations\//, "");
  const endpoint = new URL(
    `${GBP_API_BASE}/accounts/${encodeURIComponent(accountId)}/locations/${encodeURIComponent(locationId)}/reviews`,
  );
  endpoint.searchParams.set("pageSize", "50");
  endpoint.searchParams.set("orderBy", "updateTime desc");

  const reviews: GoogleReview[] = [];
  let pageToken: string | undefined;
  let totalReviewCount = 0;
  let pageCount = 0;
  do {
    if (++pageCount > 1000) {
      throw new GoogleBusinessProfileError("Review pagination exceeded the safety limit", 502);
    }
    const url = new URL(endpoint);
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const page = await googleGet<GoogleReviewPage>(url, accessToken);
    totalReviewCount = page.totalReviewCount ?? totalReviewCount;
    reviews.push(...(page.reviews ?? []));
    pageToken = page.nextPageToken;
  } while (pageToken);
  return { reviews, totalReviewCount: Math.max(totalReviewCount, reviews.length) };
}

async function synchronizeConfiguredLocation() {
  const settings = await getSettings();
  if (!settings.businessProfileRefreshToken) {
    throw new GoogleBusinessProfileError("Connect a Google Business Profile account first", 400);
  }
  if (!settings.businessAccountName || !settings.businessLocationName) {
    throw new GoogleBusinessProfileError("Select a Business Profile location before syncing", 400);
  }

  const accessToken = await getAccessToken(settings.businessProfileRefreshToken);
  const { reviews, totalReviewCount } = await fetchAllReviewPages(
    settings.businessAccountName,
    settings.businessLocationName,
    accessToken,
  );
  return db.transaction(async (tx) => {
    const [current] = await tx.select().from(googleReviewSettings)
      .where(eq(googleReviewSettings.id, settings.id))
      .for("update");
    if (
      !current ||
      current.businessAccountName !== settings.businessAccountName ||
      current.businessLocationName !== settings.businessLocationName ||
      current.businessProfileRefreshToken !== settings.businessProfileRefreshToken
    ) {
      throw new GoogleBusinessProfileError("Google location changed during sync; retry", 409);
    }
    const now = new Date();
    const shouldImport = totalReviewCount > current.autoSyncThreshold;
    let syncedCount = 0;

    if (shouldImport) {
      for (const review of reviews) {
        const externalId = review.name?.trim();
        const name = review.reviewer?.displayName?.trim();
        const comment = review.comment?.trim();
        const rating = ratingFromGoogle(review.starRating);
        if (!externalId || !name || !comment || rating < 1) continue;
        const [existing] = await tx.select({
          id: testimonials.id,
          visibilityOverride: testimonials.visibilityOverride,
        })
          .from(testimonials)
          .where(and(
            eq(testimonials.externalId, externalId),
            eq(testimonials.source, "google"),
          ))
          .limit(1)
          .for("update");
        const reviewDate = validDate(review.updateTime || review.createTime);
        const values = {
          name,
          comment,
          rating,
          photoUrl: review.reviewer?.profilePhotoUrl ?? null,
          source: "google",
          externalId,
          reviewDate,
          active: existing?.visibilityOverride ?? (rating >= current.minRating),
          updatedAt: now,
        };
        if (existing) {
          await tx.update(testimonials).set(values).where(eq(testimonials.id, existing.id));
        } else {
          await tx.insert(testimonials).values(values);
        }
        syncedCount += 1;
      }
    }

    const [updated] = await tx.update(googleReviewSettings)
      .set({
        totalReviewCount,
        lastSyncedAt: now,
        lastSyncError: null,
        updatedAt: now,
      })
      .where(eq(googleReviewSettings.id, current.id))
      .returning();

    return {
      syncedCount,
      totalReviewCount,
      skippedUntilThreshold: !shouldImport,
      lastSyncedAt: updated?.lastSyncedAt ?? now,
    };
  });
}

export async function syncGoogleBusinessReviews() {
  if (autoSyncInProgress) {
    throw new GoogleBusinessProfileError("A Google review sync is already running", 409);
  }
  autoSyncInProgress = true;
  try {
    return await synchronizeConfiguredLocation();
  } catch (error) {
    if (error instanceof GoogleBusinessProfileError && error.status === 409) throw error;
    const message = error instanceof Error ? error.message : "Google review sync failed";
    const [settings] = await db.select().from(googleReviewSettings).limit(1);
    if (settings) {
      await db.update(googleReviewSettings)
        .set({
          lastSyncError: message.slice(0, 500),
          lastSyncedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(googleReviewSettings.id, settings.id));
    }
    throw error;
  } finally {
    autoSyncInProgress = false;
  }
}

export async function disconnectGoogleBusinessProfile() {
  return db.transaction(async (tx) => {
    const [settings] = await tx.select().from(googleReviewSettings).limit(1).for("update");
    if (!settings) throw new GoogleBusinessProfileError("Google reviews settings are missing", 500);
    const now = new Date();
    await tx.update(testimonials)
      .set({ active: false, updatedAt: now })
      .where(eq(testimonials.source, "google"));
    const [updated] = await tx.update(googleReviewSettings)
      .set({
        businessProfileRefreshToken: null,
        businessAccountName: null,
        businessLocationName: null,
        businessLocationTitle: null,
        autoSyncEnabled: false,
        totalReviewCount: 0,
        lastSyncedAt: null,
        lastSyncError: null,
        updatedAt: now,
      })
      .where(eq(googleReviewSettings.id, settings.id))
      .returning();
    return updated;
  });
}

export function startGoogleBusinessReviewAutoSync() {
  if (autoSyncTimer) return;
  autoSyncTimer = setInterval(async () => {
    if (autoSyncInProgress) return;
    autoSyncInProgress = true;
    try {
      const settings = await getSettings();
      if (
        !settings.autoSyncEnabled ||
        !settings.businessProfileRefreshToken ||
        !settings.businessAccountName ||
        !settings.businessLocationName
      ) return;
      const intervalMs = Math.max(5, settings.autoSyncEveryMinutes) * 60 * 1000;
      if (settings.lastSyncedAt && Date.now() - settings.lastSyncedAt.getTime() < intervalMs) {
        return;
      }
      const result = await synchronizeConfiguredLocation();
      logger.info(
        {
          totalReviewCount: result.totalReviewCount,
          importedCount: result.syncedCount,
          skippedUntilThreshold: result.skippedUntilThreshold,
        },
        "Google Business Profile reviews checked",
      );
    } catch (error) {
      if (error instanceof GoogleBusinessProfileError && error.status === 409) return;
      const message = error instanceof Error ? error.message : "Automatic sync failed";
      try {
        const settings = await getSettings();
        await db.update(googleReviewSettings)
          .set({
            lastSyncError: message.slice(0, 500),
            lastSyncedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(googleReviewSettings.id, settings.id));
      } catch {
        // Keep the background worker alive if the database is temporarily unavailable.
      }
      logger.warn(
        { err: message },
        "Automatic Google review sync failed",
      );
    } finally {
      autoSyncInProgress = false;
    }
  }, 60 * 1000);
  autoSyncTimer.unref();
}