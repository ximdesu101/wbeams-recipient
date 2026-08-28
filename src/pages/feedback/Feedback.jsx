import {
    Alert,
    AlertAction,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import OperatorFeedback from "./layout/OperatorFeedback";
import SystemFeedback from "./layout/SystemFeedback";

const Feedback = () => {
    return (
        <div className="flex min-w-0 flex-1 flex-col gap-4">
            <Alert variant="destructive">
                <AlertTitle>UI Only — No Functionality or Business Logic Implemented Yet!</AlertTitle>
                <AlertDescription>
                    This page currently has no functions or business logic implemented yet. It is UI-only and serves as the visual/interface layout. The functionality, API integration, validation, and business logic will be implemented in a later phase.
                </AlertDescription>
            </Alert>
            <div className="grid gap-4 md:grid-cols-2">
                <OperatorFeedback />
                <SystemFeedback />
            </div>
        </div>
    );
};

export default Feedback;