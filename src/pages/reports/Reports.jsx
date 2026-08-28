import EmergencySOS from "./layout/EmergencySOS";
import SendReport from "./layout/SendReports";
import MyReports from "./layout/MyReports";

const Reports = () => {
    return (
        <div className="flex min-w-0 flex-1 flex-col gap-4">
            <EmergencySOS/>
            <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                    <SendReport />
                </div>
                <MyReports />
            </div>
        </div>
    );
};

export default Reports;