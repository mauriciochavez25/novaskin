import { Router, type IRouter, type RequestHandler } from "express";
import { and, asc, count, desc, eq, gte, isNull, lte, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import {
  adminUsers,
  contactMessages,
  galleryImages,
  googleReviewSettings,
  promotions,
  services,
  siteSettings,
  specialists,
  testimonials,
  videos,
} from "@workspace/db/schema";
import {
  CreateContactMessageBody,
  CreateContactMessageResponse,
  CreateGalleryImageBody,
  CreateGalleryImageResponse,
  CreatePromotionBody,
  CreatePromotionResponse,
  CreateServiceBody,
  CreateServiceResponse,
  CreateSpecialistBody,
  CreateSpecialistResponse,
  CreateTestimonialBody,
  CreateTestimonialResponse,
  CreateVideoBody,
  CreateVideoResponse,
  DeleteContactMessageParams,
  DeleteGalleryImageParams,
  DeletePromotionParams,
  DeleteServiceParams,
  DeleteSpecialistParams,
  DeleteTestimonialParams,
  DeleteVideoParams,
  GetAdminSummaryResponse,
  GetCurrentUserResponse,
  GetGoogleReviewSettingsResponse,
  GetSiteResponse,
  GetSiteSettingsResponse,
  ListContactMessagesResponse,
  ListGalleryImagesResponse,
  ListPromotionsResponse,
  ListServicesResponse,
  ListSpecialistsResponse,
  ListTestimonialsResponse,
  ListVideosResponse,
  LookupGoogleReviewsBody,
  LookupGoogleReviewsResponse,
  ListGoogleBusinessLocationsResponse,
  LoginBody,
  LoginResponse,
  UpdateContactMessageBody,
  UpdateContactMessageParams,
  UpdateContactMessageResponse,
  UpdateGalleryImageBody,
  UpdateGalleryImageParams,
  UpdateGalleryImageResponse,
  UpdatePromotionBody,
  UpdatePromotionParams,
  UpdatePromotionResponse,
  UpdateServiceBody,
  UpdateServiceParams,
  UpdateServiceResponse,
  UpdateSiteSettingsBody,
  UpdateSiteSettingsResponse,
  UpdateGoogleReviewSettingsBody,
  UpdateGoogleReviewSettingsResponse,
  UpdateSpecialistBody,
  UpdateSpecialistParams,
  UpdateSpecialistResponse,
  UpdateTestimonialBody,
  UpdateTestimonialParams,
  UpdateTestimonialResponse,
  UpdateVideoBody,
  UpdateVideoParams,
  UpdateVideoResponse,
  SyncGoogleReviewsResponse,
  StartGoogleBusinessProfileConnectionResponse,
  DisconnectGoogleBusinessProfileResponse,
} from "@workspace/api-zod";
import {
  clearAdminCookie,
  getAdminFromRequest,
  requireAdmin,
  setAdminCookie,
  validateAdminPassword,
} from "../lib/adminAuth";
import {
  completeGoogleAuthorization,
  createGoogleAuthorizationUrl,
  disconnectGoogleBusinessProfile,
  GoogleBusinessProfileError,
  listGoogleBusinessLocations,
  syncGoogleBusinessReviews,
} from "../lib/googleBusinessReviews";

const router: IRouter = Router();

const media = (name: string) => `/media/${name}`;
const now = new Date();

let seedPromise: Promise<void> | undefined;
async function ensureSeeded() {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    const [existingSettings] = await db.select({
      id: siteSettings.id,
      contactNumbersUpdatedAt: siteSettings.contactNumbersUpdatedAt,
    }).from(siteSettings).limit(1);
    if (!existingSettings) {
      await db.insert(siteSettings).values({
        clinicName: "Nova Skin",
        tagline: "Estética avanzada, bienestar real",
         phone: "8715044852",
         whatsapp: "8715044852",
         contactNumbersUpdatedAt: new Date(),
         email: "Correo próximamente",
         address: "Av. Juárez 4955\nPlaza Laguna Oriente\nLocal 43",
         hours: "10:00 a.m. – 2:00 p.m. / 3:00 p.m. – 7:00 p.m.",
        instagram: "https://instagram.com/novaskin",
        facebook: "https://facebook.com/novaskin",
        tiktok: "https://tiktok.com/@novaskin",
        heroImage: media("clinic-lobby.png"),
        heroEyebrow: "Cuidamos tu piel, realzamos tu esencia",
        heroTitle: "La belleza que se siente bien.",
        heroDescription: "Tratamientos clínico-estéticos avanzados en un espacio diseñado para volver a ti.",
        aboutText:
          "Nova Skin fusiona la precisión de la medicina estética con la serenidad de una experiencia de spa. Diseñamos cada tratamiento desde la escucha, la ciencia y el respeto por tu belleza natural.",
      });
    } else if (!existingSettings.contactNumbersUpdatedAt) {
      // Apply the contact-number change once; preserve later admin edits.
      await db.update(siteSettings)
        .set({
          phone: "8715044852",
          whatsapp: "8715044852",
          contactNumbersUpdatedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(
          eq(siteSettings.id, existingSettings.id),
          isNull(siteSettings.contactNumbersUpdatedAt),
        ));
    }
    const [existingGoogleReviewSettings] = await db.select({ id: googleReviewSettings.id }).from(googleReviewSettings).limit(1);
    if (!existingGoogleReviewSettings) {
      await db.insert(googleReviewSettings).values({ minRating: 4 });
    }
    const [service] = await db.select({ id: services.id }).from(services).limit(1);
    if (!service) {
      await db.insert(services).values([
        { name: "Valoración facial", description: "Un diagnóstico honesto para entender lo que tu piel necesita.", price: "0", duration: "45 min", imageUrl: media("consultation.png"), active: true, sortOrder: 1 },
        { name: "Limpieza facial profunda", description: "Renueva, equilibra e ilumina la piel con protocolos personalizados.", price: "1200", duration: "60 min", imageUrl: media("treatment-room.png"), active: true, sortOrder: 2 },
        { name: "Medicina estética avanzada", description: "Tecnología y criterio médico para resultados sutiles, visibles y naturales.", price: null, duration: "Según valoración", imageUrl: media("clinic-lobby.png"), active: true, sortOrder: 3 },
      ]);
    }
    const [gallery] = await db.select({ id: galleryImages.id }).from(galleryImages).limit(1);
    if (!gallery) {
      await db.insert(galleryImages).values([
        { title: "El espacio Nova Skin", description: "Un refugio pensado para bajar las revoluciones.", imageUrl: media("clinic-lobby.png"), active: true, sortOrder: 1 },
        { title: "Cuidado que se siente", description: "Cada detalle acompaña tu experiencia.", imageUrl: media("treatment-room.png"), active: true, sortOrder: 2 },
        { title: "Diagnóstico personalizado", description: "Escuchamos tu piel antes de recomendar.", imageUrl: media("consultation.png"), active: true, sortOrder: 3 },
      ]);
    }
    const [video] = await db.select({ id: videos.id }).from(videos).limit(1);
    if (!video) {
      await db.insert(videos).values([
         { title: "Conoce a nuestro equipo", description: "El cuidado de tu piel comienza con profesionales dedicadas.", videoUrl: media("team-intro-2026-08-31.mp4"), posterUrl: media("team-intro-2026-08-31.jpg"), active: true, sortOrder: 1 },
         { title: "Una experiencia cercana", description: "Un vistazo al cuidado que vivimos en Nova Skin.", videoUrl: media("team-treatment-2026-08-31.mp4"), posterUrl: media("team-treatment-2026-08-31.jpg"), active: true, sortOrder: 2 },
        { title: "Precisión y bienestar", description: "Tecnología clínica con trato humano.", videoUrl: media("WhatsApp_Video_2026-08-28_at_11.57.28_AM_1787940017376.mp4"), posterUrl: media("WhatsApp_Video_2026-08-28_at_11.57.28_AM_1787940017376.jpg"), active: true, sortOrder: 3 },
      ]);
    }
    const [specialist] = await db.select({ id: specialists.id }).from(specialists).limit(1);
    if (!specialist) {
      await db.insert(specialists).values([
         { name: "Dra. Indira Isis Ceniceros Mejía", specialty: "Maestría en Medicina Estética", bio: "", photoUrl: media("consultation.png"), instagram: null, active: true },
         { name: "María Muñiz Montemayor", specialty: "Lic. en Cosmetología", bio: "", photoUrl: media("treatment-room.png"), instagram: null, active: true },
      ]);
    }
    await db.transaction(async (tx) => {
      const [reviewSettings] = await tx.select().from(googleReviewSettings).limit(1).for("update");
      if (!reviewSettings || reviewSettings.exampleDraftsSeededAt) return;
      const retiredSeedReviews = [
      {
        name: "Mariana R.",
        comment: "Desde la primera valoración sentí que por fin estaban escuchando mi piel. El resultado fue natural y la experiencia, preciosa.",
      },
      {
        name: "Alejandra G.",
        comment: "Nova Skin se siente diferente: profesional, cálida y muy cuidadosa con cada detalle.",
      },
    ];
      for (const oldReview of retiredSeedReviews) {
        await tx.update(testimonials)
        .set({
          source: "draft",
          active: false,
          updatedAt: new Date(),
        })
        .where(and(
          eq(testimonials.name, oldReview.name),
          eq(testimonials.comment, oldReview.comment),
          eq(testimonials.source, "manual"),
          eq(testimonials.active, true),
          isNull(testimonials.externalId),
          eq(testimonials.updatedAt, testimonials.createdAt),
        ));
      }
      const draftReviews = [
      {
        key: "limpieza-facial",
        treatment: "Limpieza facial profunda",
        comment: "BORRADOR NO REAL. Plantilla: «Después de mi limpieza facial, sentí la piel más fresca y luminosa». Sustituir por la experiencia literal de una clienta y obtener su autorización antes de publicar.",
      },
      {
        key: "valoracion-facial",
        treatment: "Valoración facial",
        comment: "BORRADOR NO REAL. Plantilla: «La valoración me ayudó a entender qué necesitaba mi piel y qué opciones tenía». Sustituir por la experiencia literal de una clienta y obtener su autorización antes de publicar.",
      },
      {
        key: "toxina-botulinica",
        treatment: "Toxina botulínica",
        comment: "BORRADOR NO REAL. Plantilla: «Me explicaron el procedimiento con claridad y el resultado quedó natural». Sustituir por la experiencia literal de una clienta y obtener su autorización antes de publicar.",
      },
      {
        key: "bioestimuladores",
        treatment: "Bioestimuladores",
        comment: "BORRADOR NO REAL. Plantilla: «Me sentí acompañada durante mi tratamiento y el plan fue claro desde el inicio». Sustituir por la experiencia literal de una clienta y obtener su autorización antes de publicar.",
      },
      {
        key: "pdrn-salmon",
        treatment: "PDRN de salmón",
        comment: "BORRADOR NO REAL. Plantilla: «Me explicaron para qué servía el tratamiento y cómo sería el cuidado posterior». Sustituir por la experiencia literal de una clienta y obtener su autorización antes de publicar.",
      },
      {
        key: "skin-booster",
        treatment: "Skin booster",
        comment: "BORRADOR NO REAL. Plantilla: «La atención fue cuidadosa y recibí indicaciones claras para después de mi sesión». Sustituir por la experiencia literal de una clienta y obtener su autorización antes de publicar.",
      },
      {
        key: "nctf-revitalizante",
        treatment: "NCTF revitalizante",
        comment: "BORRADOR NO REAL. Plantilla: «Me gustó que adaptaran la sesión a las necesidades de mi piel». Sustituir por la experiencia literal de una clienta y obtener su autorización antes de publicar.",
      },
      {
        key: "mesoterapia-capilar",
        treatment: "Mesoterapia capilar",
        comment: "BORRADOR NO REAL. Plantilla: «Me explicaron el plan de sesiones y resolvieron mis dudas antes de comenzar». Sustituir por la experiencia literal de una clienta y obtener su autorización antes de publicar.",
      },
    ];
      for (const draft of draftReviews) {
        const externalId = `draft-example:${draft.key}`;
        const [existingDraft] = await tx.select({ id: testimonials.id })
          .from(testimonials)
          .where(eq(testimonials.externalId, externalId))
          .limit(1);
        if (!existingDraft) {
          await tx.insert(testimonials).values({
            name: `BORRADOR INTERNO · ${draft.treatment}`,
            comment: draft.comment,
            rating: 5,
            photoUrl: null,
            source: "draft",
            externalId,
            reviewDate: null,
            active: false,
          });
        }
      }
      await tx.update(googleReviewSettings)
        .set({ exampleDraftsSeededAt: new Date() })
        .where(eq(googleReviewSettings.id, reviewSettings.id));
    });
    const [promotion] = await db.select({ id: promotions.id }).from(promotions).limit(1);
    if (!promotion) {
      await db.insert(promotions).values([
        { title: "Tu primera valoración", description: "Agenda tu diagnóstico personalizado y descubre un plan pensado para ti.", imageUrl: media("consultation.png"), startDate: "2026-01-01", endDate: "2027-12-31", active: true },
      ]);
    }
    const [admin] = await db.select({ id: adminUsers.id }).from(adminUsers).limit(1);
    if (!admin) {
      const password = process.env.NOVA_ADMIN_PASSWORD ?? "nova2026";
      await db.insert(adminUsers).values({ email: process.env.NOVA_ADMIN_EMAIL ?? "admin@novaskin.mx", name: "Administrador Nova Skin", passwordHash: await bcrypt.hash(password, 10) });
    }
  })();
  return seedPromise;
}

