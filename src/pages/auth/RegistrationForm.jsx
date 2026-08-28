import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
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
    FieldGroup,
    FieldLabel,
    FieldError,
} from "@/components/ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    IdCardLanyard,
    UserRoundPen,
    Mail,
    Phone,
    Lock,
    ShieldAlert,
    Eye,
    EyeOff,
} from "lucide-react";
import { Tiles } from "@/components/styles/background/tiles";
import { verifySchema, registerSchema } from "@/schemas/recipientSchema";
import { zodFieldValidator } from "@/lib/validators";
import { verifyRecipient, registerRecipient } from "@/services/authService";
import { Separator } from "@/components/ui/separator";

const MAX_ATTEMPTS = 3;

const RegistrationForm = ({ className, ...props }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const submittedEmail = location.state?.email || "";

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [verified, setVerified] = useState(false);
    const [failedAttempts, setFailedAttempts] = useState(0);

    const form = useForm({
        defaultValues: {
            id_number: "",
            first_name: "",
            last_name: "",
            contact_number: "",
            email: submittedEmail || "",
            password: "",
            password_confirmation: "",
        },
        onSubmit: async ({ value }) => {
            if (!verified) {
                const result = verifySchema.safeParse(value);
                if (!result.success) {
                    result.error.issues.forEach((issue) => {
                        form.setFieldMeta(issue.path[0], (meta) => ({
                            ...meta,
                            errorMap: { onSubmit: issue.message },
                        }));
                    });
                    return;
                }
                await verifyMutation.mutateAsync(result.data);
                return;
            }

            const result = registerSchema.safeParse(value);
            if (!result.success) {
                result.error.issues.forEach((issue) => {
                    form.setFieldMeta(issue.path[0], (meta) => ({
                        ...meta,
                        errorMap: { onSubmit: issue.message },
                    }));
                });
                return;
            }
            await registerMutation.mutateAsync(result.data);
        },
    });

    const verifyMutation = useMutation({
        mutationFn: verifyRecipient,
        onSuccess: () => {
            setVerified(true);
            setFailedAttempts(0);
            toast.success(
                "Verification successful. Please complete your registration."
            );
        },
        onError: (err) => {
            const nextAttempts = failedAttempts + 1;
            setFailedAttempts(nextAttempts);
            toast.error(
                err.response?.data?.message ||
                    "Verification failed. Please try again."
            );
            if (nextAttempts >= MAX_ATTEMPTS) {
                toast.warning("Still having trouble? You can request access.");
            }
        },
    });

    const registerMutation = useMutation({
        mutationFn: registerRecipient,
        onSuccess: () => {
            toast.success("Registration successful. You may now log in.");
            navigate("/login");
        },
        onError: (err) => {
            const errors = err.response?.data?.errors;
            if (errors) {
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
                        "Registration failed. Please try again."
                );
            }
        },
    });

    const handleRequestAccess = () => {
        const values = form.state.values;
        navigate("/request-access", {
            state: {
                email: values.email,
                id_number: values.id_number,
                first_name: values.first_name,
                last_name: values.last_name,
            },
        });
    };

    const isPending = verifyMutation.isPending || registerMutation.isPending;

    return (
        <div
            className={cn(
                "relative w-full min-h-screen overflow-hidden",
                className
            )}
            {...props}
        >
            <div className="absolute inset-0 z-0">
                <Tiles rows={50} cols={50} />
            </div>
            <div className="absolute inset-0 bg-muted/80 z-5" />

            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 md:p-10 z-10">
                <div className="w-full max-w-sm">
                    <Card className="w-full">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                form.handleSubmit();
                            }}
                            noValidate
                        >
                            <CardHeader>
                                <CardTitle>Register your account</CardTitle>
                                <CardDescription>
                                    {verified
                                        ? "Complete your registration below."
                                        : "Enter your ID number and name to verify your eligibility."}
                                </CardDescription>
                            </CardHeader>
                            <Separator className="my-3" />
                            <CardContent>
                                <FieldGroup>
                                    <form.Field
                                        name="id_number"
                                        validators={{
                                            onBlur: zodFieldValidator(
                                                verifySchema.shape.id_number
                                            ),
                                        }}
                                    >
                                        {(field) => (
                                            <Field
                                                data-invalid={
                                                    !field.state.meta.isValid
                                                }
                                            >
                                                <FieldLabel htmlFor={field.name}>
                                                    User ID
                                                </FieldLabel>
                                                <InputGroup>
                                                    <InputGroupInput
                                                        id={field.name}
                                                        type="text"
                                                        placeholder="19-sj00183"
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) =>
                                                            field.handleChange(
                                                                e.target.value
                                                            )
                                                        }
                                                        disabled={
                                                            verified || isPending
                                                        }
                                                        aria-invalid={
                                                            !field.state.meta
                                                                .isValid
                                                        }
                                                    />
                                                    <InputGroupAddon>
                                                        <IdCardLanyard />
                                                    </InputGroupAddon>
                                                </InputGroup>
                                                <FieldError
                                                    errors={field.state.meta.errors.map(
                                                        (message) => ({
                                                            message,
                                                        })
                                                    )}
                                                />
                                            </Field>
                                        )}
                                    </form.Field>

                                    <FieldGroup className="grid grid-cols-2">
                                        <form.Field
                                            name="first_name"
                                            validators={{
                                                onBlur: zodFieldValidator(
                                                    verifySchema.shape
                                                        .first_name
                                                ),
                                            }}
                                        >
                                            {(field) => (
                                                <Field
                                                    data-invalid={
                                                        !field.state.meta
                                                            .isValid
                                                    }
                                                >
                                                    <FieldLabel
                                                        htmlFor={field.name}
                                                    >
                                                        First name
                                                    </FieldLabel>
                                                    <InputGroup>
                                                        <InputGroupInput
                                                            id={field.name}
                                                            type="text"
                                                            placeholder="Juan"
                                                            value={
                                                                field.state
                                                                    .value
                                                            }
                                                            onBlur={
                                                                field.handleBlur
                                                            }
                                                            onChange={(e) =>
                                                                field.handleChange(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            disabled={
                                                                verified ||
                                                                isPending
                                                            }
                                                            aria-invalid={
                                                                !field.state
                                                                    .meta
                                                                    .isValid
                                                            }
                                                        />
                                                        <InputGroupAddon>
                                                            <UserRoundPen />
                                                        </InputGroupAddon>
                                                    </InputGroup>
                                                    <FieldError
                                                        errors={field.state.meta.errors.map(
                                                            (message) => ({
                                                                message,
                                                            })
                                                        )}
                                                    />
                                                </Field>
                                            )}
                                        </form.Field>

                                        <form.Field
                                            name="last_name"
                                            validators={{
                                                onBlur: zodFieldValidator(
                                                    verifySchema.shape
                                                        .last_name
                                                ),
                                            }}
                                        >
                                            {(field) => (
                                                <Field
                                                    data-invalid={
                                                        !field.state.meta
                                                            .isValid
                                                    }
                                                >
                                                    <FieldLabel
                                                        htmlFor={field.name}
                                                    >
                                                        Last name
                                                    </FieldLabel>
                                                    <InputGroup>
                                                        <InputGroupInput
                                                            id={field.name}
                                                            type="text"
                                                            placeholder="Dela Cruz"
                                                            value={
                                                                field.state
                                                                    .value
                                                            }
                                                            onBlur={
                                                                field.handleBlur
                                                            }
                                                            onChange={(e) =>
                                                                field.handleChange(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            disabled={
                                                                verified ||
                                                                isPending
                                                            }
                                                            aria-invalid={
                                                                !field.state
                                                                    .meta
                                                                    .isValid
                                                            }
                                                        />
                                                        <InputGroupAddon>
                                                            <UserRoundPen />
                                                        </InputGroupAddon>
                                                    </InputGroup>
                                                    <FieldError
                                                        errors={field.state.meta.errors.map(
                                                            (message) => ({
                                                                message,
                                                            })
                                                        )}
                                                    />
                                                </Field>
                                            )}
                                        </form.Field>
                                    </FieldGroup>

                                    {verified && (
                                        <>
                                            <form.Field
                                                name="contact_number"
                                                validators={{
                                                    onBlur: zodFieldValidator(
                                                        registerSchema.shape
                                                            .contact_number
                                                    ),
                                                }}
                                            >
                                                {(field) => (
                                                    <Field
                                                        data-invalid={
                                                            !field.state.meta
                                                                .isValid
                                                        }
                                                    >
                                                        <FieldLabel
                                                            htmlFor={field.name}
                                                        >
                                                            Contact Number
                                                        </FieldLabel>
                                                        <InputGroup>
                                                            <InputGroupInput
                                                                id={field.name}
                                                                type="tel"
                                                                placeholder="09XXXXXXXXX"
                                                                value={
                                                                    field.state
                                                                        .value
                                                                }
                                                                onBlur={
                                                                    field.handleBlur
                                                                }
                                                                onChange={(e) =>
                                                                    field.handleChange(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                disabled={
                                                                    isPending
                                                                }
                                                                aria-invalid={
                                                                    !field
                                                                        .state
                                                                        .meta
                                                                        .isValid
                                                                }
                                                            />
                                                            <InputGroupAddon>
                                                                <Phone />
                                                            </InputGroupAddon>
                                                        </InputGroup>
                                                        <FieldError
                                                            errors={field.state.meta.errors.map(
                                                                (message) => ({
                                                                    message,
                                                                })
                                                            )}
                                                        />
                                                    </Field>
                                                )}
                                            </form.Field>

                                            <form.Field
                                                name="email"
                                                validators={{
                                                    onBlur: zodFieldValidator(
                                                        registerSchema.shape
                                                            .email
                                                    ),
                                                }}
                                            >
                                                {(field) => (
                                                    <Field
                                                        data-invalid={
                                                            !field.state.meta
                                                                .isValid
                                                        }
                                                    >
                                                        <FieldLabel
                                                            htmlFor={field.name}
                                                        >
                                                            Email
                                                        </FieldLabel>
                                                        <InputGroup>
                                                            <InputGroupInput
                                                                id={field.name}
                                                                type="email"
                                                                placeholder="Juan.DelaCruz@example.com"
                                                                value={
                                                                    field.state
                                                                        .value
                                                                }
                                                                onBlur={
                                                                    field.handleBlur
                                                                }
                                                                onChange={(e) =>
                                                                    field.handleChange(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                disabled={
                                                                    isPending
                                                                }
                                                                aria-invalid={
                                                                    !field
                                                                        .state
                                                                        .meta
                                                                        .isValid
                                                                }
                                                            />
                                                            <InputGroupAddon>
                                                                <Mail />
                                                            </InputGroupAddon>
                                                        </InputGroup>
                                                        <FieldError
                                                            errors={field.state.meta.errors.map(
                                                                (message) => ({
                                                                    message,
                                                                })
                                                            )}
                                                        />
                                                    </Field>
                                                )}
                                            </form.Field>

                                            <FieldGroup className="grid grid-cols-2">
                                                <form.Field
                                                    name="password"
                                                    validators={{
                                                        onBlur: zodFieldValidator(
                                                            registerSchema
                                                                .shape.password
                                                        ),
                                                    }}
                                                >
                                                    {(field) => (
                                                        <Field
                                                            data-invalid={
                                                                !field.state
                                                                    .meta
                                                                    .isValid
                                                            }
                                                        >
                                                            <FieldLabel
                                                                htmlFor={
                                                                    field.name
                                                                }
                                                            >
                                                                Password
                                                            </FieldLabel>
                                                            <InputGroup>
                                                                <InputGroupInput
                                                                    id={
                                                                        field.name
                                                                    }
                                                                    type={
                                                                        showPassword
                                                                            ? "text"
                                                                            : "password"
                                                                    }
                                                                    value={
                                                                        field
                                                                            .state
                                                                            .value
                                                                    }
                                                                    onBlur={
                                                                        field.handleBlur
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        field.handleChange(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isPending
                                                                    }
                                                                    aria-invalid={
                                                                        !field
                                                                            .state
                                                                            .meta
                                                                            .isValid
                                                                    }
                                                                />
                                                                <InputGroupAddon>
                                                                    <Lock />
                                                                </InputGroupAddon>
                                                                <InputGroupAddon align="inline-end">
                                                                    <Tooltip>
                                                                        <TooltipTrigger
                                                                            asChild
                                                                        >
                                                                            <button
                                                                                type="button"
                                                                                aria-label="Toggle password visibility"
                                                                                onClick={() =>
                                                                                    setShowPassword(
                                                                                        (
                                                                                            prev
                                                                                        ) =>
                                                                                            !prev
                                                                                    )
                                                                                }
                                                                                className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
                                                                            >
                                                                                {showPassword ? (
                                                                                    <EyeOff className="w-5 h-5" />
                                                                                ) : (
                                                                                    <Eye className="w-5 h-5" />
                                                                                )}
                                                                            </button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>
                                                                                {showPassword
                                                                                    ? "Hide password"
                                                                                    : "Show password"}
                                                                            </p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </InputGroupAddon>
                                                            </InputGroup>
                                                            <FieldError
                                                                errors={field.state.meta.errors.map(
                                                                    (
                                                                        message
                                                                    ) => ({
                                                                        message,
                                                                    })
                                                                )}
                                                            />
                                                        </Field>
                                                    )}
                                                </form.Field>

                                                <form.Field
                                                    name="password_confirmation"
                                                    validators={{
                                                        onBlur: ({ value }) => {
                                                            if (!value) {
                                                                return "Please confirm your password";
                                                            }
                                                            if (
                                                                value !==
                                                                form.getFieldValue(
                                                                    "password"
                                                                )
                                                            ) {
                                                                return "Passwords do not match";
                                                            }
                                                            return undefined;
                                                        },
                                                    }}
                                                >
                                                    {(field) => (
                                                        <Field
                                                            data-invalid={
                                                                !field.state
                                                                    .meta
                                                                    .isValid
                                                            }
                                                        >
                                                            <FieldLabel
                                                                htmlFor={
                                                                    field.name
                                                                }
                                                            >
                                                                Confirm Password
                                                            </FieldLabel>
                                                            <InputGroup>
                                                                <InputGroupInput
                                                                    id={
                                                                        field.name
                                                                    }
                                                                    type={
                                                                        showConfirmPassword
                                                                            ? "text"
                                                                            : "password"
                                                                    }
                                                                    value={
                                                                        field
                                                                            .state
                                                                            .value
                                                                    }
                                                                    onBlur={
                                                                        field.handleBlur
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        field.handleChange(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isPending
                                                                    }
                                                                    aria-invalid={
                                                                        !field
                                                                            .state
                                                                            .meta
                                                                            .isValid
                                                                    }
                                                                />
                                                                <InputGroupAddon>
                                                                    <Lock />
                                                                </InputGroupAddon>
                                                                <InputGroupAddon align="inline-end">
                                                                    <Tooltip>
                                                                        <TooltipTrigger
                                                                            asChild
                                                                        >
                                                                            <button
                                                                                type="button"
                                                                                aria-label="Toggle confirm password visibility"
                                                                                onClick={() =>
                                                                                    setShowConfirmPassword(
                                                                                        (
                                                                                            prev
                                                                                        ) =>
                                                                                            !prev
                                                                                    )
                                                                                }
                                                                                className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
                                                                            >
                                                                                {showConfirmPassword ? (
                                                                                    <EyeOff className="w-5 h-5" />
                                                                                ) : (
                                                                                    <Eye className="w-5 h-5" />
                                                                                )}
                                                                            </button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>
                                                                                {showConfirmPassword
                                                                                    ? "Hide password"
                                                                                    : "Show password"}
                                                                            </p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </InputGroupAddon>
                                                            </InputGroup>
                                                            <FieldError
                                                                errors={field.state.meta.errors.map(
                                                                    (
                                                                        message
                                                                    ) => ({
                                                                        message,
                                                                    })
                                                                )}
                                                            />
                                                        </Field>
                                                    )}
                                                </form.Field>
                                            </FieldGroup>
                                        </>
                                    )}
                                </FieldGroup>
                            </CardContent>
                            <CardFooter className="flex-col mt-4 gap-2">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isPending}
                                >
                                    {verifyMutation.isPending ? (
                                        <>
                                            <Spinner /> Verifying...
                                        </>
                                    ) : registerMutation.isPending ? (
                                        <>
                                            <Spinner /> Registering...
                                        </>
                                    ) : verified ? (
                                        "Complete Registration"
                                    ) : (
                                        "Verify account"
                                    )}
                                </Button>
                                {!verified &&
                                    failedAttempts >= MAX_ATTEMPTS && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full gap-2"
                                            onClick={handleRequestAccess}
                                        >
                                            <ShieldAlert className="w-4 h-4" />
                                            Request Access
                                        </Button>
                                    )}
                                <FieldDescription className="text-center">
                                    Don&apos;t have an account?{" "}
                                    <Link to="/login">Sign in</Link>
                                </FieldDescription>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default RegistrationForm;