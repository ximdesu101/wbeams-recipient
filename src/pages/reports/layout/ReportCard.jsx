import { useState } from "react";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { statusVariant } from "@/lib/helper";
import {
    Film,
    AudioLines,
    EllipsisVertical,
    Trash2,
    ChevronDown,
    ChevronRight,
} from "lucide-react";

function CollapsibleVideo({ src }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="overflow-hidden rounded-xl border bg-muted/30">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50"
                aria-expanded={open}
            >
                <span className="flex items-center gap-1.5">
                    <Film className="h-3.5 w-3.5 text-sky-600" />
                    Video attachment
                </span>
                {open ? (
                    <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                    <ChevronRight className="h-4 w-4 shrink-0" />
                )}
            </button>
            {open && (
                <video
                    src={src}
                    controls
                    playsInline
                    preload="metadata"
                    className="max-h-64 w-full border-t bg-black object-contain"
                />
            )}
        </div>
    );
}

function CollapsibleVoice({ src }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="overflow-hidden rounded-xl border bg-muted/30">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50"
                aria-expanded={open}
            >
                <span className="flex items-center gap-1.5">
                    <AudioLines className="h-3.5 w-3.5 text-amber-600" />
                    Voice message
                </span>
                {open ? (
                    <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                    <ChevronRight className="h-4 w-4 shrink-0" />
                )}
            </button>
            {open && (
                <div className="border-t p-3">
                    <audio
                        src={src}
                        controls
                        preload="metadata"
                        className="w-full"
                    />
                </div>
            )}
        </div>
    );
}

const ReportCard = ({ report, onDelete, isDeleting = false }) => {
    const [confirmOpen, setConfirmOpen] = useState(false);

    const hasVideo = Boolean(report.video_url || report.has_video);
    const hasVoice = Boolean(report.voice_url || report.has_voice);

    const handleConfirmDelete = () => {
        onDelete?.(report);
        setConfirmOpen(false);
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <CardTitle>{report.title}</CardTitle>
                        <CardDescription>
                            {report.location} •{" "}
                            {new Date(report.created_at).toLocaleString()}
                            {report.urgency ? (
                                <>
                                    {" "}
                                    •{" "}
                                    <span className="capitalize">
                                        {report.urgency}
                                    </span>
                                </>
                            ) : null}
                        </CardDescription>
                    </div>
                    <CardAction className="flex items-center gap-1">
                        <Badge
                            variant={statusVariant[report.status] ?? "default"}
                        >
                            {report.status
                                ? report.status.charAt(0).toUpperCase() +
                                    report.status.slice(1)
                                : "Unknown"}
                        </Badge>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    aria-label="Report actions"
                                    disabled={isDeleting}
                                >
                                    <EllipsisVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                    variant="destructive"
                                    className="text-destructive focus:text-destructive"
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        setConfirmOpen(true);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardAction>
                </CardHeader>

                {(hasVideo || hasVoice) && (
                    <CardContent className="grid gap-2 pt-0">
                        {report.video_url && (
                            <CollapsibleVideo src={report.video_url} />
                        )}

                        {report.voice_url && (
                            <CollapsibleVoice src={report.voice_url} />
                        )}

                        {hasVideo && !report.video_url && (
                            <p className="text-muted-foreground text-xs">
                                Video was attached but is not available to play.
                            </p>
                        )}
                        {hasVoice && !report.voice_url && (
                            <p className="text-muted-foreground text-xs">
                                Voice message was attached but is not available
                                to play.
                            </p>
                        )}
                    </CardContent>
                )}
            </Card>

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this report?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove{" "}
                            <span className="font-medium text-foreground">
                                {report.title}
                            </span>{" "}
                            and any attached video or voice files. This action
                            cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={handleConfirmDelete}
                        >
                            {isDeleting ? "Deleting…" : "Delete report"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default ReportCard;