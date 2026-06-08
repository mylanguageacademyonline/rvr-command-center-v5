import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

export async function POST(req) {
  try {
    const body = await req.json();
    const { base64Image, mimeType = 'image/jpeg', fileName = 'receipt.jpg' } = body;

    if (!base64Image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Initialize Google Drive API
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-service-account.json',
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });
    
    // Parse base64
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    const fileMetadata = {
      name: `${Date.now()}_${fileName}`,
      parents: folderId ? [folderId] : undefined,
    };

    const media = {
      mimeType: mimeType,
      body: stream,
    };

    // Upload to Drive
    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    // Make it readable to anyone with link (optional, depends on your permission setup)
    // For receipts, we might just keep it restricted to the service account & folder owner, 
    // but the webViewLink is returned.
    await drive.permissions.create({
      fileId: file.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return NextResponse.json({ 
      success: true, 
      fileId: file.data.id,
      url: file.data.webViewLink 
    });

  } catch (error) {
    console.error('Google Drive Upload Error:', error);
    return NextResponse.json({ error: 'Failed to upload to Google Drive' }, { status: 500 });
  }
}
