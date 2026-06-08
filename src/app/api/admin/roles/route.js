import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Role from "@/models/Role";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    await dbConnect();
    const roles = await Role.find({}).sort({ name: 1 }).lean();
    return NextResponse.json({ success: true, data: roles ?? [] });
  } catch (error) {
    console.error("[GET_ROLES_API_ERROR]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch roles" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "AgencyMaster" && session?.user?.role !== "Master") {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const { name, permissions } = await req.json();

    if (!name) {
      return NextResponse.json({ success: false, error: "Missing role name" }, { status: 400 });
    }

    const newRole = await Role.create({ name, permissions: permissions || [] });
    return NextResponse.json({ success: true, data: newRole });
  } catch (error) {
    console.error("[POST_ROLE_API_ERROR]", error);
    return NextResponse.json({ success: false, error: "Failed to create role", details: error?.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "AgencyMaster" && session?.user?.role !== "Master") {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const { roleId, permissions } = await req.json();

    if (!roleId) {
      return NextResponse.json({ success: false, error: "Missing roleId" }, { status: 400 });
    }

    const updatedRole = await Role.findByIdAndUpdate(
      roleId,
      { $set: { permissions } },
      { new: true, runValidators: true }
    );

    if (!updatedRole) {
        return NextResponse.json({ success: false, error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedRole });
  } catch (error) {
    console.error("[PATCH_ROLE_API_ERROR]", error);
    return NextResponse.json({ success: false, error: "Failed to update role", details: error?.message }, { status: 500 });
  }
}

export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "AgencyMaster" && session?.user?.role !== "Master") {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        }
    
        const { searchParams } = new URL(req.url);
        const roleId = searchParams.get('roleId');
        
        if (!roleId) {
            return NextResponse.json({ success: false, error: "Missing roleId" }, { status: 400 });
        }
    
        await dbConnect();
        await Role.findByIdAndDelete(roleId);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DELETE_ROLE_API_ERROR]", error);
        return NextResponse.json({ success: false, error: "Failed to delete role" }, { status: 500 });
    }
}
