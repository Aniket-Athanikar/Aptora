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
  MessageSquareText,
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
    cta: "Follow Us",
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
    cta: "Follow Us",
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
    cta: "Connect",
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
    cta: "Follow Us",
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
      description="Stay updated with tips, exam updates, and study community broadcasts"
      breadcrumb={[{ label: "Social Media", href: "/social-media" }]}
    >
      <div className="layout-container max-w-[1320px] px-4 mx-auto py-6">
        {/* Section Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-10"
        >
          <span className="inline-block bg-emerald-50 text-[#084c38] text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full border border-emerald-200 shadow-2xs">
            🌐 Official Aptora Channels
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
                className="group relative border-2 border-emerald-500/20 shadow-xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-md p-8 hover:border-emerald-500/40 transition-all duration-300 block hover:-translate-y-1"
              >
                {/* Top Accent Gradient Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${platform.gradient}`} />

                {/* Icon + External Link */}
                <div className="flex items-start justify-between mb-6">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${platform.gradient} flex items-center justify-center shadow-lg text-white`}
                    style={{ boxShadow: `0 8px 24px ${platform.color}25` }}
                  >
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-4 h-4 text-slate-600" />
                  </div>
                </div>

                {/* Platform Name + Handle */}
                <h3 className="text-xl font-black text-slate-900 mb-1 font-display">
                  {platform.name}
                </h3>
                <p className="text-xs font-bold text-slate-400 mb-6">
                  {platform.handle}
                </p>

                {/* Follower Count */}
                <div className="flex items-center gap-2 mb-6">
                  <Users className="w-4 h-4" style={{ color: platform.color }} />
                  <span className="text-2xl font-black text-slate-900 font-display">
                    {platform.followers}
                  </span>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    {platform.followerLabel}
                  </span>
                </div>

                {/* Follow / Subscribe Button */}
                <div
                  className={`w-full py-3.5 rounded-xl font-bold text-xs text-white text-center bg-gradient-to-r ${platform.gradient} shadow-md transition-all duration-300 group-hover:shadow-lg`}
                >
                  {platform.cta}
                </div>
              </motion.a>
            );
          })}
        </motion.div>

        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-14 text-center"
        >
          <div className="inline-flex items-center gap-4 border-2 border-emerald-500/20 shadow-xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-md px-8 py-5 text-left relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#084c38] to-emerald-700 text-white flex items-center justify-center shadow-md">
              <MessageSquareText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 font-display">
                Join 200,000+ Competitive Aspirants
              </p>
              <p className="text-xs text-slate-500 font-medium">
                Be part of our growing community for daily quizzes, exam updates, and peer discussions.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
}

