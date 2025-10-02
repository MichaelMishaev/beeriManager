# Google Drive Integration Setup

This guide explains how to set up Google Drive integration for protocol document uploads.

## Overview

The application uses Google Drive API with a Service Account to automatically upload protocol documents to a specific folder in Google Drive when users drag and drop files.

## Prerequisites

- Google Cloud Console access
- Google Drive folder where documents will be stored

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note the project ID

### 2. Enable Google Drive API

1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Drive API"
3. Click **Enable**

### 3. Create a Service Account

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **Service Account**
3. Fill in the details:
   - Service account name: `beeri-protocols-uploader`
   - Service account ID: `beeri-protocols-uploader`
   - Description: `Service account for uploading protocol documents to Google Drive`
4. Click **Create and Continue**
5. Skip optional steps and click **Done**

### 4. Create and Download Service Account Key

1. In the **Service Accounts** list, click on the service account you just created
2. Go to the **Keys** tab
3. Click **Add Key** > **Create new key**
4. Select **JSON** format
5. Click **Create** - a JSON file will be downloaded

The JSON file contains:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "beeri-protocols-uploader@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

### 5. Create Google Drive Folder

1. Go to [Google Drive](https://drive.google.com/)
2. Create a new folder for protocol documents (e.g., "BeeriManager Protocols")
3. Right-click the folder and select **Share**
4. Add the service account email (from step 4, `client_email` field)
5. Give it **Editor** permissions
6. Click **Share**

### 6. Get the Folder ID

The folder ID is in the URL when you open the folder:
```
https://drive.google.com/drive/folders/FOLDER_ID_HERE
```

Copy the `FOLDER_ID_HERE` part.

### 7. Configure Environment Variables

Add these variables to your `.env.local` file:

```bash
# Google Drive API Configuration
GOOGLE_DRIVE_CLIENT_EMAIL=beeri-protocols-uploader@your-project.iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_PROTOCOLS_FOLDER_ID=FOLDER_ID_HERE
```

**Important Notes:**
- Copy the `client_email` from the JSON file
- Copy the entire `private_key` including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` parts
- Keep the `\n` characters in the private key - they are important!
- Wrap the private key in double quotes

### 8. Test the Integration

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Go to http://localhost:4500/he/admin/protocols/new

3. Try dragging and dropping a PDF file

4. Check your Google Drive folder - the file should appear there

5. The form should receive a Google Drive URL that you can save with the protocol

## How It Works

1. User drags and drops a file into the FileUpload component
2. File is sent to `/api/upload/google-drive` API route
3. API route authenticates with Google Drive using service account credentials
4. File is uploaded to the specified folder
5. File permissions are set to "anyone with link can view"
6. Google Drive returns a shareable URL
7. URL is saved in the protocol's `document_url` or `attachment_urls` field

## Troubleshooting

### "Google Drive not configured" error
- Check that all three environment variables are set correctly
- Restart the development server after adding environment variables

### "Failed to upload file" error
- Verify the service account has Editor permissions on the folder
- Check that the folder ID is correct
- Ensure the private key is properly formatted with `\n` characters

### Files upload but are not visible
- Check folder permissions in Google Drive
- Verify the service account email was added as an Editor
- Check the folder ID is correct

## Security Notes

- Never commit the service account JSON file or `.env.local` to git
- Keep the private key secure
- Use different service accounts for development and production
- Regularly rotate service account keys
- Limit folder access to only the service account and necessary users

## Production Deployment

For production (Vercel, Railway, etc.):

1. Add the same environment variables in your hosting platform's settings
2. Use a different Google Drive folder for production
3. Create a separate service account for production (recommended)
4. Ensure the private key is properly escaped when adding to environment variables
