import { NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";
import fs from "fs";
import path from "path";

export async function POST(request) {
  try {
    const { imageBase64, mimeType, fileName } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "Missing imageBase64 data" }, { status: 400 });
    }

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || "./google-service-account.json";
    
    // Resolve absolute path to service account key statically to prevent Turbopack warning
    const absoluteCredsPath = path.join(/*turbopackIgnore: true*/ process.cwd(), credsPath.startsWith('./') ? credsPath.substring(2) : credsPath);
    
    // Perform Google Drive upload if credentials and folder ID are configured
    if (fs.existsSync(absoluteCredsPath) && folderId) {
      try {
        const auth = new google.auth.GoogleAuth({
          keyFile: absoluteCredsPath,
          scopes: ["https://www.googleapis.com/auth/drive.file"],
        });
        
        const drive = google.drive({ version: "v3", auth });
        
        // Clean Base64 prefix
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(cleanBase64, "base64");
        
        // Convert Buffer to Stream
        const mediaStream = new Readable();
        mediaStream.push(buffer);
        mediaStream.push(null);
        
        const fileMetadata = {
          name: fileName || `receipt-${Date.now()}.jpg`,
          parents: [folderId],
        };
        
        const media = {
          mimeType: mimeType || "image/jpeg",
          body: mediaStream,
        };
        
        const driveResponse = await drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: "id, name, webViewLink",
        });
        
        return NextResponse.json({
          success: true,
          message: "Receipt uploaded to Google Drive successfully",
          data: {
            status: "Google Drive Upload Complete",
            fileId: driveResponse.data.id,
            fileName: driveResponse.data.name,
            webViewLink: driveResponse.data.webViewLink
          }
        });
      } catch (uploadError) {
        console.error("Google Drive upload failed. Falling back to local storage:", uploadError.message);
      }
    }
    
    // Fallback: Store locally in public/uploads/ for frictionless development
    try {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");
      const name = fileName || `receipt-${Date.now()}.jpg`;
      
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const filePath = path.join(uploadDir, name);
      fs.writeFileSync(filePath, buffer);
      
      return NextResponse.json({
        success: true,
        message: "Google Drive environment variables not configured. Saved to local uploads fallback.",
        data: {
          status: "Local Storage Fallback Complete",
          fileName: name,
          localPath: `/uploads/${name}`,
          webViewLink: `/uploads/${name}`
        }
      });
    } catch (localError) {
      console.error("Local fallback storage failed:", localError.message);
      return NextResponse.json({ error: "Storage engine failure: unable to write local file." }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
