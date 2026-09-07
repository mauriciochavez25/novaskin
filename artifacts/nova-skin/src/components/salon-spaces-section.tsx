import { useEffect, useRef, useState } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';

type SalonSpace = {
  label: string;
  videoUrl: string;
};

type SalonVideoProps = SalonSpace & {
  index: number;
};

export type SalonSpacesSectionProps = {
  onBook: () => void;
  whatsappHref: string;
};

function SalonVideo({ label, videoUrl, index }: SalonVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isInViewport = false;

    video.defaultMuted = true;
    video.muted = true;

    const playVideo = () => {
      if (!isInViewport) return;
      video.defaultMuted = true;
      video.muted = true;
      if (video.readyState < HTMLMediaElement.HAVE_METADATA) return;
      void video.play().catch(() => undefined);
    };

    const playWhenReady = () => {
      if (isInViewport) playVideo();
    };

    video.addEventListener('loadeddata', playWhenReady);
    video.addEventListener('canplay', playWhenReady);
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
          { rootMargin: '120px 0px', threshold: 0.2 },
        );

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

  return (
    <article className={`salon-space-item salon-space-item-${index} group relative overflow-hidden rounded-[1.25rem] border border-[#AF9275]/40 bg-[#2F4055]`}>
      <div className="relative aspect-video overflow-hidden">
        <video
          ref={videoRef}
          aria-label={label}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={`/media/salon-${index === 1 ? '01' : '02'}.jpg`}
          className="h-full w-full object-cover transition duration-[550ms] ease-out group-hover:scale-[1.03]"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#202c3a]/80 via-[#202c3a]/25 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 text-[#F2F2EF] md:p-7">
          <p className="text-[11px] font-bold uppercase tracking-[.25em] text-[#D7B66A]">{label}</p>
        </div>
      </div>
    </article>
  );
}

const salonSpaces: SalonSpace[] = [
  {
    label: 'CABINA 01',
    videoUrl: '/media/salon-01.mp4',
  },
  {
    label: 'CABINA 02',
    videoUrl: '/media/salon-02.mp4',
  },
];

export default function SalonSpacesSection({ onBook, whatsappHref }: SalonSpacesSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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
      { threshold: 0.12 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="espacio"
      ref={sectionRef}
      className={`salon-spaces-section bg-[#2F4055] px-5 py-20 text-[#F2F2F0] md:px-10 md:py-32 ${isVisible ? 'salon-spaces-visible' : ''}`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="salon-space-copy salon-space-copy-1 text-[11px] font-bold uppercase tracking-[.28em] text-[#D7B66A]">
            Nuestros espacios
          </p>
          <h2 className="salon-space-copy salon-space-copy-2 mt-5 font-serif text-5xl leading-[1.02] md:text-6xl">
            Dos espacios pensados para cuidar de ti.
          </h2>
          <p className="salon-space-copy salon-space-copy-3 mt-6 max-w-xl text-base leading-7 text-[#d4d9d9] md:text-lg">
            Cada detalle está preparado para ofrecerte una experiencia cómoda, privada y enfocada en tu cuidado.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 md:gap-7">
          {salonSpaces.map((space, index) => (
            <SalonVideo key={space.label} {...space} index={index + 1} />
          ))}
        </div>

        <div className="salon-space-copy salon-space-copy-6 mt-12 flex flex-col gap-5 sm:flex-row sm:items-center">
          <button
            type="button"
            data-testid="button-salon-book"
            onClick={onBook}
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#BB9445] px-6 py-3 text-sm font-semibold uppercase tracking-[.08em] text-[#202b38] transition duration-300 hover:-translate-y-0.5 hover:bg-[#D0AA59] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7B66A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2F4055]"
          >
            Quiero agendar una valoración <ArrowRight aria-hidden="true" size={16} />
          </button>
          <a
            data-testid="link-salon-whatsapp"
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 text-sm font-semibold text-[#F2F2EF] transition-colors hover:text-[#D7B66A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7B66A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2F4055]"
          >
            <MessageCircle aria-hidden="true" size={17} className="text-[#D7B66A]" />
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}