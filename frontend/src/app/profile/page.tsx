"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth, useProfile } from "@/contexts";
import { getAvatarUrl } from "@/lib/avatar";
import { DashboardLayout } from "@/components/dashboard";
import { useToast } from "@/lib/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Award, Star, Flame, Trophy, Coins, MapPin, Clock, Calendar,
  Mail, Phone, BookOpen, GraduationCap, Edit3, Camera, Trash2,
  Lock, Shield, Save, X, Compass, CheckCircle, Zap
} from "lucide-react";
import { GoalEngineProvider } from "@/contexts/goal-engine.context";

export default function ProfilePage() {
  return (
    <GoalEngineProvider>
      <ProfileInner />
    </GoalEngineProvider>
  );
}

function ProfileInner() {
  const { logout } = useAuth();
  const { profile, isLoading, updateProfile, uploadAvatar, deleteAvatar } = useProfile();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync profile data to local form data when entering edit mode or when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        dob: profile.dob || "",
        gender: profile.gender || "",
        location: profile.location || "",
        timezone: profile.timezone || "Asia/Kolkata",
        education: profile.education || "",
        college: profile.college || "",
        occupation: profile.occupation || "",
        bio: profile.bio || "",
        target_exam: profile.target_exam || "",
        secondary_exam: profile.secondary_exam || "",
        target_score: profile.target_score || "",
        target_rank: profile.target_rank || "",
        target_date: profile.target_date || "",
        study_hours_goal: profile.study_hours_goal || 4,
      });
    }
  }, [profile, isEditing]);

  if (isLoading && !profile) {
    return (
      <DashboardLayout activeTab="profile">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#084c38] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-slate-500">Loading Profile System...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast("Your profile details have been saved successfully.", "success");
    } catch (err: any) {
      toast(err.message || "Could not save profile details.", "error");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadAvatar(file);
      toast("Your profile avatar has been updated successfully.", "success");
    } catch (err: any) {
      toast(err.message || "Failed to upload avatar image.", "error");
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm("Are you sure you want to remove your profile avatar?")) return;
    try {
      await deleteAvatar();
      toast("Your avatar has been removed from the server.", "success");
    } catch (err: any) {
      toast(err.message || "Could not remove avatar image.", "error");
    }
  };

  return (
    <DashboardLayout activeTab="profile">
      <div className="max-w-5xl mx-auto space-y-8 px-2 py-4">
        {/* Banner + Hero Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#084c38]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Avatar Area */}
          <div className="relative group shrink-0">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-[#084c38] to-[#063b2b] blur-sm opacity-30 group-hover:opacity-60 transition duration-300" />
            <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-100">
              {profile?.avatar_url ? (
                <img
                  src={getAvatarUrl(profile.avatar_url)}
                  alt={profile?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#084c38] text-white flex items-center justify-center font-black text-3xl uppercase">
                  {profile?.name ? profile.name.charAt(0) : "?"}
                </div>
              )}
            </div>

            {/* Photo controls */}
            <div className="absolute bottom-1 right-1 flex gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload Photo"
                className="w-8 h-8 rounded-full bg-[#084c38] hover:bg-[#063b2b] text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 cursor-pointer border border-white"
              >
                <Camera className="w-4 h-4" />
              </button>
              {profile?.avatar_url && (
                <button
                  type="button"
                  onClick={handleDeleteAvatar}
                  title="Remove Photo"
                  className="w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 cursor-pointer border border-white"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
          </div>

          {/* Identity details */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
              {profile?.name || "Student User"}
            </h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                {profile?.email}
              </span>
              {profile?.target_exam && (
                <span className="flex items-center gap-1.5 bg-[#ecfdf5] text-[#084c38] px-3 py-1 rounded-full border border-[#d1fae5] font-bold">
                  <Compass className="w-3.5 h-3.5" />
                  Target: {profile.target_exam}
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-slate-500 italic max-w-md">
              {profile?.bio || "No profile bio added yet."}
            </p>
          </div>

          {/* Edit / Actions */}
          <div className="shrink-0 flex flex-col items-center gap-3">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#084c38] hover:bg-[#063b2b] text-white text-xs font-bold rounded-xl shadow-xs transition-all hover:scale-102 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="submit"
                  form="profile-form"
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-[#084c38] hover:bg-[#063b2b] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-200"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}

            <button
              onClick={logout}
              className="text-xs font-bold text-rose-600 hover:underline hover:text-rose-700 cursor-pointer transition-colors"
            >
              Sign out of account
            </button>
          </div>
        </div>

        {/* Gamification / Live Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-2xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Level</p>
              <h4 className="text-lg font-bold text-slate-900">{profile?.level || 1}</h4>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
            <div className="p-2.5 rounded-xl bg-[#084c38] text-white shadow-2xs">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total XP</p>
              <h4 className="text-lg font-bold text-slate-900">{profile?.xp || 0}</h4>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
            <div className="p-2.5 rounded-xl bg-orange-500 text-white shadow-2xs">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Streak</p>
              <h4 className="text-lg font-bold text-slate-900">{profile?.streak || 0} Days</h4>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
            <div className="p-2.5 rounded-xl bg-yellow-500 text-white shadow-2xs">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Coins</p>
              <h4 className="text-lg font-bold text-slate-900">{profile?.coins || 0}</h4>
            </div>
          </div>
        </div>

        {/* Detailed Sections Form */}
        <form id="profile-form" onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <User className="w-5 h-5 text-[#084c38]" />
              <h3 className="text-base font-bold text-slate-900 font-display">Personal Information</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 disabled:opacity-75 focus:outline-none focus:border-[#084c38] focus:ring-1 focus:ring-[#084c38] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mobile Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 disabled:opacity-75 focus:outline-none focus:border-[#084c38] focus:ring-1 focus:ring-[#084c38] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 disabled:opacity-75 focus:outline-none focus:border-[#084c38] focus:ring-1 focus:ring-[#084c38] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 disabled:opacity-75 focus:outline-none focus:border-[#084c38] focus:ring-1 focus:ring-[#084c38] transition-colors"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Location / City</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 disabled:opacity-75 focus:outline-none focus:border-[#084c38] focus:ring-1 focus:ring-[#084c38] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Bio / Description</label>
                <textarea
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 disabled:opacity-75 focus:outline-none focus:border-[#084c38] focus:ring-1 focus:ring-[#084c38] transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Education & Journey */}
          <div className="space-y-6">
            {/* Education Info */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <GraduationCap className="w-5 h-5 text-[#084c38]" />
                <h3 className="text-base font-bold text-slate-900 font-display">Education & Academics</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Highest Qualification</label>
                  <input
                    type="text"
                    name="education"
                    value={formData.education || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="e.g. Bachelor of Technology"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 disabled:opacity-75 focus:outline-none focus:border-[#084c38] focus:ring-1 focus:ring-[#084c38] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">University / College</label>
                  <input
                    type="text"
                    name="college"
                    value={formData.college || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 disabled:opacity-75 focus:outline-none focus:border-[#084c38] focus:ring-1 focus:ring-[#084c38] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Occupation</label>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 disabled:opacity-75 focus:outline-none focus:border-[#084c38] focus:ring-1 focus:ring-[#084c38] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Exam Journey */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Compass className="w-5 h-5 text-[#084c38]" />
                <h3 className="text-base font-bold text-slate-900 font-display">Exam Journey</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Target Exam</label>
                    <input
                      type="text"
                      name="target_exam"
                      value={formData.target_exam || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 disabled:opacity-75 focus:outline-none focus:border-[#084c38] focus:ring-1 focus:ring-[#084c38] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Secondary Exam</label>
                    <input
                      type="text"
                      name="secondary_exam"
                      value={formData.secondary_exam || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 disabled:opacity-75 focus:outline-none focus:border-[#084c38] focus:ring-1 focus:ring-[#084c38] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Target Score</label>
                    <input
                      type="text"
                      name="target_score"
                      value={formData.target_score || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 disabled:opacity-75 focus:outline-none focus:border-[#084c38] focus:ring-1 focus:ring-[#084c38] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Target Rank</label>
                    <input
                      type="text"
                      name="target_rank"
                      value={formData.target_rank || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 disabled:opacity-75 focus:outline-none focus:border-[#084c38] focus:ring-1 focus:ring-[#084c38] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Study Hours Goal</label>
                    <input
                      type="number"
                      name="study_hours_goal"
                      value={formData.study_hours_goal || 4}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      min={1}
                      max={24}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 disabled:opacity-75 focus:outline-none focus:border-[#084c38] focus:ring-1 focus:ring-[#084c38] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Exam Date</label>
                  <input
                    type="date"
                    name="target_date"
                    value={formData.target_date || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 disabled:opacity-75 focus:outline-none focus:border-[#084c38] focus:ring-1 focus:ring-[#084c38] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}