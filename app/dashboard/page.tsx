"use client";

import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ProfileTab } from "@/components/profile-tab";
import { EventList } from "@/components/event-list";
import { UserManagementTab } from "@/components/user-management-tab";

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    redirect("/");
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileTab />;
      case "events":
        return profile?.role === "admin" ? <EventList /> : <ProfileTab />;
      case "users":
        return profile?.role === "admin" ? (
          <UserManagementTab />
        ) : (
          <ProfileTab />
        );
      default:
        return <ProfileTab />;
    }
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      user={{
        name: profile?.full_name || user.email || "",
        email: user.email || "",
        image: profile?.avatar_url || "",
        role: profile?.role || "user",
      }}
    >
      {renderTabContent()}
    </DashboardLayout>
  );
}
