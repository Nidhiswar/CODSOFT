import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
    const [accepted, setAccepted] = useState<boolean | null>(null);
    const navigate = useNavigate();

    const handleAccept = () => {
        setAccepted(true);
        localStorage.setItem("termsOfServiceAccepted", "true");
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
                    Terms of Service
                </h1>

                {accepted === true && (
                    <div className="mb-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                        <p className="text-green-800 dark:text-green-200 font-semibold">
                            Thank you for accepting our Terms of Service. Redirecting...
                        </p>
                    </div>
                )}

                {accepted === false && (
                    <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-4">
                        <XCircle className="w-8 h-8 text-red-600" />
                        <p className="text-red-800 dark:text-red-200 font-semibold">
                            You have declined the Terms of Service. Redirecting...
                        </p>
                    </div>
                )}

                <div className="prose prose-zinc dark:prose-invert max-w-none space-y-6 text-zinc-700 dark:text-zinc-300">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Effective Date: January 21, 2026
                    </p>

                    <section>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using Novel Exporters' website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">2. Services Provided</h2>
                        <p>
                            Novel Exporters provides international export services for premium spices and agricultural products from India. Our services include:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Product sourcing and quality assurance</li>
                            <li>Export documentation and compliance</li>
                            <li>International shipping and logistics</li>
                            <li>Custom packaging and labeling</li>
                            <li>After-sales support</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">3. Business Eligibility</h2>
                        <p>
                            Our services are intended for business-to-business (B2B) transactions. By using our services, you represent that:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>You are a legitimate business entity or authorized representative</li>
                            <li>You have the necessary import licenses and permits in your country</li>
                            <li>You comply with all applicable import regulations</li>
                            <li>You are at least 18 years of age</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">4. Orders and Payments</h2>
                        <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">4.1 Order Placement</h3>
                        <p>
                            All orders are subject to acceptance by Novel Exporters. We reserve the right to refuse or cancel any order at our discretion.
                        </p>

                        <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mt-4">4.2 Pricing</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Prices are quoted in USD or INR as specified</li>
                            <li>Prices are subject to change without notice</li>
                            <li>Bulk order pricing available on request</li>
                            <li>Prices exclude customs duties, taxes, and import fees in the destination country</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mt-4">4.3 Payment Terms</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Payment methods: Wire transfer, Letter of Credit, or approved payment gateways</li>
                            <li>Payment terms: As per agreed contract (typically 30-50% advance, balance before shipment)</li>
                            <li>All bank charges borne by the buyer</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">5. Shipping and Delivery</h2>
                        <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">5.1 Shipping Terms</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>We ship FOB (Free on Board) or CIF (Cost, Insurance, and Freight) as agreed</li>
                            <li>Delivery timeframes are estimates and not guaranteed</li>
                            <li>Shipping delays due to customs, weather, or force majeure are not our responsibility</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mt-4">5.2 Ports of Shipment</h3>
                        <p>
                            Primary ports: Tuticorin and Kochi, India. Other ports available on request.
                        </p>

                        <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mt-4">5.3 Import Clearance</h3>
                        <p>
                            Buyer is responsible for import clearance, customs duties, and compliance with destination country regulations.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">6. Quality Assurance and Certifications</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>All products comply with FSSAI (India) standards</li>
                            <li>ISO 22000 certified processes</li>
                            <li>IEC (Indian Export Certificate) provided</li>
                            <li>Additional certifications (Organic, Halal, Kosher) available on request</li>
                            <li>Phytosanitary certificates provided for all shipments</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">7. Returns and Refunds</h2>
                        <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">7.1 Quality Guarantee</h3>
                        <p>
                            We guarantee the quality of our products at the time of shipment. Claims must be made within 7 days of delivery with supporting documentation.
                        </p>

                        <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mt-4">7.2 Refund Policy</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Refunds processed only for proven quality defects</li>
                            <li>No refunds for buyer's remorse or change of mind</li>
                            <li>Replacement shipments preferred over refunds</li>
                            <li>Claims must be supported by third-party laboratory reports</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">8. Intellectual Property</h2>
                        <p>
                            All content on this website, including logos, trademarks, product descriptions, and images, is the property of Novel Exporters and protected by intellectual property laws.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">9. Limitation of Liability</h2>
                        <p>
                            Novel Exporters shall not be liable for:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Indirect, incidental, or consequential damages</li>
                            <li>Loss of profits or business opportunities</li>
                            <li>Delays caused by customs, shipping carriers, or force majeure</li>
                            <li>Damage during transit (covered by shipping insurance if purchased)</li>
                            <li>Buyer's failure to comply with import regulations</li>
                        </ul>
                        <p className="mt-4">
                            Our maximum liability is limited to the invoice value of the specific order in question.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">10. Compliance with Export Regulations</h2>
                        <p>
                            We comply with all applicable Indian export regulations and international trade laws. Buyers must ensure compliance with their country's import regulations.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">11. Dispute Resolution</h2>
                        <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">11.1 Governing Law</h3>
                        <p>
                            These Terms shall be governed by the laws of India.
                        </p>

                        <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mt-4">11.2 Arbitration</h3>
                        <p>
                            Any disputes shall be resolved through arbitration in Coimbatore, Tamil Nadu, India, in accordance with the Indian Arbitration and Conciliation Act.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">12. Force Majeure</h2>
                        <p>
                            We shall not be liable for failure to perform due to circumstances beyond our reasonable control, including natural disasters, wars, pandemics, government actions, or transportation disruptions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">13. Termination</h2>
                        <p>
                            We reserve the right to terminate or suspend access to our services at any time for violation of these Terms or for any other reason at our discretion.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">14. Contact Information</h2>
                        <p>
                            For questions regarding these Terms of Service, please contact:
                        </p>
                        <p className="font-semibold mt-2">
                            Email: novelexporters@gmail.com<br />
                            Phone: +91 80128 04316<br />
                            Address: Coimbatore, Tamil Nadu, India
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">15. Updates to Terms</h2>
                        <p>
                            We reserve the right to update these Terms at any time. Continued use of our services after changes constitutes acceptance of the updated Terms.
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
                            Accept Terms of Service
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

export default TermsOfService;
