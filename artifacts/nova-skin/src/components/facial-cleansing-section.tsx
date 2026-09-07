import { useEffect, useRef, useState } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';

type FacialCleansingSectionProps = {
  onLearnMore: () => void;
  onBook: () => void;
  whatsappHref: string;
  videoUrl: string;
  posterUrl: string;
};

const editorialNotes = [
  {
    number: '01',
    title: 'Cuidado de tu piel',
    description: 'Una experiencia enfocada en limpiar y cuidar la apariencia de la piel.',
  },
  {
    number: '02',
    title: 'Conoce tus necesidades',
    description: 'Un primer acercamiento para comenzar a identificar lo que tu piel necesita.',
  },
  {
    number: '03',
    title: 'Continúa tu cuidado',
    description: 'Después puedes conocer otras opciones de NovaSkin de acuerdo con tus objetivos.',
  },
];

export default function FacialCleansingSection({
  onLearnMore,
  onBook,
  whatsappHref,
  videoUrl,
  posterUrl,
}: FacialCleansingSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const revealObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          revealObserver.disconnect();
        }
      },
      { threshold: 0.14 },
    );

    revealObserver.observe(section);
    return () => revealObserver.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
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
    const mediaObserver = typeof IntersectionObserver === 'undefined'
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

    video.addEventListener('loadeddata', playWhenReady);
    video.addEventListener('canplay', playWhenReady);
    if (mediaObserver) {
      mediaObserver.observe(video);
    } else {
      isInViewport = true;
      playVideo();
    }

    return () => {
      mediaObserver?.disconnect();
      video.removeEventListener('loadeddata', playWhenReady);
      video.removeEventListener('canplay', playWhenReady);
      video.pause();
    };
  }, []);

  const reveal = (delay: number) =>
    `transition-[opacity,transform] duration-700 ease-out ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
    }`;

  return (
    <section
      ref={sectionRef}
      id="limpieza-facial"
      aria-labelledby="facial-cleansing-title"
      className="relative overflow-hidden bg-[#eee9e0] px-5 py-20 text-[#2f4055] sm:px-8 sm:py-24 md:px-10 md:py-32 lg:py-36"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.72fr)] lg:gap-24">
          <div className="max-w-xl">
            <p
              className={`${reveal(0)} text-[11px] font-bold uppercase tracking-[0.3em] text-[#bb9445]`}
            >
              ¿NO SABES POR DÓNDE EMPEZAR?
            </p>
            <h2
              id="facial-cleansing-title"
              className={`${reveal(80)} mt-6 max-w-[590px] font-serif text-[clamp(2.7rem,4.6vw,4rem)] leading-[0.98] tracking-[-0.035em] text-[#2f4055]`}
              style={{ transitionDelay: '80ms' }}
            >
              Empieza por conocer y cuidar tu piel.
            </h2>
            <p
              className={`${reveal(160)} mt-7 max-w-[500px] text-base leading-7 text-[#68727b] sm:text-lg`}
              style={{ transitionDelay: '160ms' }}
            >
              La limpieza facial puede ser un excelente primer paso para comenzar a cuidar tu piel y vivir la experiencia NovaSkin.
            </p>

            <div
              className={`${reveal(240)} mt-9 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center`}
              style={{ transitionDelay: '240ms' }}
            >
              <button
                type="button"
                data-testid="button-facial-cleansing-more"
                onClick={onLearnMore}
                className="inline-flex min-h-12 items-center justify-center gap-3 bg-[#2f4055] px-6 py-4 text-[11px] font-semibold tracking-[0.14em] text-[#f4efe7] transition duration-300 hover:-translate-y-0.5 hover:bg-[#3e526a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bb9445] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eee9e0]"
              >
                CONOCER LIMPIEZA FACIAL <ArrowRight aria-hidden="true" size={16} />
              </button>
              <button
                type="button"
                data-testid="button-facial-cleansing-book"
                onClick={onBook}
                className="inline-flex min-h-12 items-center justify-center gap-3 border border-[#2f4055] px-6 py-4 text-[11px] font-semibold tracking-[0.14em] text-[#2f4055] transition duration-300 hover:-translate-y-0.5 hover:bg-[#f4efe7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bb9445] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eee9e0]"
              >
                AGENDAR VALORACIÓN <ArrowRight aria-hidden="true" size={16} />
              </button>
            </div>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              data-testid="link-facial-cleansing-whatsapp"
              className={`${reveal(320)} mt-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2f4055] underline decoration-[#bb9445] decoration-1 underline-offset-4 transition-colors hover:text-[#bb9445] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bb9445] focus-visible:ring-offset-4 focus-visible:ring-offset-[#eee9e0]`}
              style={{ transitionDelay: '320ms' }}
            >
              <MessageCircle aria-hidden="true" size={15} className="text-[#bb9445]" />
              WhatsApp
            </a>
          </div>

          <div
            className={`${reveal(380)} group relative mx-auto w-full max-w-[500px]`}
            style={{ transitionDelay: '380ms' }}
          >
            <div className="relative aspect-[0.74] overflow-hidden bg-[#d8cfc2] shadow-[0_22px_50px_rgba(47,64,85,.12)]">
              <video
                ref={videoRef}
                src={videoUrl}
                poster={posterUrl}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="Limpieza facial realizada en NovaSkin"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                style={{ objectPosition: '50% 58%' }}
              />
              <span className="absolute bottom-5 left-5 bg-[#bb9445] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#202c3a] shadow-sm">
                IDEAL PARA COMENZAR
              </span>
            </div>
          </div>
        </div>

        <div
          className={`${reveal(460)} mt-16 grid border-t border-[#af9275]/45 md:mt-24 md:grid-cols-3`}
          style={{ transitionDelay: '460ms' }}
        >
          {editorialNotes.map((note, index) => (
            <div
              key={note.number}
              className={`py-7 md:py-8 md:pr-8 ${index > 0 ? 'border-t border-[#af9275]/45 md:border-l md:border-t-0 md:pl-8' : ''}`}
            >
              <p className="font-serif text-2xl text-[#bb9445]/75">{note.number}</p>
              <h3 className="mt-3 font-serif text-xl text-[#2f4055]">{note.title}</h3>
              <p className="mt-3 max-w-xs text-sm leading-6 text-[#68727b]">{note.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}