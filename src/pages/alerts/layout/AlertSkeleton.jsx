import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";

const SkeletonBlock = ({ className }) => (
    <div className={`animate-pulse rounded-md bg-muted ${className}`} />
);

const AlertSkeleton = () => (
    <Card>
        <CardHeader className="flex justify-between">
            <div className="flex gap-2">
                <SkeletonBlock className="h-5 w-20 rounded-full" />
                <SkeletonBlock className="h-5 w-16 rounded-full" />
            </div>
            <SkeletonBlock className="h-4 w-24" />
        </CardHeader>
        <CardHeader>
            <SkeletonBlock className="h-5 w-3/4" />
            <SkeletonBlock className="h-4 w-full mt-1" />
            <SkeletonBlock className="h-4 w-5/6 mt-1" />
        </CardHeader>
        <CardContent className="flex justify-between">
            <SkeletonBlock className="h-9 w-32 rounded-md" />
            <SkeletonBlock className="h-4 w-40" />
        </CardContent>
    </Card>
);

export default AlertSkeleton;