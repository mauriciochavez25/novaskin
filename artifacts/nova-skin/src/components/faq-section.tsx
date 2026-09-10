import { useEffect, useRef, useState } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';

type FaqSectionProps = {
  imageUrl: string;
  onBook: () => void;
  whatsappHref: string;
  questionWhatsappHref: string;
  googleMapsUrl?: string;
};

type FaqQuestion = {
  number: string;
  question: string;
  answer: string;
  location?: boolean;
  whatsapp?: boolean;
};

const questions: FaqQuestion[] = [
  {
    number: '01',
    question: '¿Necesito una valoración antes de realizarme un tratamiento?',
    answer:
      'La valoración permite conocer tus necesidades y objetivos para orientarte hacia el tratamiento más adecuado para ti. Dependiendo del procedimiento que te interese, el equipo de Nova Skin podrá indicarte si es necesario realizar una valoración previa.',
  },
  {
    number: '02',
    question: '¿Cómo puedo saber qué tratamiento es adecuado para mí?',
    answer:
      'Cada piel y cada persona tienen necesidades diferentes. Puedes contactar a Nova Skin para recibir orientación y conocer las opciones disponibles de acuerdo con lo que deseas trabajar.',
  },
  {
    number: '03',
    question: '¿Cómo puedo agendar una cita?',
    answer:
      'Puedes solicitar tu cita a través del formulario de esta página o comunicarte directamente con Nova Skin por WhatsApp. El equipo dará seguimiento a tu solicitud para confirmar disponibilidad.',
  },
  {
    number: '04',
    question: '¿Puedo preguntar por un tratamiento antes de agendar?',
    answer:
      'Sí. Puedes comunicarte por WhatsApp para resolver dudas generales antes de solicitar tu cita. Si tu pregunta requiere una valoración profesional, el equipo te indicará el siguiente paso.',
  },
  {
    number: '05',
    question: '¿Los tratamientos son iguales para todas las personas?',
    answer:
      'No necesariamente. La elección del tratamiento puede variar de acuerdo con las necesidades, objetivos y valoración de cada persona.',
  },
  {
    number: '06',
    question: '¿Dónde se encuentra Nova Skin?',
    answer: 'Nova Skin se encuentra en Av. Juárez 4955, Plaza Laguna Oriente, Local 43.',
    location: true,
  },
  {
    number: '07',
    question: '¿Cuál es el horario de atención?',
    answer: 'El horario de atención es 10:00 a.m. – 2:00 p.m. / 3:00 p.m. – 7:00 p.m.',
  },
  {
    number: '08',
    question: '¿Cómo puedo comunicarme directamente con Nova Skin?',
    answer: 'Puedes comunicarte directamente por WhatsApp al 871 143 7775.',
    whatsapp: true,
  },
];

export default function FaqSection({
  imageUrl,
  onBook,
  whatsappHref,
  questionWhatsappHref,
  googleMapsUrl = '',
}: FaqSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

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
      ref={sectionRef}
      id="preguntas-frecuentes"
      aria-labelledby="faq-title"
      className="bg-[#F2F2EF] px-5 py-20 text-[#2F4055] md:px-10 md:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
          <div
            className={`transition duration-700 ease-out ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-[.3em] text-[#BB9445]">PREGUNTAS FRECUENTES</p>
            <h2 id="faq-title" className="mt-5 font-serif text-5xl leading-[1.02] md:text-6xl">
              Antes de tu visita, resolvamos tus dudas.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#68727b] md:text-lg">
              Encuentra respuestas a algunas de las preguntas más comunes sobre tu experiencia en Nova Skin.
            </p>
            <div className="mt-10 overflow-hidden rounded-[1.25rem] bg-[#AF9275] shadow-[0_18px_45px_rgba(47,64,85,.08)]">
              <img
                src={imageUrl}
              alt="Consulta profesional en Nova Skin"
                loading="lazy"
                decoding="async"
                className="aspect-[.92] w-full object-cover transition duration-700 hover:scale-[1.02]"
              />
            </div>
          </div>

          <div
            className={`transition duration-700 ease-out lg:pt-2 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
            }`}
            style={{ transitionDelay: isVisible ? '140ms' : '0ms' }}
          >
            <div className="border-t border-[#AF9275]/45">
              {questions.map((item, index) => {
                const isOpen = openQuestion === index;
                const questionId = `faq-question-${item.number}`;
                const answerId = `faq-answer-${item.number}`;
                return (
                  <div key={item.number} className="border-b border-[#AF9275]/45">
                    <button
                      id={questionId}
                      type="button"
                      data-testid={`button-general-faq-${item.number}`}
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      onClick={() => setOpenQuestion(isOpen ? null : index)}
                      className="group flex min-h-[78px] w-full items-center justify-between gap-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BB9445] focus-visible:ring-inset"
                    >
                      <span className={`text-base leading-6 transition-colors group-hover:text-[#BB9445] md:text-lg ${isOpen ? 'text-[#BB9445]' : 'text-[#2F4055]'}`}>
                        <span className="mr-3 text-xs tracking-[.15em] text-[#BB9445]">{item.number}</span>
                        {item.question}
                      </span>
                      <span aria-hidden="true" className="shrink-0 text-2xl font-light text-[#BB9445]">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    <div
                      id={answerId}
                      role="region"
                      aria-labelledby={questionId}
                      className={`grid transition-[grid-template-rows] duration-500 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div className="pb-7 pr-8 text-sm leading-7 text-[#68727b] md:pr-12 md:text-base">
                          <p>{item.answer}</p>
                          {item.location && (
                            googleMapsUrl ? (
                              <a
                                href={googleMapsUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-5 inline-flex text-[11px] font-bold uppercase tracking-[.18em] text-[#BB9445] hover:text-[#2F4055]"
                              >
                                VER UBICACIÓN →
                              </a>
                            ) : (
                              <button
                                type="button"
                                disabled
                                title="El enlace real de Google Maps se agregará aquí"
                                className="mt-5 inline-flex cursor-not-allowed text-[11px] font-bold uppercase tracking-[.18em] text-[#BB9445]/65"
                              >
                                VER UBICACIÓN →
                              </button>
                            )
                          )}
                          {item.whatsapp && (
                            <a
                              data-testid="link-faq-whatsapp"
                              href={questionWhatsappHref}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-5 inline-flex text-[11px] font-bold uppercase tracking-[.18em] text-[#BB9445] transition-colors hover:text-[#2F4055] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BB9445]"
                            >
                              ENVIAR WHATSAPP →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-14 border-t border-[#AF9275]/45 pt-9">
              <h3 className="font-serif text-3xl leading-tight md:text-4xl">¿No encontraste lo que buscabas?</h3>
              <p className="mt-3 text-base leading-7 text-[#68727b]">Escríbenos y con gusto podemos orientarte.</p>
              <div className="mt-7 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                <a
                  data-testid="link-faq-ask-whatsapp"
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#BB9445] px-6 py-3 text-sm font-semibold uppercase tracking-[.07em] text-[#202B38] transition duration-300 hover:-translate-y-0.5 hover:bg-[#D0AA59] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BB9445] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F2F2EF]"
                >
                  <MessageCircle aria-hidden="true" size={16} />
                  PREGUNTAR POR WHATSAPP →
                </a>
                <button
                  type="button"
                  data-testid="button-faq-book"
                  onClick={onBook}
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold uppercase tracking-[.08em] text-[#2F4055] transition-colors hover:text-[#BB9445] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BB9445]"
                >
                  SOLICITAR CITA <ArrowRight aria-hidden="true" size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}