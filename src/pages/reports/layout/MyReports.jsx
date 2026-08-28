import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    deleteRecipientReport,
    getRecipientReports,
} from "@/services/reportService";
import ReportCard from "./ReportCard";
import ReportSkeleton from "./ReportSkeleton";
import EmptyReports from "./EmptyReports";

const MyReports = () => {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["recipient-reports"],
        queryFn: getRecipientReports,
    });

    const deleteMutation = useMutation({
        mutationFn: (reportId) => deleteRecipientReport(reportId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recipient-reports"] });
            toast.success("Report deleted successfully.");
        },
        onError: (err) => {
            toast.error(
                err.response?.data?.message ||
                    "Failed to delete report. Please try again."
            );
        },
    });

    const reports = useMemo(() => data?.data ?? [], [data]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Reports</CardTitle>
                <CardDescription>Your submitted reports</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="grid gap-3">
                {isLoading ? (
                    <ReportSkeleton />
                ) : reports.length === 0 ? (
                    <EmptyReports />
                ) : (
                    reports.map((report) => (
                        <ReportCard
                            key={report.id}
                            report={report}
                            isDeleting={
                                deleteMutation.isPending &&
                                deleteMutation.variables === report.id
                            }
                            onDelete={(r) => deleteMutation.mutate(r.id)}
                        />
                    ))
                )}
            </CardContent>
        </Card>
    );
};

export default MyReports;