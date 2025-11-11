# JVA Designs - Premium Architecture Portfolio CMS

A modern, performant CMS-based portfolio web application for architecture firms, built with Next.js, Tailwind CSS, Framer Motion, and Supabase.

## ✨ Features

### Public Portfolio
- **Pinterest-style Masonry Grid** with automatic layout
- **Smooth Image Slideshow** on hover/tap using Framer Motion
- **Floating Hamburger Menu** with category filtering
- **Responsive Design** adapting to mobile (2x2 grid) and desktop
- **Preloader Animation** with JVA Designs branding
- **SEO Optimized** with meta tags and Open Graph data

### Admin Dashboard
- **Full CRUD Operations** for collections and categories
- **Image Upload & Optimization** (thumbnails: 400x600px @ 80%, full-size: 2400px @ 90%)
- **Drag & Drop Image Reordering** within collections
- **Duplicate Collections** for quick creation
- **Bulk Upload** multiple collections
- **SEO Automation** (auto-generate slugs, alt text, meta descriptions)
- **Simple Analytics** with view tracking
- **Publish/Unpublish** toggle for collections
- **Category Management** with collection counts

### Automation
- Automatic slug generation from titles
- Smart image optimization (thumbnails + full-size)
- Auto-generated SEO metadata
- Image alt text generation
- Unique slug validation

## 🛠 Tech Stack

- **Frontend**: Next.js 13, React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **UI Components**: Radix UI, Lucide Icons
- **Backend**: Supabase (Auth, Database, Storage)
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage with automatic optimization
- **Deployment**: Netlify / Vercel

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Yarn (recommended) or npm
- Supabase account

### Installation

1. **Install Dependencies**
   \`\`\`bash
   yarn install
   \`\`\`

2. **Set Up Supabase Database** (CRITICAL!)
   - Go to: https://app.supabase.com/project/melliunqrbsurjmxmgxh/sql
   - Copy contents of `/app/supabase-setup.sql`
   - Paste and run in SQL Editor
   - Verify success message

3. **Create Storage Bucket**
   - Go to: https://app.supabase.com/project/melliunqrbsurjmxmgxh/storage
   - Create bucket: `portfolio-images`
   - Enable public access
   - Set up 4 storage policies (see SETUP_INSTRUCTIONS.md)

4. **Create Admin User**
   - Go to: https://app.supabase.com/project/melliunqrbsurjmxmgxh/auth/users
   - Add user with email/password
   - Enable "Auto Confirm User"

5. **Environment Variables**
   
   Already configured in `.env.local`:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=https://melliunqrbsurjmxmgxh.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[configured]
   SUPABASE_SERVICE_ROLE_KEY=[configured]
   \`\`\`

6. **Run Development Server**
   \`\`\`bash
   yarn dev
   \`\`\`

7. **Access Application**
   - Public site: http://localhost:3000
   - Admin login: http://localhost:3000/admin/login
   - Admin dashboard: http://localhost:3000/admin/dashboard

## 📚 Documentation

- **[SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)** - Complete setup guide
- **[ADMIN_USER_GUIDE.md](ADMIN_USER_GUIDE.md)** - How to use the admin dashboard
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Deploy to Netlify/Vercel

## 🎯 Quick Reference

### Admin Login
- URL: http://localhost:3000/admin/login
- Use credentials created in Supabase Auth

### Create Collection
1. Go to admin dashboard
2. Click "New Collection"
3. Fill in title, description
4. Upload images (drag & drop supported)
5. Assign category (optional)
6. Toggle "Publish" when ready
7. Click "Save"

### Image Optimization
- **Thumbnails**: 400x600px @ 80% quality
- **Full-size**: 2400px max @ 90% quality
- Automatic compression on upload

## Deployment to Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Install the Next.js plugin: Netlify will automatically detect and install `@netlify/plugin-nextjs`
4. Configure environment variables in Netlify:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
5. Deploy!

Note: The project uses Next.js with server-side rendering. Make sure the Netlify Next.js plugin is installed for proper deployment.

## Project Structure

\`\`\`
├── app/
│   ├── page.tsx              # Homepage with masonry grid
│   ├── contact/              # Contact page
│   ├── admin/
│   │   ├── login/           # Admin login
│   │   └── dashboard/       # Admin dashboard
│   └── layout.tsx           # Root layout with metadata
├── components/
│   ├── MasonryGrid.tsx      # Main grid component
│   ├── FloatingMenu.tsx     # Hamburger menu
│   └── Preloader.tsx        # Loading animation
├── contexts/
│   └── AuthContext.tsx      # Authentication context
├── lib/
│   ├── supabase.ts          # Supabase client
│   └── imageUtils.ts        # Image compression utilities
└── public/                   # Static assets
\`\`\`

## Brand Identity

- **Primary Color**: #bbd922 (lime green)
- **Secondary**: Grey tones
- **Background**: White
- **Text**: Black
- **Design**: Minimalist, rounded corners, subtle shadows

## Performance Optimizations

- Lazy-loaded images with progressive loading
- Optimized thumbnails and full-size images
- Static site generation where possible
- Framer Motion animations with GPU acceleration
- Responsive image sizes

## Future Enhancements

- Dark mode support
- Analytics integration
- Client testimonials section
- Advanced filtering and search
- Multi-language support
- Blog functionality

## License

Proprietary - JVA Designs

## Support

For support, email info@jvadesigns.com
