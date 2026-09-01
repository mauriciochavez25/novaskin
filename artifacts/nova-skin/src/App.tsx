import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  ArrowRight, BarChart3, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, CircleAlert,
  CircleCheck, Clock3, Eye, FileText, Image as ImageIcon, Instagram, LayoutDashboard, LogOut,
  Mail, Menu, MessageCircle, Pencil, Phone, Plus, Play, Save, Scissors, Send, Settings,
  Sparkles, Star, Trash2, UserRound, Users, Video as VideoIcon, X
} from 'lucide-react';
import {
  getGetAdminSummaryQueryKey, getGetCurrentUserQueryKey, getGetSiteQueryKey, getGetSiteSettingsQueryKey,
  getListContactMessagesQueryKey, getListGalleryImagesQueryKey, getListPromotionsQueryKey,
  getListServicesQueryKey, getListSpecialistsQueryKey, getListTestimonialsQueryKey,
  getListVideosQueryKey, useCreateContactMessage, useCreateGalleryImage, useCreatePromotion, useCreateService,
  useCreateSpecialist, useCreateTestimonial, useCreateVideo, useDeleteContactMessage, useDeleteGalleryImage,
  useDeletePromotion, useDeleteService, useDeleteSpecialist, useDeleteTestimonial, useDeleteVideo, useGetAdminSummary,
  useGetCurrentUser, useGetSite, useGetSiteSettings, useListContactMessages, useListGalleryImages,
  useListPromotions, useListServices, useListSpecialists, useListTestimonials, useListVideos, useLogin, useLogout,
  useUpdateContactMessage, useUpdateGalleryImage, useUpdatePromotion, useUpdateService, useUpdateSiteSettings,
  useUpdateSpecialist, useUpdateTestimonial, useUpdateVideo
} from '@workspace/api-client-react';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';
import { AdminLayout } from '@/pages/admin/layout';
import { Login } from '@/pages/admin/login';
import { Dashboard } from '@/pages/admin/dashboard';
import { Services } from '@/pages/admin/services';
import { Gallery, Videos, Promotions, Specialists, Testimonials } from '@/pages/admin/content-pages';
import { Messages } from '@/pages/admin/messages';
import { Settings as AdminSettings } from '@/pages/admin/settings';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 20_000, retry: 1 } } });

const media = '/media/';
const fallback = {
  clinicName: 'NOVA SKIN', tagline: 'Estética avanzada, bienestar real', phone: '871 143 7775',
  whatsapp: '8711437775', email: 'Correo próximamente', address: 'Av. Juárez 4955\nPlaza Laguna Oriente\nLocal 43',
  hours: '10:00 a.m. – 2:00 p.m.\n4:00 p.m. – 7:00 p.m.', instagram: '@novaskinmedspa', facebook: 'NOVA Skin Med Spa', tiktok: '@novaskinmedspa',
  heroImage: `${media}clinic-lobby.png`, heroEyebrow: 'ESTÉTICA AVANZADA, BIENESTAR REAL', heroTitle: 'Tu piel merece el respaldo de la ciencia y el confort de un spa.',
  heroDescription: 'Tratamientos clínico-estéticos personalizados en un entorno cálido, sofisticado y seguro.',
  aboutText: 'Creemos que el cuidado personal no debe sentirse como una obligación, sino como un momento de reconexión. Combinamos ciencia, tecnología y bienestar para que cada visita se sienta tan bien como se ve.'
};

const localImages = [`${media}clinic-lobby.png`, `${media}treatment-room.png`, `${media}consultation.png`];
const heroVideo = `${media}WhatsApp_Video_2026-08-28_at_11.57.22_AM_1787940023775.mp4`;
const heroPoster = `${media}WhatsApp_Video_2026-08-28_at_11.57.22_AM_1787940023775.jpg`;
const localVideos = [
  [`${media}team-intro-2026-08-31.mp4`, `${media}team-intro-2026-08-31.jpg`],
  [`${media}team-treatment-2026-08-31.mp4`, `${media}team-treatment-2026-08-31.jpg`],
  [`${media}WhatsApp_Video_2026-08-28_at_11.57.28_AM_1787940017376.mp4`, `${media}WhatsApp_Video_2026-08-28_at_11.57.28_AM_1787940017376.jpg`]
];

