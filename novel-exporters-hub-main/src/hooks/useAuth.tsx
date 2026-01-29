import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export const useAuth = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setLoading(false);
                    return;
                }
                const userData = await api.getMe();
                if (userData && !userData.message) {
                    setUser(userData);
                }
            } catch (err) {
                console.error("Failed to fetch user data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return { user, loading };
};