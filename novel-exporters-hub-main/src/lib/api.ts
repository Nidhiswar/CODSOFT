const API_BASE_URL = "http://127.0.0.1:5009/api";

const getHeaders = () => ({
    "Content-Type": "application/json",
    "x-auth-token": localStorage.getItem("token") || "",
});

export const api = {
    // Auth
    register: async (userData: any) => {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });
        return res.json();
    },

    login: async (credentials: any) => {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                identifier: credentials.email || credentials.phone,
                password: credentials.password
            }),
        });
        const data = await res.json();
        if (data.token) localStorage.setItem("token", data.token);
        return data;
    },

    getMe: async () => {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: getHeaders(),
        });
        return res.json();
    },

    recordConsent: async (consentData: any) => {
        const res = await fetch(`${API_BASE_URL}/auth/consent`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(consentData),
        });
        return res.json();
    },

    forgotPassword: async (email: string) => {
        const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        return res.json();
    },

    resetPassword: async (token: string, password: any) => {
        const res = await fetch(`${API_BASE_URL}/auth/reset-password/${token}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
        });
        return res.json();
    },

    // Cart
    updateCart: async (cart: any[]) => {
        const res = await fetch(`${API_BASE_URL}/auth/cart`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ cart }),
        });
        return res.json();
    },

    // Enquiry
    sendEnquiry: async (enquiryData: any) => {
        const res = await fetch(`${API_BASE_URL}/enquiry`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(enquiryData),
        });
        return res.json();
    },

    getAllEnquiries: async () => {
        const res = await fetch(`${API_BASE_URL}/enquiry/all`, {
            headers: getHeaders(),
        });
        return res.json();
    },

    // Orders
    createOrder: async (orderData: any) => {
        const res = await fetch(`${API_BASE_URL}/orders`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(orderData),
        });
        return res.json();
    },

    getMyOrders: async () => {
        const res = await fetch(`${API_BASE_URL}/orders/my-orders`, {
            headers: getHeaders(),
        });
        return res.json();
    },

    getAllOrders: async () => {
        const res = await fetch(`${API_BASE_URL}/orders/all`, {
            headers: getHeaders(),
        });
        return res.json();
    },

    updateOrderStatus: async (orderId: string, status: string, admin_notes: string) => {
        const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify({ status, admin_notes }),
        });
        return res.json();
    },

    getAnalytics: async () => {
        const res = await fetch(`${API_BASE_URL}/orders/analytics`, {
            headers: getHeaders(),
        });
        return res.json();
    },

    chat: async (message: string, history: any[]) => {
        const res = await fetch(`${API_BASE_URL}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, history }),
        });

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await res.text();
            console.error("Non-JSON response received:", text);
            throw new Error("Server returned an invalid response format (HTML instead of JSON). Check if the backend is running.");
        }

        return res.json();
    },

    getAllUsers: async () => {
        const res = await fetch(`${API_BASE_URL}/auth/all-users`, {
            headers: getHeaders(),
        });
        return res.json();
    },

    getTotalProductsCount: async () => {
        const res = await fetch(`${API_BASE_URL}/orders/total-products-count`);
        return res.json();
    },

    downloadOrderHistoryPDF: async () => {
        const res = await fetch(`${API_BASE_URL}/orders/my-orders/pdf`, {
            headers: getHeaders(),
        });
        return res.blob();
    },

    downloadEnquiryHistoryPDF: async () => {
        const res = await fetch(`${API_BASE_URL}/enquiry/enquiry-history/pdf`, {
            headers: getHeaders(),
        });
        return res.blob();
    },
};
