"use client";

import { useSearchParams } from "next/navigation";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { InstructorDashboard } from "@/components/dashboard/instructor-dashboard";
import { useSessionGuard } from "@/hooks/useSessionGuard"
import { AdminDashboardWithSidebar } from "@/components/dashboard/admin-dashboard-with-sidebar";

export default function DashboardPage() {
  const params = useSearchParams();
  const { authorized, role, name } = useSessionGuard("admin")
  
  // Create a user object from the available data
  const user = { role, name };

  if (authorized === null) return <p>Checking access...</p>
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-500">Access Denied: Admins only</p>
      </div>
    )
  }

  switch (role) {
    case "admin":
     return <AdminDashboardWithSidebar />;
    case "instructor":
      return <InstructorDashboard user={user} />;
    case "student":
    default:
      return <StudentDashboard user={user} />;
  }
}