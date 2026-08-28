import { BellOff } from "lucide-react";
import {
    Card,
    CardDescription,
    CardTitle,
} from "@/components/ui/card";

const EmptyAlerts = () => (
    <Card className="flex flex-col items-center justify-center py-16 text-center">
        <BellOff className="mb-4 h-12 w-12 text-muted-foreground" />
        <CardTitle className="text-lg">No alerts yet</CardTitle>
        <CardDescription className="mt-1 max-w-xs">
            You&apos;re all caught up. New alerts sent to your group will appear here.
        </CardDescription>
    </Card>
);

export default EmptyAlerts;