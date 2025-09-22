"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * useSessionGuard - Checks if user has required role and returns session data.
 * @param {string} expectedRole - Role required to access the page (optional)
 * @param {boolean} redirect - If true, redirect to /signin when unauthorized
 */
export function useSessionGuard(expectedRole = null, redirect = true) {
  const router = useRouter();
  const [session, setSession] = useState({
    authorized: null,
    userId: null,
    role: null,
    name: null,
    email: null,
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();

        let isAuthorized = data.authorized;
        if (expectedRole) {
          isAuthorized = isAuthorized && data.role === expectedRole;
        }

        setSession({
          authorized: isAuthorized,
          userId: isAuthorized ? data.userId : null,
          role: isAuthorized ? data.role : null,
          name: isAuthorized ? data.name : null,
          email: isAuthorized ? data.email : null,
        });

        if (!isAuthorized && redirect) {
          router.push("/auth");
        }
      } catch (err) {
        console.error("Session check failed", err);
        setSession({ authorized: false, userId: null, role: null });
        if (redirect) router.push("/auth");
      }
    };

    checkSession();
  }, [router, expectedRole, redirect]);

  return session;
}
