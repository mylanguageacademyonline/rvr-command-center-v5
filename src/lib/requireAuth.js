import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

export async function requireAuth(requiredPermissions = []) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (!session.user.isApproved) {
    return { error: NextResponse.json({ error: "Forbidden: Account Pending Approval" }, { status: 403 }) };
  }

  // If specific permissions are required, check them
  if (requiredPermissions.length > 0) {
    const userPerms = session.user.permissions || [];
    const hasPerm = requiredPermissions.some(perm => userPerms.includes(perm));
    
    // Master Control users override everything
    if (!hasPerm && !userPerms.includes("ACCESS_MASTER_CONTROL")) {
      return { error: NextResponse.json({ error: "Forbidden: Insufficient Permissions" }, { status: 403 }) };
    }
  }

  return { session };
}
