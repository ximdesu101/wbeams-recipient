import OperatorFeedback from "./layout/OperatorFeedback";
import SystemFeedback from "./layout/SystemFeedback";

const Feedback = () => {
    return (
        <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
                <OperatorFeedback />
                <SystemFeedback />
            </div>
        </div>
    );
};

export default Feedback;
