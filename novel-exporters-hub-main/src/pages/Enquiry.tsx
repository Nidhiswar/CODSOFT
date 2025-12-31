import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send, CheckCircle } from "lucide-react";

const Enquiry = () => {
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    email: "",
    message: "",
  });

  /* ---------- HANDLE INPUT CHANGE ---------- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------- HANDLE FORM SUBMIT ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/enquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send enquiry");
      }

      setIsSubmitted(true);

      toast({
        title: "Enquiry Sent!",
        description:
          "Your enquiry has been sent successfully. Please check your email.",
      });

      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          username: "",
          phone: "",
          email: "",
          message: "",
        });
      }, 3000);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden">
      {/* ---------- HERO SECTION ---------- */}
      <section className="relative py-24 md:py-32 gradient-hero">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1920')] bg-cover bg-center opacity-15" />
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-white mb-6">
            Send an Enquiry
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Have questions about our products? Fill out the form and we'll get
            back to you shortly.
          </p>
        </div>
      </section>

      {/* ---------- ENQUIRY FORM ---------- */}
      <section className="section-padding bg-background">
        <div className="container-custom max-w-2xl">
          <div className="p-8 md:p-10 rounded-3xl bg-card shadow-xl border border-border">

            {isSubmitted ? (
              /* ---------- SUCCESS MESSAGE ---------- */
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-leaf flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold font-serif mb-2">
                  Thank You!
                </h2>
                <p className="text-muted-foreground">
                  Your enquiry has been submitted. We’ve also sent you a
                  confirmation email.
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold font-serif mb-2">
                    Get in Touch
                  </h2>
                  <p className="text-muted-foreground">
                    Fill in your details and message below.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Full Name *
                    </label>
                    <Input
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Phone Number *
                    </label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 XXXXX XXXXX"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Your Message *
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your requirements..."
                      rows={5}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : (
                      <>
                        Send Message
                        <Send className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>

          {/* ---------- CONTACT INFO ---------- */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Or contact us directly:
            </p>
            <div className="flex justify-center gap-6 flex-wrap">
              <a
                href="mailto:internationalsupport@novelexporters.com"
                className="text-primary hover:underline"
              >
                internationalsupport@novelexporters.com
              </a>
              <a
                href="tel:+918012804316"
                className="text-primary hover:underline"
              >
                +91 80128 04316
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Enquiry;
