import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/dashboards/LogoutButton";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const userRole = session?.user?.role || session?.user?.tier;
  const isApproved = session?.user?.isApproved;

  // Block unapproved users
  if (!isApproved) {
    return (
      <div className="min-h-screen bg-[#070913] flex flex-col items-center justify-center text-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-500 flex items-center justify-center rounded-full mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4">Pending Approval</h1>
        <p className="text-slate-400 max-w-md mb-8">
          Your account has been successfully linked via Google, but you are currently awaiting Master Control approval. Please contact an administrator to activate your access.
        </p>
        <LogoutButton />
      </div>
    );
  }

  // Define sidebar links dynamically based on JWT permissions
  const permissions = session?.user?.permissions || [];
  
  const getNavLinks = (perms) => {
    let links = [];

    // Master Control
    if (perms.includes("ACCESS_MASTER_CONTROL")) {
      links.push(
        { name: "System Overview", href: "/dashboard?tab=overview", icon: "overview" },
        { name: "Users & SaaS Roles", href: "/dashboard?tab=users", icon: "users" }
      );
    }
    
    // Frontline IN/OUT
    if (perms.includes("ACCESS_IN_OUT")) {
      links.push(
        { name: "Quick Log", href: "/dashboard?tab=logs", icon: "logs" },
        { name: "IN / OUT Actions", href: "/dashboard", icon: "inout" }
      );
    }

    // Kitchen Ledger & BoM
    if (perms.includes("ACCESS_KITCHEN_LEDGER")) {
      links.push({ name: "Kitchen Ledger", href: "/dashboard?tab=kitchen", icon: "kitchen" });
    }
    if (perms.includes("ACCESS_BOM")) {
      links.push({ name: "BoM Calculator", href: "/dashboard?tab=bom", icon: "bom" });
    }

    // Sales & Quotes
    if (perms.includes("ACCESS_QUOTES")) {
      links.push(
        { name: "Active Quotes", href: "/dashboard?tab=quotes", icon: "quotes" },
        { name: "Generate Quote", href: "/dashboard?tab=new-quote", icon: "new-quote" }
      );
    }

    // Vendors
    if (perms.includes("ACCESS_VENDORS")) {
      links.push({ name: "Vendor Ledger", href: "/dashboard?tab=vendors", icon: "vendors" });
    }

    // Fallback if no permissions (or just pending role)
    if (links.length === 0) {
      links.push({ name: "Dashboard Overview", href: "/dashboard", icon: "dashboard" });
    }

    return links;
  };

  const navLinks = getNavLinks(permissions);

  return (
    <div className="min-h-screen bg-[#070913] flex font-sans text-slate-200">
      {/* Left Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex-col hidden md:flex z-20">
        {/* App Logo */}
        <div className="h-20 flex items-center px-8 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-bold text-lg leading-none">R</span>
            </div>
            <span className="text-md font-bold text-white tracking-wide">RVR Catering</span>
          </div>
        </div>

        {/* Dynamic Sidebar Links */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          <div className="px-4 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {userRole} Workspace
          </div>
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-400 hover:bg-slate-800/40 hover:text-slate-100 font-medium text-sm"
            >
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-slate-800/60">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {children}
      </div>
    </div>
  );
}
