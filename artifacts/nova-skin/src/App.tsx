import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  ArrowRight, BarChart3, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, CircleAlert,
  Clock3, Eye, FileText, Image as ImageIcon, Instagram, LayoutDashboard, LogOut,
  Mail, Menu, MessageCircle, Pencil, Phone, Plus, Play, Save, Scissors, Send, Settings,
  Trash2, UserRound, Users, Video as VideoIcon, X
} from 'lucide-react';
import {
  getGetAdminSummaryQueryKey, getGetCurrentUserQueryKey, getGetSiteQueryKey, getGetSiteSettingsQueryKey,
  getListContactMessagesQueryKey, getListGalleryImagesQueryKey, getListPromotionsQueryKey,
  getListServicesQueryKey, getListSpecialistsQueryKey,
  getListVideosQueryKey, useCreateContactMessage, useCreateGalleryImage, useCreatePromotion, useCreateService,
  useCreateSpecialist, useCreateVideo, useDeleteContactMessage, useDeleteGalleryImage,
  useDeletePromotion, useDeleteService, useDeleteSpecialist, useDeleteVideo, useGetAdminSummary,
  useGetCurrentUser, useGetSite, useGetSiteSettings, useListContactMessages, useListGalleryImages,
  useListPromotions, useListServices, useListSpecialists, useListVideos, useLogin, useLogout,
  useUpdateContactMessage, useUpdateGalleryImage, useUpdatePromotion, useUpdateService, useUpdateSiteSettings,
  useUpdateSpecialist, useUpdateVideo
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
import WhatToImproveSection from '@/components/what-to-improve-section';
import SalonSpacesSection from '@/components/salon-spaces-section';
import ExperienceTimelineSection from '@/components/experience-timeline-section';
import FacialCleansingSection from '@/components/facial-cleansing-section';
import FacialCleansingDetailsModal from '@/components/facial-cleansing-details-modal';
import TeamSection from '@/components/team-section';
import FaqSection from '@/components/faq-section';
import ReviewsSection from '@/components/reviews-section';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 20_000, retry: 1 } } });

const media = '/media/';
const fallback = {
  clinicName: 'Nova Skin', tagline: 'Estética avanzada, bienestar real', phone: '871 143 7775',
  whatsapp: '8711437775', email: 'Correo próximamente', address: 'Av. Juárez 4955\nPlaza Laguna Oriente\nLocal 43',
  hours: '10:00 a.m. – 2:00 p.m. / 3:00 p.m. – 7:00 p.m.', instagram: '@novaskinmedspa', facebook: 'Nova Skin', tiktok: '@novaskinmedspa',
  heroImage: `${media}clinic-lobby.png`, heroEyebrow: 'ESTÉTICA AVANZADA, BIENESTAR REAL', heroTitle: 'Tu piel merece el respaldo de la ciencia y el confort de un spa.',
  heroDescription: 'Tratamientos clínico-estéticos personalizados en un entorno cálido, sofisticado y seguro.',
  aboutText: 'Creemos que el cuidado personal no debe sentirse como una obligación, sino como un momento de reconexión. Combinamos ciencia, tecnología y bienestar para que cada visita se sienta tan bien como se ve.'
};

const visibleBrandTextFields = new Set([
  'clinicName',
  'heroEyebrow',
  'heroTitle',
  'heroDescription',
  'aboutText',
  'name',
  'title',
  'description',
  'comment',
  'bio',
  'question',
  'answer',
]);

function normalizeVisibleBrandText<T>(record: T): T {
  return Object.fromEntries(
    Object.entries(record as object).map(([key, value]) => [
      key,
      visibleBrandTextFields.has(key) && typeof value === 'string'
        ? value.replaceAll('NovaSkin', 'Nova Skin')
        : value,
    ]),
  ) as T;
}

