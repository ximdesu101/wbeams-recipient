import { useState } from "react";
import { MonitorSmartphone } from "lucide-react";
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

const SystemFeedback = () => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-violet-100 p-2.5 dark:bg-violet-950">
                        <MonitorSmartphone className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <CardTitle>System feedback</CardTitle>
                        <CardDescription>
                            Share feedback about the app experience, reliability,
                            and overall usability.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <Separator />
            <CardContent className="grid gap-4">
                <Field>
                    <FieldLabel>How is the system overall?</FieldLabel>
                    <StarRating value={rating} onChange={setRating} />
                </Field>

                <Field>
                    <FieldLabel htmlFor="system-comment">
                        Comments (optional)
                    </FieldLabel>
                    <Textarea
                        id="system-comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Bugs, ideas, or anything we should improve?"
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

export default SystemFeedback;