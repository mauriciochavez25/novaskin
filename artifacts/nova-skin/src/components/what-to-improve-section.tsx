import { useState } from 'react';
import { ChevronDown, MessageCircle, Sparkles } from 'lucide-react';

type Objective = {
  title: string;
  copy: string;
  orientation: string;
  treatments: string[];
};

export type WhatToImproveSectionProps = {
  imageUrl: string;
  onViewRelated: (treatments: string[]) => void;
  onBook: () => void;
  whatsappHref: string;
};

const objectives: Objective[] = [
  {
    title: 'Hidratación y luminosidad',
    copy: 'Una piel con mejor hidratación suele verse más fresca, uniforme y descansada.',
    orientation:
      'La valoración ayuda a distinguir qué necesita tu piel para recuperar hidratación y luz sin sobrecargarla.',
    treatments: ['Skin Boosters', 'NCTF Revitalizante', 'PDRN Salmón'],
  },
  {
    title: 'Líneas de expresión',
    copy: 'Suaviza visualmente la apariencia de líneas dinámicas y otros signos de expresión.',
    orientation:
      'Observaremos las zonas que te preocupan y el movimiento facial para orientar opciones de forma personalizada.',
    treatments: ['Toxina Botulínica'],
  },
  {
    title: 'Firmeza',
    copy: 'Cuando buscas que la piel se sienta más elástica, tonificada y acompañada en el tiempo.',
    orientation:
      'La recomendación depende del estado de la piel, la elasticidad y el tipo de estímulo que mejor acompañe tus objetivos.',
    treatments: ['Bioestimuladores'],
  },
  {
    title: 'Textura y calidad de piel',
    copy: 'Para una piel que se vea y se sienta más uniforme, lisa y vital.',
    orientation:
      'Revisaremos textura, sensibilidad y calidad general para definir una orientación que respete el momento de tu piel.',
    treatments: ['PDRN Salmón', 'Skin Boosters', 'NCTF Revitalizante'],
  },
  {
    title: 'Cuidado capilar',
    copy: 'Acompaña la salud y la calidad del cabello desde el cuero cabelludo.',
    orientation:
      'La valoración permite conocer el estado del cuero cabelludo y orientar el cuidado capilar más adecuado para ti.',
    treatments: ['Mesoterapia Capilar'],
  },
];

