"use client";

import React from "react";
import { User, Bell, Globe, Shield, Save, Eye, EyeOff, Lock, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "../DashboardContext";

export const SettingsTab: React.FC = () => {
  const {
    userProfile,
    savingProfile,
    settingsName, setSettingsName,
    settingsPhone, setSettingsPhone,
    settingsLocation, setSettingsLocation,
    settingsTimezone, setSettingsTimezone,
    settingsBio, setSettingsBio,
    notificationEmail, setNotificationEmail,
    notificationPush, setNotificationPush,
    notificationWhatsApp, setNotificationWhatsApp,
    notificationSMS, setNotificationSMS,
    privacyProfile, setPrivacyProfile,
    privacyStreaks, setPrivacyStreaks,
    privacyAnalytics, setPrivacyAnalytics,
    oldPassword, setOldPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    showPasswords, setShowPasswords,
    isChangingPassword,
    handleSaveSettings,
    handleResetPassword,
    handleImageUpload
  } = useDashboard();

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="border-b border-[#E9ECF8] pb-4">
        <h2 className="text-2xl font-black text-neutral-900">Settings & Profile</h2>
        <p className="text-xs text-neutral-400 font-medium mt-1">Manage your account profile parameters, notifications preferences, and security settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Profile Card & Bio Form (Left 2 Columns) */}
        <form onSubmit={handleSaveSettings} className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 border-b border-[#E9ECF8] pb-3.5">
              <User className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold text-neutral-900 text-base">Personal Account Profile</h3>
            </div>

            {/* Upload picture avatar */}
            <div className="flex flex-col sm:flex-row gap-6 items-center border-b border-neutral-100 pb-6">
              <div className="relative group w-20 h-20 rounded-full overflow-hidden bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 shadow-sm">
                {userProfile?.avatar_url ? (
                  <img 
                    src={userProfile.avatar_url} 
                    alt={userProfile.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  userProfile?.name?.[0]?.toUpperCase() || "S"
                )}
                <label className="absolute inset-0 bg-neutral-950/45 cursor-pointer opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center text-white text-[8px] font-black uppercase tracking-wider transition-opacity">
                  <UploadCloud className="w-4 h-4 mb-0.5" /> Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="space-y-1.5 text-center sm:text-left">
                <span className="block font-bold text-sm text-neutral-800">Profile Image Avatar</span>
                <p className="text-[10px] text-neutral-400 font-semibold leading-relaxed max-w-xs">
                  We support JPG, JPEG or PNG formats. Files will be dynamically compressed to a clean 256x256 size layout.
                </p>
              </div>
            </div>

            {/* Text Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold text-neutral-600 uppercase mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={settingsName}
                  onChange={(e) => setSettingsName(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-indigo-600 bg-white"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-neutral-600 uppercase mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={settingsPhone}
                  onChange={(e) => setSettingsPhone(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-indigo-600 bg-white"
                  placeholder="e.g. +91 9876543210"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-neutral-600 uppercase mb-1">Location / Region</label>
                <input
                  type="text"
                  value={settingsLocation}
                  onChange={(e) => setSettingsLocation(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-indigo-600 bg-white"
                  placeholder="e.g. New Delhi, India"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-neutral-600 uppercase mb-1">System Timezone</label>
                <select
                  value={settingsTimezone}
                  onChange={(e) => setSettingsTimezone(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-indigo-600 bg-white cursor-pointer"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="UTC">Coordinated Universal Time (UTC)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-neutral-600 uppercase mb-1">Brief Bio / Ambition Statement</label>
              <textarea
                value={settingsBio}
                onChange={(e) => setSettingsBio(e.target.value)}
                rows={3}
                className="w-full text-xs font-semibold px-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-indigo-600 bg-white resize-none"
                placeholder="Tell us a little about your learning goals..."
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/25 hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 border-0"
            >
              <Save className="w-4 h-4" />
              {savingProfile ? "Saving changes..." : "Save Settings Changes"}
            </button>
          </div>
        </form>

        {/* Toggles & Password form (Right Column) */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Notifications config */}
          <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 border-b border-[#E9ECF8] pb-3.5">
              <Bell className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold text-neutral-900 text-base">Alerts Toggles</h3>
            </div>

            <div className="space-y-4">
              {[
                { state: notificationEmail, setter: setNotificationEmail, title: "Email Digest", desc: "Receive summary study reports." },
                { state: notificationPush, setter: setNotificationPush, title: "Push Alerts", desc: "Streak trackers & updates alerts." },
                { state: notificationWhatsApp, setter: setNotificationWhatsApp, title: "WhatsApp Digest", desc: "Alert tasks list via WhatsApp." },
                { state: notificationSMS, setter: setNotificationSMS, title: "SMS Alerts", desc: "Verify alerts for calendar deadlines." },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 font-bold">
                  <div>
                    <span className="block font-bold text-xs text-neutral-800">{item.title}</span>
                    <span className="block text-[10px] text-neutral-400 font-semibold">{item.desc}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => item.setter(!item.state)}
                    className={cn(
                      "w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none border-0",
                      item.state ? "bg-indigo-600" : "bg-neutral-200"
                    )}
                  >
                    <span className={cn(
                      "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all",
                      item.state ? "translate-x-5" : ""
                    )} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy settings */}
          <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 border-b border-[#E9ECF8] pb-3.5">
              <Globe className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold text-neutral-900 text-base">Privacy Settings</h3>
            </div>

            <div className="space-y-4">
              {[
                { state: privacyProfile, setter: setPrivacyProfile, title: "Profile Visibility", desc: "Allow other learners to see your profile." },
                { state: privacyStreaks, setter: setPrivacyStreaks, title: "Public Streaks", desc: "Let peers check your active streaks." },
                { state: privacyAnalytics, setter: setPrivacyAnalytics, title: "Analytics Sharing", desc: "Contribute anonymous study durations." },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 font-bold">
                  <div>
                    <span className="block font-bold text-xs text-neutral-800">{item.title}</span>
                    <span className="block text-[10px] text-neutral-400 font-semibold">{item.desc}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => item.setter(!item.state)}
                    className={cn(
                      "w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none border-0",
                      item.state ? "bg-indigo-600" : "bg-neutral-200"
                    )}
                  >
                    <span className={cn(
                      "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all",
                      item.state ? "translate-x-5" : ""
                    )} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Password update form */}
          <div className="bg-white border border-[#E9ECF8] rounded-[24px] p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#E9ECF8] pb-3.5">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-neutral-900 text-base">Security Control</h3>
              </div>
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full animate-pulse">
                Score: {userProfile?.security_score || 85}/100
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-neutral-500">Update Account Password</span>
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="text-indigo-600 flex items-center gap-1 bg-transparent border-0 cursor-pointer text-xs font-bold"
                >
                  {showPasswords ? (
                    <>
                      <EyeOff className="w-4 h-4" /> Hide Fields
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" /> Show Fields
                    </>
                  )}
                </button>
              </div>

              {showPasswords && (
                <div className="space-y-3.5 border-t border-neutral-100 pt-3">
                  <div>
                    <label className="block text-[10px] font-extrabold text-neutral-600 mb-1">Current Old Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full text-xs font-semibold pl-9 pr-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-indigo-600 bg-white"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-neutral-600 mb-1">New Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full text-xs font-semibold pl-9 pr-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-indigo-600 bg-white"
                          placeholder="Min 8 chars"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-neutral-600 mb-1">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full text-xs font-semibold pl-9 pr-3 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:border-indigo-600 bg-white"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={isChangingPassword || !newPassword}
                    className="w-full text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white py-2 rounded-xl cursor-pointer transition-colors disabled:opacity-50 border-0"
                  >
                    {isChangingPassword ? "Saving credentials..." : "Verify & Apply Password Reset"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
