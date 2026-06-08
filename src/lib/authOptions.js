import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Role from "@/models/Role";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      await dbConnect();
      
      const email = user.email;
      if (!email) return false;

      // Check if user exists in the database
      let dbUser = await User.findOne({ email });

      // If user does not exist, auto-create
      if (!dbUser) {
        const userCount = await User.countDocuments();
        const isFirstUser = userCount === 0;

        dbUser = await User.create({
          email: email,
          role: isFirstUser ? "AgencyMaster" : "Pending",
          isApproved: isFirstUser,
        });
      }

      // Attach database role and approval status to the NextAuth user object
      user.role = dbUser.role;
      user.isApproved = dbUser.isApproved;
      user.id = dbUser._id.toString();

      // Fetch custom permissions for this role
      let roleDoc = await Role.findOne({ name: dbUser.role });
      
      // If the role is AgencyMaster, give them a wildcard or specific master perm
      if (dbUser.role === "AgencyMaster" || dbUser.role === "Master") {
          user.permissions = ["ACCESS_MASTER_CONTROL", "ACCESS_IN_OUT", "ACCESS_KITCHEN_LEDGER", "ACCESS_BOM", "ACCESS_QUOTES", "ACCESS_VENDORS"];
      } else {
          user.permissions = roleDoc ? roleDoc.permissions : [];
      }

      return true; // Always allow sign in, layout will block access if not approved
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.isApproved = user.isApproved;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.isApproved = token.isApproved;
        session.user.permissions = token.permissions || [];
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login', // Redirects unauthenticated users to our custom login page
  }
};
