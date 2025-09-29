# 🚀 BeeriManager - How to Launch

## Quick Start (5 minutes)

### 1. Clone and Setup
```bash
cd /Users/michaelmishayev/Desktop/Projects/beeriManager
npm install
```

### 2. Environment Variables
Create `.env.local` file in project root:
```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:4500
NEXT_PUBLIC_APP_NAME=BeeriManager

# Authentication (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
ADMIN_PASSWORD_HASH=your-bcrypt-hashed-admin-password

# Optional
NODE_ENV=development
```

### 3. Generate Admin Password Hash
```bash
# Run this once to generate admin password hash
npm run dev
# Then visit http://localhost:4500/api/generate-hash?password=YourAdminPassword
# Copy the hash to ADMIN_PASSWORD_HASH in .env.local
```

### 4. Setup Database
```bash
# Run database migrations (if using Supabase locally)
npm run db:migrate

# OR use the SQL files in supabase/migrations/ in Supabase dashboard
```

### 5. Launch Development Server
```bash
npm run dev
```

Open [http://localhost:4500](http://localhost:4500) in your browser!

---

## Complete Setup Guide

### Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works)
- Basic understanding of environment variables

### Database Setup (Supabase)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your Project URL and API Keys

2. **Run Database Migrations**
   ```sql
   -- Copy contents of supabase/migrations/001_core_tables.sql
   -- Copy contents of supabase/migrations/002_extended_features.sql
   -- Copy contents of supabase/migrations/003_advanced_features.sql
   -- Run each in Supabase SQL Editor
   ```

3. **Enable Row Level Security**
   - Go to Authentication > Policies
   - Verify RLS is enabled on all tables

### Environment Variables Explained

```env
# Supabase URLs and Keys (get from Supabase dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:4500  # Change for production
NEXT_PUBLIC_APP_NAME=BeeriManager

# JWT Secret (generate a strong random string)
JWT_SECRET=your-very-long-random-secret-string-min-32-chars

# Admin Password (generate with bcrypt)
ADMIN_PASSWORD_HASH=$2b$10$abcdefghijklmnopqrstuvwxyz

# Development
NODE_ENV=development
```

### Generate Secure Admin Password

Option 1 - Using Node.js:
```bash
node -e "
const bcrypt = require('bcryptjs');
const password = 'YourStrongAdminPassword123!';
const hash = bcrypt.hashSync(password, 10);
console.log('ADMIN_PASSWORD_HASH=' + hash);
"
```

Option 2 - Using online bcrypt generator (not recommended for production)

### File Structure Check
Ensure these files exist:
```
beeriManager/
├── .env.local (you create this)
├── package.json ✅
├── next.config.js ✅
├── tailwind.config.ts ✅
├── src/
│   ├── app/
│   │   ├── layout.tsx ✅
│   │   ├── page.tsx (create this)
│   │   ├── (auth)/login/page.tsx ✅
│   │   └── api/ ✅
│   ├── components/ ✅
│   ├── lib/ ✅
│   └── middleware.ts ✅
└── supabase/migrations/ ✅
```

---

## Production Deployment

### 1. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 2. Set Production Environment Variables
```bash
# Set each environment variable in Vercel
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add JWT_SECRET
vercel env add ADMIN_PASSWORD_HASH
vercel env add NEXT_PUBLIC_APP_URL  # Set to your domain
```

### 3. Update App URL
Change `NEXT_PUBLIC_APP_URL` to your production domain:
```env
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## Testing the Setup

### 1. Basic Functionality Test
- [ ] Homepage loads at http://localhost:4500
- [ ] Login page accessible at http://localhost:4500/login
- [ ] Can login with admin password
- [ ] Dashboard shows (even with empty data)
- [ ] Can logout successfully

### 2. API Endpoints Test
- [ ] GET http://localhost:4500/api/dashboard/stats returns data
- [ ] GET http://localhost:4500/api/events returns empty array
- [ ] POST to create events works (when logged in)

### 3. Database Test
- [ ] Can connect to Supabase
- [ ] Tables exist and are accessible
- [ ] RLS policies are working

---

## Troubleshooting

### Common Issues

**"Module not found" errors:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Database connection fails:**
- Check Supabase project is active
- Verify environment variables are correct
- Check internet connection

**Login doesn't work:**
- Verify ADMIN_PASSWORD_HASH is correctly generated
- Check JWT_SECRET is set and long enough
- Check browser network tab for API errors

**Build fails:**
```bash
# Check TypeScript errors
npm run type-check

# Check for missing dependencies
npm install --production=false
```

**PWA not installing:**
- Verify HTTPS in production
- Check manifest.json is accessible
- Verify service worker registration

### Debug Commands
```bash
# Check environment variables
npm run env-check

# Test database connection
npm run db-test

# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build
```

---

## Default Admin Access

- **Login URL:** http://localhost:4500/login
- **Default Password:** Set by you in environment variables
- **Features Available:**
  - Dashboard with stats
  - Event management
  - Task management
  - Issue tracking
  - Basic admin functionality

---

## Next Steps After Launch

### Phase 1 (Week 1)
1. Add sample data for testing
2. Create first real events
3. Test on mobile devices
4. Share with committee members

### Phase 2 (Month 1)
1. Add more advanced features
2. Integrate with WhatsApp
3. Set up automated backups
4. Train committee members

### Phase 3 (Ongoing)
1. Monitor usage and performance
2. Add requested features
3. Regular data backups
4. Security updates

---

## Support & Maintenance

### Regular Tasks
- [ ] Weekly: Check error logs
- [ ] Monthly: Database backup
- [ ] Quarterly: Update dependencies
- [ ] Yearly: Review and update passwords

### Monitoring
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://app.supabase.com
- Error Tracking: Check Vercel function logs

### Emergency Contacts
- Vercel Support: support@vercel.com
- Supabase Support: support@supabase.io
- Developer: [Your contact info]

---

## Security Checklist

### Pre-Launch
- [ ] All passwords are strong and unique
- [ ] Environment variables are secured
- [ ] RLS policies are enabled
- [ ] HTTPS enforced in production
- [ ] Admin access properly protected

### Post-Launch
- [ ] Monitor for unusual activity
- [ ] Regular security updates
- [ ] Backup data regularly
- [ ] Review access logs monthly

---

*Last updated: December 2024*
*BeeriManager v1.0.0*