"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { profileService } from "@/services/profile.service";

export interface UserProfile {
  id: number;
  user_id: number;
  name: string;
  email: string;
  member_since: string;
  phone: string;
  dob: string;
  gender: string;
  location: string;
  timezone: string;
  education: string;
  college: string;
  occupation: string;
  bio: string;
  avatar_url: string;
  xp: number;
  coins: number;
  level: number;
  streak: number;
  target_exam: string;
  secondary_exam: string;
  target_score: string;
  target_rank: string;
  target_date: string;
  study_hours_goal: number;
  weak_subjects: string[];
  strong_subjects: string[];
  favorite_subjects: string[];
  accuracy: number;
  mock_average: number;
  questions_solved: number;
  study_hours_total: number;
  completion_pct: number;
  bookmarks_count: number;
  certificates_count: number;
  social_links: Record<string, string>;
  achievements: string[];
  connected_devices: string[];
  notification_settings: Record<string, any>;
  privacy_settings: Record<string, any>;
  security_score: number;
  plan: string;
  plan_renewal: string;
  ai_credits: number;
  storage_used_mb: number;
  updated_at: string;
}

interface ProfileContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  updateProfile: (data: Record<string, any>) => Promise<UserProfile>;
  uploadAvatar: (file: File, onProgress?: (percent: number) => void) => Promise<UserProfile>;
  deleteAvatar: () => Promise<UserProfile>;
  refreshProfile: () => Promise<UserProfile | null>;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  isLoading: true,
  updateProfile: async () => { throw new Error("ProfileProvider not initialized"); },
  uploadAvatar: async () => { throw new Error("ProfileProvider not initialized"); },
  deleteAvatar: async () => { throw new Error("ProfileProvider not initialized"); },
  refreshProfile: async () => null,
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async (): Promise<UserProfile | null> => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setProfile(null);
        return null;
      }
    }
    try {
      const res = await profileService.getProfile();
      if (res && res.success && res.profile) {
        setProfile(res.profile);
        return res.profile;
      }
    } catch (err: any) {
      setProfile(null);
    }
    return null;
  };

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      fetchProfile().finally(() => setIsLoading(false));
    } else {
      setProfile(null);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const updateProfile = async (data: Record<string, any>): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const res = await profileService.updateProfile(data);
      if (res && res.success && res.profile) {
        setProfile(res.profile);
        return res.profile;
      }
      throw new Error(res?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const uploadAvatar = async (file: File, onProgress?: (percent: number) => void): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const res = await profileService.uploadAvatar(file, onProgress);
      if (res && res.success && res.profile) {
        setProfile(res.profile);
        return res.profile;
      }
      throw new Error(res?.message || "Failed to upload avatar");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAvatar = async (): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const res = await profileService.deleteAvatar();
      if (res && res.success && res.profile) {
        setProfile(res.profile);
        return res.profile;
      }
      throw new Error(res?.message || "Failed to delete avatar");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async (): Promise<UserProfile | null> => {
    return fetchProfile();
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading,
        updateProfile,
        uploadAvatar,
        deleteAvatar,
        refreshProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
