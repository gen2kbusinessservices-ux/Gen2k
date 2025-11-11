# JVA Designs - Premium Architecture Portfolio CMS

A modern, performant CMS-based portfolio web application for architecture firms, built with Next.js, Tailwind CSS, Framer Motion, and Supabase.

## Features

- **Pinterest-style Masonry Grid** with automatic layout
- **Smooth Image Slideshow** on hover/tap using Framer Motion
- **Floating Hamburger Menu** with category filtering
- **Admin Dashboard** for managing collections and categories
- **Image Optimization** with automatic compression and thumbnails
- **SEO Optimized** with meta tags and Open Graph data
- **Responsive Design** adapting to mobile (2x2 grid) and desktop
- **Preloader Animation** with JVA Designs branding
- **Premium Design** with Apple-level elegance

## Tech Stack

- **Frontend**: Next.js 13, React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Supabase (Auth, Database, Storage)
- **Deployment**: Netlify

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

3. Set up Supabase:
   - Create a new Supabase project at https://supabase.com
   - The database schema is already created (tables: categories, collections, settings)
   - Create a storage bucket named "portfolio-images" with public access
   - Create an admin user via Supabase Auth

4. Configure environment variables:

Create a \`.env.local\` file in the root directory:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

5. Run the development server:

\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000)

### Admin Access

1. Navigate to `/admin/login`
2. Sign in with your Supabase Auth credentials
3. Access the dashboard at `/admin/dashboard`

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