export function WhatToImproveSection({
  imageUrl,
  onViewRelated,
  onBook,
  whatsappHref,
}: WhatToImproveSectionProps) {
  const [openObjective, setOpenObjective] = useState<number | null>(null);

  const toggleObjective = (index: number) => {
    setOpenObjective((current) => (current === index ? null : index));
  };

  return (
    <section
      id="mejorar"
      aria-labelledby="what-to-improve-title"
      className="relative overflow-hidden bg-[#F2F2EF] px-5 py-20 text-[#2F4055] sm:px-8 md:px-10 md:py-28 lg:px-16 lg:py-36"
    >
      <div className="mx-auto grid max-w-7xl gap-14 md:grid-cols-[minmax(0,.82fr)_minmax(0,1.18fr)] md:grid-rows-[auto_1fr] md:items-start md:gap-12 lg:grid-cols-[minmax(290px,.78fr)_minmax(0,1.22fr)] lg:gap-24">
        <div className="md:sticky md:top-12">
          <p className="motion-safe:reveal mb-5 text-[11px] font-bold uppercase tracking-[.28em] text-[#BB9445]">
            Tu punto de partida
          </p>
          <h2
            id="what-to-improve-title"
            className="motion-safe:reveal delay-1 max-w-xl font-serif text-[clamp(2.7rem,6vw,5.5rem)] leading-[.96] tracking-[-.035em] text-[#2F4055]"
          >
            ¿Qué quieres mejorar?
          </h2>
          <p className="motion-safe:reveal delay-2 mt-6 max-w-md text-base leading-7 text-[#68727b] md:mt-8 md:text-lg">
            No necesitas saber qué tratamiento elegir. Empieza por contarnos qué buscas.
          </p>

        </div>

        <div className="delay-4 md:col-start-2 md:row-span-2 md:row-start-1">
          <div className="mb-7 flex items-end justify-between gap-6 border-b border-[#AF9275]/45 pb-5">
            <p className="max-w-xs text-xs font-semibold uppercase leading-5 tracking-[.2em] text-[#AF9275]">
              Elige el objetivo que más se parece a lo que buscas
            </p>
            <span className="hidden font-serif text-3xl text-[#BB9445]/60 sm:block">01—05</span>
          </div>

          <div className="border-t border-[#AF9275]/45">
            {objectives.map((objective, index) => {
              const isOpen = openObjective === index;

              return (
                <article
                  key={objective.title}
                  style={{ animationDelay: `${0.55 + index * 0.1}s` }}
                  className={`motion-safe:reveal border-b border-[#AF9275]/45 transition-colors duration-300 ${
                    isOpen ? 'bg-[#E9E3D9]/55' : 'bg-transparent'
                  }`}
                >
                  <button
                    type="button"
                    aria-controls={`objective-panel-${index}`}
                    aria-expanded={isOpen}
                    onClick={() => toggleObjective(index)}
                    className="group flex min-h-[88px] w-full items-center gap-4 px-1 py-5 text-left transition-colors duration-300 hover:bg-[#E9E3D9]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#BB9445] sm:min-h-[100px] sm:gap-7 sm:px-4"
                  >
                    <span className="w-8 shrink-0 font-mono text-[11px] tracking-[.16em] text-[#BB9445]">
                      0{index + 1}
                    </span>
                    <span className="flex-1 font-serif text-[1.45rem] leading-tight text-[#2F4055] transition-transform duration-300 group-hover:translate-x-1 sm:text-[1.8rem]">
                      {objective.title}
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className={`h-5 w-5 shrink-0 text-[#AF9275] transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-[#BB9445]' : ''
                      }`}
                    />
                  </button>

                  <div
                    id={`objective-panel-${index}`}
                    role="region"
                    aria-label={`Orientación para ${objective.title}`}
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="grid gap-7 px-1 pb-7 pl-[3.25rem] pt-0 sm:grid-cols-[minmax(0,1fr)_minmax(170px,.72fr)] sm:gap-9 sm:px-4 sm:pb-8 sm:pl-[4.75rem]">
                        <div>
                          <p className="max-w-lg text-sm leading-6 text-[#68727b]">{objective.copy}</p>
                          <p className="mt-4 max-w-lg text-sm leading-6 text-[#2F4055]">
                            {objective.orientation}
                          </p>
                          <button
                            type="button"
                            onClick={() => onViewRelated(objective.treatments)}
                            className="mt-5 inline-flex min-h-11 items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-[#2F4055] underline decoration-[#BB9445] decoration-1 underline-offset-4 transition-colors hover:text-[#BB9445] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BB9445] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E9E3D9]"
                          >
                            CONOCER TRATAMIENTOS <span aria-hidden="true">→</span>
                          </button>
                        </div>

                        <div className="border-l border-[#BB9445]/45 pl-5 sm:pl-6">
                          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#AF9275]">
                            Opciones relacionadas:
                          </p>
                          <ul className="mt-3 space-y-2 text-sm leading-5 text-[#2F4055]">
                            {objective.treatments.map((treatment) => (
                              <li key={treatment}>{treatment}</li>
                            ))}
                          </ul>
                          <p className="mt-5 text-[11px] leading-4 text-[#68727b]">
                            La recomendación final depende de una valoración profesional.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <button
              type="button"
              onClick={onBook}
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#2F4055] px-6 py-3 text-sm font-semibold uppercase tracking-[.08em] text-[#F2F2EF] transition duration-300 hover:-translate-y-0.5 hover:bg-[#3D526B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BB9445] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F2F2EF]"
            >
              Quiero una valoración <span aria-hidden="true">→</span>
            </button>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 self-start text-sm font-semibold text-[#2F4055] transition-colors hover:text-[#BB9445] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BB9445] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F2F2EF] sm:self-auto"
            >
              <MessageCircle aria-hidden="true" className="h-4 w-4 text-[#BB9445]" />
              Escríbenos por WhatsApp
            </a>
          </div>
        </div>

        <figure className="motion-safe:reveal delay-3 relative mt-10 w-full max-w-sm overflow-hidden md:col-start-1 md:row-start-2 md:mt-14">
          <div className="absolute -left-3 -top-3 z-0 h-24 w-24 border-l border-t border-[#BB9445]/70" />
          <div className="relative z-10 aspect-[4/5] overflow-hidden bg-[#D9D1C4] sm:aspect-[5/4] md:aspect-[4/5] lg:aspect-[5/6]">
            <img
              src={imageUrl}
              alt="Consulta para identificar necesidades de la piel en NovaSkin"
              className="h-full w-full object-cover transition duration-700 ease-out motion-safe:hover:scale-[1.025]"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#202b38]/75 via-[#202b38]/20 to-transparent px-5 pb-5 pt-16 text-[#F2F2EF]">
              <figcaption className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.24em]">
                <Sparkles aria-hidden="true" className="h-3.5 w-3.5 text-[#D7B66A]" />
                Primero escuchamos
              </figcaption>
            </div>
          </div>
        </figure>
      </div>
    </section>
  );
}

export default WhatToImproveSection;