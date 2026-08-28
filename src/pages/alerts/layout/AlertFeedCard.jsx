import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheckBig, Mail, MonitorSmartphone, ThumbsDown, ThumbsUp } from "lucide-react";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Field, FieldContent, FieldTitle, FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { submitAlertFeedback } from "@/services/alertService";
import { SEVERITY_VARIANT, timeAgo } from "@/lib/helper";

const AlertFeedCard = ({ alert }) => {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [comment, setComment] = useState("");

    const operatorName = alert.operator
        ? `${alert.operator.first_name} ${alert.operator.last_name}`
        : "Unknown";
    const refNumber = `OPR-${String(alert.operator?.id ?? 0).padStart(5, "0")}`;

    const feedbackMutation = useMutation({
        mutationFn: ({ rating, comment }) =>
            submitAlertFeedback({ alertId: alert.id, rating, comment }),
        onSuccess: () => {
            toast.success("Feedback submitted. Thank you!");
            setPopoverOpen(false);
            setFeedback("");
            setComment("");
        },
        onError: () => {
            toast.error("Failed to submit feedback. Please try again.");
        },
    });

    const handleFeedbackSubmit = () => {
        if (!feedback) {
            toast.warning("Please select Helpful or Not helpful before submitting.");
            return;
        }
        feedbackMutation.mutate({ rating: feedback, comment });
    };

    return (
        <Card>
            <CardHeader className="flex justify-between">
                <div className="flex gap-2">
                    <Badge>{alert.alert_type?.name ?? "Alert"}</Badge>
                    <Badge variant={SEVERITY_VARIANT[alert.severity] ?? "default"}>
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                    </Badge>
                </div>
                <CardDescription>{timeAgo(alert.sent_at)}</CardDescription>
            </CardHeader>

            <CardHeader>
                <CardTitle>{alert.title}</CardTitle>
                <CardDescription>{alert.message}</CardDescription>
            </CardHeader>

            {alert.response_instructions?.length > 0 && (
                <CardContent>
                    <Card>
                        <CardContent>
                            <CardDescription>Safety instructions</CardDescription>
                            {alert.response_instructions.map((instruction, index) => (
                                <p
                                    key={index}
                                    className="flex items-start gap-2 text-sm leading-6"
                                >
                                    <CircleCheckBig className="mt-1 h-4 w-4 shrink-0 text-green-600" />
                                    <span>{instruction}</span>
                                </p>
                            ))}
                        </CardContent>
                    </Card>
                </CardContent>
            )}

            {alert.acknowledged_via && (
                <CardContent>
                    <CardDescription className="flex items-center gap-1.5">
                        {alert.acknowledged_via === "email" ? (
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                            <MonitorSmartphone className="h-3.5 w-3.5 shrink-0" />
                        )}
                        Acknowledged via:{" "}
                        <span className="font-medium text-foreground capitalize">
                            {alert.acknowledged_via === "email" ? "Email" : "In-app"}
                        </span>
                    </CardDescription>
                </CardContent>
            )}

            <CardContent className="flex justify-between">
                <CardAction>
                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline">Leave feedback</Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-72">
                            <PopoverHeader>
                                <PopoverTitle>Was this alert helpful?</PopoverTitle>
                            </PopoverHeader>

                            <RadioGroup
                                value={feedback}
                                onValueChange={setFeedback}
                                className="flex max-w-sm"
                            >
                                <FieldLabel htmlFor={`like-${alert.id}`}>
                                    <Field>
                                        <FieldContent className="items-center">
                                            <FieldTitle>
                                                <ThumbsUp className="w-4 h-4" />
                                                Helpful
                                            </FieldTitle>
                                        </FieldContent>
                                        <RadioGroupItem
                                            value="like"
                                            id={`like-${alert.id}`}
                                            className="absolute opacity-0 pointer-events-none"
                                        />
                                    </Field>
                                </FieldLabel>

                                <FieldLabel htmlFor={`dislike-${alert.id}`}>
                                    <Field>
                                        <FieldContent className="items-center">
                                            <FieldTitle>
                                                <ThumbsDown className="w-4 h-4" />
                                                Not helpful
                                            </FieldTitle>
                                        </FieldContent>
                                        <RadioGroupItem
                                            value="dislike"
                                            id={`dislike-${alert.id}`}
                                            className="absolute opacity-0 pointer-events-none"
                                        />
                                    </Field>
                                </FieldLabel>
                            </RadioGroup>

                            {feedback && (
                                <div className="mt-3">
                                    <Textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder={
                                            feedback === "like"
                                                ? "What made this alert helpful?"
                                                : "How can we improve this alert?"
                                        }
                                        className="min-h-[80px]"
                                    />
                                </div>
                            )}

                            <Button
                                variant="outline"
                                className="mt-3 w-full"
                                onClick={handleFeedbackSubmit}
                                disabled={feedbackMutation.isPending}
                            >
                                {feedbackMutation.isPending ? "Submitting..." : "Submit feedback"}
                            </Button>
                        </PopoverContent>
                    </Popover>
                </CardAction>

                <CardDescription className="my-auto">
                    Ref: {refNumber} &middot; Sent by {operatorName}
                </CardDescription>
            </CardContent>
        </Card>
    );
};

export default AlertFeedCard;