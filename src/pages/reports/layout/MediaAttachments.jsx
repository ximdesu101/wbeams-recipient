import { useRef, useState, useEffect, useCallback } from "react";
import {
    Video,
    Mic,
    X,
    Square,
    Film,
    AudioLines,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0");
    const s = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");
    return `${m}:${s}`;
};

const formatBytes = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getSupportedMimeType = (kind) => {
    const candidates =
        kind === "record-video"
            ? [
                  "video/webm;codecs=vp9,opus",
                  "video/webm;codecs=vp8,opus",
                  "video/webm",
                  "video/mp4",
              ]
            : [
                  "audio/webm;codecs=opus",
                  "audio/webm",
                  "audio/mp4",
                  "audio/ogg",
              ];

    for (const type of candidates) {
        if (
            typeof MediaRecorder !== "undefined" &&
            MediaRecorder.isTypeSupported(type)
        ) {
            return type;
        }
    }
    return "";
};

const queryPermission = async (name) => {
    try {
        if (!navigator.permissions?.query) return "unknown";
        const result = await navigator.permissions.query({ name });
        return result.state; // "granted" | "denied" | "prompt"
    } catch {
        // Firefox may throw for camera/microphone
        return "unknown";
    }
};

const requestStream = async (type) => {
    if (type === "record-voice") {
        return navigator.mediaDevices.getUserMedia({ audio: true });
    }

    // Video: try several constraint sets so one denied device doesn't block everything
    const attempts = [
        // 1. Any camera + mic
        { video: true, audio: true },
        // 2. Prefer rear camera + mic (phones)
        { video: { facingMode: { ideal: "environment" } }, audio: true },
        // 3. Front camera + mic
        { video: { facingMode: { ideal: "user" } }, audio: true },
        // 4. Camera only (mic may be blocked or missing)
        { video: true, audio: false },
        // 5. Prefer rear, no mic
        { video: { facingMode: { ideal: "environment" } }, audio: false },
        // 6. Front, no mic
        { video: { facingMode: { ideal: "user" } }, audio: false },
    ];

    let lastError;
    for (const constraints of attempts) {
        try {
            return await navigator.mediaDevices.getUserMedia(constraints);
        } catch (err) {
            lastError = err;
            // Keep trying other constraint sets
        }
    }
    throw lastError;
};

const getMediaErrorMessage = async (err) => {
    if (!window.isSecureContext) {
        return "Camera/microphone only work on HTTPS or localhost. Open the app via https:// or http://localhost.";
    }

    const cam = await queryPermission("camera");
    const mic = await queryPermission("microphone");

    if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        if (cam === "denied" || mic === "denied") {
            return (
                "Camera or microphone is blocked for this site. " +
                "Click the lock/tune icon in the address bar → Site settings → set Camera and Microphone to Allow, then reload."
            );
        }
        return (
            "Browser blocked camera/microphone access. " +
            "Check the address-bar permission icon, allow both Camera and Microphone, then try again."
        );
    }

    if (err?.name === "NotFoundError" || err?.name === "DevicesNotFoundError") {
        return "No camera or microphone was found on this device.";
    }

    if (err?.name === "NotReadableError" || err?.name === "TrackStartError") {
        return "Camera/microphone is already in use by another app (Zoom, Teams, etc.). Close it and try again.";
    }

    if (
        err?.name === "OverconstrainedError" ||
        err?.name === "ConstraintNotSatisfiedError"
    ) {
        return "This device does not support the requested camera settings.";
    }

    if (err?.name === "SecurityError") {
        return "Camera blocked by browser security settings. Use HTTPS or localhost.";
    }

    return (
        err?.message ||
        `Unable to start recording (${err?.name || "unknown error"}).`
    );
};

