import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

// Import dashboards
import FrontlineDashboard from "@/components/dashboards/FrontlineDashboard";
import AgencyMasterDashboard from "@/components/dashboards/AgencyMasterDashboard";
import SalesDashboard from "@/components/dashboards/SalesDashboard";
import HeadChefDashboard from "@/components/dashboards/HeadChefDashboard";
import SupportDashboard from "@/components/dashboards/SupportDashboard";
import MarketingDashboard from "@/components/dashboards/MarketingDashboard";

export default async function DashboardPage({ searchParams }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userRole = session?.user?.role || session?.user?.tier;

  switch (userRole) {
    case "Frontline":
      return <FrontlineDashboard searchParams={searchParams} />;
    case "AgencyMaster":
      return <AgencyMasterDashboard searchParams={searchParams} />;
    case "Sales":
    case "ClientAdmin":
      return <SalesDashboard searchParams={searchParams} />;
    case "HeadChef":
      return <HeadChefDashboard searchParams={searchParams} />;
    case "Support":
      return <SupportDashboard searchParams={searchParams} />;
    case "Marketing":
      return <MarketingDashboard searchParams={searchParams} />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
          <p className="text-gray-400">Unknown Role Detected. Access Denied.</p>
        </div>
      );
  }
}
