"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Users,
  Building2,
  GraduationCap,
  UserCheck,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  UserPlus,
  Eye,
  Plus,
  User,
  FileSpreadsheet,
} from "lucide-react";

interface MenuItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  children?: MenuItem[];
  roles?: string[];
}

interface SidebarProps {
  userRole: string;
}

export default function Sidebar({ userRole }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      href: `/${userRole}/dashboard`,
      icon: <Home className="h-5 w-5" />,
      roles: ["admin", "siswa", "guru"],
    },
    {
      title: "Jurnal",
      icon: <BookOpen className="h-5 w-5" />,
      roles: ["admin", "siswa", "guru"],
      children: [
        {
          title: "Lihat Jurnal",
          href: userRole === "siswa" ? "/siswa/jurnal" : `/${userRole}/jurnal`,
          icon: <Eye className="h-4 w-4" />,
          roles: ["admin", "siswa", "guru"],
        },
        ...(userRole === "siswa"
          ? [
              {
                title: "Buat Jurnal",
                href: "/siswa/jurnal/create",
                icon: <Plus className="h-4 w-4" />,
                roles: ["siswa"],
              },
            ]
          : []),
      ],
    },
    {
      title: "Manajemen Users",
      icon: <Users className="h-5 w-5" />,
      roles: ["admin"],
      children: [
        {
          title: "Semua Users",
          href: "/admin/users",
          icon: <Users className="h-4 w-4" />,
          roles: ["admin"],
        },
        {
          title: "Tambah User",
          href: "/admin/users/create",
          icon: <UserPlus className="h-4 w-4" />,
          roles: ["admin"],
        },
      ],
    },
    {
      title: "Siswa",
      icon: <GraduationCap className="h-5 w-5" />,
      roles: ["admin", "guru"],
      children: [
        {
          title: "Data Siswa",
          href: `/${userRole}/siswa`,
          icon: <Eye className="h-4 w-4" />,
          roles: ["admin", "guru"],
        },
        ...(userRole === "admin"
          ? [
              {
                title: "Tambah Siswa",
                href: "/admin/siswa/create",
                icon: <Plus className="h-4 w-4" />,
                roles: ["admin"],
              },
              {
                title: "Import Excel",
                href: "/admin/import-siswa",
                icon: <FileSpreadsheet className="h-4 w-4" />,
                roles: ["admin"],
              },
            ]
          : []),
      ],
    },
    {
      title: "Guru",
      icon: <UserCheck className="h-5 w-5" />,
      roles: ["admin"],
      children: [
        {
          title: "Data Guru",
          href: "/admin/guru",
          icon: <Eye className="h-4 w-4" />,
          roles: ["admin"],
        },
        {
          title: "Tambah Guru",
          href: "/admin/guru/create",
          icon: <Plus className="h-4 w-4" />,
          roles: ["admin"],
        },
      ],
    },
    {
      title: "DUDI",
      icon: <Building2 className="h-5 w-5" />,
      roles: ["admin"],
      children: [
        {
          title: "Data DUDI",
          href: "/admin/dudi",
          icon: <Eye className="h-4 w-4" />,
          roles: ["admin"],
        },
        {
          title: "Tambah DUDI",
          href: "/admin/dudi/create",
          icon: <Plus className="h-4 w-4" />,
          roles: ["admin"],
        },
      ],
    },
    {
      title: "Absensi",
      icon: <Calendar className="h-5 w-5" />,
      roles: ["admin", "siswa", "guru"],
      ...(userRole === "admin"
        ? { href: "/admin/absensi" }
        : userRole === "guru"
        ? { href: "/guru/absensi" }
        : { href: "/siswa/absensi" }),
    },
    {
      title: "Profil",
      icon: <User className="h-5 w-5" />,
      roles: ["admin", "siswa", "guru"],
      ...(userRole === "admin"
        ? { href: "/admin/profil" }
        : userRole === "guru"
        ? { href: "/guru/profil" }
        : { href: "/siswa/profil" }),
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles?.includes(userRole)
  );

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const isActiveRoute = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const isActive = item.href ? isActiveRoute(item.href) : false;

    if (hasChildren) {
      return (
        <div key={item.title}>
          <button
            onClick={() => toggleExpanded(item.title)}
            className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors ${
              depth > 0 ? "pl-8" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span className="font-medium">{item.title}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {isExpanded && (
            <div className="!bg-slate-50">
              {item.children
                ?.filter((child) => child.roles?.includes(userRole))
                .map((child) => renderMenuItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.title}
        href={item.href || "#"}
        className={`flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors ${
          depth > 0 ? "pl-8" : ""
        } ${
          isActive
            ? "bg-blue-100 text-blue-600 border-r-2 border-blue-600"
            : "text-slate-700 hover:bg-slate-100"
        }`}
        onClick={() => setIsOpen(false)}
      >
        {item.icon}
        <span className="font-medium">{item.title}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile menu button - Hidden since we use bottom navigation */}
      <button onClick={() => setIsOpen(!isOpen)} className="hidden">
        {isOpen ? (
          <X className="h-6 w-6 text-slate-800" />
        ) : (
          <Menu className="h-6 w-6 text-slate-800" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white/95 backdrop-blur-sm shadow-xl z-40 transition-transform duration-300 ease-in-out border-r border-slate-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 hidden lg:block`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h1 className="text-xl font-bold text-slate-800">Jurnal PKL</h1>
          <p className="text-sm text-slate-600 capitalize">
            {userRole} Dashboard
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <div className="py-4">
            {filteredMenuItems.map((item) => renderMenuItem(item))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-red-50 to-pink-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 hover:shadow-sm"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
