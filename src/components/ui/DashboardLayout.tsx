"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import MobileBottomNav from "./MobileBottomNav";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: string;
}

export default function DashboardLayout({
  children,
  userRole,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen !bg-slate-50">
      <Sidebar userRole={userRole} />

      <main className="flex-1 lg:ml-64 overflow-auto !bg-slate-50">
        <div className="p-6 lg:p-8 pb-20 md:pb-8">{children}</div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav userRole={userRole} />
    </div>
  );
}
