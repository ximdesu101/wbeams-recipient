import { Star } from "lucide-react";

const StarRating = ({ value = 0, onChange, readOnly = false }) => {
    return (
        <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => {
                const isActive = star <= value;
                return (
                    <button
                        key={star}
                        type="button"
                        onClick={() => !readOnly && onChange?.(star)}
                        disabled={readOnly}
                        className={`transition ${readOnly ? "cursor-default" : "hover:scale-110"}`}
                        aria-label={`${star} star${star === 1 ? "" : "s"}`}
                        aria-readonly={readOnly}
                    >
                        <Star
                            className={`h-7 w-7 ${isActive
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-transparent text-muted-foreground"
                                }`}
                        />
                    </button>
                );
            })}
        </div>
    );
};

export default StarRating;
