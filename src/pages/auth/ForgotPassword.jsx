import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { toast } from "sonner";
import { Mail, Send, LockKeyhole, MailCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Field,
    FieldDescription,
    FieldLabel,
} from "@/components/ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import {
    resetRecipientPassword,
    sendRecipientPasswordResetCode,
} from "@/services/authService";

const ForgotPassword = () => {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [codeSent, setCodeSent] = useState(false);

    const clearForm = () => {
        setEmail("");
        setCode("");
        setPassword("");
        setPasswordConfirmation("");
        setShowPassword(false);
        setShowPasswordConfirmation(false);
        setCodeSent(false);
    };

    const sendCodeMutation = useMutation({
        mutationFn: sendRecipientPasswordResetCode,
        onSuccess: (data) => {
            setCodeSent(true);
            setCode("");
            toast.success(data.message || "If an account exists, a reset code has been sent.");
        },
        onError: (error) => toast.error(
            error.response?.data?.message || "Unable to send a password reset code."
        ),
    });

    const resetPasswordMutation = useMutation({
        mutationFn: resetRecipientPassword,
        onSuccess: (data) => {
            toast.success(data.message || "Password reset successfully. You can now sign in.");
            setOpen(false);
            clearForm();
        },
        onError: (error) => {
            const validationErrors = error.response?.data?.errors;
            const firstError = validationErrors
                ? Object.values(validationErrors).flat()[0]
                : null;
            toast.error(firstError || error.response?.data?.message || "Unable to reset your password.");
        },
    });

    const isPending = sendCodeMutation.isPending || resetPasswordMutation.isPending;

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                setOpen(nextOpen);
                if (!nextOpen) clearForm();
            }}
        >
            <DialogTrigger asChild>
                <button type="button" className="hover:underline">
                    Forgot password?
                </button>
            </DialogTrigger>
            <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <LockKeyhole className="size-5" />
                        {codeSent ? "Reset your password" : "Forgot password?"}
                    </DialogTitle>
                    <DialogDescription>
                        {codeSent
                            ? `Enter the 6-digit code sent to ${email}, then choose a new password.`
                            : "Enter your account email and we will send you a reset code."}
                    </DialogDescription>
                </DialogHeader>
                {!codeSent ? (
                    <form
                        className="min-w-0 space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            sendCodeMutation.mutate(email.trim());
                        }}
                    >
                        <Field>
                            <FieldLabel htmlFor="forgot-password-email">
                                Email address
                            </FieldLabel>
                            <InputGroup className="w-full min-w-0">
                                <InputGroupAddon><Mail /></InputGroupAddon>
                                <InputGroupInput
                                    id="forgot-password-email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    disabled={isPending}
                                    required
                                />
                            </InputGroup>
                        </Field>
                        <DialogFooter>
                            <Button type="submit" disabled={isPending || !email.trim()}>
                                {sendCodeMutation.isPending ? (
                                    <><Spinner /> Sending code...</>
                                ) : (
                                    <><Send /> Send reset code</>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                ) : (
                    <form
                        className="min-w-0 space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            if (password !== passwordConfirmation) {
                                toast.error("Passwords do not match.");
                                return;
                            }
                            resetPasswordMutation.mutate({
                                email: email.trim(),
                                code,
                                password,
                                password_confirmation: passwordConfirmation,
                            });
                        }}
                    >
                        <Field>
                            <FieldLabel htmlFor="password-reset-code">
                                Verification code
                            </FieldLabel>
                            <div className="flex min-w-0 justify-center">
                                <InputOTP
                                    id="password-reset-code"
                                    maxLength={6}
                                    pattern={REGEXP_ONLY_DIGITS}
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    value={code}
                                    onChange={setCode}
                                    disabled={isPending}
                                >
                                    <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-11 *:data-[slot=input-otp-slot]:w-10 *:data-[slot=input-otp-slot]:text-lg">
                                        {[0, 1, 2, 3, 4, 5].map((index) => (
                                            <InputOTPSlot key={index} index={index} />
                                        ))}
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                            <FieldDescription className="text-center">
                                The code expires in 10 minutes.
                            </FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="new-password">New password</FieldLabel>
                            <InputGroup className="w-full min-w-0">
                                <InputGroupAddon><LockKeyhole /></InputGroupAddon>
                                <InputGroupInput
                                    id="new-password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    minLength={8}
                                    placeholder="At least 8 characters"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    disabled={isPending}
                                    required
                                />
                                <InputGroupAddon align="inline-end">
                                    <button
                                        type="button"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        onClick={() => setShowPassword((visible) => !visible)}
                                        disabled={isPending}
                                        className="flex items-center text-muted-foreground hover:text-foreground disabled:pointer-events-none"
                                    >
                                        {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                    </button>
                                </InputGroupAddon>
                            </InputGroup>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="confirm-new-password">
                                Confirm new password
                            </FieldLabel>
                            <InputGroup className="w-full min-w-0">
                                <InputGroupAddon><LockKeyhole /></InputGroupAddon>
                                <InputGroupInput
                                    id="confirm-new-password"
                                    type={showPasswordConfirmation ? "text" : "password"}
                                    autoComplete="new-password"
                                    minLength={8}
                                    placeholder="Enter your new password again"
                                    value={passwordConfirmation}
                                    onChange={(event) => setPasswordConfirmation(event.target.value)}
                                    disabled={isPending}
                                    required
                                />
                                <InputGroupAddon align="inline-end">
                                    <button
                                        type="button"
                                        aria-label={showPasswordConfirmation ? "Hide password confirmation" : "Show password confirmation"}
                                        onClick={() => setShowPasswordConfirmation((visible) => !visible)}
                                        disabled={isPending}
                                        className="flex items-center text-muted-foreground hover:text-foreground disabled:pointer-events-none"
                                    >
                                        {showPasswordConfirmation ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                    </button>
                                </InputGroupAddon>
                            </InputGroup>
                        </Field>
                        <DialogFooter className="flex-col-reverse sm:flex-col sm:items-stretch sm:justify-start">
                            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={isPending}
                                    onClick={() => sendCodeMutation.mutate(email.trim())}
                                >
                                    {sendCodeMutation.isPending ? (
                                        <><Spinner /> Sending...</>
                                    ) : (
                                        "Resend code"
                                    )}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isPending || code.length !== 6}
                                >
                                    {resetPasswordMutation.isPending ? (
                                        <><Spinner /> Resetting...</>
                                    ) : (
                                        <><MailCheck /> Reset password</>
                                    )}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ForgotPassword;