const withSeed: RequestHandler = (_req, _res, next) => {
  ensureSeeded().then(() => next()).catch(next);
};

router.use(withSeed);

router.get("/site", async (_req, res, next) => {
  try {
    const [settings] = await db.select().from(siteSettings).limit(1);
    const [serviceRows, galleryRows, videoRows, promotionRows, specialistRows, testimonialRows] = await Promise.all([
      db.select().from(services).where(eq(services.active, true)).orderBy(asc(services.sortOrder)),
      db.select().from(galleryImages).where(eq(galleryImages.active, true)).orderBy(asc(galleryImages.sortOrder)),
      db.select().from(videos).where(eq(videos.active, true)).orderBy(asc(videos.sortOrder)),
      db.select().from(promotions).where(and(eq(promotions.active, true), lte(promotions.startDate, new Date().toISOString().slice(0, 10)), gte(promotions.endDate, new Date().toISOString().slice(0, 10)))).orderBy(desc(promotions.createdAt)),
      db.select().from(specialists).where(eq(specialists.active, true)).orderBy(asc(specialists.createdAt)),
      db.select().from(testimonials).where(eq(testimonials.active, true)).orderBy(
        desc(testimonials.rating),
        desc(sql`coalesce(${testimonials.reviewDate}, ${testimonials.createdAt})`),
      ),
    ]);
    res.json(GetSiteResponse.parse({ settings, services: serviceRows.map(normalizeService), gallery: galleryRows, videos: videoRows, promotions: promotionRows, specialists: specialistRows, testimonials: testimonialRows }));
  } catch (error) { next(error); }
});

