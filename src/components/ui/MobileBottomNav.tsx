"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Users,
  FileText,
  Settings,
  Calendar,
  Building,
  UserCheck,
  BarChart3,
  User,
  Clock,
  CheckSquare,
} from "lucide-react";

interface MobileBottomNavProps {
  userRole: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
}

export default function MobileBottomNav({ userRole }: MobileBottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Define navigation items based on user role
  const getNavItems = (): NavItem[] => {
    switch (userRole) {
      case "admin":
        return [
          {
            id: "dashboard",
            label: "Dashboard",
            icon: Home,
            href: "/admin/dashboard",
          },
          {
            id: "absensi",
            label: "Absensi",
            icon: CheckSquare,
            href: "/admin/absensi",
          },
          {
            id: "siswa",
            label: "Siswa",
            icon: Users,
            href: "/admin/siswa",
          },
          {
            id: "jurnal",
            label: "Jurnal",
            icon: FileText,
            href: "/admin/jurnal",
          },
          {
            id: "profil",
            label: "Profil",
            icon: User,
            href: "/admin/profil",
          },
        ];

      case "guru":
        return [
          {
            id: "dashboard",
            label: "Dashboard",
            icon: Home,
            href: "/guru/dashboard",
          },
          {
            id: "siswa",
            label: "Siswa",
            icon: Users,
            href: "/guru/siswa",
          },
          {
            id: "jurnal",
            label: "Jurnal",
            icon: FileText,
            href: "/guru/jurnal",
          },
          {
            id: "profile",
            label: "Profil",
            icon: User,
            href: "/guru/profil",
          },
        ];

      case "siswa":
        return [
          {
            id: "dashboard",
            label: "Dashboard",
            icon: Home,
            href: "/siswa/dashboard",
          },
          {
            id: "absensi",
            label: "Absensi",
            icon: Clock,
            href: "/siswa/absensi",
          },
          {
            id: "jurnal",
            label: "Jurnal",
            icon: BookOpen,
            href: "/siswa/jurnal",
          },
          {
            id: "profil",
            label: "Profil",
            icon: User,
            href: "/siswa/profil",
          },
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleNavigation = (href: string) => {
    // Add haptic feedback for mobile devices
    if ("vibrate" in navigator) {
      navigator.vibrate(10); // Very short vibration for tactile feedback
    }

    router.push(href);
  };

  // Only show on mobile (controlled by CSS classes)
  if (navItems.length === 0) {
    return null;
  }

  return (
    <>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-lg z-50 md:hidden">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname.startsWith(item.href) ||
              (item.href === `/${userRole}/dashboard` &&
                pathname === `/${userRole}`);

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.href)}
                className={`
                  relative flex flex-col items-center justify-center flex-1 h-full px-1 py-2 transition-all duration-300 active:scale-95 rounded-lg mx-1
                  ${
                    isActive
                      ? "text-white bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  }
                `}
                style={{
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 mb-1 transition-all duration-200 ${
                      isActive ? "text-white" : "text-slate-500"
                    }`}
                  />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-sm"></div>
                  )}
                </div>
                <span
                  className={`text-xs font-medium transition-all duration-200 ${
                    isActive ? "text-white" : "text-slate-600"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom padding to prevent content overlap */}
      <div className="h-16 md:hidden"></div>
    </>
  );
}
