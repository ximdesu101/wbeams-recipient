import { CircleCheckBig } from "lucide-react";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/helper";

const AlertCard = ({ alert, onAcknowledge, isAcknowledging }) => {
    const operatorName = alert.operator
        ? `${alert.operator.first_name} ${alert.operator.last_name}`
        : "Unknown";
    const refNumber = `OPR-${String(alert.operator?.id ?? 0).padStart(5, "0")}`;

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div className="min-w-0">
                    <CardTitle>{alert.title}</CardTitle>
                    <CardDescription>{alert.message}</CardDescription>
                </div>

                <CardDescription className="shrink-0">
                    {timeAgo(alert.sent_at)}
                </CardDescription>
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

            <CardAction className="flex w-full justify-center items-center">
                <Button onClick={onAcknowledge} disabled={isAcknowledging}>
                    {isAcknowledging ? "Acknowledging..." : "Acknowledge"}
                </Button>
            </CardAction>
        </Card>
    );
};

export default AlertCard;