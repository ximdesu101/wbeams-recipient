import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    TriangleAlert,
    Siren,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import { submitEmergencySos } from "@/services/reportService";

const EmergencySOS = () => {
    const [open, setOpen] = useState(false);

    const mutation = useMutation({
        mutationFn: async () => {
            const recipient = JSON.parse(localStorage.getItem("recipient") || "{}") || {};
            const profile = [recipient.first_name, recipient.last_name, recipient.role]
                .filter(Boolean)
                .join(" ") || "Recipient";

            const coordinates = await new Promise((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error("Geolocation is not supported on this device."));
                    return;
                }

                navigator.geolocation.getCurrentPosition(
                    (position) =>
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        }),
                    (error) => reject(error),
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0,
                    }
                );
            });

            return submitEmergencySos({
                location: "Current location",
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
                profile,
                details: `SOS requested by ${profile}`,
            });
        },
        onError: (error) => {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Unable to send SOS right now.";
            toast.error(message);
        },
    });

    const handleSendSOS = () => {
        setOpen(true);         
        mutation.mutate();    
    };

    const handleClose = (value) => {
        setOpen(value);
        if (!value) {
            mutation.reset();  
        }
    };

    return (
        <>
            <Card className="border-destructive/30">
                <CardContent className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-destructive/10 p-3">
                            <TriangleAlert className="h-7 w-7 text-destructive" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Emergency SOS</h3>
                            <p className="text-muted-foreground text-sm">
                                Send your location and profile to the operator
                                dispatch desk immediately.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center text-white">
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleSendSOS}
                            disabled={mutation.isPending}
                        >
                            <Siren className="h-5 w-5 my-auto text-white" />
                            Send SOS
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog that shows Loading → Success */}
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-md">
                    {mutation.isPending ? (
                        // ── Loading state ──
                        <DialogHeader className="items-center text-center space-y-4 py-6">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
                                <Loader2 className="h-8 w-8 animate-spin text-red-600 dark:text-red-400" />
                            </div>
                            <DialogTitle className="text-xl">Sending SOS…</DialogTitle>
                            <DialogDescription className="text-base">
                                Please wait while we send your location and profile
                                to the dispatch desk.
                            </DialogDescription>
                        </DialogHeader>
                    ) : mutation.isSuccess ? (
                        // ── Success state ──
                        <>
                            <DialogHeader className="items-center text-center">
                                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                                    <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <DialogTitle className="text-xl">
                                    SOS Sent Successfully
                                </DialogTitle>
                                <DialogDescription className="text-base">
                                    Your emergency alert has been dispatched to the
                                    operator desk along with your current location
                                    and profile.
                                </DialogDescription>
                            </DialogHeader>

                            <DialogFooter className="sm:justify-center">
                                <Button
                                    onClick={() => handleClose(false)}
                                    className="w-full sm:w-auto"
                                >
                                    Got it
                                </Button>
                            </DialogFooter>
                        </>
                    ) : (
                        // ── Error / fallback (optional) ──
                        <DialogHeader className="items-center text-center space-y-4 py-6">
                            <DialogTitle>Something went wrong</DialogTitle>
                            <DialogDescription>
                                Please try again.
                            </DialogDescription>
                            <Button onClick={() => handleClose(false)}>
                                Close
                            </Button>
                        </DialogHeader>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default EmergencySOS;