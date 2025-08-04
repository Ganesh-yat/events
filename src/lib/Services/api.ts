import { API_ROUTE } from "../../../config";

export const loginUser = async (email: string, password: string) => {
    const res = await fetch(`${API_ROUTE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    return res.json();
};

export const validateEntry = async (qrCode: string, visitor: string) => {
    const res = await fetch(`${API_ROUTE}/api/v1/event/handleQR/scan/${qrCode}&visitor=${visitor}?action=entry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });
    return res.json();
};

export const logExit = async (qrCode: string) => {
    const res = await fetch(`${API_ROUTE}/api/v1/event/handleQR/scan/${qrCode}?action=exit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });
    return res.json();
};

export const giveGift = async (qrCode: string) => {
    const res = await fetch(`${API_ROUTE}/api/v1/event/handleQR/scan/${qrCode}?action=gift`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });
    return res.json();
};

export const checkFoodStatus = async (qrCode: string, visitorCount: string) => {
    const res = await fetch(`${API_ROUTE}/api/v1/event/handleQR/scan/${qrCode}?action=food&count=${visitorCount}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });
    return res.json();
};
