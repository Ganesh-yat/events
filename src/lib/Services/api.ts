import { API_ROUTE } from "../../../config";
import { useGlobalInfo } from "../../context/GlobalContext";

// Helper function to create authenticated fetch
const createAuthenticatedFetch = (token: string | null) => {
    return async (url: string, options: RequestInit = {}) => {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...(options.headers as Record<string, string>),
        };

        // Add authorization header if token exists
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        return fetch(url, {
            ...options,
            headers,
        });
    };
};

export const loginUser = async (email: string, password: string) => {
    const res = await fetch(`${API_ROUTE}/api/v1/auth/sign-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    return res.json();
};

export const validateEntry = async (qrCode: string, visitor: string, token?: string | null) => {
    const authenticatedFetch = createAuthenticatedFetch(token || null);
    const res = await authenticatedFetch(`${API_ROUTE}/api/v1/event/handleQR/scan/${qrCode}&visitor=${visitor}?action=entry`, {
        method: "POST",
    });
    return res.json();
};

export const logExit = async (qrCode: string, token?: string | null) => {
    const authenticatedFetch = createAuthenticatedFetch(token || null);
    const res = await authenticatedFetch(`${API_ROUTE}/api/v1/event/handleQR/scan/${qrCode}?action=exit`, {
        method: "POST",
    });
    return res.json();
};

export const giveGift = async (qrCode: string, token?: string | null) => {
    const authenticatedFetch = createAuthenticatedFetch(token || null);
    const res = await authenticatedFetch(`${API_ROUTE}/api/v1/event/handleQR/scan/${qrCode}?action=gift`, {
        method: "POST",
    });
    return res.json();
};

export const checkFoodStatus = async (qrCode: string, visitorCount: string, token?: string | null) => {
    const authenticatedFetch = createAuthenticatedFetch(token || null);
    const res = await authenticatedFetch(`${API_ROUTE}/api/v1/event/handleQR/scan/${qrCode}?action=food&count=${visitorCount}`, {
        method: "POST",
    });
    return res.json();
};

// Custom hook that provides authenticated API functions
export const useAuthenticatedApi = () => {
    const { token } = useGlobalInfo();
    
    return {
        validateEntry: (qrCode: string, visitor: string) => validateEntry(qrCode, visitor, token),
        logExit: (qrCode: string) => logExit(qrCode, token),
        giveGift: (qrCode: string) => giveGift(qrCode, token),
        checkFoodStatus: (qrCode: string, visitorCount: string) => checkFoodStatus(qrCode, visitorCount, token),
    };
};
