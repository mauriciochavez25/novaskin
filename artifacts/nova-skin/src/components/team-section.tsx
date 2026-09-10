import { useEffect, useRef, useState } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';

type SpecialistRecord = {
  name?: string;
  photoUrl?: string | null;
};

type TeamSectionProps = {
  specialists: SpecialistRecord[];
  fallbackImages: string[];
  imageOverrides?: string[];
  onBook: () => void;
  whatsappHref: string;
};

const profiles = [
  {
    name: 'María Muñiz Montemayor',
    title: 'Lic. en Cosmetología',
  },
  {
    name: 'Dra. Indira Isis Ceniceros Mejía',
    title: 'Maestría en Medicina Estética',
  },
];

export default function TeamSection({
  specialists,
  fallbackImages,
  imageOverrides,
  onBook,
  whatsappHref,
}: TeamSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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

  const team = profiles.map((profile, index) => {
    const storedProfile = specialists.find((specialist) => specialist.name === profile.name);
    return {
      ...profile,
      photoUrl: imageOverrides?.[index] || storedProfile?.photoUrl || fallbackImages[index],
    };
  });

  return (
    <section
      id="equipo"
      ref={sectionRef}
      aria-labelledby="team-title"
      className="bg-[#F2F2EF] px-5 py-20 text-[#2F4055] md:px-10 md:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div
          className={`max-w-2xl transition duration-700 ease-out ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-[.3em] text-[#BB9445]">NUESTRO EQUIPO</p>
          <h2 id="team-title" className="mt-5 max-w-3xl font-serif text-5xl leading-[1.02] md:text-6xl">
            Profesionales dedicadas al cuidado de tu piel.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-[#68727b] md:text-lg">
            Conoce a las especialistas que forman parte de la experiencia NovaSkin.
          </p>
        </div>

        <div className="mt-14 grid gap-12 md:grid-cols-2 md:gap-8 lg:mt-20 lg:gap-14">
          {team.map((profile, index) => (
            <article
              key={profile.name}
              className={`transition duration-700 ease-out ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 140 + 180}ms` }}
            >
              <div className="group relative overflow-hidden rounded-t-[8rem] rounded-b-[1.25rem] bg-[#AF9275] shadow-[0_18px_45px_rgba(47,64,85,.10)] md:rounded-t-[11rem]">
                <img
                  src={profile.photoUrl}
                  alt={`${profile.name}, ${profile.title}`}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[.86] h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.02]"
                />
              </div>
              <div className="mt-6 border-b border-[#AF9275]/55 pb-7">
                <h3 className="max-w-xl font-serif text-3xl leading-tight md:text-4xl">{profile.name}</h3>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[.18em] text-[#BB9445]">{profile.title}</p>
              </div>
            </article>
          ))}
        </div>

        <div
          className={`mt-16 flex flex-col gap-6 border-t border-[#AF9275]/45 pt-9 transition duration-700 ease-out sm:flex-row sm:items-center sm:justify-between ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
          }`}
          style={{ transitionDelay: '520ms' }}
        >
          <p className="font-serif text-3xl md:text-4xl">¿Lista para comenzar?</p>
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <button
              type="button"
              data-testid="button-team-book"
              onClick={onBook}
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#BB9445] px-6 py-3 text-sm font-semibold uppercase tracking-[.08em] text-[#202B38] transition duration-300 hover:-translate-y-0.5 hover:bg-[#D0AA59] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BB9445] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F2F2EF]"
            >
              AGENDAR VALORACIÓN <ArrowRight aria-hidden="true" size={16} />
            </button>
            <a
              data-testid="link-team-whatsapp"
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold uppercase tracking-[.08em] text-[#2F4055] transition-colors hover:text-[#BB9445] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BB9445] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F2F2EF]"
            >
              <MessageCircle aria-hidden="true" size={17} className="text-[#BB9445]" />
              WHATSAPP
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}