const localImages = [`${media}clinic-lobby.png`, `${media}treatment-room.png`, `${media}consultation.png`];
const experienceImages = [
  `${media}experience-01-assessment.png`,
  `${media}experience-02-protocol-new.png`,
  `${media}experience-03-treatment.png`,
  `${media}experience-04-follow-up-new.png`,
];
const heroVideo = `${media}WhatsApp_Video_2026-08-28_at_11.57.22_AM_1787940023775.mp4`;
const heroPoster = `${media}WhatsApp_Video_2026-08-28_at_11.57.22_AM_1787940023775.jpg`;
const facialCleansingVideo = `${media}facial-cleansing.mp4`;
const facialCleansingPoster = `${media}facial-cleansing-poster.jpg`;
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
    video.defaultMuted = true;
    video.muted = true;
    void video.play().catch(() => {
      // Browsers can still reject playback when the device has media restrictions.
    });
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isInViewport = false;
    video.defaultMuted = true;
    video.muted = true;

    const playWhenVisible = () => {
      if (!isInViewport) return;
      video.defaultMuted = true;
      video.muted = true;
      if (video.readyState < HTMLMediaElement.HAVE_METADATA) return;
      void video.play().catch(() => undefined);
    };

    const playWhenReady = () => playWhenVisible();
    const observer = typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver(
          ([entry]) => {
            isInViewport = entry.isIntersecting;
            if (isInViewport) {
              playWhenVisible();
            } else {
              video.pause();
            }
          },
          { threshold: 0.2 },
        );

    video.addEventListener('loadeddata', playWhenReady);
    video.addEventListener('canplay', playWhenReady);

    if (observer) {
      observer.observe(video);
    } else {
      isInViewport = true;
      playWhenVisible();
    }

    return () => {
      observer?.disconnect();
      video.removeEventListener('loadeddata', playWhenReady);
      video.removeEventListener('canplay', playWhenReady);
      video.pause();
    };
  }, []);

  return (
    <div
      className="group relative aspect-video overflow-hidden bg-[#2F4055]"
      onMouseEnter={playVideo}
      onFocus={playVideo}
      tabIndex={0}
      aria-label={`${title}. Se reproduce automáticamente al entrar en pantalla`}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay
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

function PhilosophySection({ copy }: { copy: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const principles = [
    {
      number: '01',
      title: 'Atención personalizada',
      description: 'Cada piel y cada objetivo son diferentes. Por eso, el cuidado comienza por conocer tus necesidades.',
    },
    {
      number: '02',
      title: 'Cuidado profesional',
      description: 'Cada tratamiento parte de una valoración y de un protocolo pensado de acuerdo con las necesidades de cada persona.',
    },
    {
      number: '03',
      title: 'Resultados naturales',
      description: 'Buscamos cuidar y realzar la apariencia de la piel manteniendo una imagen natural y equilibrada.',
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="filosofia"
      className={`philosophy-section bg-[#F2F2EF] px-5 py-24 md:px-10 md:py-32 lg:py-36 ${isVisible ? 'philosophy-visible' : ''}`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="philosophy-reveal philosophy-delay-1">
            <p className="text-[11px] font-bold uppercase tracking-[.28em] text-[#BB9445]">NUESTRA FILOSOFÍA</p>
            <h2 className="mt-6 max-w-xl font-serif text-[2.6rem] leading-[1.04] text-[#2F4055] md:text-[3.25rem] lg:text-[4rem]">
              Tu piel merece un cuidado pensado para ti.
            </h2>
          </div>
          <div className="flex items-end lg:pb-2">
            <p className="philosophy-reveal philosophy-delay-2 max-w-lg text-base leading-8 text-[#68727b] md:text-lg">
              {copy}
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-0 border-t border-[#AF9275]/45 md:mt-20 md:grid-cols-2 lg:grid-cols-3">
          {principles.map((principle, index) => (
            <div
              key={principle.number}
              className={`philosophy-reveal philosophy-principle philosophy-delay-${index + 3} group border-b border-[#AF9275]/45 py-8 md:px-8 md:py-10 lg:border-b-0 lg:first:pl-0 lg:last:pr-0 ${index === 2 ? 'md:col-span-2 lg:col-span-1' : ''} ${index > 0 ? 'lg:border-l lg:border-[#AF9275]/45' : ''}`}
            >
              <p className="font-serif text-4xl text-[#BB9445]/65 transition-colors duration-300 group-hover:text-[#BB9445]">{principle.number}</p>
              <h3 className="mt-6 max-w-xs font-serif text-2xl text-[#2F4055]">{principle.title}</h3>
              <p className="mt-4 max-w-sm text-sm leading-7 text-[#68727b]">{principle.description}</p>
            </div>
          ))}
        </div>

        <a
          href="#servicios"
          className="philosophy-reveal philosophy-delay-6 mt-16 inline-flex items-center gap-4 text-[11px] font-bold uppercase tracking-[.24em] text-[#AF9275] transition-colors duration-300 hover:text-[#BB9445] md:mt-20"
        >
          <span className="h-px w-10 bg-[#BB9445]/70" />
          DESCUBRE NUESTROS TRATAMIENTOS ↓
        </a>
      </div>
    </section>
  );
}

type TreatmentFaq = { question: string; answer: string };
type Treatment = {
  number: string;
  name: string;
  imageUrl: string;
  description: string;
  detail: string;
  faq: TreatmentFaq[];
};

const treatmentCatalog: Treatment[] = [
  {
    number: '01',
    name: 'Limpieza Facial',
    imageUrl: `${media}what-to-improve-skin.jpg`,
    description: 'Cuidado facial enfocado en limpiar, renovar y mejorar la apariencia general de la piel.',
    detail: 'La información detallada de este tratamiento estará disponible próximamente. El equipo de Nova Skin podrá orientarte durante una valoración.',
    faq: [],
  },
  {
    number: '02',
    name: 'Toxina Botulínica',
    imageUrl: `${media}treatment-01-toxina.jpg`,
    description: 'Ayuda a disminuir temporalmente la actividad de determinados músculos para suavizar líneas de expresión.',
    detail: 'Es un tratamiento que ayuda a disminuir temporalmente la actividad de determinados músculos para suavizar líneas de expresión. Una aplicación adecuada busca mantener una apariencia natural.',
    faq: [
      { question: '¿Cuándo se empiezan a ver los resultados?', answer: 'Los primeros efectos pueden comenzar a observarse aproximadamente a partir del tercer día y continúan evolucionando posteriormente.' },
      { question: '¿Cuánto dura el efecto?', answer: 'De acuerdo con la información proporcionada por Nova Skin, suele tener una duración aproximada de 4 a 6 meses, aunque puede variar según cada persona.' },
      { question: '¿Me va a dejar la cara sin expresión?', answer: 'El objetivo de una aplicación adecuada es suavizar las líneas de expresión manteniendo una apariencia natural.' },
    ],
  },
  {
    number: '03',
    name: 'Bioestimuladores',
    imageUrl: `${media}treatment-02-biostimuladores.jpg`,
    description: 'Estimulan progresivamente la producción natural de colágeno y elastina para mejorar la firmeza y calidad de la piel.',
    detail: 'Los bioestimuladores buscan estimular progresivamente la producción natural de colágeno y elastina para mejorar la firmeza, elasticidad y calidad de la piel.',
    faq: [
      { question: '¿Los resultados son inmediatos?', answer: 'Los resultados son principalmente progresivos porque el tratamiento busca estimular procesos como la producción natural de colágeno.' },
      { question: '¿Cuánto duran los resultados?', answer: 'Pueden mantenerse durante varios meses y la duración depende del producto utilizado y de las características de cada paciente.' },
      { question: '¿Cuántas sesiones necesito?', answer: 'El número de sesiones depende del producto, las condiciones de la piel y los objetivos de cada persona, por lo que se determina durante una valoración.' },
    ],
  },
  {
    number: '04',
    name: 'PDRN Salmón',
    imageUrl: `${media}treatment-03-pdrn.jpg`,
    description: 'Tratamiento enfocado en la bioestimulación y regeneración cutánea para mejorar la calidad general de la piel.',
    detail: 'Es un tratamiento enfocado en la bioestimulación y regeneración cutánea para mejorar la calidad general de la piel.',
    faq: [
      { question: '¿Es realmente de salmón?', answer: 'El PDRN se obtiene a partir de ADN de salmón altamente purificado y procesado para su utilización correspondiente.' },
      { question: '¿Cuándo se empiezan a notar los resultados?', answer: 'Algunos cambios pueden apreciarse desde las primeras sesiones, mientras que otros relacionados con la calidad de la piel aparecen progresivamente.' },
      { question: '¿Qué cuidados debo tener después?', answer: 'Deben seguirse las indicaciones del profesional y pueden incluir mantener la piel limpia e hidratada, utilizar protección solar y evitar temporalmente productos irritantes.' },
    ],
  },
  {
    number: '05',
    name: 'Skin Boosters',
    imageUrl: `${media}treatment-04-skin-boosters.jpg`,
    description: 'Enfocados en mejorar la hidratación, luminosidad, elasticidad y calidad general de la piel.',
    detail: 'Los Skin Boosters están enfocados principalmente en mejorar la hidratación, luminosidad, elasticidad y calidad de la piel.',
    faq: [
      { question: '¿Los Skin Boosters dan volumen al rostro?', answer: 'Su objetivo principal es mejorar la hidratación y calidad de la piel; no persiguen el mismo efecto de volumen que un relleno.' },
      { question: '¿Qué beneficios puedo notar?', answer: 'Están enfocados en mejorar aspectos como hidratación, luminosidad, elasticidad y calidad general de la piel.' },
      { question: '¿Cuántas sesiones necesito?', answer: 'El protocolo depende del producto utilizado, las condiciones de la piel y los objetivos del paciente, por lo que debe establecerse de manera personalizada.' },
    ],
  },
  {
    number: '06',
    name: 'NCTF Revitalizante',
    imageUrl: `${media}treatment-05-nctf.jpg`,
    description: 'Mesoterapia enfocada en revitalizar la piel y mejorar hidratación, luminosidad y textura.',
    detail: 'Es un tratamiento de mesoterapia enfocado en revitalizar la piel y mejorar aspectos como hidratación, luminosidad, textura y calidad general.',
    faq: [
      { question: '¿Para qué sirve NCTF?', answer: 'Está enfocado en revitalizar la piel y mejorar aspectos como hidratación, luminosidad, textura y calidad general.' },
      { question: '¿Es un relleno facial?', answer: 'Nova Skin lo maneja como un tratamiento de mesoterapia revitalizante con ácido hialurónico no reticulado y otros activos, enfocado principalmente en la calidad de la piel.' },
      { question: '¿Se puede combinar con otros tratamientos?', answer: 'En algunos casos sí, pero cualquier combinación debe definirse de manera personalizada durante una valoración profesional.' },
    ],
  },
  {
    number: '07',
    name: 'Mesoterapia Capilar',
    imageUrl: `${media}treatment-06-mesoterapia-capilar.jpg`,
    description: 'Aplicación de activos directamente en el cuero cabelludo para favorecer las condiciones del folículo y la calidad del cabello.',
    detail: 'Consiste en aplicar activos directamente en el cuero cabelludo para favorecer las condiciones del folículo y mejorar la calidad del cabello.',
    faq: [
      { question: '¿Para quién está indicada?', answer: 'Puede utilizarse como apoyo en personas con cabello debilitado, pérdida de densidad o caída capilar, siempre después de una valoración.' },
      { question: '¿Todos reciben los mismos activos?', answer: 'No. El protocolo y los activos deben seleccionarse de acuerdo con las necesidades individuales de cada persona.' },
      { question: '¿Cuántas sesiones necesito?', answer: 'El número y frecuencia de las sesiones dependerán de las necesidades detectadas durante la valoración y del protocolo indicado.' },
    ],
  },
];

function TreatmentDetailsModal({ treatment, onClose }: { treatment: Treatment; onClose: () => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const whatsappUrl = `https://wa.me/8711437775?text=${encodeURIComponent(`Hola, me gustaría recibir más información sobre ${treatment.name} y agendar una valoración.`)}`;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="treatment-modal-title" className="fixed inset-0 z-[70] flex items-center justify-center bg-[#202c3a]/80 p-4 md:p-8" onClick={onClose}>
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto bg-[#F2F2EF] text-[#2F4055] shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <button type="button" aria-label="Cerrar detalle del tratamiento" data-testid="button-close-treatment" onClick={onClose} className="absolute right-4 top-4 z-10 rounded-full border border-[#2F4055]/25 bg-[#F2F2EF]/90 p-3 text-[#2F4055] transition hover:bg-[#BB9445] md:right-6 md:top-6">
          <X size={18} />
        </button>
        <div className="grid lg:grid-cols-[.82fr_1.18fr]">
          <div className="bg-[#AF9275] p-5 md:p-8">
            <p className="text-xs font-bold uppercase tracking-[.24em] text-[#F2F2EF]">{treatment.number}</p>
            <h2 id="treatment-modal-title" className="mt-4 max-w-sm font-serif text-4xl leading-tight text-[#F2F2EF] md:text-5xl">{treatment.name}</h2>
            <div className="arch mt-8 overflow-hidden bg-[#2F4055]">
              <img src={treatment.imageUrl} alt={`Placeholder de ${treatment.name}`} className="aspect-[.78] h-full w-full object-cover" />
            </div>
          </div>
          <div className="p-6 md:p-10">
            <p className="text-[11px] font-bold uppercase tracking-[.25em] text-[#BB9445]">Información del tratamiento</p>
            <h3 className="mt-6 font-serif text-3xl text-[#2F4055]">¿En qué consiste?</h3>
            <p className="mt-4 text-base leading-8 text-[#68727b]">{treatment.detail}</p>
            {treatment.faq.length > 0 && <div className="mt-10 border-t border-[#AF9275]/45">
              <h3 className="py-6 font-serif text-3xl text-[#2F4055]">Preguntas frecuentes</h3>
              <div>
                {treatment.faq.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div key={faq.question} className="border-t border-[#AF9275]/45">
                      <button type="button" aria-expanded={isOpen} data-testid={`button-faq-${treatment.number}-${index + 1}`} onClick={() => setOpenFaq(isOpen ? null : index)} className="flex w-full items-center justify-between gap-5 py-5 text-left text-sm font-semibold text-[#2F4055]">
                        <span>{faq.question}</span>
                        <span className="shrink-0 font-serif text-2xl font-normal text-[#BB9445]">{isOpen ? '−' : '+'}</span>
                      </button>
                      <div className={`overflow-hidden text-sm leading-7 text-[#68727b] transition-all duration-300 ${isOpen ? 'max-h-48 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>}
            <div className="mt-10 bg-[#2F4055] p-6 text-[#F2F2F0] md:p-8">
              <p className="font-serif text-2xl">¿Quieres saber si este tratamiento es para ti?</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  testId="button-treatment-book"
                  variant="gold"
                  className="uppercase tracking-[.08em]"
                  onClick={() => {
                    onClose();
                    window.setTimeout(() => document.querySelector('#contacto')?.scrollIntoView({ behavior: 'smooth' }), 0);
                  }}
                >
                  Agendar valoración <ArrowRight size={16} />
                </Button>
                <a data-testid="link-treatment-whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/35 px-5 py-3 text-sm font-semibold uppercase tracking-[.08em] text-white transition hover:-translate-y-0.5 hover:bg-white/10">
                  <MessageCircle size={16} /> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTreatments(services: any[]): Treatment[] {
  return treatmentCatalog.map((treatment) => {
    const managedTreatment = services.find((service) => service.name === treatment.name);
    return {
      ...treatment,
      imageUrl: managedTreatment?.imageUrl || treatment.imageUrl,
      description: managedTreatment?.description || treatment.description,
    };
  });
}

function TreatmentsSection({ treatments, onSelect }: { treatments: Treatment[]; onSelect: (treatment: Treatment) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{ pointerId: number; startX: number; startScrollLeft: number; moved: boolean } | null>(null);
  const wasDraggedRef = useRef(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const updateArrows = () => {
      setCanScrollLeft(track.scrollLeft > 4);
      setCanScrollRight(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
    };
    updateArrows();
    track.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      track.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [treatments.length]);

  const scrollCarousel = (direction: number) => {
    const track = trackRef.current;
    if (!track) return;
    const firstCard = track.querySelector<HTMLElement>('.treatment-card');
    if (!firstCard) return;
    const styles = window.getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
    const step = firstCard.getBoundingClientRect().width + gap;
    if (!step) return;
    const maxScrollLeft = track.scrollWidth - track.clientWidth;
    const currentIndex = Math.round(track.scrollLeft / step);
    const nextPosition = Math.max(0, Math.min(maxScrollLeft, (currentIndex + direction) * step));
    track.scrollTo({ left: nextPosition, behavior: 'smooth' });
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    if (track.scrollWidth <= track.clientWidth) return;
    event.preventDefault();
    track.scrollLeft += event.deltaY;
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: track.scrollLeft,
      moved: false,
    };
    wasDraggedRef.current = false;
    setIsDragging(true);
    track.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    const dragState = dragStateRef.current;
    if (!track || !dragState || dragState.pointerId !== event.pointerId) return;
    const distance = event.clientX - dragState.startX;
    if (Math.abs(distance) > 4) {
      dragState.moved = true;
      event.preventDefault();
      track.scrollLeft = dragState.startScrollLeft - distance;
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    const dragState = dragStateRef.current;
    if (!track || !dragState || dragState.pointerId !== event.pointerId) return;
    wasDraggedRef.current = dragState.moved;
    dragStateRef.current = null;
    setIsDragging(false);
    if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
  };

  const handleTrackClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!wasDraggedRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    window.setTimeout(() => {
      wasDraggedRef.current = false;
    }, 0);
  };

  return (
    <section id="servicios" className="treatments-section bg-[#e6e1d9] px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.28em] text-[#BB9445]">TRATAMIENTOS</p>
            <h2 className="mt-5 max-w-3xl font-serif text-5xl leading-[1.02] text-[#2F4055] md:text-6xl">Cuidado personalizado, respaldado por la ciencia.</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#68727b]">Conoce las opciones de Nova Skin y encuentra el punto de partida para cuidar tu piel de forma personalizada.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" aria-label="Tratamientos anteriores" data-testid="button-treatment-prev" disabled={!canScrollLeft} onClick={() => scrollCarousel(-1)} className="rounded-full border border-[#AF9275] p-3 text-[#2F4055] transition hover:bg-[#F2F2EF] disabled:cursor-not-allowed disabled:opacity-35">
              <ChevronLeft size={18} />
            </button>
            <button type="button" aria-label="Siguientes tratamientos" data-testid="button-treatment-next" disabled={!canScrollRight} onClick={() => scrollCarousel(1)} className="rounded-full border border-[#AF9275] p-3 text-[#2F4055] transition hover:bg-[#F2F2EF] disabled:cursor-not-allowed disabled:opacity-35">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div
          ref={trackRef}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={handleTrackClick}
          className={`treatment-track mt-14 flex gap-5 overflow-x-auto pb-5 ${isDragging ? 'is-dragging' : ''}`}
        >
          {treatments.map((treatment) => (
            <article key={treatment.number} className="treatment-card group flex shrink-0 snap-start flex-col">
              <div className="treatment-photo arch relative h-[350px] overflow-hidden bg-[#AF9275] transition-transform duration-300 group-hover:-translate-y-1 md:h-[390px]">
                <img
                  src={treatment.imageUrl}
                  alt={`Imagen temporal de ${treatment.name}`}
                  draggable={false}
                  style={{ objectPosition: treatment.number === '01' ? 'center 45%' : 'center' }}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex flex-1 flex-col px-1 pb-2 pt-6">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#BB9445]">{treatment.number}</p>
                <div className="mt-3 min-h-4 text-[10px] font-bold uppercase tracking-[.16em] text-[#BB9445]">
                  {treatment.number === '01' && 'Ideal para comenzar'}
                </div>
                <h3 className="mt-3 font-serif text-3xl leading-tight text-[#2F4055]">{treatment.name}</h3>
                <p className="mt-4 text-sm leading-7 text-[#68727b]">{treatment.description}</p>
                <button
                  type="button"
                  data-testid={`button-treatment-more-${treatment.number}`}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelect(treatment);
                  }}
                  className="mt-auto inline-flex cursor-pointer items-center gap-2 pt-8 text-xs font-bold uppercase tracking-[.18em] text-[#2F4055] transition hover:text-[#BB9445]"
                >
                  Ver más <ArrowRight size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PublicSite() {
  const { data, isLoading, isError } = useGetSite();
  const site: any = data?.settings ? normalizeVisibleBrandText(data.settings) : fallback;
  const services: any[] = (data?.services ?? []).map(normalizeVisibleBrandText);
  const gallery: any[] = (data?.gallery ?? []).map(normalizeVisibleBrandText);
  const videos: any[] = (data?.videos ?? []).map(normalizeVisibleBrandText);
  const promotions: any[] = (data?.promotions ?? []).map(normalizeVisibleBrandText);
  const specialistsFromApi: any[] = (data?.specialists ?? []).map(normalizeVisibleBrandText);
  const specialists: any[] = [];
  const testimonials: any[] = (data?.testimonials ?? []).map(normalizeVisibleBrandText);
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
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [isFacialDetailsOpen, setIsFacialDetailsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const contact = useCreateContactMessage();
  const treatments = useMemo(() => getTreatments(services), [services]);
  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;

    let isInViewport = false;
    video.defaultMuted = true;
    video.muted = true;

    const playVideo = () => {
      if (!isInViewport || video.readyState < HTMLMediaElement.HAVE_METADATA) return;
      video.defaultMuted = true;
      video.muted = true;
      void video.play().catch(() => undefined);
    };
    const playWhenReady = () => playVideo();
    const observer = typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver(
          ([entry]) => {
            isInViewport = entry.isIntersecting;
            if (isInViewport) {
              playVideo();
            } else {
              video.pause();
            }
          },
          { threshold: 0.2 },
        );

    video.addEventListener('loadeddata', playWhenReady);
    video.addEventListener('canplay', playWhenReady);
    if (observer) {
      observer.observe(video);
    } else {
      isInViewport = true;
      playVideo();
    }

    return () => {
      observer?.disconnect();
      video.removeEventListener('loadeddata', playWhenReady);
      video.removeEventListener('canplay', playWhenReady);
      video.pause();
    };
  }, []);
  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const galleryItems = gallery.length ? gallery : [{ id: 1, title: 'Un espacio para volver a ti', description: 'Nuestra recepción', imageUrl: localImages[0] }, { id: 2, title: 'Rituales que reparan', description: 'Sala de tratamientos', imageUrl: localImages[1] }, { id: 3, title: 'Primero escuchamos', description: 'Consulta personalizada', imageUrl: localImages[2] }];
  const videoItems = videos.length ? videos : localVideos.map((v, i) => ({ id: i + 1, title: ['El ritual Nova Skin', 'La ciencia se siente', 'Detalles que importan'][i], description: 'Conoce un poco más de nuestro universo.', videoUrl: v[0], posterUrl: v[1] }));
  const submitContact = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    contact.mutate(
      { data: { name: String(f.get('name')), phone: String(f.get('phone')), email: String(f.get('email')), message: String(f.get('message')) } },
      { onSuccess: () => { setSent(true); form.reset(); } },
    );
  };
  const scrollToContact = () => document.querySelector('#contacto')?.scrollIntoView({ behavior: 'smooth' });
  const scrollToTreatments = (_treatments: string[]) => document.querySelector('#servicios')?.scrollIntoView({ behavior: 'smooth' });
  const improvementWhatsAppHref = `https://wa.me/${String(site.whatsapp || fallback.whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent('Hola, me gustaría recibir orientación sobre qué tratamiento puede ser adecuado para lo que quiero mejorar.')}`;
  const salonWhatsAppHref = `https://wa.me/${String(site.whatsapp || fallback.whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent('Hola, me gustaría agendar una valoración en Nova Skin.')}`;
  const salonSpacesWhatsAppHref = `https://wa.me/${String(site.whatsapp || fallback.whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent('Hola, me gustaría recibir información y agendar una valoración en Nova Skin.')}`;
  const experienceWhatsAppHref = `https://wa.me/${String(site.whatsapp || fallback.whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent('Hola, me gustaría agendar una valoración y conocer qué tratamiento puede ser adecuado para mí.')}`;
  const facialCleansingWhatsAppHref = `https://wa.me/${String(site.whatsapp || fallback.whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent('Hola, me gustaría recibir información sobre la limpieza facial de Nova Skin.')}`;
  const heroWhatsAppHref = `https://wa.me/${String(site.whatsapp || fallback.whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent('Hola, me gustaría recibir información sobre los tratamientos de Nova Skin.')}`;
  const faqQuestionWhatsAppHref = `https://wa.me/${String(site.whatsapp || fallback.whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent('Hola, tengo una pregunta sobre los servicios de Nova Skin.')}`;
  const faqAskWhatsAppHref = `https://wa.me/${String(site.whatsapp || fallback.whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent('Hola, tengo una duda y me gustaría recibir información sobre Nova Skin.')}`;
  return <div className="nova-grain overflow-hidden bg-[#F2F2EF] text-[#2F4055]">
    <header className={`fixed left-0 right-0 top-0 z-40 border-b text-white transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500 ${hasScrolled ? 'border-[#AF9275]/35 bg-[#202C3B]/90 shadow-[0_10px_30px_rgba(32,44,59,.16)] backdrop-blur-md' : 'border-white/20 bg-transparent'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-10">
        <a href="#inicio" data-testid="link-home" className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#BB9445] font-serif text-xl text-[#BB9445]">N</span><span className="text-sm font-bold tracking-[.24em]">NOVA SKIN</span></a>
        <nav className="hidden items-center gap-8 text-xs uppercase tracking-[.2em] md:flex"><a data-testid="link-services" href="#servicios">Tratamientos</a><a data-testid="link-space" href="#espacio">El espacio</a><a data-testid="link-team" href="#equipo">Especialistas</a><a data-testid="link-contact" href="#contacto">Contacto</a></nav>
        <Button testId="button-book-header" variant="gold" onClick={scrollToContact}>Agendar valoración <ArrowRight size={15}/></Button>
        <button data-testid="button-mobile-menu" onClick={() => setMenu(!menu)} className="ml-2 md:hidden"><Menu size={23}/></button>
      </div>
      {menu && <nav className="flex flex-col gap-5 bg-[#2F4055] px-6 py-6 text-sm uppercase tracking-widest md:hidden"><a href="#servicios" onClick={() => setMenu(false)}>Tratamientos</a><a href="#espacio" onClick={() => setMenu(false)}>El espacio</a><a href="#equipo" onClick={() => setMenu(false)}>Especialistas</a><a href="#contacto" onClick={() => setMenu(false)}>Contacto</a></nav>}
    </header>
    <main>
        <section id="inicio" className="relative flex min-h-[100svh] items-end overflow-hidden bg-[#2F4055] px-5 pb-14 pt-32 md:px-10 md:pb-24">
         <video
           ref={heroVideoRef}
           aria-hidden="true"
           autoPlay
           muted
           loop
           playsInline
           preload="auto"
           poster={heroPoster}
            className="absolute inset-0 h-full w-full object-cover object-[62%_center] md:object-center"
         >
           <source src={heroVideo} type="video/mp4" />
         </video>
          <div className="absolute inset-0 bg-gradient-to-r from-[#202c3a]/70 via-[#202c3a]/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#202c3a]/35 via-transparent to-[#202c3a]/[0.06]" />
         <div className="relative mx-auto w-full max-w-7xl">
            <div className="max-w-[680px] text-[#F2F2F0] md:max-w-[740px]">
             <p className="hero-reveal hero-reveal-1 mb-5 text-[11px] font-bold uppercase tracking-[.3em] text-[#e0bb69] md:text-xs md:tracking-[.35em]">{heroContent.eyebrow}</p>
              <h1 className="hero-reveal hero-reveal-2 max-w-[670px] font-serif text-[2.35rem] leading-[1.05] md:text-[3.2rem] lg:text-[3.35rem] xl:text-[3.5rem]">{heroContent.title}</h1>
             <p className="hero-reveal hero-reveal-3 mt-7 max-w-xl text-base leading-7 text-[#e9ebe8] md:text-lg">{heroContent.description}</p>
             <div className="hero-reveal hero-reveal-4 mt-8 flex flex-wrap gap-3 md:mt-9">
                <Button testId="button-book-hero" variant="gold" className="min-h-12 px-6 uppercase tracking-[.08em]" onClick={scrollToContact}>Agendar valoración <ArrowRight size={16}/></Button>
                <a data-testid="link-whatsapp-hero" href={heroWhatsAppHref} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/45 bg-[#202c3a]/15 px-6 py-3 text-sm font-semibold uppercase tracking-[.08em] text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white/12"><MessageCircle size={16}/> WhatsApp</a>
             </div>
           </div>
         </div>
      </section>
       <PhilosophySection copy="Nova Skin fusiona la precisión de la medicina estética con la serenidad de una experiencia de spa. Diseñamos cada tratamiento desde la escucha, la ciencia y el respeto por tu belleza natural." />
        <FacialCleansingSection
          onLearnMore={() => setIsFacialDetailsOpen(true)}
          onBook={scrollToContact}
          whatsappHref={facialCleansingWhatsAppHref}
          videoUrl={facialCleansingVideo}
          posterUrl={facialCleansingPoster}
        />
        <TreatmentsSection treatments={treatments} onSelect={setSelectedTreatment} />
       <WhatToImproveSection onViewRelated={scrollToTreatments} onBook={scrollToContact} whatsappHref={improvementWhatsAppHref} />
       <SalonSpacesSection onBook={scrollToContact} whatsappHref={salonSpacesWhatsAppHref} />
       <ExperienceTimelineSection imageUrls={experienceImages} onBook={scrollToContact} whatsappHref={experienceWhatsAppHref} />
       <TeamSection specialists={specialistsFromApi} fallbackImages={[localImages[2], localImages[1]]} imageOverrides={[`${media}specialist-maria.png`, `${media}specialist-indira.png`]} onBook={scrollToContact} whatsappHref={salonWhatsAppHref} />
      {specialists.length > 0 && <section id="equipo" className="bg-[#F2F2EF] px-5 py-20 md:px-10 md:py-28"><div className="mx-auto max-w-7xl"><SectionHeading eyebrow="NUESTRO EQUIPO" title="Profesionales dedicadas al cuidado de tu piel."/><div className="mt-12 grid gap-10 md:grid-cols-2">{specialists.slice(0, 2).map((s, i) => <div key={s.id}><div className="arch aspect-[.92] overflow-hidden bg-[#AF9275]"><img src={s.photoUrl || localImages[i % 3]} alt={s.name} className="h-full w-full object-cover transition duration-700 hover:scale-[1.02]"/></div><p className="mt-5 text-xs uppercase tracking-widest text-[#BB9445]">{s.specialty}</p><h3 className="mt-2 font-serif text-2xl md:text-3xl">{s.name}</h3>{s.bio && <p className="mt-2 text-sm leading-6 text-[#68727b]">{s.bio}</p>}</div>)}</div></div></section>}
       <ReviewsSection reviews={testimonials} />
       <FaqSection onBook={scrollToContact} whatsappHref={faqAskWhatsAppHref} questionWhatsappHref={faqQuestionWhatsAppHref} />
       <section id="contacto" className="bg-[#F2F2EF] px-5 py-20 md:px-10 md:py-28"><div className="mx-auto grid max-w-7xl gap-14 md:grid-cols-[.8fr_1.2fr]"><div><SectionHeading eyebrow="Empieza por aquí" title="Hablemos de lo que quieres sentir." copy="Cuéntanos qué te gustaría trabajar. Te responderemos con calma para encontrar el mejor siguiente paso."/><div className="mt-9 space-y-4 text-sm"><a data-testid="link-contact-phone" href={`tel:${site.phone}`} className="flex items-center gap-3"><Phone size={17} className="text-[#BB9445]"/>{site.phone}</a><div className="flex items-center gap-3"><Mail size={17} className="text-[#BB9445]"/>{site.email || 'Correo próximamente'}</div><div className="flex items-start gap-3"><Clock3 size={17} className="mt-0.5 text-[#BB9445]"/><span className="whitespace-pre-line">{site.hours}</span></div><div className="flex items-start gap-3"><CalendarDays size={17} className="mt-0.5 text-[#BB9445]"/><span className="whitespace-pre-line">{site.address}</span></div></div></div><form onSubmit={submitContact} className="soft-card bg-[#e6e1d9] p-7 md:p-10"><p className="mb-7 font-serif text-2xl">Tu próximo ritual empieza con una pregunta.</p><div className="grid gap-4 md:grid-cols-2"><input required name="name" data-testid="input-contact-name" className="admin-input" placeholder="Nombre"/><input required name="phone" data-testid="input-contact-phone" className="admin-input" placeholder="Teléfono"/><input name="email" type="email" data-testid="input-contact-email" className="admin-input md:col-span-2" placeholder="Email"/><textarea required name="message" data-testid="input-contact-message" className="admin-input min-h-32 resize-y md:col-span-2" placeholder="¿Qué te gustaría consultar?"/><Button type="submit" testId="button-contact-submit" variant="gold" className="md:col-span-2">{contact.isPending ? 'Enviando…' : sent ? <><Check size={16}/> Recibido, gracias</> : <>Enviar mensaje <Send size={16}/></>}</Button></div>{contact.isError && <p data-testid="status-contact-error" className="mt-4 text-sm text-[#A83525]">No pudimos enviar tu mensaje. Intenta de nuevo.</p>}</form></div></section>
    </main>
    <footer className="bg-[#202c3a] px-5 py-12 text-[#F2F2F0] md:px-10"><div className="mx-auto flex max-w-7xl flex-col gap-10 md:flex-row md:items-end md:justify-between"><div><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#BB9445] font-serif text-xl text-[#BB9445]">N</span><span className="text-sm font-bold tracking-[.24em]">NOVA SKIN</span></div><p className="mt-5 max-w-xs text-sm leading-6 text-[#bdc5c8]">{site.tagline}</p></div><div className="text-sm text-[#bdc5c8] md:text-right"><p>{site.address}</p><p className="mt-2">{site.hours}</p><div className="mt-5 flex gap-4 md:justify-end"><a data-testid="link-footer-instagram" href="#" aria-label="Instagram"><Instagram size={18}/></a><a data-testid="link-footer-whatsapp" href={`https://wa.me/${String(site.whatsapp).replace(/\D/g, '')}`} aria-label="WhatsApp"><MessageCircle size={18}/></a></div></div></div><div className="mx-auto mt-10 max-w-7xl border-t border-white/15 pt-5 text-xs text-[#82909a]">© {new Date().getFullYear()} Nova Skin · Estética avanzada, bienestar real.</div></footer>
     {selectedTreatment && <TreatmentDetailsModal treatment={selectedTreatment} onClose={() => setSelectedTreatment(null)} />}
     {isFacialDetailsOpen && (
       <FacialCleansingDetailsModal
         posterUrl={facialCleansingPoster}
         onClose={() => setIsFacialDetailsOpen(false)}
       />
     )}
     {lightbox && <div role="dialog" aria-modal="true" className="fixed inset-0 z-[60] grid place-items-center bg-[#202c3a]/90 p-5" onClick={() => setLightbox(null)}><button data-testid="button-close-lightbox" onClick={() => setLightbox(null)} className="absolute right-5 top-5 rounded-full border border-white/30 p-3 text-white"><X size={18}/></button><div onClick={e => e.stopPropagation()} className="max-h-[90vh] max-w-5xl"><img src={lightbox.imageUrl} alt={lightbox.title} className="max-h-[78vh] w-auto object-contain"/><h3 className="mt-4 font-serif text-2xl text-white">{lightbox.title}</h3><p className="mt-1 text-sm text-[#d5d7d5]">{lightbox.description}</p></div></div>}
    {isLoading && <div className="fixed bottom-5 left-5 z-50 rounded-full bg-[#2F4055] px-4 py-2 text-xs text-white">Cargando Nova Skin…</div>}{isError && <div className="fixed bottom-5 left-5 z-50 rounded-full bg-[#A83525] px-4 py-2 text-xs text-white">Mostrando información esencial</div>}
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
