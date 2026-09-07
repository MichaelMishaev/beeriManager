# Deployment Guide - BeeriManager

## Production Environment

### Hosting Information
- **Platform**: Railway
- **Domain**: http://pipguru.club
- **Port**: 10000 (configured in Railway)
- **Environment**: Production

### Domain Configuration
The custom domain `pipguru.club` is configured in Railway's networking settings:
- Primary domain: signals-nextjs-production.up.railway.app
- Custom domain: pipguru.club
- Port mapping: 10000 → Metal Edge

### Environment Variables (Railway)

Set these in Railway's dashboard under Variables:

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=http://pipguru.club
NEXT_PUBLIC_APP_NAME=BeeriManager
NODE_ENV=production

# Supabase
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>

# Authentication
JWT_SECRET=<your-jwt-secret>
ADMIN_PASSWORD_HASH=<bcrypt-hashed-password>

# Google Calendar (Optional)
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_CALENDAR_ID=<your-calendar-id>

# Push Notifications (Optional)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<your-vapid-public-key>
VAPID_PRIVATE_KEY=<your-vapid-private-key>
VAPID_SUBJECT=mailto:<your-email>
```

## Deployment Process

### Automatic Deployment
Railway automatically deploys from the connected GitHub repository:
1. Push to main branch
2. Railway detects changes
3. Builds Next.js application
4. Deploys to pipguru.club

### Manual Deployment
If needed, redeploy manually:
1. Go to Railway dashboard
2. Select the project
3. Click "Deploy" → "Redeploy"

## Build Configuration

### Railway Build Settings
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Node Version**: 20.x (from package.json engines)
- **Install Command**: `npm install`

### Next.js Configuration
- Server-side rendering enabled
- PWA with offline support
- RTL layout for Hebrew
- Static optimization where possible

## DNS Configuration

### Current Setup
```
Domain: pipguru.club
DNS Provider: (Your DNS provider)
Railway Endpoint: Metal Edge
Port: 10000
```

### DNS Records Required
```
CNAME: pipguru.club → signals-nextjs-production.up.railway.app
```

## Database (Supabase)

### Connection
- Hosted on Supabase Cloud
- PostgreSQL 15+
- Connection pooling enabled
- SSL required

### Tables
- events
- tasks
- responsibilities
- issues
- protocols
- committees
- anonymous_feedback
- app_settings

## Monitoring & Health Checks

### Railway Health Check
Railway automatically monitors:
- Application uptime
- Response times
- Error rates

### Manual Checks
1. **Homepage**: http://pipguru.club
2. **API Health**: http://pipguru.club/api/health (if implemented)
3. **Admin Panel**: http://pipguru.club/admin

## Performance Optimization

### Caching Strategy
- Static assets cached via CDN
- Service Worker for offline support
- PWA caching configured in `next.config.js`

### Image Optimization
- Next.js Image component used throughout
- Automatic WebP conversion
- Responsive image serving

## Troubleshooting

### Common Issues

**1. 404 Errors**
- Check Railway deployment logs
- Verify build completed successfully
- Check Next.js routing configuration

**2. Environment Variables Not Working**
- Verify variables set in Railway dashboard
- Rebuild after adding new variables
- Check variable names match code

**3. Database Connection Issues**
- Verify Supabase credentials
- Check IP allowlist in Supabase
- Test connection from Railway logs

**4. Domain Not Resolving**
- Verify DNS records
- Check Railway domain configuration
- Allow 24-48h for DNS propagation

### Viewing Logs
```bash
# In Railway dashboard:
# 1. Select project
# 2. Click "Deployments"
# 3. Select deployment
# 4. View "Logs" tab
```

## Rollback Procedure

If deployment fails:
1. Go to Railway dashboard
2. Find previous successful deployment
3. Click "Redeploy"
4. Monitor logs for success

## Security

### Headers
Security headers configured in `next.config.js`:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### Authentication
- JWT-based admin authentication
- Bcrypt password hashing
- Environment-based secrets

## Backup & Recovery

### Database Backups
- Supabase automatic daily backups
- Point-in-time recovery available
- Manual backups via Supabase dashboard

### Application Backups
- Source code in GitHub
- Railway deployment history
- Environment variables documented

## Update Checklist

Before deploying updates:
- [ ] Test locally with production build
- [ ] Update environment variables if needed
- [ ] Run type checking: `npm run type-check`
- [ ] Run linting: `npm run lint`
- [ ] Update database schema if needed
- [ ] Test PWA functionality
- [ ] Verify RTL layout works
- [ ] Test on mobile devices
- [ ] Push to GitHub main branch
- [ ] Monitor Railway deployment
- [ ] Verify deployment at pipguru.club
- [ ] Check logs for errors

## Contact & Support

### Railway Support
- Dashboard: https://railway.app
- Documentation: https://docs.railway.app
- Status Page: https://status.railway.app

### Project Team
- Developer: [Your Name]
- Repository: [GitHub URL]
