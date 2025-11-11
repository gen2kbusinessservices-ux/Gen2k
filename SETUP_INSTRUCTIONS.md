# JVA Designs Portfolio - Setup Instructions

## Step 1: Database Setup

1. Go to your Supabase project: https://melliunqrbsurjmxmgxh.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase-setup.sql` file
5. Paste it into the SQL Editor
6. Click **Run** to execute the script
7. You should see a success message

## Step 2: Create Storage Bucket

1. In your Supabase dashboard, go to **Storage** in the left sidebar
2. Click **Create a new bucket**
3. Set the following:
   - **Name**: `portfolio-images`
   - **Public bucket**: Toggle ON (enable public access)
   - **File size limit**: 50 MB (recommended)
   - **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`
4. Click **Create bucket**

## Step 3: Set Storage Policies

1. In the Storage section, click on the `portfolio-images` bucket
2. Go to the **Policies** tab
3. Click **New Policy**
4. Create the following policies:

**Policy 1: Public Read Access**
- Policy name: `Public can view images`
- Allowed operation: SELECT
- Policy definition: `true`

**Policy 2: Authenticated Upload**
- Policy name: `Authenticated users can upload`
- Allowed operation: INSERT
- Policy definition: `(bucket_id = 'portfolio-images' AND auth.role() = 'authenticated')`

**Policy 3: Authenticated Update**
- Policy name: `Authenticated users can update`
- Allowed operation: UPDATE
- Policy definition: `(bucket_id = 'portfolio-images' AND auth.role() = 'authenticated')`

**Policy 4: Authenticated Delete**
- Policy name: `Authenticated users can delete`
- Allowed operation: DELETE
- Policy definition: `(bucket_id = 'portfolio-images' AND auth.role() = 'authenticated')`

## Step 4: Create Admin User

1. In your Supabase dashboard, go to **Authentication** > **Users**
2. Click **Add user** > **Create new user**
3. Enter your admin credentials:
   - **Email**: your-admin@email.com
   - **Password**: YourSecurePassword123!
   - **Auto Confirm User**: Toggle ON
4. Click **Create user**

## Step 5: Install Dependencies & Run Application

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The application will be available at: http://localhost:3000

## Step 6: Access Admin Dashboard

1. Navigate to: http://localhost:3000/admin/login
2. Sign in with the admin credentials you created in Step 4
3. You'll be redirected to the admin dashboard

## Features Overview

### Admin Dashboard Features:
- ✅ Create, edit, and delete collections
- ✅ Upload multiple images with automatic optimization
- ✅ Drag & drop image reordering within collections
- ✅ Duplicate collections for quick creation
- ✅ Bulk upload multiple collections
- ✅ Category management
- ✅ SEO metadata auto-generation
- ✅ Simple analytics (view tracking)
- ✅ Publish/unpublish collections

### Image Optimization:
- Thumbnails: 400x600px @ 80% quality (fast loading)
- Full-size: 2400px max @ 90% quality (detailed viewing)
- Automatic compression and storage

### Public Portfolio:
- Pinterest-style masonry grid
- Category filtering
- Image slideshow on hover
- Responsive design (mobile & desktop)
- SEO optimized

## Troubleshooting

**Issue: Cannot upload images**
- Check that the `portfolio-images` bucket exists
- Verify storage policies are set correctly
- Make sure you're signed in as an authenticated user

**Issue: Database errors**
- Verify the SQL script ran successfully
- Check that all tables were created
- Review the Supabase logs for errors

**Issue: Authentication not working**
- Confirm admin user was created
- Check that RLS policies are enabled
- Verify environment variables are correct

## Next Steps

1. Upload your first collection through the admin dashboard
2. Test the public portfolio view
3. Customize categories as needed
4. Configure SEO metadata for better search engine visibility

## Support

For issues or questions, check the Supabase documentation:
- https://supabase.com/docs
- https://supabase.com/docs/guides/storage
- https://supabase.com/docs/guides/auth
