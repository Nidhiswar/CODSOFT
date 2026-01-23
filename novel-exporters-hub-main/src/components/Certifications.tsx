import { motion } from "framer-motion";
import { ShieldCheck, Building2, FileCheck, Globe, Award, Leaf, Ship } from "lucide-react";

const certifications = [
    {
        title: "GST Registered",
        icon: ShieldCheck,
        description: "Goods and Services Tax compliant for transparent and verified business operations.",
    },
    {
        title: "MSME Certified",
        icon: Building2,
        description: "Registered under Ministry of Micro, Small & Medium Enterprises, supporting industrial growth.",
    },
    {
        title: "FSSAI Licensed",
        icon: FileCheck,
        description: "Food Safety and Standards Authority of India certified for superior food quality control.",
    },
    {
        title: "IEC Authorized",
        icon: Globe,
        description: "Import Export Code authorized by DGFT for seamless international trade operations.",
    },
    {
        title: "Spices Board Registered",
        icon: Award,
        description: "Mandatory registration with the Spices Board of India ensuring authentic spice exports.",
    },
    {
        title: "APEDA Registered",
        icon: Leaf,
        description: "Registered with APEDA for the promotion and development of export of scheduled products.",
    },
    {
        title: "ICEGATE Enabled",
        icon: Ship,
        description: "Direct EDI access to Indian Customs for efficient cargo clearance across Sea & Air.",
    },
];

const Certifications = () => {
    return (
        <section className="section-padding bg-zinc-50 dark:bg-zinc-900/50 transition-colors duration-500">
            <div className="container-custom">
                <div className="text-center mb-16 space-y-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-extrabold font-sans text-foreground leading-tight tracking-tight"
                    >
                        Certifications & Regulatory Compliance
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed font-sans"
                    >
                        Government-recognized registrations ensuring compliant, secure, and reliable global trade operations.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                    {certifications.map((item, index) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{
                                y: -12,
                            }}
                            className="group relative p-8 rounded-[2rem] bg-card border border-border/50 shadow-sm hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-500 flex flex-col items-center text-center overflow-hidden"
                        >
                            {/* Background Glow */}
                            <div className="absolute -inset-1 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl -z-10" />

                            {/* Icon Container */}
                            <div className="mb-8 relative">
                                <div className="p-6 rounded-3xl bg-muted/30 group-hover:bg-primary group-hover:rotate-[6deg] transition-all duration-500 shadow-sm">
                                    <item.icon className="w-10 h-10 text-muted-foreground group-hover:text-white transition-colors duration-500" />
                                </div>
                            </div>

                            <h3 className="text-xl font-extrabold font-sans mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                                {item.title}
                            </h3>

                            <p className="text-muted-foreground text-sm leading-relaxed mb-6 group-hover:text-foreground font-sans">
                                {item.description}
                            </p>

                            <div className="mt-auto pt-4 border-t border-border/20 w-full flex justify-center">
                                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/50 group-hover:text-primary/70 transition-colors duration-300">
                                    Official Registration
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Certifications;
