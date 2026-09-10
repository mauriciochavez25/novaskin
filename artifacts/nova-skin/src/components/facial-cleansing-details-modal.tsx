import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, MessageCircle, X } from 'lucide-react';

type ProtocolStep = {
  number: string;
  title: string;
  description: string;
};

type FacialOption = {
  name: string;
  subtitle: string;
  introduction: string;
  steps: ProtocolStep[];
  resultTitle: string;
  result: string;
};

type FacialCleansingDetailsModalProps = {
  onClose: () => void;
  posterUrl: string;
};

const facialOptions: FacialOption[] = [
  {
    name: 'NOVA ESSENTIAL',
    subtitle: 'Limpieza Facial Esencial',
    introduction:
      'Un tratamiento diseñado para realizar una higiene facial profunda, eliminar impurezas y aportar a la piel una apariencia más limpia, luminosa y saludable.',
    steps: [
      {
        number: '01',
        title: 'Higiene Facial Inicial',
        description: 'Limpieza profunda del rostro para eliminar impurezas, residuos y exceso de grasa.',
      },
      {
        number: '02',
        title: 'Microdermoabrasión',
        description: 'Exfoliación mecánica que ayuda a remover células córneas y favorecer una textura más uniforme.',
      },
      {
        number: '03',
        title: 'Vapor Ozono',
        description: 'Preparación de la piel para facilitar el proceso de extracción y favorecer una limpieza más profunda.',
      },
      {
        number: '04',
        title: 'Extracción de Impurezas',
        description: 'Extracción manual y/o mediante tecnología ultrasónica, según las necesidades y sensibilidad de la piel.',
      },
      {
        number: '05',
        title: 'Hidrafacial',
        description: 'Limpieza, exfoliación e hidratación para dejar la piel visiblemente más fresca y luminosa.',
      },
      {
        number: '06',
        title: 'Mascarilla Facial',
        description: 'Aplicación de una mascarilla seleccionada de acuerdo con las necesidades específicas de la piel.',
      },
      {
        number: '07',
        title: 'Skin Care Personalizado',
        description: 'Finalización del tratamiento con una selección personalizada de tónico, sérum y/o crema, de acuerdo con el diagnóstico y tipo de piel.',
      },
    ],
    resultTitle: 'RESULTADO',
    result: 'Una piel más limpia, suave, hidratada, luminosa y revitalizada, con un protocolo adaptado a sus necesidades.',
  },
  {
    name: 'NOVA ÉCLAT',
    subtitle: 'Tratamiento Facial Revitalizante',
    introduction:
      'Un protocolo facial diseñado para purificar, revitalizar y devolver luminosidad a la piel, combinando técnicas de higiene profunda, aparatología y activos nutritivos seleccionados de acuerdo con las necesidades de cada piel.',
    steps: [
      {
        number: '01',
        title: 'Higiene Facial Suave',
        description: 'Limpieza delicada del rostro para eliminar impurezas, residuos y exceso de grasa, respetando el equilibrio natural de la piel.',
      },
      {
        number: '02',
        title: 'Microdermoabrasión',
        description: 'Exfoliación mecánica superficial que ayuda a eliminar células córneas y favorecer una textura más suave y uniforme.',
      },
      {
        number: '03',
        title: 'Vapor Ozono',
        description: 'Preparación de la piel mediante vapor para facilitar el proceso de extracción y favorecer una higiene más profunda.',
      },
      {
        number: '04',
        title: 'Extracción de Impurezas',
        description: 'Extracción manual y/o ultrasónica, seleccionando la técnica más adecuada de acuerdo con las condiciones y necesidades de la piel.',
      },
      {
        number: '05',
        title: 'Hidrafacial',
        description: 'Protocolo de limpieza, exfoliación e hidratación que ayuda a mejorar la apariencia de la piel, aportando frescura y luminosidad.',
      },
      {
        number: '06',
        title: 'Mascarilla Personalizada',
        description: 'Aplicación de una mascarilla seleccionada específicamente según el diagnóstico y las necesidades de la piel.',
      },
      {
        number: '07',
        title: 'Alta Frecuencia Capilar',
        description: 'Aplicación de alta frecuencia en cuero cabelludo como complemento del protocolo de cuidado.',
      },
      {
        number: '08',
        title: 'Terapia de Luz LED',
        description: 'Aplicación de fototerapia LED seleccionada de acuerdo con el objetivo cosmético del tratamiento.',
      },
      {
        number: '09',
        title: 'Ampolleta Nutritiva',
        description: 'Aplicación de un concentrado nutritivo para complementar el tratamiento y aportar activos específicos a la piel.',
      },
      {
        number: '10',
        title: 'Skin Care Personalizado',
        description: 'Finalización del protocolo con la aplicación de tónico, sérum y/o crema, seleccionados según el tipo y las necesidades de la piel.',
      },
    ],
    resultTitle: 'EXPERIENCIA NOVA ÉCLAT',
    result: 'Una experiencia de cuidado integral que deja la piel con una apariencia más limpia, suave, hidratada, luminosa y revitalizada.',
  },
];

