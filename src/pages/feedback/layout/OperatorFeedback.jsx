import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Headphones } from "lucide-react";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Field, FieldLabel } from "@/components/ui/field";
import StarRating from "./StarRating";
import {
    getOperatorFeedback,
    submitOperatorFeedback,
} from "@/services/feedbackService";

const OperatorFeedback = () => {
    const queryClient = useQueryClient();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    const { data: existing, isLoading } = useQuery({
        queryKey: ["operatorFeedback"],
        queryFn: getOperatorFeedback,
        staleTime: 30_000,
    });

    useEffect(() => {
        if (existing) {
            setRating(existing.rating || 0);
            setComment(existing.comment || "");
            setIsEditing(false);
        }
    }, [existing]);

    const mutation = useMutation({
        mutationFn: submitOperatorFeedback,
        onSuccess: (data) => {
            queryClient.setQueryData(["operatorFeedback"], data);
            toast.success(
                existing
                    ? "Operator feedback updated. Thank you!"
                    : "Operator feedback submitted. Thank you!"
            );
            setIsEditing(false);
        },
        onError: (err) => {
            toast.error(
                err?.message || "Failed to submit feedback. Please try again."
            );
        },
    });

    const handleSubmit = () => {
        if (!rating || rating < 1 || rating > 5) {
            toast.warning("Please select a rating from 1 to 5 stars.");
            return;
        }
        mutation.mutate({ rating, comment });
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (existing) {
            setRating(existing.rating || 0);
            setComment(existing.comment || "");
        } else {
            setRating(0);
            setComment("");
        }
        setIsEditing(false);
    };

    const hasSubmitted = Boolean(existing);
    const showForm = !hasSubmitted || isEditing;

    const formatDate = (iso) => {
        if (!iso) return "";
        try {
            return new Date(iso).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
            });
        } catch {
            return iso;
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-blue-100 p-2.5 dark:bg-blue-950">
                        <Headphones className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <CardTitle>Operator feedback</CardTitle>
                        <CardDescription>
                            Rate how the operator handled alerts and response
                            coordination.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <Separator />
            <CardContent className="grid gap-4">
                {isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading…</p>
                ) : showForm ? (
                    <>
                        <Field>
                            <FieldLabel>How was the operator support?</FieldLabel>
                            <StarRating value={rating} onChange={setRating} />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="operator-comment">
                                Comments (optional)
                            </FieldLabel>
                            <Textarea
                                id="operator-comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="What went well? What could be improved?"
                                className="min-h-[100px]"
                            />
                        </Field>
                    </>
                ) : (
                    <div className="grid gap-3">
                        <Field>
                            <FieldLabel>Your rating</FieldLabel>
                            <StarRating value={existing.rating} readOnly />
                        </Field>
                        {existing.comment ? (
                            <Field>
                                <FieldLabel>Your comment</FieldLabel>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {existing.comment}
                                </p>
                            </Field>
                        ) : null}
                        <p className="text-xs text-muted-foreground">
                            Submitted {formatDate(existing.submittedAt)}
                            {existing.updatedAt !== existing.submittedAt
                                ? ` · Updated ${formatDate(existing.updatedAt)}`
                                : ""}
                        </p>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <CardAction className="flex gap-2">
                    {showForm ? (
                        <>
                            {hasSubmitted && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={mutation.isPending}
                                >
                                    Cancel
                                </Button>
                            )}
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={mutation.isPending}
                            >
                                {mutation.isPending
                                    ? "Submitting…"
                                    : hasSubmitted
                                        ? "Update feedback"
                                        : "Submit feedback"}
                            </Button>
                        </>
                    ) : (
                        <Button type="button" variant="outline" onClick={handleEdit}>
                            Edit feedback
                        </Button>
                    )}
                </CardAction>
            </CardFooter>
        </Card>
    );
};

export default OperatorFeedback;