router.post("/contact", async (req, res, next) => {
  try {
    const input = CreateContactMessageBody.parse(req.body);
    const [created] = await db.insert(contactMessages).values(input).returning();
    res.status(201).json(CreateContactMessageResponse.parse(created));
  } catch (error) { next(error); }
});

router.post("/auth/login", async (req, res, next) => {
  try {
    const input = LoginBody.parse(req.body);
    const user = await validateAdminPassword(input.email, input.password);
    if (!user) { res.status(401).json({ error: "Correo o contraseña incorrectos" }); return; }
    setAdminCookie(res, user.id);
    res.json(LoginResponse.parse(user));
  } catch (error) { next(error); }
});
router.post("/auth/logout", (_req, res) => { clearAdminCookie(res); res.status(204).end(); });
router.get("/auth/me", withSeed, async (req, res, next) => {
  try {
    const user = await getAdminFromRequest(req);
    if (!user) { res.status(401).json({ error: "No autenticado" }); return; }
    res.json(GetCurrentUserResponse.parse(user));
  } catch (error) { next(error); }
});

const admin: IRouter = Router();

admin.get("/summary", async (_req, res, next) => {
  try {
    const [[images], [videoCount], [serviceCount], [promotionCount], [messageCount], [unreadCount]] = await Promise.all([
      db.select({ value: count() }).from(galleryImages),
      db.select({ value: count() }).from(videos),
      db.select({ value: count() }).from(services).where(eq(services.active, true)),
      db.select({ value: count() }).from(promotions).where(eq(promotions.active, true)),
      db.select({ value: count() }).from(contactMessages),
      db.select({ value: count() }).from(contactMessages).where(eq(contactMessages.read, false)),
    ]);
    res.json(GetAdminSummaryResponse.parse({ images: Number(images.value), videos: Number(videoCount.value), services: Number(serviceCount.value), promotions: Number(promotionCount.value), messages: Number(messageCount.value), unreadMessages: Number(unreadCount.value) }));
  } catch (error) { next(error); }
});

