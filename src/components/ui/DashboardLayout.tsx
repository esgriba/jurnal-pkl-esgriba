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
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50">
      <Sidebar userRole={userRole} />

      <main className="flex-1 lg:ml-64 overflow-auto bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50">
        <div className="p-6 lg:p-8 pb-20 md:pb-8">{children}</div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav userRole={userRole} />
    </div>
  );
}