export function useMediaAttachments(value, onChange) {
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const streamRef = useRef(null);
    const timerRef = useRef(null);
    const previewVideoRef = useRef(null);
    const attachmentsRef = useRef(value ?? { video: null, voice: null });

    const [mode, setMode] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [liveStream, setLiveStream] = useState(null);
    const [error, setError] = useState("");

    const attachments = value ?? { video: null, voice: null };
    attachmentsRef.current = attachments;

    const stopTracks = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        setLiveStream(null);
        if (previewVideoRef.current) {
            previewVideoRef.current.srcObject = null;
        }
    }, []);

    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setElapsed(0);
    }, []);

    useEffect(() => {
        return () => {
            stopTracks();
            clearTimer();
            if (mediaRecorderRef.current?.state === "recording") {
                try {
                    mediaRecorderRef.current.stop();
                } catch {
                    // ignore
                }
            }
        };
    }, [stopTracks, clearTimer]);

    useEffect(() => {
        const el = previewVideoRef.current;
        if (el && liveStream) {
            el.srcObject = liveStream;
            el.muted = true;
            el.playsInline = true;
            const playPromise = el.play?.();
            if (playPromise?.catch) {
                playPromise.catch(() => {});
            }
        }
    }, [liveStream, isRecording, mode]);

    const update = useCallback(
        (patch) => {
            onChange?.({ ...attachmentsRef.current, ...patch });
        },
        [onChange]
    );

    const startRecording = async (type) => {
        setError("");

        if (!window.isSecureContext) {
            setError(
                "Camera/microphone only work on HTTPS or localhost. Open the app via https:// or http://localhost."
            );
            return;
        }

        if (!navigator.mediaDevices?.getUserMedia) {
            setError("Camera API is not available in this browser.");
            return;
        }

        try {
            const stream = await requestStream(type);

            streamRef.current = stream;
            setLiveStream(stream);
            setMode(type);
            setIsRecording(true);
            setElapsed(0);

            chunksRef.current = [];
            const mimeType = getSupportedMimeType(type);
            const recorder = mimeType
                ? new MediaRecorder(stream, { mimeType })
                : new MediaRecorder(stream);

            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (e) => {
                if (e.data?.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onerror = () => {
                setError("Recording failed. Please try again.");
                stopTracks();
                clearTimer();
                setIsRecording(false);
                setMode(null);
            };

            recorder.onstop = () => {
                const blobType =
                    mimeType ||
                    (type === "record-video" ? "video/webm" : "audio/webm");
                const blob = new Blob(chunksRef.current, { type: blobType });
                const url = URL.createObjectURL(blob);
                const name =
                    type === "record-video"
                        ? `recording-${Date.now()}.webm`
                        : `voice-${Date.now()}.webm`;

                if (type === "record-video") {
                    update({
                        video: {
                            file: blob,
                            url,
                            name,
                            size: blob.size,
                            source: "record",
                        },
                    });
                } else {
                    update({
                        voice: {
                            file: blob,
                            url,
                            name,
                            size: blob.size,
                            source: "record",
                        },
                    });
                }

                stopTracks();
                clearTimer();
                setIsRecording(false);
                setMode(null);
            };

            recorder.start(250);
            timerRef.current = setInterval(() => {
                setElapsed((prev) => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("getUserMedia / MediaRecorder error:", err);
            const message = await getMediaErrorMessage(err);
            setError(message);
            stopTracks();
            clearTimer();
            setIsRecording(false);
            setMode(null);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop();
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.onstop = null;
            if (mediaRecorderRef.current.state === "recording") {
                try {
                    mediaRecorderRef.current.stop();
                } catch {
                    // ignore
                }
            }
        }
        stopTracks();
        clearTimer();
        setIsRecording(false);
        setMode(null);
    };

    const removeVideo = () => {
        if (attachments.video?.url) URL.revokeObjectURL(attachments.video.url);
        update({ video: null });
    };

    const removeVoice = () => {
        if (attachments.voice?.url) URL.revokeObjectURL(attachments.voice.url);
        update({ voice: null });
    };

    return {
        isRecording,
        error,
        mode,
        elapsed,
        previewVideoRef,
        startRecording,
        stopRecording,
        cancelRecording,
        removeVideo,
        removeVoice,
        attachments,
    };
}

export function MediaFooterActions({ isRecording, onRecordVideo, onRecordVoice }) {
    return (
        <TooltipProvider>
            <div className="flex items-center gap-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={isRecording}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onRecordVideo?.();
                            }}
                            aria-label="Record video"
                        >
                            <Video className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Record video</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={isRecording}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onRecordVoice?.();
                            }}
                            aria-label="Record voice message"
                        >
                            <Mic className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Voice message</TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
}

export function MediaPanel({
    isRecording,
    mode,
    elapsed,
    previewVideoRef,
    attachments,
    error,
    onCancel,
    onStop,
    onRemoveVideo,
    onRemoveVoice,
}) {
    if (!isRecording && !attachments?.video && !attachments?.voice && !error) {
        return null;
    }

    return (
        <div className="grid gap-2">
            {isRecording && (
                <div className="overflow-hidden rounded-xl border bg-muted/30">
                    {mode === "record-video" && (
                        <div className="relative aspect-video bg-black">
                            <video
                                ref={previewVideoRef}
                                autoPlay
                                muted
                                playsInline
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                                REC {formatDuration(elapsed)}
                            </div>
                        </div>
                    )}

                    {mode === "record-voice" && (
                        <div className="flex flex-col items-center justify-center gap-4 px-6 py-10">
                            <div className="relative flex h-20 w-20 items-center justify-center">
                                <span className="absolute inset-0 animate-ping rounded-full bg-red-500/20" />
                                <span className="absolute inset-2 rounded-full bg-red-500/30" />
                                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white">
                                    <Mic className="h-6 w-6" />
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-semibold tabular-nums">
                                    {formatDuration(elapsed)}
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    Recording voice message…
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-2 border-t px-4 py-3">
                        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                            <X className="mr-1.5 h-4 w-4" />
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={onStop}
                        >
                            <Square className="mr-1.5 h-3.5 w-3.5 fill-current" />
                            Stop & save
                        </Button>
                    </div>
                </div>
            )}

            {!isRecording && attachments?.video && (
                <div className="flex items-start gap-3 rounded-xl border bg-card p-3">
                    <div className="flex h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-black">
                        <video
                            src={attachments.video.url}
                            className="h-full w-full object-cover"
                            muted
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <Film className="h-3.5 w-3.5 text-sky-600" />
                            <p className="truncate text-sm font-medium">
                                {attachments.video.name}
                            </p>
                        </div>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                            Recorded video
                            {attachments.video.size
                                ? ` · ${formatBytes(attachments.video.size)}`
                                : ""}
                        </p>
                        <video
                            src={attachments.video.url}
                            controls
                            className="mt-2 max-h-40 w-full rounded-lg"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={onRemoveVideo}
                        aria-label="Remove video"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {!isRecording && attachments?.voice && (
                <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
                        <AudioLines className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                            {attachments.voice.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                            Voice message
                            {attachments.voice.size
                                ? ` · ${formatBytes(attachments.voice.size)}`
                                : ""}
                        </p>
                        <audio
                            src={attachments.voice.url}
                            controls
                            className="mt-2 w-full"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={onRemoveVoice}
                        aria-label="Remove voice message"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {error && (
                <p className="text-destructive text-sm" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}