function normalizeService(row: typeof services.$inferSelect) {
  return { ...row, price: row.price === null ? null : Number(row.price) };
}

function publicGoogleReviewSettings(row: typeof googleReviewSettings.$inferSelect) {
  const { businessProfileRefreshToken, ...safeSettings } = row;
  return {
    ...safeSettings,
    businessProfileConnected: Boolean(businessProfileRefreshToken),
  };
}

function crudRoutes<T extends Record<string, unknown>>(path: string, table: any, createSchema: { parse: (x: unknown) => T }, updateSchema: { parse: (x: unknown) => T }, responseSchema: { parse: (x: unknown) => unknown }, listSchema: { parse: (x: unknown) => unknown }) {
  admin.get(path, async (_req, res, next) => { try { const rows = await db.select().from(table).orderBy(desc(table.createdAt)); res.json(listSchema.parse(rows.map((row: any) => table === services ? normalizeService(row) : row))); } catch (error) { next(error); } });
  admin.post(path, async (req, res, next) => { try { const rows = await db.insert(table).values(createSchema.parse(req.body)).returning() as unknown as any[]; const row = rows[0]; res.status(201).json(responseSchema.parse(table === services ? normalizeService(row) : row)); } catch (error) { next(error); } });
  admin.patch(`${path}/:id`, async (req, res, next) => { try {
    const id = Number(req.params.id);
    const input = updateSchema.parse(req.body);
    if (table === testimonials) {
      const testimonialInput = UpdateTestimonialBody.parse(req.body);
      const result = await db.transaction(async (tx) => {
        const [settings] = await tx.select().from(googleReviewSettings).limit(1).for("update");
        const [existing] = await tx.select().from(testimonials)
          .where(eq(testimonials.id, id)).limit(1).for("update");
        if (!existing) return { status: 404, error: "No encontrado" };
        if (existing.source === "draft" && testimonialInput.active) {
          return { status: 400, error: "Los borradores de ejemplo no se pueden publicar. Sustitúyelos por opiniones reales autorizadas." };
        }
        if (existing.source === "google") {
          const currentLocationPrefix = settings?.businessAccountName && settings.businessLocationName
            ? `${settings.businessAccountName}/${settings.businessLocationName}/reviews/`
            : null;
          if (
            testimonialInput.active &&
            (!settings?.businessProfileRefreshToken || !currentLocationPrefix ||
              !existing.externalId?.startsWith(currentLocationPrefix))
          ) {
            return { status: 400, error: "Esta reseña pertenece a otra ficha o la cuenta está desconectada." };
          }
          const [row] = await tx.update(testimonials)
            .set({
              active: testimonialInput.active,
              visibilityOverride: testimonialInput.active,
              updatedAt: new Date(),
            })
            .where(eq(testimonials.id, id))
            .returning();
          return { row };
        }
        const [row] = await tx.update(testimonials)
          .set({ ...testimonialInput, updatedAt: new Date() })
          .where(eq(testimonials.id, id))
          .returning();
        return { row };
      });
      if ("error" in result) {
        res.status(result.status ?? 400).json({ error: result.error });
        return;
      }
      res.json(responseSchema.parse(result.row));
      return;
    }
    const rows = await db.update(table).set({ ...input, updatedAt: new Date() }).where(eq(table.id, id)).returning() as unknown as any[];
    const row = rows[0];
    if (!row) { res.status(404).json({ error: "No encontrado" }); return; }
    res.json(responseSchema.parse(table === services ? normalizeService(row as typeof services.$inferSelect) : row));
  } catch (error) { next(error); } });
  admin.delete(`${path}/:id`, async (req, res, next) => { try { await db.delete(table).where(eq(table.id, Number(req.params.id))); res.status(204).end(); } catch (error) { next(error); } });
}

