"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Send,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Phone as WhatsAppIcon,
  ArrowRight,
  Loader2
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import Link from "next/link";
import { useToast } from "@/lib/ToastContext";
import { getWhatsAppLink } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const contactCards = [
  {
    icon: Mail,
    title: "Email Us",
    detail: "agentforge29@gmail.com",
    href: "mailto:agentforge29@gmail.com",
    color: "#e9101b",
  },
  {
    icon: Phone,
    title: "Call Us",
    detail: "+91 99707 51798 ",
    href: "tel:+919970751798",
    color: "#4F46E5",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    detail: "+91 70300 87366 ",
    href: "https://wa.me/917030087366",
    color: "#087a32",
  },
  {
    icon: MapPin,
    title: "Address",
    detail: "Aptora, 3rd Floor, Bloak 21, Gandhi Chowk, Civil Line, Sangali, Maharastra, India",
    href: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3809.112674390326!2d74.56860000000001!3d16.8524!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc1230000000000%3A0x0!2sGandhi+Chowk%2C+Sangli!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin",
    color: "#F59E0B",
  },
];

const socialLinks = [
  { icon: Facebook, label: "Facebook", href: "https://www.facebook.com/Aptora" },
  { icon: Twitter, label: "Twitter", href: "https://twitter.com/Aptora" },
  { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/s.o.n.u03" },
  { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/mrunal-chaudhari03" },
  { icon: Youtube, label: "YouTube", href: "https://www.youtube.com/@Aptora" },
  { icon: WhatsAppIcon, label: "WhatsApp 2", href: "https://wa.me/919970751798" },

];

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast("Message sent successfully! We will get back to you shortly.", "success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        toast("Failed to transmit message. Please try again.", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Could not connect to the server.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout
      title="Contact Us"
      description="Have questions? We'd love to hear from you. Reach out to us anytime."
      breadcrumb={[{ label: "Contact Us", href: "/contact" }]}
    >
      <div className="layout-container max-w-[1320px] px-4 mx-auto space-y-20">
        {/* Main Grid — Info + Form */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid lg:grid-cols-5 gap-8"
        >
          {/* Left: Contact Info Cards */}
          <div className="lg:col-span-2 space-y-5">
            {contactCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.a
                  key={idx}
                  href={mounted && card.href.startsWith("https://wa.me/") ? getWhatsAppLink(card.href.split("/").pop() || "") : card.href}
                  variants={itemVariants}
                  className="flex items-start gap-4 bg-white/70 backdrop-blur-xl border border-[#ECECEC] rounded-[24px] p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group block"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border"
                    style={{
                      backgroundColor: `${card.color}08`,
                      borderColor: `${card.color}18`,
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: card.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-neutral-900 mb-1">{card.title}</h3>
                    <p className="text-sm font-semibold text-neutral-500 group-hover:text-emerald-600 transition-colors">
                      {card.detail}
                    </p>
                  </div>
                </motion.a>
              );
            })}
          </div>

          {/* Right: Contact Form */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-3 bg-white/70 backdrop-blur-xl border border-[#ECECEC] rounded-[24px] p-8 md:p-10 shadow-lg"
          >
            <h2 className="text-2xl font-black text-neutral-900 mb-2">Send us a Message</h2>
            <p className="text-sm font-semibold text-neutral-500 mb-8">
              Fill out the form below and we&apos;ll get back to you within 24 hours.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full bg-white/50 border border-neutral-200 rounded-xl px-4 py-3 text-sm font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full bg-white/50 border border-neutral-200 rounded-xl px-4 py-3 text-sm font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  className="w-full bg-white/50 border border-neutral-200 rounded-xl px-4 py-3 text-sm font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  rows={5}
                  className="w-full bg-white/50 border border-neutral-200 rounded-xl px-4 py-3 text-sm font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-500/10 hover:shadow-xl hover:shadow-emerald-500/20 transition-all disabled:opacity-50 border-none cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </motion.section>

        {/* Social Icons */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center"
        >
          <motion.div variants={itemVariants}>
            <span className="inline-block bg-emerald-50 text-emerald-600 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-100 mb-4">
              Stay Connected
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-3">Connect With Us</h2>
            <p className="text-neutral-500 font-semibold max-w-md mx-auto mb-10">
              Follow us on social media for the latest updates, tips, and resources.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center justify-center gap-4">
            {socialLinks.map((social, idx) => {
              const Icon = social.icon;
              return (
                <a
                  key={idx}
                  href={mounted && social.href.startsWith("https://wa.me/") ? getWhatsAppLink(social.href.split("/").pop() || "") : social.href}
                  aria-label={social.label}
                  className="w-14 h-14 rounded-2xl bg-white/70 backdrop-blur-xl border border-[#ECECEC] flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-1 hover:border-emerald-500/30 transition-all duration-300 group"
                >
                  <Icon className="w-5 h-5 text-neutral-500 group-hover:text-emerald-600 transition-colors" />
                </a>
              );
            })}
          </motion.div>
        </motion.section>

        {/* Next Step CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center pt-8"
        >
          <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white p-8 md:p-12 rounded-[24px] shadow-xl relative overflow-hidden group max-w-[900px] mx-auto">
            <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500" />
            <h3 className="text-2xl md:text-3xl font-black mb-3">
              Prefer direct business channel?
            </h3>
            <p className="text-emerald-100 text-sm font-semibold mb-6 max-w-md mx-auto">
              Send us inquiries regarding institutional licenses, partnerships, or API setups.
            </p>
            <a
              href="mailto:business@Aptora.ai"
              className="inline-flex items-center gap-2 text-sm font-black text-emerald-600 bg-white px-8 py-3.5 rounded-xl hover:bg-neutral-50 hover:shadow-lg transition-all"
            >
              Contact Business Team <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.section>
      </div>
    </PageLayout>
  );
}
