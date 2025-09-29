# 🚀 Vercel Deployment Guide for BeeriManager

## Prerequisites
✅ GitHub repository connected to Vercel
✅ Supabase project created
✅ Admin password ready

## 🔐 Environment Variables to Set in Vercel

Go to your Vercel project settings → Environment Variables and add:

### Required Variables

```bash
# Supabase (from your Supabase project settings)
NEXT_PUBLIC_SUPABASE_URL=https://wkfxwnayexznjhcktwwu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your_anon_key]
SUPABASE_SERVICE_KEY=[your_service_role_key]

# Authentication (create your own)
JWT_SECRET=[generate_32+_char_secret]
ADMIN_PASSWORD=[your_admin_password]

# App URL (will be set automatically by Vercel)
NEXT_PUBLIC_APP_URL=[your-app].vercel.app
```

### Optional Variables (for Google Calendar sync)
```bash
NEXT_PUBLIC_GOOGLE_CALENDAR_ID=[your_calendar_id]@group.calendar.google.com
GOOGLE_CLIENT_EMAIL=[service_account]@[project].iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=[your_private_key]
```

## 📦 Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Deploy BeeriManager to Vercel"
git push origin main
```

### 2. Configure in Vercel Dashboard
1. Go to your Vercel dashboard
2. Import your GitHub repository (if not already)
3. Add all environment variables above
4. Deploy!

### 3. Post-Deployment Setup

#### Set up Supabase Storage Buckets
Run these SQL commands in Supabase SQL Editor:

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('documents', 'documents', true),
  ('protocols', 'protocols', true),
  ('issues', 'issues', true),
  ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (true);

CREATE POLICY "Authenticated upload" ON storage.objects
  FOR INSERT WITH CHECK (true);
```

#### Create First Admin User
After deployment, go to:
```
https://[your-app].vercel.app/login
```

Use the ADMIN_PASSWORD you set in environment variables.

## 🔧 Troubleshooting

### Build Errors
- Check all environment variables are set
- Verify Supabase keys are correct
- Ensure JWT_SECRET is at least 32 characters

### Database Connection Issues
- Check Supabase URL is correct
- Verify service role key has proper permissions
- Ensure database migrations ran successfully

### PWA Not Working
- Clear browser cache
- Check service worker is registered
- Verify manifest.json is accessible

## 📱 Testing the Deployment

1. **Public Pages** (no auth required):
   - `/` - Homepage
   - `/events` - Events list
   - `/calendar` - Calendar view
   - `/tasks` - Tasks dashboard
   - `/finances` - Financial transparency

2. **Admin Pages** (auth required):
   - `/admin` - Admin dashboard
   - `/admin/events/new` - Create event
   - `/admin/tasks/new` - Create task
   - `/admin/expenses/new` - Add expense

3. **PWA Installation**:
   - Open site on mobile
   - Click "Add to Home Screen"
   - App will work offline

## 🎉 Success Checklist

- [ ] Site loads at vercel.app URL
- [ ] Database connects successfully
- [ ] Admin login works
- [ ] Can create events/tasks
- [ ] Calendar displays properly
- [ ] Hebrew RTL layout correct
- [ ] Mobile responsive
- [ ] PWA installs on phone

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables
3. Check Supabase connection
4. Review browser console for errors

---

**Your BeeriManager is now live! 🎊**

Share with your parent committee:
```
https://[your-app].vercel.app
```