crudRoutes("/services", services, CreateServiceBody, UpdateServiceBody, CreateServiceResponse, ListServicesResponse);
crudRoutes("/gallery", galleryImages, CreateGalleryImageBody, UpdateGalleryImageBody, CreateGalleryImageResponse, ListGalleryImagesResponse);
crudRoutes("/videos", videos, CreateVideoBody, UpdateVideoBody, CreateVideoResponse, ListVideosResponse);
crudRoutes("/promotions", promotions, CreatePromotionBody, UpdatePromotionBody, CreatePromotionResponse, ListPromotionsResponse);
crudRoutes("/specialists", specialists, CreateSpecialistBody, UpdateSpecialistBody, CreateSpecialistResponse, ListSpecialistsResponse);
crudRoutes("/testimonials", testimonials, CreateTestimonialBody, UpdateTestimonialBody, CreateTestimonialResponse, ListTestimonialsResponse);

admin.get("/settings", async (_req, res, next) => { try { const [row] = await db.select().from(siteSettings).limit(1); res.json(GetSiteSettingsResponse.parse(row)); } catch (error) { next(error); } });
admin.put("/settings", async (req, res, next) => { try { const [row] = await db.update(siteSettings).set({ ...UpdateSiteSettingsBody.parse(req.body), updatedAt: new Date() }).where(eq(siteSettings.id, 1)).returning(); res.json(UpdateSiteSettingsResponse.parse(row)); } catch (error) { next(error); } });
admin.get("/google-reviews/settings", async (_req, res, next) => {
  try {
    const [row] = await db.select().from(googleReviewSettings).limit(1);
    if (!row) {
      res.status(404).json({ error: "Configuración de reseñas no encontrada" });
      return;
    }
    res.json(GetGoogleReviewSettingsResponse.parse(publicGoogleReviewSettings(row)));
  } catch (error) {
    next(error);
  }
});
admin.put("/google-reviews/settings", async (req, res, next) => {
  try {
    const input = UpdateGoogleReviewSettingsBody.parse(req.body);
    const row = await db.transaction(async (tx) => {
      const [existing] = await tx.select().from(googleReviewSettings).limit(1).for("update");
      const locationChanged = Boolean(
        existing &&
        input.businessLocationName !== undefined &&
        (
          input.businessAccountName !== existing.businessAccountName ||
          input.businessLocationName !== existing.businessLocationName
        ),
      );
      if (locationChanged) {
        await tx.update(testimonials)
          .set({ active: false, updatedAt: new Date() })
          .where(eq(testimonials.source, "google"));
      }
      const update = {
        ...input,
        ...(locationChanged ? { lastSyncedAt: null, totalReviewCount: 0 } : {}),
        updatedAt: new Date(),
      };
      const [updated] = existing
        ? await tx.update(googleReviewSettings).set(update).where(eq(googleReviewSettings.id, existing.id)).returning()
        : await tx.insert(googleReviewSettings).values({ minRating: input.minRating ?? 4, ...input }).returning();
      return updated;
    });
    if (!row) {
      res.status(500).json({ error: "No se pudo guardar la configuración" });
      return;
    }
    res.json(UpdateGoogleReviewSettingsResponse.parse(publicGoogleReviewSettings(row)));
  } catch (error) {
    next(error);
  }
});

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  googleMapsUri?: string;
  reviews?: GoogleReview[];
};

