import { Star } from 'lucide-react';

type Review = {
  id: number | string;
  name: string;
  comment: string;
  rating: number;
  source?: string;
  reviewDate?: string | null;
};

type ReviewsSectionProps = {
  reviews?: Review[];
};

function formatReviewDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString('es-MX', { dateStyle: 'medium' });
}

export default function ReviewsSection({ reviews = [] }: ReviewsSectionProps) {
  const visibleReviews = reviews.slice(0, 3);
  if (visibleReviews.length === 0) return null;

  return (
    <section
      aria-labelledby="reviews-heading"
      className="bg-[#2F4055] px-5 py-20 text-[#F2F2F0] md:px-10 md:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <header className="text-center">
          <p className="text-xs uppercase tracking-[.3em] text-[#e0bb69]">Historias Nova Skin</p>
          <h2 id="reviews-heading" className="mt-3 font-serif text-3xl leading-tight md:text-5xl">
            Lo que se siente también se cuenta.
          </h2>
        </header>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {visibleReviews.map((review) => {
            const reviewDate = review.reviewDate ? formatReviewDate(review.reviewDate) : null;
            return (
              <article
                key={review.id}
                data-testid={`review-card-public-${review.id}`}
                className="flex h-full flex-col rounded-sm border border-white/15 bg-[#202c3a]/45 p-6 md:p-7"
              >
                <div
                  className="flex gap-1 text-[#BB9445]"
                  aria-label={`${review.rating} de 5 estrellas`}
                  data-testid={`review-rating-${review.id}`}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={15} fill={star <= review.rating ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <blockquote className="mt-6 flex-1 font-serif text-xl leading-relaxed text-[#F2F2F0]">
                  “{review.comment}”
                </blockquote>
                <footer className="mt-7 border-t border-white/15 pt-5">
                  <p className="text-sm font-semibold text-white">{review.name}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[.16em] text-[#c7ccca]">
                    {review.source === 'google' && <span>Reseña de Google</span>}
                    {reviewDate && (
                      <time dateTime={review.reviewDate || undefined} data-testid={`review-date-${review.id}`}>
                        {reviewDate}
                      </time>
                    )}
                  </div>
                </footer>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}