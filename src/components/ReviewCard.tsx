import type { Review } from '@/types/cv';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
      <div className="flex gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={i < review.rating ? 'text-yellow-500' : 'text-muted'}
          >
            ★
          </span>
        ))}
      </div>
      <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
        "{review.text}"
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <span className="text-primary font-semibold text-sm">
            {review.initials}
          </span>
        </div>
        <div>
          <p className="font-medium text-foreground text-sm">{review.name}</p>
          <p className="text-xs text-muted-foreground">{review.location}</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
