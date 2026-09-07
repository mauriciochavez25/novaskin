import { Router, type IRouter, type RequestHandler } from "express";
import { and, asc, count, desc, eq, gte, lte } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import {
  adminUsers,
  contactMessages,
  galleryImages,
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
  GetSiteResponse,
  GetSiteSettingsResponse,
  ListContactMessagesResponse,
  ListGalleryImagesResponse,
  ListPromotionsResponse,
  ListServicesResponse,
  ListSpecialistsResponse,
  ListTestimonialsResponse,
  ListVideosResponse,
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
  UpdateSpecialistBody,
  UpdateSpecialistParams,
  UpdateSpecialistResponse,
  UpdateTestimonialBody,
  UpdateTestimonialParams,
  UpdateTestimonialResponse,
  UpdateVideoBody,
  UpdateVideoParams,
  UpdateVideoResponse,
} from "@workspace/api-zod";
import {
  clearAdminCookie,
  getAdminFromRequest,
  requireAdmin,
  setAdminCookie,
  validateAdminPassword,
} from "../lib/adminAuth";

const router: IRouter = Router();

const media = (name: string) => `/media/${name}`;
const now = new Date();

let seedPromise: Promise<void> | undefined;
async function ensureSeeded() {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    const [existingSettings] = await db.select({ id: siteSettings.id }).from(siteSettings).limit(1);
    if (!existingSettings) {
      await db.insert(siteSettings).values({
        clinicName: "NovaSkin",
        tagline: "Estética avanzada, bienestar real",
         phone: "871 143 7775",
         whatsapp: "8711437775",
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
          "NovaSkin fusiona la precisión de la medicina estética con la serenidad de una experiencia de spa. Diseñamos cada tratamiento desde la escucha, la ciencia y el respeto por tu belleza natural.",
      });
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
        { title: "El espacio NovaSkin", description: "Un refugio pensado para bajar las revoluciones.", imageUrl: media("clinic-lobby.png"), active: true, sortOrder: 1 },
        { title: "Cuidado que se siente", description: "Cada detalle acompaña tu experiencia.", imageUrl: media("treatment-room.png"), active: true, sortOrder: 2 },
        { title: "Diagnóstico personalizado", description: "Escuchamos tu piel antes de recomendar.", imageUrl: media("consultation.png"), active: true, sortOrder: 3 },
      ]);
    }
    const [video] = await db.select({ id: videos.id }).from(videos).limit(1);
    if (!video) {
      await db.insert(videos).values([
         { title: "Conoce a nuestro equipo", description: "El cuidado de tu piel comienza con profesionales dedicadas.", videoUrl: media("team-intro-2026-08-31.mp4"), posterUrl: media("team-intro-2026-08-31.jpg"), active: true, sortOrder: 1 },
         { title: "Una experiencia cercana", description: "Un vistazo al cuidado que vivimos en NovaSkin.", videoUrl: media("team-treatment-2026-08-31.mp4"), posterUrl: media("team-treatment-2026-08-31.jpg"), active: true, sortOrder: 2 },
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
    const [testimonial] = await db.select({ id: testimonials.id }).from(testimonials).limit(1);
    if (!testimonial) {
      await db.insert(testimonials).values([
        { name: "Mariana R.", comment: "Desde la primera valoración sentí que por fin estaban escuchando mi piel. El resultado fue natural y la experiencia, preciosa.", rating: 5, photoUrl: null, active: true },
        { name: "Alejandra G.", comment: "NovaSkin se siente diferente: profesional, cálida y muy cuidadosa con cada detalle.", rating: 5, photoUrl: null, active: true },
      ]);
    }
    const [promotion] = await db.select({ id: promotions.id }).from(promotions).limit(1);
    if (!promotion) {
      await db.insert(promotions).values([
        { title: "Tu primera valoración", description: "Agenda tu diagnóstico personalizado y descubre un plan pensado para ti.", imageUrl: media("consultation.png"), startDate: "2026-01-01", endDate: "2027-12-31", active: true },
      ]);
    }
    const [admin] = await db.select({ id: adminUsers.id }).from(adminUsers).limit(1);
    if (!admin) {
      const password = process.env.NOVA_ADMIN_PASSWORD ?? "nova2026";
      await db.insert(adminUsers).values({ email: process.env.NOVA_ADMIN_EMAIL ?? "admin@novaskin.mx", name: "Administrador NovaSkin", passwordHash: await bcrypt.hash(password, 10) });
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
      db.select().from(testimonials).where(eq(testimonials.active, true)).orderBy(desc(testimonials.createdAt)),
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

function crudRoutes<T extends Record<string, unknown>>(path: string, table: any, createSchema: { parse: (x: unknown) => T }, updateSchema: { parse: (x: unknown) => T }, responseSchema: { parse: (x: unknown) => unknown }, listSchema: { parse: (x: unknown) => unknown }) {
  admin.get(path, async (_req, res, next) => { try { const rows = await db.select().from(table).orderBy(desc(table.createdAt)); res.json(listSchema.parse(rows.map((row: any) => table === services ? normalizeService(row) : row))); } catch (error) { next(error); } });
  admin.post(path, async (req, res, next) => { try { const rows = await db.insert(table).values(createSchema.parse(req.body)).returning() as unknown as any[]; const row = rows[0]; res.status(201).json(responseSchema.parse(table === services ? normalizeService(row) : row)); } catch (error) { next(error); } });
  admin.patch(`${path}/:id`, async (req, res, next) => { try { const id = Number(req.params.id); const rows = await db.update(table).set({ ...updateSchema.parse(req.body), updatedAt: new Date() }).where(eq(table.id, id)).returning() as unknown as any[]; const row = rows[0]; if (!row) { res.status(404).json({ error: "No encontrado" }); return; } res.json(responseSchema.parse(table === services ? normalizeService(row as typeof services.$inferSelect) : row)); } catch (error) { next(error); } });
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
admin.get("/messages", async (_req, res, next) => { try { const rows = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)); res.json(ListContactMessagesResponse.parse(rows)); } catch (error) { next(error); } });
admin.patch("/messages/:id", async (req, res, next) => { try { const params = UpdateContactMessageParams.parse(req.params); const [row] = await db.update(contactMessages).set({ ...UpdateContactMessageBody.parse(req.body), updatedAt: new Date() }).where(eq(contactMessages.id, params.id)).returning(); res.json(UpdateContactMessageResponse.parse(row)); } catch (error) { next(error); } });
admin.delete("/messages/:id", async (req, res, next) => { try { const params = DeleteContactMessageParams.parse(req.params); await db.delete(contactMessages).where(eq(contactMessages.id, params.id)); res.status(204).end(); } catch (error) { next(error); } });

void DeleteGalleryImageParams; void DeletePromotionParams; void DeleteServiceParams; void DeleteSpecialistParams; void DeleteTestimonialParams; void DeleteVideoParams; void UpdateGalleryImageParams; void UpdatePromotionParams; void UpdateServiceParams; void UpdateSpecialistParams; void UpdateTestimonialParams; void UpdateVideoParams; void UpdateContactMessageBody; void CreateContactMessageResponse; void UpdateContactMessageBody; void now;

router.use("/admin", requireAdmin, admin);

export default router;