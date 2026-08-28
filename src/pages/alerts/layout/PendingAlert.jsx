import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import AlertCard from "@/pages/alerts/layout/AlertCard";
import { getPendingAlerts, markAlertRead } from "@/services/alertService";

const PendingAlertsDialog = () => {
    const queryClient = useQueryClient();
    const [queue, setQueue] = useState([]);

    const { data, isSuccess } = useQuery({
        queryKey: ["recipient-alerts", "pending"],
        queryFn: getPendingAlerts,
    });

    useEffect(() => {
        if (!isSuccess) return;
        const incoming = data?.data ?? [];
        setQueue((prev) => {
            const existingIds = new Set(prev.map((a) => a.id));
            const newAlerts = incoming.filter((a) => !existingIds.has(a.id));
            return [...prev, ...newAlerts];
        });
    }, [data, isSuccess]);

    const acknowledgeMutation = useMutation({
        mutationFn: (alertId) => markAlertRead(alertId),
        onSuccess: (_, alertId) => {
            setQueue((prev) => prev.filter((a) => a.id !== alertId));
            queryClient.invalidateQueries({ queryKey: ["recipient-alerts"] });
            queryClient.invalidateQueries({
                queryKey: ["recipient-alerts-unread-count"],
            });
        },
        onError: () => {
            toast.error("Could not acknowledge alert. Please try again.");
        },
    });

    if (queue.length === 0) {
        return null;
    }

    const currentAlert = queue[0];
    const remaining = queue.length;

    return (
        <AlertDialog open modal>
            <AlertDialogContent>
                <AlertCard
                    alert={currentAlert}
                    variant="dialog"
                    onAcknowledge={() =>
                        acknowledgeMutation.mutate(currentAlert.id)
                    }
                    isAcknowledging={acknowledgeMutation.isPending}
                />
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default PendingAlertsDialog;