const whatsappUrl = `https://wa.me/8711437775?text=${encodeURIComponent(
  'Hola, me gustaría recibir información sobre los faciales Nova Essential y Nova Éclat y saber cuál puede ser adecuado para mí.',
)}`;

export default function FacialCleansingDetailsModal({
  onClose,
  posterUrl,
}: FacialCleansingDetailsModalProps) {
  const [openFacial, setOpenFacial] = useState<number | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  const closeAndBook = () => {
    onClose();
    window.setTimeout(() => {
      document.querySelector('#contacto')?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="facial-details-title"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#202c3a]/80 p-3 sm:p-5 md:p-8"
      onClick={onClose}
    >
      <div
        className="relative max-h-[94vh] w-full max-w-5xl overflow-y-auto bg-[#F2F2EF] text-[#2F4055] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Cerrar detalle de Limpieza Facial"
          data-testid="button-close-facial-details"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full border border-[#2F4055]/25 bg-[#F2F2EF]/90 p-3 text-[#2F4055] transition hover:bg-[#BB9445] md:right-6 md:top-6"
        >
          <X size={18} />
        </button>

        <div className="grid lg:grid-cols-[.72fr_1.28fr]">
          <aside className="bg-[#AF9275] p-5 sm:p-7 md:p-8">
            <button
              type="button"
              data-testid="button-back-facial-details"
              onClick={onClose}
              className="inline-flex min-h-11 items-center gap-2 text-[11px] font-bold uppercase tracking-[.18em] text-[#F2F2EF] transition hover:text-[#2F4055] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2F2EF]"
            >
              <ArrowLeft size={16} /> Volver
            </button>
            <p className="mt-8 text-[11px] font-bold uppercase tracking-[.25em] text-[#F2F2EF]/80">
              Cuidado facial
            </p>
            <h2
              id="facial-details-title"
              className="mt-4 max-w-sm font-serif text-4xl leading-tight text-[#F2F2EF] md:text-5xl"
            >
              Limpieza Facial
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-6 text-[#F2F2EF]/90">
              Dos experiencias de cuidado diseñadas de acuerdo con las necesidades de tu piel.
            </p>
            <div className="arch mt-8 overflow-hidden bg-[#2F4055]">
              <img
                src={posterUrl}
                alt="Limpieza facial realizada en Nova Skin"
                className="aspect-[.8] h-full w-full object-cover object-[50%_58%]"
              />
            </div>
          </aside>

          <div className="p-5 sm:p-7 md:p-10 lg:p-12">
            <p className="text-[11px] font-bold uppercase tracking-[.25em] text-[#BB9445]">
              Información del tratamiento
            </p>
            <h3 className="mt-6 font-serif text-3xl text-[#2F4055]">¿En qué consiste un facial?</h3>
            <p className="mt-4 text-base leading-8 text-[#68727b]">
              Un tratamiento facial es un procedimiento estético enfocado en limpiar, renovar, hidratar y mejorar la apariencia de la piel, adaptándose siempre a su tipo y necesidades. Antes de comenzar, se realiza una valoración para determinar qué productos, técnicas y aparatología son adecuados para cada piel.
            </p>

            <div className="mt-10 border-t border-[#AF9275]/45">
              {facialOptions.map((facial, index) => {
                const isOpen = openFacial === index;
                const panelId = `facial-panel-${index + 1}`;
                return (
                  <section key={facial.name} className="border-b border-[#AF9275]/45">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      data-testid={`button-facial-option-${index + 1}`}
                      onClick={() => setOpenFacial(isOpen ? null : index)}
                      className="flex min-h-24 w-full items-center justify-between gap-5 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#BB9445] sm:py-6"
                    >
                      <span>
                        <span className="block text-[11px] font-bold uppercase tracking-[.2em] text-[#BB9445]">
                          {facial.name}
                        </span>
                        <span className="mt-2 block font-serif text-xl text-[#2F4055] sm:text-2xl">
                          {facial.subtitle}
                        </span>
                      </span>
                      <span className="shrink-0 font-serif text-3xl font-normal text-[#BB9445]">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>

                    <div
                      id={panelId}
                      aria-hidden={!isOpen}
                      inert={!isOpen}
                      className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${
                        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div className="pb-8">
                          <p className="text-sm leading-7 text-[#68727b] sm:text-base sm:leading-8">
                            {facial.introduction}
                          </p>
                          <h4 className="mt-8 text-[11px] font-bold uppercase tracking-[.24em] text-[#2F4055]">
                            El protocolo incluye
                          </h4>
                          <ol className="mt-4">
                            {facial.steps.map((step) => (
                              <li
                                key={`${facial.name}-${step.number}`}
                                className="grid gap-3 border-t border-[#AF9275]/35 py-5 sm:grid-cols-[3rem_1fr]"
                              >
                                <span className="font-serif text-2xl text-[#BB9445]">{step.number}</span>
                                <div>
                                  <h5 className="font-serif text-xl text-[#2F4055]">{step.title}</h5>
                                  <p className="mt-2 text-sm leading-7 text-[#68727b]">{step.description}</p>
                                </div>
                              </li>
                            ))}
                          </ol>
                          <div className="mt-2 border-l-2 border-[#BB9445] bg-[#e6e1d9] p-5 sm:p-6">
                            <p className="text-[10px] font-bold uppercase tracking-[.24em] text-[#BB9445]">
                              {facial.resultTitle}
                            </p>
                            <p className="mt-3 text-sm leading-7 text-[#2F4055]">{facial.result}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>

            <div className="mt-10 bg-[#2F4055] p-6 text-[#F2F2F0] md:p-8">
              <p className="font-serif text-2xl">¿No sabes cuál elegir?</p>
              <p className="mt-3 text-sm leading-7 text-[#d5d7d5]">
                Antes de comenzar realizamos una valoración para identificar las necesidades de tu piel y orientarte hacia el protocolo adecuado.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  data-testid="button-facial-details-book"
                  onClick={closeAndBook}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#BB9445] px-5 py-3 text-sm font-semibold uppercase tracking-[.08em] text-[#202c3a] transition hover:-translate-y-0.5 hover:bg-[#d0aa59] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Agendar valoración <ArrowRight size={16} />
                </button>
                <a
                  data-testid="link-facial-details-whatsapp"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/35 px-5 py-3 text-center text-sm font-semibold uppercase tracking-[.08em] text-white transition hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BB9445]"
                >
                  <MessageCircle size={16} /> Preguntar por WhatsApp
                </a>
              </div>
            </div>

            <p className="mt-7 text-center font-serif text-sm italic text-[#68727b]">
              Nova Skin — Belleza, cuidado y tecnología para tu piel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}