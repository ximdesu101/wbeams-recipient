import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
    Mail,
    Send,
    LockKeyhole
} from "lucide-react";

const ForgotPassword = () => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button type="button" className="hover:underline">
                    Forgot password?
                </button>
            </DialogTrigger>
            <DialogContent
                className="sm:max-w-sm"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <LockKeyhole className="size-5" />
                        Forgot Password?
                    </DialogTitle>
                    <DialogDescription>
                        Enter your email address and we will send you a code
                        to reset your password.
                    </DialogDescription>
                </DialogHeader>
                <Field>
                    <InputGroup>
                        <InputGroupAddon>
                            <Mail />
                        </InputGroupAddon>
                        <InputGroupInput
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            required
                        />
                    </InputGroup>
                </Field>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Close
                        </Button>
                    </DialogClose>
                    <Button>
                        <Send />
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ForgotPassword