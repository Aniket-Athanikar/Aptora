"use client";

import { motion } from "framer-motion";
import {
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  ExternalLink,
  Users,
} from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};

interface SocialPlatform {
  name: string;
  icon: typeof Instagram;
  handle: string;
  followers: string;
  followerLabel: string;
  cta: string;
  color: string;
  gradient: string;
  url: string;
}

const platforms: SocialPlatform[] = [
  {
    name: "Instagram",
    icon: Instagram,
    handle: "@aptora",
    followers: "50K+",
    followerLabel: "Followers",
    cta: "Follow",
    color: "#E4405F",
    gradient: "from-[#F58529] via-[#DD2A7B] to-[#8134AF]",
    url: "https://instagram.com/aptora",
  },
  {
    name: "Facebook",
    icon: Facebook,
    handle: "Aptora",
    followers: "35K+",
    followerLabel: "Followers",
    cta: "Follow",
    color: "#1877F2",
    gradient: "from-[#1877F2] to-[#0C5DC7]",
    url: "https://facebook.com/aptora",
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    handle: "Aptora",
    followers: "20K+",
    followerLabel: "Followers",
    cta: "Follow",
    color: "#0A66C2",
    gradient: "from-[#0A66C2] to-[#004182]",
    url: "https://linkedin.com/company/aptora",
  },
  {
    name: "X (Twitter)",
    icon: Twitter,
    handle: "@aptora",
    followers: "15K+",
    followerLabel: "Followers",
    cta: "Follow",
    color: "#000000",
    gradient: "from-[#333333] to-[#000000]",
    url: "https://x.com/aptora",
  },
  {
    name: "YouTube",
    icon: Youtube,
    handle: "Aptora",
    followers: "100K+",
    followerLabel: "Subscribers",
    cta: "Subscribe",
    color: "#FF0000",
    gradient: "from-[#FF0000] to-[#CC0000]",
    url: "https://youtube.com/@aptora",
  },
];

export default function SocialMediaPage() {
  return (
    <PageLayout
      title="Follow Us on Social Media"
      description="Stay updated with tips, updates and more"
      breadcrumb={[{ label: "Social Media", href: "/social-media" }]}
    >
      <div className="layout-container max-w-[1320px] px-4 mx-auto">
        {/* Section Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-14"
        >
          <span className="inline-block bg-emerald-50 text-emerald-600 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-100">
            🌐 Connect With Us
          </span>
        </motion.div>

        {/* Social Platform Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7"
        >
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <motion.a
                key={platform.name}
                variants={itemVariants}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white/70 backdrop-blur-xl border border-[#ECECEC] rounded-[24px] p-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block"
              >
                {/* Icon + External Link */}
                <div className="flex items-start justify-between mb-6">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${platform.gradient} flex items-center justify-center shadow-lg`}
                    style={{ boxShadow: `0 8px 24px ${platform.color}25` }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-neutral-50 border border-[#ECECEC] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ExternalLink className="w-4 h-4 text-neutral-400" />
                  </div>
                </div>

                {/* Platform Name + Handle */}
                <h3 className="text-xl font-black text-neutral-900 mb-1">
                  {platform.name}
                </h3>
                <p className="text-sm font-semibold text-neutral-400 mb-5">
                  {platform.handle}
                </p>

                {/* Follower Count */}
                <div className="flex items-center gap-2 mb-6">
                  <Users className="w-4 h-4" style={{ color: platform.color }} />
                  <span className="text-2xl font-black text-neutral-900">
                    {platform.followers}
                  </span>
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    {platform.followerLabel}
                  </span>
                </div>

                {/* Follow / Subscribe Button */}
                <button
                  className={`w-full py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r ${platform.gradient} shadow-md transition-all duration-300 hover:shadow-lg`}
                  style={{ boxShadow: `0 4px 16px ${platform.color}20` }}
                >
                  {platform.cta}
                </button>
              </motion.a>
            );
          })}
        </motion.div>

        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 bg-white/70 backdrop-blur-xl border border-[#ECECEC] rounded-full px-8 py-4 shadow-md">
            <span className="text-2xl">💬</span>
            <div className="text-left">
              <p className="text-sm font-black text-neutral-900">
                Join 200K+ Students
              </p>
              <p className="text-xs text-neutral-500 font-semibold">
                Be part of our growing community of competitive exam aspirants.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
}
