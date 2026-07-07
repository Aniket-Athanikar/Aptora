"use client";

import { motion } from "framer-motion";
import { Shield, Database, Settings, UserCheck, Mail } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";

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

const sections = [
  {
    number: "01",
    icon: Database,
    title: "Information We Collect",
    content: [
      {
        subtitle: "Personal Information",
        text: "When you create an account, we collect your name, email address, phone number, and educational details to personalize your experience.",
      },
      {
        subtitle: "Usage Data",
        text: "We automatically collect information about how you interact with our platform, including pages visited, features used, time spent, and performance metrics on tests and quizzes.",
      },
      {
        subtitle: "Cookies & Tracking",
        text: "We use cookies and similar tracking technologies to enhance your browsing experience, remember preferences, and analyze platform usage to improve our services.",
      },
    ],
  },
  {
    number: "02",
    icon: Settings,
    title: "How We Use Information",
    content: [
      {
        subtitle: "Service Delivery",
        text: "We use your information to provide, maintain, and improve our AI-powered exam preparation services, including generating personalized study material and practice questions.",
      },
      {
        subtitle: "Personalization",
        text: "Your usage data helps our AI algorithms create personalized learning paths, adaptive difficulty levels, and targeted recommendations to optimize your study experience.",
      },
      {
        subtitle: "Communication",
        text: "We may use your contact information to send service updates, promotional content, study reminders, and respond to your inquiries. You can opt out of marketing emails at any time.",
      },
    ],
  },
  {
    number: "03",
    icon: Shield,
    title: "Data Sharing",
    content: [
      {
        subtitle: "Third-Party Service Providers",
        text: "We may share your information with trusted third-party service providers who assist in operating our platform, such as cloud hosting, analytics, payment processing, and customer support services. These providers are contractually bound to protect your data.",
      },
      {
        subtitle: "Legal Requirements",
        text: "We may disclose your information if required by law, regulation, or legal process, or if we believe disclosure is necessary to protect the rights, property, or safety of ExamForge AI, our users, or the public.",
      },
    ],
  },
  {
    number: "04",
    icon: UserCheck,
    title: "Your Choices",
    content: [
      {
        subtitle: "Update or Delete Your Data",
        text: "You have the right to access, update, or request deletion of your personal data at any time by navigating to your Account Settings or contacting our support team.",
      },
      {
        subtitle: "Opt-Out",
        text: "You can opt out of receiving promotional emails by clicking the unsubscribe link in any marketing email. You can also manage cookie preferences through your browser settings.",
      },
      {
        subtitle: "Data Portability",
        text: "You can request a copy of your personal data in a structured, machine-readable format by contacting our support team.",
      },
    ],
  },
  {
    number: "05",
    icon: Mail,
    title: "Contact Us",
    content: [
      {
        subtitle: "Privacy Questions",
        text: "If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please reach out to us at privacy@examforge.ai. We are committed to resolving any privacy-related issues promptly and transparently.",
      },
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <PageLayout
      title="Privacy Policy"
      description="Your privacy matters to us. Learn how we protect your data."
      breadcrumb={[{ label: "Privacy Policy", href: "/privacy-policy" }]}
    >
      <div className="layout-container max-w-[900px] px-4 mx-auto space-y-10">
        {/* Last Updated + Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/70 backdrop-blur-xl border border-[#ECECEC] rounded-[24px] p-8 md:p-10 shadow-lg"
        >
          <div className="inline-block bg-[#6D4AFF]/5 text-[#6D4AFF] text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-[#6D4AFF]/10 mb-6">
            Last updated: 25 May 2024
          </div>
          <p className="text-neutral-600 font-medium leading-relaxed">
            At ExamForge AI, we are committed to protecting the privacy and security of our users.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information
            when you use our platform and services. By using ExamForge AI, you agree to the collection
            and use of information in accordance with this policy.
          </p>
        </motion.div>

        {/* Sections */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          className="space-y-6"
        >
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-white/70 backdrop-blur-xl border border-[#ECECEC] rounded-[24px] p-8 md:p-10 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#6D4AFF]/5 border border-[#6D4AFF]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-[#6D4AFF]" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#6D4AFF] tracking-widest">
                      SECTION {section.number}
                    </span>
                    <h2 className="text-xl font-black text-neutral-900 mt-1">{section.title}</h2>
                  </div>
                </div>

                <div className="space-y-5 pl-0 md:pl-[68px]">
                  {section.content.map((item, itemIdx) => (
                    <div key={itemIdx}>
                      <h3 className="text-sm font-black text-neutral-800 mb-1.5">{item.subtitle}</h3>
                      <p className="text-sm font-medium text-neutral-500 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </PageLayout>
  );
}
