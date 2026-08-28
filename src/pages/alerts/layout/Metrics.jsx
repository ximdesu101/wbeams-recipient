import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Bell,
    FileText,
    ClockAlert,
} from "lucide-react";
import { getRecipientAlerts } from "@/services/alertService";
import { getRecipientReports } from "@/services/reportService";

const Metrics = () => {
    const { data: alertsData, isLoading: alertsLoading } = useQuery({
        queryKey: ["recipient-alerts"],
        queryFn: getRecipientAlerts,
        staleTime: 15_000,
    });

    const { data: reportsData, isLoading: reportsLoading } = useQuery({
        queryKey: ["recipient-reports"],
        queryFn: getRecipientReports,
        staleTime: 15_000,
    });

    const alerts = useMemo(
        () => (Array.isArray(alertsData?.data) ? alertsData.data : []),
        [alertsData]
    );

    const reports = useMemo(
        () => (Array.isArray(reportsData?.data) ? reportsData.data : []),
        [reportsData]
    );

    const totalAlerts = alerts.length;
    const myReports = reports.length;
    const pendingReports = reports.filter(
        (r) => String(r.status ?? "pending").toLowerCase() === "pending"
    ).length;

    const isLoading = alertsLoading || reportsLoading;

    const cardMetrics = [
        {
            title: "Total Alerts",
            value: isLoading ? "—" : totalAlerts,
            icon: Bell,
            bgColor: "bg-blue-100 dark:bg-blue-950",
            iconColor: "text-blue-600 dark:text-blue-400",
        },
        {
            title: "My Reports",
            value: isLoading ? "—" : myReports,
            icon: FileText,
            bgColor: "bg-green-100 dark:bg-green-950",
            iconColor: "text-green-600 dark:text-green-400",
        },
        {
            title: "Pending Reports",
            value: isLoading ? "—" : pendingReports,
            icon: ClockAlert,
            bgColor: "bg-yellow-100 dark:bg-yellow-950",
            iconColor: "text-yellow-600 dark:text-yellow-400",
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cardMetrics.map((card, index) => {
                const Icon = card.icon;

                return (
                    <Card key={index} className="flex flex-row items-center gap-4 p-4">
                        <div
                            className={`flex size-14 shrink-0 items-center justify-center rounded-xl ${card.bgColor}`}
                        >
                            <Icon className={`size-7 ${card.iconColor}`} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <CardHeader className="p-0 pb-1">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {card.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <p className="text-3xl font-bold tracking-tight">
                                    {card.value}
                                </p>
                            </CardContent>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

export default Metrics;