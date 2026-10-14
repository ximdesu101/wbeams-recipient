import { CircleCheckBig, CircleCheck } from "lucide-react";
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
    const severityCardClass = {
        low: "border-green-100 bg-green-500 dark:bg-green-500/100 alert-glow-green",
        medium: "border-yellow-100 bg-yellow-500 dark:bg-yellow-500/100 alert-glow-yellow",
        moderate: "border-yellow-100 bg-yellow-500 dark:bg-yellow-500/100 alert-glow-yellow",
        high: "border-orange-100 bg-orange-500 dark:bg-orange-500/100 alert-glow-orange",
        critical: "border-red-100 bg-red-500 dark:bg-red-500/100 alert-glow-red",
    }[alert.severity?.toLowerCase()] ?? "";

    return (
        <Card className={severityCardClass}>
            <CardHeader>
                <div className="flex justify-between">
                    <CardTitle className="text-2xl">{alert.title}</CardTitle>
                    <CardDescription className="text-white my-auto">
                        {timeAgo(alert.sent_at)}          
                    </CardDescription>                    
                </div>
                <CardDescription className="text-white">
                    {alert.message}                                   
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
                <Button onClick={onAcknowledge} disabled={isAcknowledging} >
                    <CircleCheck />
                    {isAcknowledging ? "Acknowledging..." : "Acknowledge"}
                </Button>
            </CardAction>
        </Card>
    );
};

export default AlertCard;
