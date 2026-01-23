import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft, Mail } from "lucide-react";
import { motion } from "framer-motion";

const ConsentRequired = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1920')] bg-cover bg-center opacity-10" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 max-w-lg w-full bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 md:p-14 text-center shadow-2xl border border-white/10"
            >
                <div className="w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center mx-auto mb-8">
                    <ShieldAlert className="w-10 h-10 text-destructive" />
                </div>

                <h1 className="text-3xl font-bold font-serif mb-4 text-foreground">Consent Required</h1>

                <p className="text-muted-foreground leading-relaxed mb-10">
                    To maintain our standards for international B2B spice trade, all users must review and accept our updated <span className="text-foreground font-bold italic">Terms of Service</span> and <span className="text-foreground font-bold italic">Privacy Policy</span>.
                    Access to the platform tools is restricted until consent is provided.
                </p>

                <div className="space-y-4">
                    <Button
                        onClick={() => navigate("/login")}
                        size="xl"
                        className="w-full rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-black font-black uppercase tracking-widest hover:scale-[1.02] transition-transform"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Login
                    </Button>

                    <div className="pt-6 border-t border-zinc-100 dark:border-white/5">
                        <p className="text-xs text-muted-foreground mb-4 font-medium uppercase tracking-[0.2em]">Need Assistance?</p>
                        <a
                            href="mailto:internationalsupport@novelexporters.com"
                            className="inline-flex items-center gap-2 text-primary hover:underline font-bold text-sm"
                        >
                            <Mail className="w-4 h-4" />
                            Contact Export Support
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ConsentRequired;
