import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { RefreshCwIcon, MailCheck, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { Tiles } from "@/components/styles/background/tiles";
import { sendRecipientRegistrationCode, verifyRecipientRegistrationCode } from "@/services/authService";
import { toast } from "sonner";

const InputOTPForm = ({ className, ...props }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [email, setEmail] = useState(location.state?.email || "");
    const [code, setCode] = useState("");
    const [codeSent, setCodeSent] = useState(false);

    const sendMutation = useMutation({
        mutationFn: sendRecipientLoginCode,
        onSuccess: (data) => {
            setCodeSent(true);
            setCode("");
            toast.success(data.message || "If your account is active, a code is on its way.");
        },
        onError: (error) => toast.error(error.response?.data?.message || "Unable to send a sign-in code."),
    });

    const verifyMutation = useMutation({
        mutationFn: () => verifyRecipientLoginCode(email.trim(), code),
        onSuccess: (data) => {
            localStorage.setItem("recipient_token", data.token);
            localStorage.setItem("recipient", JSON.stringify(data.data));
            toast.success("You are signed in.");
            navigate("/alert", { replace: true });
        },
        onError: (error) => toast.error(error.response?.data?.message || "Unable to verify that code."),
    });

    const handleSend = (event) => {
        event.preventDefault();
        if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
            toast.error("Enter a valid email address.");
            return;
        }
        sendMutation.mutate(email.trim());
    };

    return (
        <div className={cn("relative w-full min-h-screen overflow-hidden", className)} {...props}>
            <div className="absolute inset-0 z-0"><Tiles rows={50} cols={50} /></div>
            <div className="absolute inset-0 z-[5] bg-muted/80" />
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm">
                    <Card className="border shadow-lg">
                        <CardHeader className="space-y-1 text-center">
                            <CardTitle className="text-2xl font-semibold tracking-tight">Verify your login</CardTitle>
                            <CardDescription>
                                {codeSent ? "Enter the 6-digit sign-in code sent to your email." : "Request a 6-digit sign-in code sent to your email."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form onSubmit={handleSend} className="space-y-3">
                                <Field>
                                    <FieldLabel htmlFor="otp-email">Email address</FieldLabel>
                                    <InputGroup>
                                        <InputGroupInput id="otp-email" type="email" autoComplete="email" placeholder="m@example.com" value={email} onChange={(event) => setEmail(event.target.value)} disabled={sendMutation.isPending || verifyMutation.isPending} required />
                                        <InputGroupAddon><Mail /></InputGroupAddon>
                                    </InputGroup>
                                </Field>
                                <Button type="submit" variant="outline" className="w-full" disabled={sendMutation.isPending || verifyMutation.isPending}>
                                    <RefreshCwIcon className={sendMutation.isPending ? "animate-spin" : ""} />
                                    {sendMutation.isPending ? "Sending code..." : codeSent ? "Resend code" : "Send sign-in code"}
                                </Button>
                            </form>
                            {codeSent && (
                                <Field className="space-y-3">
                                    <FieldLabel htmlFor="otp-verification" className="sr-only">Verification code</FieldLabel>
                                    <div className="flex justify-center">
                                        <InputOTP maxLength={6} id="otp-verification" pattern={REGEXP_ONLY_DIGITS} value={code} onChange={setCode} disabled={verifyMutation.isPending}>
                                            <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                                                <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
                                            </InputOTPGroup>
                                            <InputOTPSeparator className="mx-2 text-muted-foreground" />
                                            <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                                                <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </div>
                                    <FieldDescription className="text-center">Check your inbox and spam folder for the code.</FieldDescription>
                                </Field>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3">
                            <Button className="w-full" disabled={!codeSent || code.length !== 6 || verifyMutation.isPending} onClick={() => verifyMutation.mutate()}>
                                <MailCheck />{verifyMutation.isPending ? "Verifying..." : "Verify and sign in"}
                            </Button>
                            <Button variant="ghost" className="w-full text-muted-foreground" asChild><Link to="/login">Back to login</Link></Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default InputOTPForm;