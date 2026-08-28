import { useNavigate, useLocation, Link } from "react-router-dom";
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
    FieldGroup,
    FieldDescription,
    FieldLabel,
    FieldError,
} from "@/components/ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { Mail, IdCardLanyard, UserRoundPen, ShieldAlert } from "lucide-react";
import { Tiles } from "@/components/styles/background/tiles";
import { requestAccessSchema } from "@/schemas/recipientSchema";
import { zodFieldValidator } from "@/lib/validators";
import { requestAccess } from "@/services/authService";
import { Separator } from "@/components/ui/separator";

const RequestAccessPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const stateData = location.state || {};

    const requestMutation = useMutation({
        mutationFn: requestAccess,
        onSuccess: (_data, variables) => {
            toast.success(
                "Your access request has been submitted. An admin will review it shortly."
            );
            navigate("/register", {
                state: {
                    requestSubmitted: true,
                    email: variables.email,
                },
            });
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
                        "Failed to submit access request."
                );
            }
        },
    });

    const form = useForm({
        defaultValues: {
            email: stateData.email || "",
            id_number: stateData.id_number || "",
            first_name: stateData.first_name || "",
            last_name: stateData.last_name || "",
        },
        onSubmit: async ({ value }) => {
            const result = requestAccessSchema.safeParse(value);
            if (!result.success) {
                result.error.issues.forEach((issue) => {
                    form.setFieldMeta(issue.path[0], (meta) => ({
                        ...meta,
                        errorMap: { onSubmit: issue.message },
                    }));
                });
                return;
            }
            await requestMutation.mutateAsync(result.data);
        },
    });

    const handleBack = () => {
        navigate("/register");
    };

    const isPending = requestMutation.isPending;

    return (
        <div className="relative w-full min-h-screen overflow-hidden">
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
                                <CardTitle className="flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5" />
                                    Request Access
                                </CardTitle>
                                <CardDescription>
                                    We couldn&apos;t verify your information. Fill
                                    in the form below and an admin will review
                                    your request.
                                </CardDescription>
                            </CardHeader>
                            <Separator className="my-3" />
                            <CardContent>
                                <FieldGroup>
                                    <form.Field
                                        name="id_number"
                                        validators={{
                                            onBlur: zodFieldValidator(
                                                requestAccessSchema.shape
                                                    .id_number
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
                                                        disabled={isPending}
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
                                                    requestAccessSchema.shape
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
                                                            disabled={isPending}
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
                                                    requestAccessSchema.shape
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
                                                            disabled={isPending}
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

                                    <form.Field
                                        name="email"
                                        validators={{
                                            onBlur: zodFieldValidator(
                                                requestAccessSchema.shape.email
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
                                                    Email
                                                </FieldLabel>
                                                <InputGroup>
                                                    <InputGroupInput
                                                        id={field.name}
                                                        type="email"
                                                        placeholder="Juan.DelaCruz@example.com"
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) =>
                                                            field.handleChange(
                                                                e.target.value
                                                            )
                                                        }
                                                        disabled={isPending}
                                                        aria-invalid={
                                                            !field.state.meta
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
                                </FieldGroup>
                            </CardContent>
                            <CardFooter className="flex-col mt-4 gap-2">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <>
                                            <Spinner /> Submitting...
                                        </>
                                    ) : (
                                        "Submit Request"
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={handleBack}
                                    disabled={isPending}
                                >
                                    Back to Registration
                                </Button>
                                <FieldDescription className="text-center">
                                    Already have an account?{" "}
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

export default RequestAccessPage;