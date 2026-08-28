import { cn } from "@/lib/utils";
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { RefreshCwIcon, Send, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldLabel,
} from "@/components/ui/field";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { Tiles } from "@/components/styles/background/tiles";

const InputOTPForm = ({ className, ...props }) => {
    return (
        <div
            className={cn(
                "relative w-full min-h-screen overflow-hidden",
                className
            )}
            {...props}
        >
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <Tiles rows={50} cols={50} />
            </div>
            <div className="absolute inset-0 z-[5] bg-muted/80" />

            {/* Centered content */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm">
                    <Card className="border shadow-lg">
                        <CardHeader className="space-y-1 text-center">
                            <CardTitle className="text-2xl font-semibold tracking-tight">
                                Verify your login
                            </CardTitle>
                            <CardDescription>
                                Enter the 6-digit verification code we sent to your email
                                address.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <Field className="space-y-3">
                                <FieldLabel htmlFor="otp-verification" className="sr-only">
                                    Verification code
                                </FieldLabel>

                                <div className="flex justify-center">
                                    <InputOTP maxLength={6} id="otp-verification" pattern={REGEXP_ONLY_DIGITS} required>
                                        <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                                            <InputOTPSlot index={0} />
                                            <InputOTPSlot index={1} />
                                            <InputOTPSlot index={2} />
                                        </InputOTPGroup>

                                        <InputOTPSeparator className="mx-2 text-muted-foreground" />

                                        <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                                            <InputOTPSlot index={3} />
                                            <InputOTPSlot index={4} />
                                            <InputOTPSlot index={5} />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>

                                <FieldDescription className="text-center">
                                    Didn&apos;t receive the code?{" "}
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline"
                                    >
                                        <RefreshCwIcon className="size-3.5" />
                                        Resend
                                    </button>
                                </FieldDescription>
                            </Field>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-3">
                            <Button className="w-full">
                                <Send/>
                                Verify email
                            </Button>
                            <Button variant="ghost" className="w-full text-muted-foreground">
                                Back to login
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default InputOTPForm;