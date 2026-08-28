import { useEffect, useState, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { RecipientMe } from "@/services/authService";

const AuthProtector = () => {
    const [invalid, setInvalid] = useState(false);
    const hasToken = !!localStorage.getItem("recipient_token");
    const validatingRef = useRef(false);

    const validateAuth = async () => {
        if (validatingRef.current) return; 
        validatingRef.current = true;

        const token = localStorage.getItem("recipient_token");
        if (!token) {
            setInvalid(true);
            validatingRef.current = false;
            return;
        }

        try {
            await RecipientMe();
        } catch (error) {
            localStorage.removeItem("recipient_token");
            localStorage.removeItem("recipient");
            setInvalid(true);
        } finally {
            validatingRef.current = false;
        }
    };

    useEffect(() => {
        validateAuth();

        const handlePageShow = (event) => {
            if (event.persisted) {
                validateAuth();
            }
        };

        window.addEventListener("pageshow", handlePageShow);
        return () => window.removeEventListener("pageshow", handlePageShow);
    }, []);

    if (!hasToken || invalid) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AuthProtector;