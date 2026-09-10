import { type CSSProperties, useEffect, useRef, useState } from 'react';

type ExperienceTimelineSectionProps = {
  imageUrls: string[];
  onBook: () => void;
  whatsappHref: string;
};

const stages = [
  {
    number: '01',
    title: 'VALORACIÓN',
    description: 'Conocemos tus necesidades, objetivos y lo que te gustaría mejorar.',
    objectPosition: '56% 58%',
  },
  {
    number: '02',
    title: 'TU PROTOCOLO',
    description: 'Definimos un plan de cuidado de acuerdo con tus necesidades y objetivos.',
    objectPosition: '50% 48%',
  },
  {
    number: '03',
    title: 'TRATAMIENTO',
    description: 'Recibes atención profesional durante todo el procedimiento.',
    objectPosition: '53% 48%',
  },
  {
    number: '04',
    title: 'SEGUIMIENTO',
    description: 'Recibes indicaciones y cuidados posteriores para acompañar tus resultados.',
    objectPosition: '50% 56%',
  },
] as const;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export default function ExperienceTimelineSection({
  imageUrls,
  onBook,
  whatsappHref,
}: ExperienceTimelineSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRefs = useRef<Array<HTMLElement | null>>([]);
  const [activeStage, setActiveStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const updateProgress = () => {
      const bounds = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const start = viewportHeight * 0.82;
      const end = -bounds.height + viewportHeight * 0.2;
      setProgress(clamp((start - bounds.top) / (start - end), 0, 1));
    };

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const revealObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.12 },
    );

    revealObserver.observe(section);
    return () => revealObserver.disconnect();
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const stageObserver = new IntersectionObserver(
      (entries) => {
        const visibleStages = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio);

        const visibleStage = visibleStages[0];
        if (!visibleStage) return;

        const stageIndex = Number(visibleStage.target.getAttribute('data-stage-index'));
        if (!Number.isNaN(stageIndex)) setActiveStage(stageIndex);
      },
      {
        rootMargin: '-34% 0px -48% 0px',
        threshold: [0.15, 0.35, 0.6, 0.85],
      },
    );

    stageRefs.current.forEach((stage) => {
      if (stage) stageObserver.observe(stage);
    });

    return () => stageObserver.disconnect();
  }, []);

  const progressStyle = {
    '--timeline-progress': progress,
  } as CSSProperties;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="experience-timeline-title"
      className="relative overflow-hidden bg-[#f4efe7] px-5 py-24 text-[#2f4055] sm:px-8 sm:py-32 lg:px-12 lg:py-40"
    >
      <div className="mx-auto max-w-[1180px]">
        <div
          className={`max-w-[700px] transition-transform duration-700 ease-out ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
          }`}
        >
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#bb9445]">
            TU EXPERIENCIA
          </p>
          <h2
            id="experience-timeline-title"
            className="font-serif text-[clamp(2.7rem,7vw,5.9rem)] leading-[0.94] tracking-[-0.035em] text-[#2f4055]"
          >
            Así se vive NovaSkin.
          </h2>
          <p className="mt-7 max-w-[540px] text-base leading-7 text-[#68727b] sm:text-lg">
            Un cuidado pensado para acompañarte en cada etapa.
          </p>
        </div>

        <div className="relative mt-20 sm:mt-24 lg:mt-32">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-[0.45rem] top-0 w-px bg-[#d7cbbb] lg:bottom-auto lg:left-[12.5%] lg:right-[12.5%] lg:top-0 lg:h-px lg:w-auto"
          >
            <div
              className="absolute left-0 top-0 h-full w-full origin-top bg-[#bb9445] scale-y-[var(--timeline-progress)] lg:h-px lg:w-full lg:origin-left lg:scale-y-100 lg:scale-x-[var(--timeline-progress)]"
              style={progressStyle}
            />
          </div>

          <div className="relative grid gap-y-20 md:gap-y-24 lg:flex lg:items-start lg:gap-x-7 lg:gap-y-0">
            {stages.map((stage, index) => {
              const imageUrl = imageUrls[index];
              const isActive = activeStage === index;

              return (
                <article
                  key={stage.number}
                  ref={(node) => {
                    stageRefs.current[index] = node;
                  }}
                  data-stage-index={index}
                  className={`relative pl-10 transition-transform duration-700 ease-out md:pl-11 lg:flex-1 lg:pl-0 lg:pt-12 ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
                  } ${index % 2 === 1 ? 'lg:pt-24' : ''}`}
                  style={{ transitionDelay: `${index * 100 + 80}ms` }}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-[-0.05rem] z-10 grid h-3 w-3 place-items-center rounded-full border-2 bg-[#f4efe7] transition-colors duration-500 lg:left-1/2 lg:top-[-0.3rem] lg:-translate-x-1/2 ${
                      isActive ? 'border-[#bb9445] bg-[#bb9445]' : 'border-[#b9a991]'
                    }`}
                  />

                  <div className="group relative aspect-[0.87] overflow-hidden bg-[#ded5c5]">
                    <img
                      src={imageUrl}
                      alt={`${stage.number} — ${stage.title}`}
                      loading="lazy"
                      decoding="async"
                      style={{ objectPosition: stage.objectPosition }}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                    />
                  </div>

                  <div className="mt-6 max-w-[255px]">
                    <p
                      className={`text-[11px] font-semibold tracking-[0.18em] transition-colors duration-500 ${
                        isActive ? 'text-[#bb9445]' : 'text-[#68727b]'
                      }`}
                    >
                      {stage.number} <span className="px-1">—</span> {stage.title}
                    </p>
                    <p className="mt-4 text-[15px] leading-7 text-[#68727b]">{stage.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div
          className={`mt-24 border-t border-[#d7cbbb] pt-10 transition-transform duration-700 ease-out sm:mt-32 sm:flex sm:items-end sm:justify-between sm:gap-10 lg:mt-40 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
          }`}
          style={{ transitionDelay: '520ms' }}
        >
          <h3 className="max-w-[570px] font-serif text-3xl leading-[1.05] tracking-[-0.025em] sm:text-4xl lg:text-5xl">
            ¿Lista para comenzar tu experiencia NovaSkin?
          </h3>
          <div className="mt-8 flex shrink-0 flex-col items-start gap-5 sm:mt-0 sm:items-end">
            <button
              type="button"
              onClick={onBook}
              className="inline-flex items-center gap-3 border border-[#2f4055] bg-[#2f4055] px-6 py-4 text-[11px] font-semibold tracking-[0.16em] text-[#f4efe7] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-[#3e526a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bb9445] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4efe7]"
            >
              AGENDAR VALORACIÓN <span aria-hidden="true">→</span>
            </button>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-semibold tracking-[0.18em] text-[#2f4055] underline decoration-[#bb9445] decoration-1 underline-offset-4 transition-colors hover:text-[#bb9445] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bb9445] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f4efe7]"
            >
              WHATSAPP
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}