# Deployment Checklist

## Pre-Deployment Setup

### ✅ Step 1: Database Setup (CRITICAL)

- [ ] Opened Supabase SQL Editor
- [ ] Copied and ran entire `supabase-setup.sql` script
- [ ] Verified "Success" message appeared
- [ ] Checked tables were created: `collections`, `categories`, `settings`, `analytics`

### ✅ Step 2: Storage Setup

- [ ] Created `portfolio-images` storage bucket
- [ ] Enabled **public access** for the bucket
- [ ] Set file size limit to 50MB
- [ ] Created all 4 storage policies (SELECT, INSERT, UPDATE, DELETE)

### ✅ Step 3: Admin User

- [ ] Created admin user in Supabase Auth
- [ ] Enabled "Auto Confirm User" toggle
- [ ] Saved admin credentials securely

### ✅ Step 4: Environment Variables

Verify `.env.local` contains:
```
NEXT_PUBLIC_SUPABASE_URL=https://melliunqrbsurjmxmgxh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### ✅ Step 5: Test Locally

- [ ] Run `yarn dev`
- [ ] Access http://localhost:3000 (public site)
- [ ] Access http://localhost:3000/admin/login
- [ ] Sign in with admin credentials
- [ ] Create test category
- [ ] Upload test collection with images
- [ ] Verify images appear on public site

---

## Deployment to Netlify

### Prerequisites
- [ ] GitHub account
- [ ] Netlify account
- [ ] Code pushed to GitHub repository

### Deployment Steps

1. **Connect Repository**
   - [ ] Sign in to Netlify
   - [ ] Click "Add new site" → "Import an existing project"
   - [ ] Connect to GitHub and select repository

2. **Configure Build Settings**
   ```
   Build command: yarn build
   Publish directory: .next
   ```

3. **Set Environment Variables**
   Go to Site Settings → Environment Variables, add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://melliunqrbsurjmxmgxh.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
   SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
   ```

4. **Install Next.js Plugin**
   - [ ] Netlify should auto-detect and install `@netlify/plugin-nextjs`
   - [ ] If not, add it in Site Settings → Build & Deploy → Build Plugins

5. **Deploy**
   - [ ] Click "Deploy site"
   - [ ] Wait for build to complete
   - [ ] Access your live site!

### Post-Deployment Verification

- [ ] Public site loads correctly
- [ ] Admin login works
- [ ] Can create/edit collections
- [ ] Image uploads work
- [ ] Published collections appear on public site
- [ ] Categories filter works
- [ ] Analytics tracking works

---

## Alternative Deployment (Vercel)

1. **Connect Repository**
   - [ ] Sign in to Vercel
   - [ ] Import GitHub repository

2. **Framework Preset**
   - [ ] Vercel auto-detects Next.js

3. **Environment Variables**
   Add same variables as Netlify:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   ```

4. **Deploy**
   - [ ] Click "Deploy"
   - [ ] Access live site

---

## Custom Domain Setup

### On Netlify
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Configure DNS records as instructed

### On Vercel
1. Go to Project Settings → Domains
2. Add domain
3. Configure DNS records

---

## Post-Launch Tasks

### Content
- [ ] Upload all portfolio collections
- [ ] Add proper descriptions and SEO metadata
- [ ] Categorize projects appropriately
- [ ] Publish collections when ready

### SEO
- [ ] Submit sitemap to Google Search Console
- [ ] Verify Open Graph tags work (share on social media)
- [ ] Add custom favicon if needed

### Maintenance
- [ ] Set up monitoring/analytics
- [ ] Schedule regular backups of Supabase data
- [ ] Review and respond to performance metrics

---

## Troubleshooting Deployment

### Build Fails
- **Check**: Environment variables are set correctly
- **Check**: All dependencies in package.json
- **Solution**: Review build logs for specific errors

### Images Not Loading
- **Check**: Storage bucket has public access
- **Check**: Storage policies are set correctly
- **Solution**: Verify URLs in browser DevTools Network tab

### 500 Errors on API Routes
- **Check**: SUPABASE_SERVICE_ROLE_KEY is set
- **Check**: Database tables exist
- **Solution**: Check Netlify/Vercel function logs

### Authentication Not Working
- **Check**: NEXT_PUBLIC_SUPABASE_ANON_KEY is correct
- **Check**: Admin user exists in Supabase
- **Solution**: Test with Supabase directly first

---

## Rollback Plan

If deployment fails:
1. Revert to previous GitHub commit
2. Redeploy from working commit
3. Check deployment logs for errors
4. Fix issues in development first
5. Push and redeploy

---

## Performance Optimization

### After Deployment
- [ ] Enable Netlify/Vercel CDN
- [ ] Configure caching headers
- [ ] Monitor Core Web Vitals
- [ ] Optimize largest images if needed

### Supabase Optimization
- [ ] Monitor database queries
- [ ] Add indexes if queries are slow
- [ ] Check storage usage
- [ ] Review API usage and rate limits

---

## Security Checklist

- [ ] Changed default admin password
- [ ] Service role key kept secret (never in client code)
- [ ] RLS policies verified
- [ ] HTTPS enabled on domain
- [ ] Regular security updates scheduled

---

## Success Criteria

Your deployment is successful when:
- ✅ Public portfolio site loads fast
- ✅ Admin can log in and manage content
- ✅ Images upload and display correctly  
- ✅ SEO metadata is working
- ✅ Analytics tracking functions
- ✅ No console errors on client or server
- ✅ Mobile responsive design works

---

## Support Resources

- **Netlify Docs**: https://docs.netlify.com/
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs

**Ready to deploy? Good luck! 🚀**
