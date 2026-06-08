import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const userSchema = new mongoose.Schema({
  email: String,
  isApproved: Boolean,
  role: String,
  permissions: [String]
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function approveUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB...");
    
    const users = await User.find({});
    console.log("Users in DB:", users);
    process.exit(0);
  } catch (error) {
    console.error("Error approving users:", error);
    process.exit(1);
  }
}

approveUsers();
