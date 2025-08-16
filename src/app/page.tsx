"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSetup = async () => {
      try {
        // Check if Supabase is configured
        createClient();

        // Check if user is already logged in
        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          if (user.role === "siswa") {
            router.push("/siswa/dashboard");
          } else if (user.role === "guru") {
            router.push("/guru/dashboard");
          } else {
            router.push("/admin/dashboard");
          }
        } else {
          router.push("/login");
        }
      } catch (error) {
        // Supabase not configured, redirect to setup
        router.push("/setup");
      } finally {
        setIsChecking(false);
      }
    };

    checkSetup();
  }, [router]);

  if (!isChecking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Checking configuration...</p>
      </div>
    </div>
  );
}