function Button({ children, onClick, variant = 'dark', type = 'button', className = '', testId }: any) {
  return <button type={type} onClick={onClick} data-testid={testId} className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 ${variant === 'dark' ? 'bg-[#2F4055] text-[#F2F2F0] hover:bg-[#3d526b]' : variant === 'gold' ? 'bg-[#BB9445] text-[#202b38] hover:bg-[#cba657]' : 'border border-[#AF9275] bg-transparent text-[#2F4055] hover:bg-[#ece8e0]'} ${className}`}>{children}</button>;
}

function SectionHeading({ eyebrow, title, copy, light = false }: any) {
  return <div className={`max-w-2xl ${light ? 'text-[#F2F2F0]' : 'text-[#2F4055]'}`}><p className="mb-4 text-[11px] font-bold uppercase tracking-[.28em] text-[#BB9445]">{eyebrow}</p><h2 className="font-serif text-4xl leading-[1.08] md:text-6xl">{title}</h2>{copy && <p className={`mt-5 text-base leading-7 ${light ? 'text-[#d4d9d9]' : 'text-[#68727b]'}`}>{copy}</p>}</div>;
}

function HoverVideo({ src, poster, title }: { src: string; poster?: string; title: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const playVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    void video.play().catch(() => {
      // Browsers can still reject playback when the device has media restrictions.
    });
  };

  const pauseVideo = () => {
    videoRef.current?.pause();
  };

  return (
    <div
      className="group relative aspect-video overflow-hidden bg-[#2F4055]"
      onMouseEnter={playVideo}
      onMouseLeave={pauseVideo}
      onFocus={playVideo}
      onBlur={pauseVideo}
      tabIndex={0}
      aria-label={`${title}. Pasa el cursor para reproducir`}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="pointer-events-none absolute inset-0 grid place-items-center bg-[#202c3a]/10 transition group-hover:bg-transparent">
        <span className="rounded-full border border-white/70 bg-[#2F4055]/60 p-4 text-white transition group-hover:scale-90 group-hover:bg-[#BB9445] group-hover:opacity-0">
          <Play size={20} fill="currentColor" />
        </span>
      </div>
    </div>
  );
}

function PublicSite() {
  const { data, isLoading, isError } = useGetSite();
  const site: any = data?.settings ?? fallback;
  const services: any[] = data?.services ?? [];
  const gallery: any[] = data?.gallery ?? [];
  const videos: any[] = data?.videos ?? [];
  const promotions: any[] = data?.promotions ?? [];
  const specialists: any[] = data?.specialists ?? [];
  const testimonials: any[] = data?.testimonials ?? [];
  const heroContent = {
    eyebrow: site.heroEyebrow && site.heroEyebrow !== 'Cuidamos tu piel, realzamos tu esencia' && site.heroEyebrow !== fallback.heroEyebrow
      ? site.heroEyebrow
      : fallback.heroEyebrow,
    title: site.heroTitle && site.heroTitle !== 'La belleza que se siente bien.'
      ? site.heroTitle
      : fallback.heroTitle,
    description: site.heroDescription && site.heroDescription !== 'Tratamientos clínico-estéticos avanzados en un espacio diseñado para volver a ti.'
      ? site.heroDescription
      : fallback.heroDescription,
  };
  const [menu, setMenu] = useState(false);
  const [lightbox, setLightbox] = useState<any>(null);
  const [sent, setSent] = useState(false);
  const contact = useCreateContactMessage();
  const galleryItems = gallery.length ? gallery : [{ id: 1, title: 'Un espacio para volver a ti', description: 'Nuestra recepción', imageUrl: localImages[0] }, { id: 2, title: 'Rituales que reparan', description: 'Sala de tratamientos', imageUrl: localImages[1] }, { id: 3, title: 'Primero escuchamos', description: 'Consulta personalizada', imageUrl: localImages[2] }];
  const serviceItems = services.length ? services : [
    { id: 1, name: 'Limpieza profunda', description: 'Una piel luminosa, equilibrada y lista para respirar.', duration: '60 min', price: 120, imageUrl: localImages[1] },
    { id: 2, name: 'Hydrafacial', description: 'Tecnología de hidratación y renovación sin tiempo de recuperación.', duration: '50 min', price: 185, imageUrl: localImages[2] },
    { id: 3, name: 'Toxina botulínica', description: 'Resultados naturales, planeados contigo y aplicados por especialistas.', duration: '45 min', price: null, imageUrl: localImages[0] }
  ];
  const videoItems = videos.length ? videos : localVideos.map((v, i) => ({ id: i + 1, title: ['El ritual NOVA', 'La ciencia se siente', 'Detalles que importan'][i], description: 'Conoce un poco más de nuestro universo.', videoUrl: v[0], posterUrl: v[1] }));
  const submitContact = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    contact.mutate(
      { data: { name: String(f.get('name')), phone: String(f.get('phone')), email: String(f.get('email')), message: String(f.get('message')) } },
      { onSuccess: () => { setSent(true); form.reset(); } },
    );
  };
  return <div className="nova-grain overflow-hidden bg-[#F2F2EF] text-[#2F4055]">
    <header className="absolute left-0 right-0 top-0 z-40 border-b border-white/20 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-10">
        <a href="#inicio" data-testid="link-home" className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#BB9445] font-serif text-xl text-[#BB9445]">N</span><span className="text-sm font-bold tracking-[.24em]">NOVA SKIN</span></a>
        <nav className="hidden items-center gap-8 text-xs uppercase tracking-[.2em] md:flex"><a data-testid="link-services" href="#servicios">Tratamientos</a><a data-testid="link-space" href="#espacio">El espacio</a><a data-testid="link-team" href="#equipo">Especialistas</a><a data-testid="link-contact" href="#contacto">Contacto</a></nav>
        <Button testId="button-book-header" variant="gold" onClick={() => document.querySelector('#contacto')?.scrollIntoView({ behavior: 'smooth' })}>Agendar consulta <ArrowRight size={15}/></Button>
        <button data-testid="button-mobile-menu" onClick={() => setMenu(!menu)} className="ml-2 md:hidden"><Menu size={23}/></button>
      </div>
      {menu && <nav className="flex flex-col gap-5 bg-[#2F4055] px-6 py-6 text-sm uppercase tracking-widest md:hidden"><a href="#servicios" onClick={() => setMenu(false)}>Tratamientos</a><a href="#espacio" onClick={() => setMenu(false)}>El espacio</a><a href="#equipo" onClick={() => setMenu(false)}>Especialistas</a><a href="#contacto" onClick={() => setMenu(false)}>Contacto</a></nav>}
    </header>
    <main>
       <section id="inicio" className="relative flex min-h-[100svh] items-end overflow-hidden bg-[#2F4055] px-5 pb-14 pt-32 md:px-10 md:pb-24">
         <video
           aria-hidden="true"
           autoPlay
           muted
           loop
           playsInline
           preload="auto"
           poster={heroPoster}
           className="absolute inset-0 h-full w-full object-cover object-[56%_center] md:object-center"
         >
           <source src={heroVideo} type="video/mp4" />
         </video>
         <div className="absolute inset-0 bg-[#202c3a]/20" />
         <div className="absolute inset-0 bg-gradient-to-r from-[#202c3a]/65 via-[#202c3a]/20 to-transparent" />
         <div className="absolute inset-0 bg-gradient-to-t from-[#202c3a]/50 via-transparent to-[#202c3a]/10" />
         <div className="relative mx-auto w-full max-w-7xl">
           <div className="max-w-[760px] text-[#F2F2F0] md:max-w-[820px]">
             <p className="hero-reveal hero-reveal-1 mb-5 text-[11px] font-bold uppercase tracking-[.3em] text-[#e0bb69] md:text-xs md:tracking-[.35em]">{heroContent.eyebrow}</p>
             <h1 className="hero-reveal hero-reveal-2 max-w-[760px] font-serif text-[3.25rem] leading-[.98] md:text-[6.25rem] lg:text-[7.25rem]">{heroContent.title}</h1>
             <p className="hero-reveal hero-reveal-3 mt-7 max-w-xl text-base leading-7 text-[#e9ebe8] md:text-lg">{heroContent.description}</p>
             <div className="hero-reveal hero-reveal-4 mt-8 flex flex-wrap gap-3 md:mt-9">
               <Button testId="button-book-hero" variant="gold" className="min-h-12 px-6 uppercase tracking-[.08em]" onClick={() => document.querySelector('#contacto')?.scrollIntoView({ behavior: 'smooth' })}>Agendar valoración <ArrowRight size={16}/></Button>
               <a data-testid="link-whatsapp-hero" href={`https://wa.me/${String(site.whatsapp || fallback.whatsapp).replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/45 bg-[#202c3a]/15 px-6 py-3 text-sm font-semibold uppercase tracking-[.08em] text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white/12"><MessageCircle size={16}/> WhatsApp</a>
             </div>
           </div>
         </div>
      </section>
      <section className="bg-[#F2F2EF] px-5 py-20 md:px-10 md:py-32"><div className="mx-auto grid max-w-7xl items-start gap-12 md:grid-cols-[.65fr_1fr]"><div><p className="text-7xl font-serif text-[#BB9445]/50">01</p><p className="mt-8 max-w-xs text-xs font-bold uppercase leading-5 tracking-[.2em] text-[#AF9275]">Más que resultados,<br/>un nuevo ritual.</p></div><div><SectionHeading eyebrow="Nuestra filosofía" title="Tu piel merece el respaldo de la ciencia y el confort de un spa." copy={site.aboutText || fallback.aboutText}/><div className="mt-9 grid grid-cols-2 gap-7 border-t border-[#AF9275]/40 pt-7 text-sm"><div><Sparkles size={19} className="mb-3 text-[#BB9445]"/><b className="block">Ciencia cercana</b><span className="mt-1 block text-[#68727b]">Protocolos pensados para ti.</span></div><div><CircleCheck size={19} className="mb-3 text-[#BB9445]"/><b className="block">Bienestar real</b><span className="mt-1 block text-[#68727b]">Un espacio que baja el ruido.</span></div></div></div></div></section>
      <section id="servicios" className="bg-[#e6e1d9] px-5 py-20 md:px-10 md:py-28"><div className="mx-auto max-w-7xl"><SectionHeading eyebrow="Tratamientos" title="Lo que tu piel necesita, lo encontramos juntas." copy="Cada protocolo comienza con una conversación y termina con un plan que puedes sostener."/><div className="mt-14 grid gap-5 md:grid-cols-3">{serviceItems.map((s, i) => <article key={s.id} data-testid={`card-service-${s.id}`} className={`group ${i === 1 ? 'md:mt-14' : ''}`}><div className="arch relative aspect-[.82] overflow-hidden bg-[#AF9275]"><img src={s.imageUrl || localImages[i % 3]} alt={s.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-[#202c3a]/70 to-transparent opacity-70"/><span className="absolute bottom-5 left-5 text-xs uppercase tracking-[.2em] text-[#F2F2EF]">0{i + 1}</span></div><div className="flex items-start justify-between gap-3 pt-5"><div><h3 className="font-serif text-2xl">{s.name}</h3><p className="mt-2 text-sm leading-6 text-[#68727b]">{s.description}</p></div><ArrowRight size={18} className="mt-1 shrink-0 text-[#BB9445] transition group-hover:translate-x-1"/></div><div className="mt-4 flex gap-4 text-xs font-semibold uppercase tracking-wider text-[#AF9275]"><span>{s.duration || 'Personalizado'}</span>{s.price && <span>${s.price}</span>}</div></article>)}</div></div></section>
      <section id="espacio" className="bg-[#2F4055] px-5 py-20 text-[#F2F2F0] md:px-10 md:py-32"><div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[.8fr_1.2fr] md:items-end"><SectionHeading light eyebrow="El espacio NOVA" title="No es solo una cita, es un momento de reconexión contigo misma." copy="Luz cálida, manos expertas y el tiempo suficiente para que vuelvas a escucharte."/><div className="grid grid-cols-2 gap-3 md:grid-cols-[1fr_1.35fr]"><img src={localImages[2]} alt="Consulta en NOVA Skin" className="aspect-[.8] w-full object-cover"/><img src={localImages[1]} alt="Sala de tratamiento NOVA Skin" className="mt-12 aspect-[.8] w-full object-cover"/></div></div></section>
      <section className="bg-[#F2F2EF] px-5 py-20 md:px-10 md:py-28"><div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-end justify-between gap-6"><SectionHeading eyebrow="Un vistazo" title="El cuidado también vive en los detalles."/><p className="max-w-xs text-sm leading-6 text-[#68727b]">Un ambiente creado para sentirte tranquila desde el primer paso.</p></div><div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">{galleryItems.slice(0, 4).map((g, i) => <button type="button" key={g.id} data-testid={`button-gallery-${g.id}`} onClick={() => setLightbox(g)} className={`group relative overflow-hidden text-left ${i === 0 ? 'col-span-2 row-span-2' : ''}`}><img src={g.imageUrl || localImages[i % 3]} alt={g.title} className="h-full min-h-40 w-full object-cover transition duration-700 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-[#202c3a]/65 to-transparent opacity-0 transition group-hover:opacity-100"/><span className="absolute bottom-4 left-4 text-sm text-white opacity-0 transition group-hover:opacity-100">{g.title}</span></button>)}</div></div></section>
      {promotions.length > 0 && <section className="bg-[#AF9275] px-5 py-16 md:px-10"><div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[.8fr_1.2fr] md:items-center"><SectionHeading eyebrow="Este mes en NOVA" title="Un buen momento para empezar." copy="Conoce nuestras experiencias y beneficios vigentes."/><div className="grid gap-4 md:grid-cols-2">{promotions.map(p => <div key={p.id} className="bg-[#F2F2EF] p-7"><p className="text-xs uppercase tracking-widest text-[#BB9445]">NOVA edit</p><h3 className="mt-3 font-serif text-2xl">{p.title}</h3><p className="mt-3 text-sm text-[#68727b]">{p.description}</p></div>)}</div></div></section>}
       <section className="bg-[#e6e1d9] px-5 py-20 md:px-10 md:py-28"><div className="mx-auto max-w-7xl"><div className="flex items-end justify-between"><SectionHeading eyebrow="Desde adentro" title="La calma también se practica."/><div className="hidden gap-2 md:flex"><button data-testid="button-video-prev" className="rounded-full border border-[#AF9275] p-3"><ChevronLeft size={18}/></button><button data-testid="button-video-next" className="rounded-full border border-[#AF9275] p-3"><ChevronRight size={18}/></button></div></div><div className="mt-12 grid gap-5 md:grid-cols-3">{videoItems.map((v, i) => <article key={v.id}><HoverVideo src={v.videoUrl} poster={v.posterUrl || localVideos[i % 3][1]} title={v.title}/><h3 className="mt-4 font-serif text-2xl">{v.title}</h3><p className="mt-1 text-sm text-[#68727b]">{v.description}</p></article>)}</div></div></section>
      {specialists.length > 0 && <section id="equipo" className="bg-[#F2F2EF] px-5 py-20 md:px-10 md:py-28"><div className="mx-auto max-w-7xl"><SectionHeading eyebrow="NUESTRO EQUIPO" title="Profesionales dedicadas al cuidado de tu piel."/><div className="mt-12 grid gap-10 md:grid-cols-2">{specialists.slice(0, 2).map((s, i) => <div key={s.id}><div className="arch aspect-[.92] overflow-hidden bg-[#AF9275]"><img src={s.photoUrl || localImages[i % 3]} alt={s.name} className="h-full w-full object-cover transition duration-700 hover:scale-[1.02]"/></div><p className="mt-5 text-xs uppercase tracking-widest text-[#BB9445]">{s.specialty}</p><h3 className="mt-2 font-serif text-2xl md:text-3xl">{s.name}</h3>{s.bio && <p className="mt-2 text-sm leading-6 text-[#68727b]">{s.bio}</p>}</div>)}</div></div></section>}
      {testimonials.length > 0 && <section className="bg-[#2F4055] px-5 py-20 text-[#F2F2F0] md:px-10 md:py-28"><div className="mx-auto max-w-5xl text-center"><p className="text-xs uppercase tracking-[.3em] text-[#e0bb69]">Historias NOVA</p><div className="mx-auto mt-8 flex justify-center gap-1 text-[#BB9445]">{[1,2,3,4,5].map(x => <Star key={x} size={16} fill="currentColor"/>)}</div><blockquote className="mt-8 font-serif text-3xl leading-tight md:text-5xl">“{testimonials[0].comment}”</blockquote><p className="mt-7 text-sm uppercase tracking-widest text-[#c7ccca]">— {testimonials[0].name}</p></div></section>}
      <section id="contacto" className="bg-[#F2F2EF] px-5 py-20 md:px-10 md:py-28"><div className="mx-auto grid max-w-7xl gap-14 md:grid-cols-[.8fr_1.2fr]"><div><SectionHeading eyebrow="Empieza por aquí" title="Hablemos de lo que quieres sentir." copy="Cuéntanos qué te gustaría trabajar. Te responderemos con calma para encontrar el mejor siguiente paso."/><div className="mt-9 space-y-4 text-sm"><a data-testid="link-contact-phone" href={`tel:${site.phone}`} className="flex items-center gap-3"><Phone size={17} className="text-[#BB9445]"/>{site.phone}</a><div className="flex items-center gap-3"><Mail size={17} className="text-[#BB9445]"/>{site.email || 'Correo próximamente'}</div><div className="flex items-start gap-3"><Clock3 size={17} className="mt-0.5 text-[#BB9445]"/><span className="whitespace-pre-line">{site.hours}</span></div><div className="flex items-start gap-3"><CalendarDays size={17} className="mt-0.5 text-[#BB9445]"/><span className="whitespace-pre-line">{site.address}</span></div></div></div><form onSubmit={submitContact} className="soft-card bg-[#e6e1d9] p-7 md:p-10"><p className="mb-7 font-serif text-2xl">Tu próximo ritual empieza con una pregunta.</p><div className="grid gap-4 md:grid-cols-2"><input required name="name" data-testid="input-contact-name" className="admin-input" placeholder="Nombre"/><input required name="phone" data-testid="input-contact-phone" className="admin-input" placeholder="Teléfono"/><input name="email" type="email" data-testid="input-contact-email" className="admin-input md:col-span-2" placeholder="Email"/><textarea required name="message" data-testid="input-contact-message" className="admin-input min-h-32 resize-y md:col-span-2" placeholder="¿Qué te gustaría consultar?"/><Button type="submit" testId="button-contact-submit" variant="gold" className="md:col-span-2">{contact.isPending ? 'Enviando…' : sent ? <><Check size={16}/> Recibido, gracias</> : <>Enviar mensaje <Send size={16}/></>}</Button></div>{contact.isError && <p data-testid="status-contact-error" className="mt-4 text-sm text-[#A83525]">No pudimos enviar tu mensaje. Intenta de nuevo.</p>}</form></div></section>
    </main>
    <footer className="bg-[#202c3a] px-5 py-12 text-[#F2F2F0] md:px-10"><div className="mx-auto flex max-w-7xl flex-col gap-10 md:flex-row md:items-end md:justify-between"><div><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#BB9445] font-serif text-xl text-[#BB9445]">N</span><span className="text-sm font-bold tracking-[.24em]">NOVA SKIN</span></div><p className="mt-5 max-w-xs text-sm leading-6 text-[#bdc5c8]">{site.tagline}</p></div><div className="text-sm text-[#bdc5c8] md:text-right"><p>{site.address}</p><p className="mt-2">{site.hours}</p><div className="mt-5 flex gap-4 md:justify-end"><a data-testid="link-footer-instagram" href="#" aria-label="Instagram"><Instagram size={18}/></a><a data-testid="link-footer-whatsapp" href={`https://wa.me/${String(site.whatsapp).replace(/\D/g, '')}`} aria-label="WhatsApp"><MessageCircle size={18}/></a></div></div></div><div className="mx-auto mt-10 max-w-7xl border-t border-white/15 pt-5 text-xs text-[#82909a]">© {new Date().getFullYear()} NOVA Skin Med Spa · Estética avanzada, bienestar real.</div></footer>
    {lightbox && <div role="dialog" aria-modal="true" className="fixed inset-0 z-[60] grid place-items-center bg-[#202c3a]/90 p-5" onClick={() => setLightbox(null)}><button data-testid="button-close-lightbox" onClick={() => setLightbox(null)} className="absolute right-5 top-5 rounded-full border border-white/30 p-3 text-white"><X size={18}/></button><div onClick={e => e.stopPropagation()} className="max-h-[90vh] max-w-5xl"><img src={lightbox.imageUrl} alt={lightbox.title} className="max-h-[78vh] w-auto object-contain"/><h3 className="mt-4 font-serif text-2xl text-white">{lightbox.title}</h3><p className="mt-1 text-sm text-[#d5d7d5]">{lightbox.description}</p></div></div>}
    {isLoading && <div className="fixed bottom-5 left-5 z-50 rounded-full bg-[#2F4055] px-4 py-2 text-xs text-white">Cargando NOVA…</div>}{isError && <div className="fixed bottom-5 left-5 z-50 rounded-full bg-[#A83525] px-4 py-2 text-xs text-white">Mostrando información esencial</div>}
  </div>;
}

function AdminRoute({ component: Component, path }: any) {
  return (
    <Route path={path}>
      <AdminLayout>
        <Component />
      </AdminLayout>
    </Route>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={PublicSite} />
        <Route path="/admin/login" component={Login} />
        <AdminRoute path="/admin" component={Dashboard} />
        <AdminRoute path="/admin/services" component={Services} />
        <AdminRoute path="/admin/gallery" component={Gallery} />
        <AdminRoute path="/admin/videos" component={Videos} />
        <AdminRoute path="/admin/promotions" component={Promotions} />
        <AdminRoute path="/admin/specialists" component={Specialists} />
        <AdminRoute path="/admin/testimonials" component={Testimonials} />
        <AdminRoute path="/admin/messages" component={Messages} />
        <AdminRoute path="/admin/settings" component={AdminSettings} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
