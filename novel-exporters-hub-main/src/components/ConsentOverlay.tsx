import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, FileText, Lock, ChevronRight, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface ConsentOverlayProps {
    onAccept: () => void;
    onDecline: () => void;
}

const ConsentOverlay = ({ onAccept, onDecline }: ConsentOverlayProps) => {
    const [isChecked, setIsChecked] = useState(false);
    const [showFullToS, setShowFullToS] = useState(false);
    const [showFullPrivacy, setShowFullPrivacy] = useState(false);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-950/95 backdrop-blur-xl p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
                {/* Left Side: Branding & Trust */}
                <div className="md:w-1/3 bg-zinc-50 dark:bg-zinc-800/50 p-8 md:p-12 flex flex-col justify-center border-r border-zinc-100 dark:border-white/5">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                        <ShieldCheck className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold font-serif mb-4 text-foreground">Welcome to Novel Exporters</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                        As a professional B2B platform, we prioritize compliance and data security. Please review our updated policies to continue.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                            <Lock className="w-4 h-4 text-primary" />
                            Secure Data Handling
                        </div>
                        <div className="flex items-center gap-3 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                            <FileText className="w-4 h-4 text-spice-gold" />
                            Global Compliance
                        </div>
                    </div>
                </div>

                {/* Right Side: Consent Actions */}
                <div className="md:w-2/3 p-8 md:p-12 flex flex-col overflow-y-auto">
                    <div className="mb-8">
                        <h3 className="text-xl font-bold mb-2">Mandatory Policy Review</h3>
                        <p className="text-sm text-muted-foreground">Version 1.0.0 • Last updated: Jan 2026</p>
                    </div>

                    <div className="space-y-6 flex-grow">
                        {/* Terms of Service Section */}
                        <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-white/5 space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm">
                                        <FileText className="w-5 h-5 text-spice-gold" />
                                    </div>
                                    <h4 className="font-bold">Terms of Service</h4>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setShowFullToS(true)} className="text-xs hover:bg-spice-gold/10 hover:text-spice-gold">
                                    Read Full <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                                By accessing Novel Exporters, you agree to comply with international trade regulations, provide accurate business documentation (GST/IEC), and adhere to our standardized shipping and quality inspection protocols.
                            </p>
                        </div>

                        {/* Privacy Policy Section */}
                        <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-white/5 space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm">
                                        <Lock className="w-5 h-5 text-primary" />
                                    </div>
                                    <h4 className="font-bold">Privacy Policy</h4>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setShowFullPrivacy(true)} className="text-xs hover:bg-primary/10 hover:text-primary">
                                    Read Full <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                                We collect essential business data to facilitate global spice exports. Your information is protected under industry-standard encryption and will never be sold to third-party marketing agencies.
                            </p>
                        </div>
                    </div>

                    {/* Consent Checkbox */}
                    <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                        <Checkbox id="consent" checked={isChecked} onCheckedChange={(checked) => setIsChecked(checked as boolean)} className="mt-1" />
                        <label htmlFor="consent" className="text-sm font-medium leading-none cursor-pointer select-none">
                            I have read and agree to the <span className="text-primary font-bold">Terms of Service</span> and <span className="text-primary font-bold">Privacy Policy</span>. I understand that this consent is required to access the platform's professional tools.
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="mt-10 flex flex-col sm:flex-row gap-4">
                        <Button
                            onClick={onAccept}
                            disabled={!isChecked}
                            size="xl"
                            className={`flex-grow rounded-2xl font-black uppercase tracking-widest transition-all duration-300 ${isChecked ? 'bg-zinc-950 dark:bg-white text-white dark:text-black shadow-xl hover:scale-[1.02]' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
                        >
                            Accept & Continue
                            <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                        <Button
                            onClick={onDecline}
                            variant="outline"
                            size="xl"
                            className="rounded-2xl border-zinc-200 dark:border-white/10 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors group"
                        >
                            Decline Access
                            <X className="w-5 h-5 ml-2 group-hover:rotate-90 transition-transform" />
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Full Modal Overlays for TOS/Privacy */}
            <AnimatePresence>
                {(showFullToS || showFullPrivacy) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8 bg-zinc-950/80 backdrop-blur-md"
                    >
                        <motion.div
                            layoutId="content-modal"
                            className="w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-[2rem] overflow-hidden flex flex-col max-h-[85vh] shadow-2xl border border-white/10"
                        >
                            <div className="p-8 border-b border-zinc-100 dark:border-white/5 flex justify-between items-center">
                                <h2 className="text-2xl font-bold font-serif">{showFullToS ? "Terms of Service" : "Privacy Policy"}</h2>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="rounded-xl">
                                        <Download className="w-4 h-4 mr-2" /> PDF
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => { setShowFullToS(false); setShowFullPrivacy(false); }}>
                                        <X className="w-6 h-6" />
                                    </Button>
                                </div>
                            </div>
                            <div className="p-8 overflow-y-auto prose dark:prose-invert max-w-none text-muted-foreground text-sm leading-relaxed">
                                {showFullToS ? (
                                    <div className="space-y-6">
                                        <section>
                                            <h3 className="text-foreground font-bold text-lg">1. Acceptance of Terms</h3>
                                            <p>By registering on Novel Exporters, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you are accepting on behalf of a company, you represent that you have the legal authority to bind that entity to these terms.</p>
                                        </section>
                                        <section>
                                            <h3 className="text-foreground font-bold text-lg">2. Professional B2B Conduct</h3>
                                            <p>Novel Exporters is a dedicated B2B spice export portal. Users must maintain professional conduct. All trade enquiries and negotiations initiated on the platform are subject to verification.</p>
                                        </section>
                                        <section>
                                            <h3 className="text-foreground font-bold text-lg">3. User Documentation</h3>
                                            <p>For international trade compliance, users may be required to upload copies of their Import Export Code (IEC), GST registration, or equivalent corporate identification. Failure to provide valid documentation may result in account suspension.</p>
                                        </section>
                                        <section>
                                            <h3 className="text-foreground font-bold text-lg">4. Product Specifications</h3>
                                            <p>While we strive for 100% accuracy, spices are natural agricultural products. Variations in color, aroma, and density may occur between batches. Final shipments will match the Grade A quality standards specified in our catalog.</p>
                                        </section>
                                        <section>
                                            <h3 className="text-foreground font-bold text-lg">5. Liability & Shipping</h3>
                                            <p>Standard export terms (FOB, CIF) apply as per the specific quotation. Novel Exporters is not liable for delays caused by customs processing or carrier unforeseen events once the goods leave the Indian port.</p>
                                        </section>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <section>
                                            <h3 className="text-foreground font-bold text-lg">1. Data Collection</h3>
                                            <p>We collect business-identifiable information including but not limited to Business Name, Authorized Personnel Name, Email, Phone Number, and Shipping Address. This data is essential for processing international spice export orders.</p>
                                        </section>
                                        <section>
                                            <h3 className="text-foreground font-bold text-lg">2. Data Usage</h3>
                                            <p>Collected data is used for: (a) Fulfillment of spice orders; (b) Communication regarding enquiries and shipments; (c) Legal compliance with Indian export regulations; (d) Improving our B2B platform experience.</p>
                                        </section>
                                        <section>
                                            <h3 className="text-foreground font-bold text-lg">3. Information Sharing</h3>
                                            <p>We do not sell your personal or business data. We only share necessary details with trusted partners: logistics providers, customs clearing agents, and financial institutions involved in your transaction.</p>
                                        </section>
                                        <section>
                                            <h3 className="text-foreground font-bold text-lg">4. Security Measures</h3>
                                            <p>Your data is stored on secure servers with industry-standard encryption (AES-256). We regularly audit our systems to prevent unauthorized access or data breaches.</p>
                                        </section>
                                        <section>
                                            <h3 className="text-foreground font-bold text-lg">5. Rights & Access</h3>
                                            <p>Under GDPR and equivalent trade privacy laws, you have the right to request a copy of your stored data, request corrections, or ask for account deletion, subject to pending trade obligations.</p>
                                        </section>
                                    </div>
                                )}
                            </div>
                            <div className="p-8 border-t border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-zinc-800/30 flex justify-center">
                                <Button onClick={() => { setShowFullToS(false); setShowFullPrivacy(false); }} size="lg" className="rounded-xl px-12">Close & Return</Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ConsentOverlay;
