import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Contact = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 md:py-24 lg:py-32 gradient-hero">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1920')] bg-cover bg-center opacity-15" />
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-white mb-4 sm:mb-6 animate-fade-in">
            Contact Us
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto animate-fade-in px-4" style={{ animationDelay: '100ms' }}>
            Get in touch with our team for orders, enquiries, or any questions
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
            {/* Contact Details */}
            <div className="space-y-6 sm:space-y-8">
              <div>
                <span className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                  Reach Out
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-foreground mb-3 sm:mb-4">
                  We'd Love to Hear From You
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Whether you're interested in our products, have a question, or want to 
                  discuss bulk orders, our team is here to help.
                </p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-card border border-border card-hover animate-fade-in">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl gradient-leaf flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold font-serif text-foreground mb-1 text-sm sm:text-base">Email</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm">International Support</p>
                    <a href="mailto:novelexporters@gmail.com" className="text-primary hover:underline text-sm sm:text-base break-all">
                      novelexporters@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-card border border-border card-hover animate-fade-in" style={{ animationDelay: '100ms' }}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl gradient-warm flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold font-serif text-foreground mb-1 text-sm sm:text-base">Phone</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm">Available Mon-Sat, 9AM-6PM IST</p>
                    <a href="tel:+918012804316" className="text-primary hover:underline">
                      +91 80128 04316
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-border card-hover animate-fade-in" style={{ animationDelay: '200ms' }}>
                  <div className="w-12 h-12 rounded-xl gradient-warm flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold font-serif text-foreground mb-1">Location</h3>
                    <p className="text-muted-foreground text-sm">Visit our office</p>
                    <p className="text-foreground">Novel Exporters, 2/202-C, Dhanam Nagar, Mylampatti, Coimbatore - 641062</p>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Novel%20Exporters%2C%202%2F202-C%2C%20Dhanam%20Nagar%2C%20Mylampatti%2C%20Coimbatore%20641062&zoom=17"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm mt-1 inline-block"
                    >
                      Open in Google Maps
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-border card-hover animate-fade-in" style={{ animationDelay: '300ms' }}>
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold font-serif text-foreground mb-1">Business Hours</h3>
                    <p className="text-muted-foreground text-sm">Monday - Saturday</p>
                    <p className="text-foreground">9:00 AM - 6:00 PM IST</p>
                  </div>
                </div>
              </div>

              <Link to="/enquiry">
                <Button variant="hero" size="lg" className="w-full sm:w-auto">
                  Send an Enquiry
                </Button>
              </Link>
            </div>

            {/* Map / Image */}
            <div className="relative">
              <div className="aspect-video sm:aspect-square lg:aspect-auto lg:h-full rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
                <iframe
                  src="https://www.google.com/maps?q=Novel%20Exporters%2C%202%2F202-C%2C%20Dhanam%20Nagar%2C%20Mylampatti%2C%20Coimbatore%20641062&z=17&maptype=roadmap&output=embed"
                  title="Novel Exporters - Live Location"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '280px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact CTA */}
      <section className="py-16 bg-muted">
        <div className="container-custom text-center">
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-foreground mb-4">
            Need Immediate Assistance?
          </h2>
          <p className="text-muted-foreground mb-6">
            Our support team is ready to help you with any questions or concerns.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:+918012804316">
              <Button variant="default" size="lg">
                <Phone className="w-4 h-4 mr-2" />
                Call Us Now
              </Button>
            </a>
            <a href="mailto:novelexporters@gmail.com">
              <Button variant="outline" size="lg">
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
