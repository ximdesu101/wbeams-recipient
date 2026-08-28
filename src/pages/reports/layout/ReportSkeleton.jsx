import { Card, CardContent } from "@/components/ui/card";

const ReportSkeleton = () => (
    <Card>
        <CardContent className="animate-pulse space-y-3">
            <div className="h-5 w-3/4 rounded-md bg-muted" />
            <div className="h-4 w-1/2 rounded-md bg-muted" />
            <div className="h-8 w-24 rounded-md bg-muted" />
        </CardContent>
    </Card>
);

export default ReportSkeleton;