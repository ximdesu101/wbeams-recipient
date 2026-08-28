import { useState } from "react";
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

const OperatorFeedback = () => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

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
            </CardContent>
            <CardFooter>
                <CardAction>
                    <Button type="button">Submit feedback</Button>
                </CardAction>
            </CardFooter>
        </Card>
    );
};

export default OperatorFeedback;