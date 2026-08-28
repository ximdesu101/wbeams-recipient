import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { LayersPlus } from 'lucide-react';

const EmptyReports = () => (
    <Empty>
        <EmptyHeader>
            <EmptyMedia variant="icon">
                <LayersPlus />
            </EmptyMedia>
            <EmptyTitle>No data</EmptyTitle>
            <EmptyDescription>No data found</EmptyDescription>
        </EmptyHeader>
    </Empty>
);

export default EmptyReports;