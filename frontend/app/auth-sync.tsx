"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

export function AuthSync() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const syncedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || syncedUserId.current === user.id) return;

    const syncUser = async () => {
      const token = await getToken();
      if (!token) return;

      const email = user.primaryEmailAddress?.emailAddress;
      if (!email) return;

      const response = await fetch(`${backendUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: [user.firstName, user.lastName].filter(Boolean).join(" "),
          email,
        }),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(`Could not sync account with backend (${response.status}): ${details}`);
      }
      syncedUserId.current = user.id;
    };

    syncUser().catch(() => {});
  }, [getToken, isLoaded, isSignedIn, user]);

  return null;
}