'use client';

import { useEffect, useState } from "react";
import { AdminProfile, getMe } from "@/app/api/roles";

let cached: Promise<AdminProfile | null> | null = null;

/** The signed-in admin's identity and perks (fetched once per page load). */
export function useAdminProfile() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cached) {
      cached = getMe().then((res) => res.data).catch(() => {
        cached = null;
        return null;
      });
    }
    cached.then((data) => {
      setProfile(data);
      setLoading(false);
    });
  }, []);

  const hasPerk = (...codes: string[]) =>
    !!profile && (profile.is_superuser || codes.some((code) => profile.perks.includes(code)));

  return { profile, loading, hasPerk };
}

export function clearAdminProfile() {
  cached = null;
}
