import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            const res = await api.resetPassword(token!, password);
            if (res.message.includes("success")) {
                setIsSuccess(true);
                setTimeout(() => navigate("/login"), 3000);
            } else {
                toast.error(res.message || "Invalid or expired token");
            }
        } catch (err) {
            toast.error("Failed to reset password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-spice-gold/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-card/50 backdrop-blur-xl border border-border p-8 rounded-[2rem] shadow-2xl relative z-10"
            >
                {!isSuccess ? (
                    <>
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-bold font-serif text-foreground mb-2">New Password</h1>
                            <p className="text-muted-foreground">Please enter your new secure password below.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-widest text-foreground/70 ml-1">New Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="pl-12 h-14 rounded-2xl bg-muted/30 border-border"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-widest text-foreground/70 ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="pl-12 h-14 rounded-2xl bg-muted/30 border-border"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 rounded-2xl text-lg font-bold"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
                            </Button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold font-serif mb-4">Password Reset!</h2>
                        <p className="text-muted-foreground text-center">
                            Your password has been successfully updated. Redirecting you to login...
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ResetPassword;
