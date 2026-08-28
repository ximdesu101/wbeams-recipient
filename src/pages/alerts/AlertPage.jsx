import { useQuery } from "@tanstack/react-query";
import {
    Card,
    CardDescription,
    CardTitle,
} from "@/components/ui/card";
import { getRecipientAlerts } from "@/services/alertService";
import Metrics from "./layout/Metrics";
import AlertFeedCard from "./layout/AlertFeedCard";
import AlertSkeleton from "./layout/AlertSkeleton";
import EmptyAlerts from "./layout/EmptyAlerts";

const AlertPage = () => {
    const {
        data,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["recipient-alerts"],
        queryFn: getRecipientAlerts,
    });

    const alerts = data?.data ?? [];

    if (isError) {
        return (
            <Card className="flex flex-col items-center justify-center py-16 text-center">
                <CardTitle className="text-lg text-destructive">
                    Failed to load alerts
                </CardTitle>
                <CardDescription className="mt-1 max-w-xs">
                    {error?.message ?? "Something went wrong. Please refresh the page."}
                </CardDescription>
            </Card>
        );
    }

    return (
        <div className="flex min-w-0 flex-1 flex-col gap-4">
            <Metrics/>
            <div className="grid gap-4">
                {isLoading ? (
                    <div className="grid gap-4">
                        <AlertSkeleton />
                        <AlertSkeleton />
                        <AlertSkeleton />
                    </div>
                ) : alerts.length === 0 ? (
                    <EmptyAlerts />
                ) : (
                    <div className="grid gap-4">
                        {alerts.map((alert) => (
                            <AlertFeedCard key={alert.id} alert={alert} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlertPage;