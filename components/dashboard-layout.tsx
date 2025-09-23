"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Calendar,
  Users,
  UserCircle,
  ChevronDown,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: "user" | "admin";
  };
}

export function DashboardLayout({
  children,
  activeTab,
  onTabChange,
  user,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { signOut } = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    signOut();
  };

  const userTabs = [{ id: "profile", label: "Profil", icon: UserCircle }];

  const adminTabs = [
    { id: "profile", label: "Profil", icon: UserCircle },
    { id: "events", label: "Manajemen Event", icon: Calendar },
    { id: "users", label: "Manajemen User", icon: Users },
  ];

  const tabs = user?.role === "admin" ? adminTabs : userTabs;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="flex h-16 items-center px-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>

          <div className="flex-1 flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">&lt;/&gt;</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">
                Madura<span className="text-purple-600">Dev</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                {user?.role === "admin"
                  ? "Dashboard Admin"
                  : "Dashboard Member"}
              </p>
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <Button
              variant="ghost"
              className="relative h-10 w-auto px-2 rounded-full flex items-center gap-2 hover:bg-gray-100"
              onClick={() => {
                console.log(
                  "[v0] Dropdown button clicked, current state:",
                  dropdownOpen
                );
                setDropdownOpen(!dropdownOpen);
              }}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user?.image || "/placeholder.svg"}
                  alt={user?.name || "User"}
                />
                <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </Button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-[9999] py-1">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name}
                    </p>
                    <p className="text-xs leading-none text-gray-500">
                      {user?.email}
                    </p>
                    <p className="text-xs leading-none text-purple-600 font-medium">
                      {user?.role === "admin" ? "Administrator" : "Member"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onTabChange("profile");
                    setDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  <span>Profil</span>
                </button>

                <button
                  onClick={() => setDropdownOpen(false)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Pengaturan</span>
                </button>

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Keluar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={`
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-sm border-r transition-transform duration-200 ease-in-out
          md:relative md:translate-x-0 md:block
          top-16 md:top-0
        `}
        >
          <nav className="flex flex-col gap-2 p-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  className={`justify-start ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                      : "hover:bg-purple-50"
                  }`}
                  onClick={() => {
                    onTabChange(tab.id);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {tab.label}
                </Button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