type GoogleReview = {
  name?: string;
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  authorAttribution?: { displayName?: string; photoUri?: string };
  publishTime?: string;
};

admin.post("/google-reviews/lookup", async (req, res, next) => {
  try {
    const input = LookupGoogleReviewsBody.parse(req.body);
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      res.status(503).json({ error: "Google Maps API key is not configured" });
      return;
    }

    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.googleMapsUri",
      },
      body: JSON.stringify({ textQuery: input.query }),
    });
    if (!response.ok) {
      res.status(502).json({ error: "Google Places lookup failed" });
      return;
    }
    const payload = (await response.json()) as { places?: GooglePlace[] };
    const place = payload.places?.[0];
    if (!place?.id || !place.displayName?.text || !place.formattedAddress || !place.googleMapsUri) {
      res.status(404).json({ error: "No matching Google place found" });
      return;
    }
    res.json(LookupGoogleReviewsResponse.parse({
      placeId: place.id,
      placeName: place.displayName.text,
      formattedAddress: place.formattedAddress,
      googleMapsUrl: place.googleMapsUri,
    }));
  } catch (error) {
    next(error);
  }
});

admin.post("/google-reviews/connect", async (req, res, next) => {
  try {
    res.json(StartGoogleBusinessProfileConnectionResponse.parse(await createGoogleAuthorizationUrl(req)));
  } catch (error) {
    if (error instanceof GoogleBusinessProfileError) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    next(error);
  }
});
admin.get("/google-reviews/locations", async (_req, res, next) => {
  try {
    res.json(ListGoogleBusinessLocationsResponse.parse({
      locations: await listGoogleBusinessLocations(),
    }));
  } catch (error) {
    if (error instanceof GoogleBusinessProfileError) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    next(error);
  }
});
admin.post("/google-reviews/disconnect", async (_req, res, next) => {
  try {
    const row = await disconnectGoogleBusinessProfile();
    res.json(DisconnectGoogleBusinessProfileResponse.parse(publicGoogleReviewSettings(row)));
  } catch (error) {
    if (error instanceof GoogleBusinessProfileError) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    next(error);
  }
});
admin.post("/google-reviews/sync", async (_req, res, next) => {
  try {
    res.json(SyncGoogleReviewsResponse.parse(await syncGoogleBusinessReviews()));
  } catch (error) {
    if (error instanceof GoogleBusinessProfileError) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    next(error);
  }
});
admin.get("/messages", async (_req, res, next) => { try { const rows = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)); res.json(ListContactMessagesResponse.parse(rows)); } catch (error) { next(error); } });
admin.patch("/messages/:id", async (req, res, next) => { try { const params = UpdateContactMessageParams.parse(req.params); const [row] = await db.update(contactMessages).set({ ...UpdateContactMessageBody.parse(req.body), updatedAt: new Date() }).where(eq(contactMessages.id, params.id)).returning(); res.json(UpdateContactMessageResponse.parse(row)); } catch (error) { next(error); } });
admin.delete("/messages/:id", async (req, res, next) => { try { const params = DeleteContactMessageParams.parse(req.params); await db.delete(contactMessages).where(eq(contactMessages.id, params.id)); res.status(204).end(); } catch (error) { next(error); } });

router.get("/admin/google-reviews/oauth/callback", async (req, res) => {
  const state = typeof req.query.state === "string" ? req.query.state : "";
  const code = typeof req.query.code === "string" ? req.query.code : "";
  if (!state || !code || req.query.error) {
    res.redirect(303, "/admin/testimonials?google=authorization-error");
    return;
  }
  try {
    await completeGoogleAuthorization(req, state, code);
    res.redirect(303, "/admin/testimonials?google=connected");
  } catch (error) {
    req.log.error(
      { err: error instanceof Error ? error.message : "Unknown OAuth error" },
      "Google Business Profile authorization failed",
    );
    res.redirect(303, "/admin/testimonials?google=authorization-error");
  }
});

void DeleteGalleryImageParams; void DeletePromotionParams; void DeleteServiceParams; void DeleteSpecialistParams; void DeleteTestimonialParams; void DeleteVideoParams; void UpdateGalleryImageParams; void UpdatePromotionParams; void UpdateServiceParams; void UpdateSpecialistParams; void UpdateTestimonialParams; void UpdateVideoParams; void UpdateContactMessageBody; void CreateContactMessageResponse; void UpdateContactMessageBody; void now;

router.use("/admin", requireAdmin, admin);

export default router;