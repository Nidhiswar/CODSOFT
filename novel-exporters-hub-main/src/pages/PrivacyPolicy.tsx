import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
    const [accepted, setAccepted] = useState<boolean | null>(null);
    const navigate = useNavigate();

    const handleAccept = () => {
        setAccepted(true);
        localStorage.setItem("privacyPolicyAccepted", "true");
        setTimeout(() => navigate("/"), 2000);
    };

    const handleReject = () => {
        setAccepted(false);
        setTimeout(() => navigate("/"), 2000);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 py-16">
            <div className="container-custom max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-bold font-serif text-zinc-900 dark:text-white mb-8">
                    Privacy Policy
                </h1>

                {accepted === true && (
                    <div className="mb-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                        <p className="text-green-800 dark:text-green-200 font-semibold">
                            Thank you for accepting our Privacy Policy. Redirecting...
                        </p>
                    </div>
                )}

                {accepted === false && (
                    <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-4">
                        <XCircle className="w-8 h-8 text-red-600" />
                        <p className="text-red-800 dark:text-red-200 font-semibold">
                            You have declined the Privacy Policy. Redirecting...
                        </p>
                    </div>
                )}

                <div className="prose prose-zinc dark:prose-invert max-w-none space-y-6 text-zinc-700 dark:text-zinc-300">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Effective Date: January 21, 2026
                    </p>

                    <section>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">1. Introduction</h2>
                        <p>
                            Novel Exporters ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our export services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">2. Information We Collect</h2>
                        <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">2.1 Personal Information</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Name, email address, phone number, and business details</li>
                            <li>Shipping and billing addresses</li>
                            <li>Payment information (processed securely through third-party payment gateways)</li>
                            <li>Import/Export licenses and certifications</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mt-4">2.2 Business Information</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Company name, registration number, and tax identification</li>
                            <li>Order history and product preferences</li>
                            <li>Communication preferences</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mt-4">2.3 Technical Information</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>IP address, browser type, and device information</li>
                            <li>Cookies and similar tracking technologies</li>
                            <li>Website usage statistics and analytics</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">3. How We Use Your Information</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Process and fulfill your export orders</li>
                            <li>Communicate about orders, shipping, and deliveries</li>
                            <li>Comply with international trade regulations and customs requirements</li>
                            <li>Improve our products and services</li>
                            <li>Send marketing communications (with your consent)</li>
                            <li>Detect and prevent fraud or unauthorized transactions</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">4. International Data Transfers</h2>
                        <p>
                            As an export company, we may transfer your data internationally to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Shipping carriers and logistics partners</li>
                            <li>Customs authorities in destination countries</li>
                            <li>Payment processors and financial institutions</li>
                            <li>Quality certification bodies</li>
                        </ul>
                        <p className="mt-4">
                            We ensure appropriate safeguards are in place to protect your data during international transfers, in compliance with applicable data protection laws.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">5. Data Security</h2>
                        <p>
                            We implement industry-standard security measures to protect your information, including:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>SSL/TLS encryption for data transmission</li>
                            <li>Secure servers and databases</li>
                            <li>Regular security audits and assessments</li>
                            <li>Access controls and employee training</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">6. Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Access your personal data</li>
                            <li>Correct inaccurate information</li>
                            <li>Request deletion of your data (subject to legal obligations)</li>
                            <li>Object to processing of your data</li>
                            <li>Withdraw consent at any time</li>
                            <li>Lodge a complaint with a supervisory authority</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">7. Cookies</h2>
                        <p>
                            We use cookies to enhance your browsing experience. You can control cookie settings through your browser preferences.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">8. Data Retention</h2>
                        <p>
                            We retain your personal data for as long as necessary to fulfill the purposes outlined in this policy and comply with legal obligations, including export documentation requirements (typically 7 years for Indian export regulations).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">9. Contact Us</h2>
                        <p>
                            For any privacy-related questions or to exercise your rights, please contact us at:
                        </p>
                        <p className="font-semibold mt-2">
                            Email: internationalsupport@novelexporters.com<br />
                            Phone: +91 80128 04316<br />
                            Address: Coimbatore, Tamil Nadu, India
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">10. Updates to This Policy</h2>
                        <p>
                            We may update this Privacy Policy periodically. The effective date at the top will reflect the latest revision.
                        </p>
                    </section>
                </div>

                {accepted === null && (
                    <div className="mt-12 flex gap-4 justify-center">
                        <Button
                            onClick={handleAccept}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg"
                        >
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            Accept Privacy Policy
                        </Button>
                        <Button
                            onClick={handleReject}
                            variant="outline"
                            className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-8 py-6 text-lg"
                        >
                            <XCircle className="w-5 h-5 mr-2" />
                            Decline
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrivacyPolicy;
