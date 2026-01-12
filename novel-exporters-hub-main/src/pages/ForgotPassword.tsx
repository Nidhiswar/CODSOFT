import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await api.forgotPassword(email);
            if (res.message) {
                setIsSent(true);
                toast.success("Reset link sent to your email");
            } else {
                toast.error(res.message || "Something went wrong");
            }
        } catch (err) {
            toast.error("Failed to send reset link");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-spice-gold/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-card/50 backdrop-blur-xl border border-border p-8 rounded-[2rem] shadow-2xl relative z-10"
            >
                <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Login
                </Link>

                {!isSent ? (
                    <>
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold font-serif text-foreground mb-2">Novel Exporters</h1>
                            <p className="text-muted-foreground">Enter your email and we'll send you a secure link to reset your account password.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-widest text-foreground/70 ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        type="email"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="pl-12 h-14 rounded-2xl bg-muted/30 border-border focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
                            </Button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold font-serif mb-4">Check your email</h2>
                        <p className="text-muted-foreground mb-8">
                            We have sent a password reset link to <span className="font-bold text-foreground">{email}</span>.
                            The link will expire in 1 hour.
                        </p>
                        <Button variant="outline" className="w-full h-14 rounded-2xl" onClick={() => setIsSent(false)}>
                            Try another email
                        </Button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
