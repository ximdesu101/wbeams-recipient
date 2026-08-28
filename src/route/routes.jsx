import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import App from "@/App";
import Hero from "@/pages/public/LandingPage";
import Login from "@/pages/auth/LoginForm";
import RecipientLayout from "@/pages/RecipientLayout";
import AuthProtector from "./guard/AuthProtector";
import PageLoader from "@/components/common/PageLoader";

const RegistrationForm = lazy(() => import("@/pages/auth/RegistrationForm"));
const InputOTPForm = lazy(() => import("@/pages/auth/EmailOTP"));
const RequestAccess = lazy(() => import("@/pages/auth/RequestAccess"));
const Alert = lazy(() => import("@/pages/alerts/AlertPage"));
const Reports = lazy(() => import("@/pages/reports/Reports"));
const Feedback = lazy(() => import("@/pages/feedback/Feedback"));

const withSuspense = (Component) => (
    <Suspense fallback={<PageLoader />}>
        <Component />
    </Suspense>
);

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            { index: true, element: <Hero /> },
            { path: "login", element: <Login /> },
            { path: "register", element: withSuspense(RegistrationForm) },
            { path: "verify-email", element: withSuspense(InputOTPForm) },
            { path: "request-access", element: withSuspense(RequestAccess) },
        ],
    },
    {
        element: <AuthProtector />,
        children: [
            {
                element: <RecipientLayout />,
                children: [
                    { path: "alert", element: withSuspense(Alert) },
                    { path: "reports", element: withSuspense(Reports) },
                    { path: "feedback", element: withSuspense(Feedback) },
                ],
            },
        ],
    },
]);