import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { adminUsers } from "@workspace/db/schema";

const COOKIE_NAME = "nova_admin";
const SESSION_SECRET = process.env.SESSION_SECRET ?? "nova-development-session";

function sign(value: string) {
  return createHmac("sha256", SESSION_SECRET).update(value).digest("hex");
}

function readUserId(req: Request) {
  const raw = req.headers.cookie
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);
  if (!raw) return null;
  const [id, signature] = raw.split(".");
  if (!id || !signature) return null;
  const expected = sign(id);
  if (signature.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const parsed = Number(id);
  return Number.isInteger(parsed) ? parsed : null;
}

export async function getAdminFromRequest(req: Request) {
  const id = readUserId(req);
  if (!id) return null;
  const [user] = await db
    .select({ id: adminUsers.id, email: adminUsers.email, name: adminUsers.name })
    .from(adminUsers)
    .where(eq(adminUsers.id, id))
    .limit(1);
  return user ?? null;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  getAdminFromRequest(req)
    .then((user) => {
      if (!user) {
        res.status(401).json({ error: "Autenticación requerida" });
        return;
      }
      res.locals.admin = user;
      next();
    })
    .catch(next);
}

export function setAdminCookie(res: Response, userId: number) {
  const value = `${userId}.${sign(String(userId))}`;
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
  );
}

export function clearAdminCookie(res: Response) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

export async function validateAdminPassword(email: string, password: string) {
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return null;
  return { id: user.id, email: user.email, name: user.name };
}