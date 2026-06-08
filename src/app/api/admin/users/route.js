import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find({}).sort({ role: 1 }).lean();
    return NextResponse.json({ success: true, data: users ?? [] });
  } catch (error) {
    console.error("[GET_USERS_API_ERROR]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await dbConnect();
    const { userId, role, isApproved, subscriptionActive } = await req.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 });
    }

    const updates = {};
    if (role !== undefined) updates.role = role;
    if (isApproved !== undefined) updates.isApproved = Boolean(isApproved);
    if (subscriptionActive !== undefined) updates.subscriptionActive = Boolean(subscriptionActive);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("[PATCH_USER_API_ERROR]", error);
    return NextResponse.json({ success: false, error: "Failed to update user", details: error?.message }, { status: 500 });
  }
}
