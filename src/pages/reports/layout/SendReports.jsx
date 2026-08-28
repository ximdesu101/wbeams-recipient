import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldContent,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import {
    InputGroup,
    InputGroupInput,
    InputGroupTextarea,
} from "@/components/ui/input-group";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

import { reportSchema } from "@/schemas/reportSchema";
import { zodFieldValidator } from "@/lib/validators";
import { submitReport } from "@/services/reportService";
import { LOCATION_NAMES } from "@/lib/campusLocations";
import { urgencies } from "@/lib/helper";
import {
    useMediaAttachments,
    MediaFooterActions,
    MediaPanel,
} from "./MediaAttachments";
import { Send } from "lucide-react";

const locations = LOCATION_NAMES;

const initialMediaState = {
    video: null,
    voice: null,
};

const SendReport = () => {
    const [isLocating, setIsLocating] = useState(false);
    const [media, setMedia] = useState(initialMediaState);
    const queryClient = useQueryClient();

    const {
        isRecording,
        error: mediaError,
        mode,
        elapsed,
        previewVideoRef,
        startRecording,
        stopRecording,
        cancelRecording,
        removeVideo,
        removeVoice,
        attachments,
    } = useMediaAttachments(media, setMedia);

    const submitMutation = useMutation({
        mutationFn: submitReport,
        onSuccess: () => {
            // Revoke object URLs to free memory
            if (media.video?.url) URL.revokeObjectURL(media.video.url);
            if (media.voice?.url) URL.revokeObjectURL(media.voice.url);
            form.reset();
            setMedia(initialMediaState);
            queryClient.invalidateQueries({ queryKey: ["recipient-reports"] });
            toast.success("Report submitted successfully.");
        },
        onError: (err) => {
            // Network / timeout (common when PHP rejects large uploads silently)
            if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
                toast.error(
                    "Upload timed out. Try a shorter recording, or increase PHP upload limits on the server."
                );
                return;
            }
            if (!err.response) {
                toast.error(
                    err.message ||
                        "Network error while uploading. Check the API is reachable and upload size limits."
                );
                return;
            }

            const errors = err.response?.data?.errors;
            if (errors) {
                // Show first validation error (includes video/voice rules)
                const first = Object.values(errors)[0];
                const msg = Array.isArray(first) ? first[0] : String(first);
                toast.error(msg);

                Object.entries(errors).forEach(([key, messages]) => {
                    form.setFieldMeta(key, (meta) => ({
                        ...meta,
                        errorMap: {
                            onSubmit: Array.isArray(messages)
                                ? messages[0]
                                : String(messages),
                        },
                    }));
                });
            } else {
                toast.error(
                    err.response?.data?.message ||
                        `Failed to submit report (${err.response?.status || "error"}).`
                );
            }
        },
    });

    const form = useForm({
        defaultValues: {
            location: "",
            title: "",
            urgency: "low",
        },
        onSubmit: async ({ value }) => {
            const result = reportSchema.safeParse(value);
            if (!result.success) {
                result.error.issues.forEach((issue) => {
                    form.setFieldMeta(issue.path[0], (meta) => ({
                        ...meta,
                        errorMap: { onSubmit: issue.message },
                    }));
                });
                return;
            }

            setIsLocating(true);
            try {
                const coords = await getSenderCoordinates();

                // Attach recorded media (Blob/File) if present
                const payload = {
                    ...result.data,
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                };

                if (media.video?.file) {
                    // Ensure we send a proper File with a name
                    payload.video =
                        media.video.file instanceof File
                            ? media.video.file
                            : new File(
                                  [media.video.file],
                                  media.video.name || `recording-${Date.now()}.webm`,
                                  { type: media.video.file.type || "video/webm" }
                              );
                }
                if (media.voice?.file) {
                    payload.voice =
                        media.voice.file instanceof File
                            ? media.voice.file
                            : new File(
                                  [media.voice.file],
                                  media.voice.name || `voice-${Date.now()}.webm`,
                                  { type: media.voice.file.type || "audio/webm" }
                              );
                }

                await submitMutation.mutateAsync(payload);
            } catch (error) {
                if (!error?.response) {
                    toast.error(
                        error?.message ||
                        "Unable to get your location. Please allow location access and try again."
                    );
                }
            } finally {
                setIsLocating(false);
            }
        },
    });

    const getSenderCoordinates = () =>
        new Promise((resolve, reject) => {
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
                (error) => {
                    if (error.code === 1) {
                        reject(
                            new Error(
                                "Location permission denied. Please allow location access."
                            )
                        );
                    } else if (error.code === 3) {
                        reject(
                            new Error("Location request timed out. Please try again.")
                        );
                    } else {
                        reject(
                            new Error("Unable to get your location. Please try again.")
                        );
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        });

    const isBusy = isLocating || submitMutation.isPending;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Send a report to the operator</CardTitle>
                <CardDescription>
                    Report an incident, hazard or situation happening in your area.
                </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent>
                <FieldGroup>
                    <form.Field
                        name="location"
                        validators={{
                            onBlur: zodFieldValidator(reportSchema.shape.location),
                        }}
                    >
                        {(field) => (
                            <Field data-invalid={!field.state.meta.isValid}>
                                <FieldLabel htmlFor={field.name}>Location</FieldLabel>
                                <Select
                                    value={field.state.value}
                                    onValueChange={(value) =>
                                        field.handleChange(value)
                                    }
                                    disabled={isBusy}
                                >
                                    <SelectTrigger id={field.name}>
                                        <SelectValue placeholder="Select the location nearest to you" />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectGroup>
                                            {locations.map((location) => (
                                                <SelectItem
                                                    key={location}
                                                    value={location}
                                                >
                                                    {location}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FieldError
                                    errors={field.state.meta.errors.map(
                                        (message) => ({ message })
                                    )}
                                />
                            </Field>
                        )}
                    </form.Field>

                    <form.Field
                        name="title"
                        validators={{
                            onBlur: zodFieldValidator(reportSchema.shape.title),
                        }}
                    >
                        {(field) => (
                            <Field data-invalid={!field.state.meta.isValid}>
                                <FieldLabel htmlFor={field.name}>
                                    Report name
                                </FieldLabel>
                                <InputGroup>
                                    <InputGroupTextarea
                                        id={field.name}
                                        type="text"
                                        placeholder="Enter a short report title"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) =>
                                            field.handleChange(e.target.value)
                                        }
                                        disabled={isBusy}
                                        aria-invalid={!field.state.meta.isValid}
                                    />
                                </InputGroup>
                                <FieldError
                                    errors={field.state.meta.errors.map(
                                        (message) => ({ message })
                                    )}
                                />
                            </Field>
                        )}
                    </form.Field>

                    <form.Field
                        name="urgency"
                        validators={{
                            onBlur: zodFieldValidator(reportSchema.shape.urgency),
                        }}
                    >
                        {(field) => (
                            <Field data-invalid={!field.state.meta.isValid}>
                                <FieldLabel>Urgency</FieldLabel>
                                <RadioGroup
                                    value={field.state.value}
                                    onValueChange={(value) =>
                                        field.handleChange(value)
                                    }
                                    disabled={isBusy}
                                    className="grid grid-cols-4 gap-2"
                                >
                                    {urgencies.map((option) => (
                                        <FieldLabel
                                            key={option.value}
                                            htmlFor={`${option.value}-urgency`}
                                        >
                                            <Field
                                                orientation="horizontal"
                                                className="items-center justify-between rounded-md border"
                                            >
                                                <FieldContent>
                                                    <Label className="text-sm font-medium">
                                                        {option.title}
                                                    </Label>
                                                </FieldContent>
                                                <RadioGroupItem
                                                    id={`${option.value}-urgency`}
                                                    value={option.value}
                                                />
                                            </Field>
                                        </FieldLabel>
                                    ))}
                                </RadioGroup>
                                <FieldError
                                    errors={field.state.meta.errors.map(
                                        (message) => ({ message })
                                    )}
                                />
                            </Field>
                        )}
                    </form.Field>

                    <MediaPanel
                        isRecording={isRecording}
                        mode={mode}
                        elapsed={elapsed}
                        previewVideoRef={previewVideoRef}
                        attachments={attachments}
                        error={mediaError}
                        onCancel={cancelRecording}
                        onStop={stopRecording}
                        onRemoveVideo={removeVideo}
                        onRemoveVoice={removeVoice}
                    />
                </FieldGroup>
            </CardContent>
            <CardFooter className="mt-auto flex w-full items-center justify-between">
                <CardAction className="flex items-center gap-1">
                    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                        {([canSubmit, isSubmitting]) => (
                            <Button
                                type="button"
                                onClick={form.handleSubmit}
                                disabled={!canSubmit || isSubmitting || isBusy || isRecording}
                            >
                                <Send />
                                Send Report
                            </Button>
                        )}
                    </form.Subscribe>
                </CardAction>
                <MediaFooterActions
                    isRecording={isRecording}
                    onRecordVideo={() => startRecording("record-video")}
                    onRecordVoice={() => startRecording("record-voice")}
                />
            </CardFooter>
        </Card>
    );
};

export default SendReport;