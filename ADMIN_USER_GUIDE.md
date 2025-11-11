# JVA Designs Admin User Guide

## Quick Start Guide

### 1. Complete Database Setup (IMPORTANT - Do This First!)

Before using the admin dashboard, you MUST set up your Supabase database:

1. **Open Supabase SQL Editor**
   - Go to: https://app.supabase.com/project/melliunqrbsurjmxmgxh/sql
   - Sign in to your Supabase account

2. **Run the Database Setup Script**
   - Open the file `/app/supabase-setup.sql` in this project
   - Copy the ENTIRE contents of the file
   - Paste it into the Supabase SQL Editor
   - Click the **"Run"** button (green play button)
   - Wait for confirmation: "Success. No rows returned"

3. **Create Storage Bucket**
   - Go to: https://app.supabase.com/project/melliunqrbsurjmxmgxh/storage/buckets
   - Click **"New bucket"**
   - Settings:
     - Name: `portfolio-images`
     - Public: **Toggle ON** (enable public access)
     - File size limit: 50 MB
   - Click **"Create bucket"**

4. **Set Storage Policies**
   - Click on the `portfolio-images` bucket
   - Go to **"Policies"** tab
   - Click **"New policy"** and create these 4 policies:

   **Policy 1: Public Read**
   ```
   Name: Public can view images
   Operation: SELECT
   Policy: true
   ```

   **Policy 2: Authenticated Upload**
   ```
   Name: Authenticated upload
   Operation: INSERT
   Policy: (bucket_id = 'portfolio-images' AND auth.role() = 'authenticated')
   ```

   **Policy 3: Authenticated Update**
   ```
   Name: Authenticated update
   Operation: UPDATE  
   Policy: (bucket_id = 'portfolio-images' AND auth.role() = 'authenticated')
   ```

   **Policy 4: Authenticated Delete**
   ```
   Name: Authenticated delete
   Operation: DELETE
   Policy: (bucket_id = 'portfolio-images' AND auth.role() = 'authenticated')
   ```

### 2. Create Admin User

1. Go to: https://app.supabase.com/project/melliunqrbsurjmxmgxh/auth/users
2. Click **"Add user"** → **"Create new user"**
3. Enter your credentials:
   - Email: your-email@example.com
   - Password: YourSecurePassword123!
   - **IMPORTANT**: Toggle **"Auto Confirm User"** to ON
4. Click **"Create user"**

### 3. Access Admin Dashboard

1. Navigate to: http://localhost:3000/admin/login
2. Sign in with the credentials you created
3. You'll be redirected to the admin dashboard

---

## Admin Dashboard Features

### Collections Management

#### Create a New Collection

1. Click **"Collections"** tab
2. Click **"New Collection"** button
3. Fill in the details:
   - **Title**: Enter collection name (slug auto-generates)
   - **Slug**: URL-friendly identifier (auto-filled, editable)
   - **Description**: Describe the project
   - **Category**: Select from dropdown (optional)
   - **Publish**: Check to make it visible on public site
4. **Upload Images**:
   - Click the upload area or drag & drop images
   - Multiple images supported
   - Images are automatically optimized:
     - Thumbnails: 400x600px @ 80% quality
     - Full-size: 2400px max @ 90% quality
   - **Drag to reorder** images after upload
   - Edit alt text for each image
5. Click **"Save Collection"**

#### Edit Collection

1. Find the collection card
2. Click **"Edit"** button
3. Make your changes
4. Click **"Save Collection"**

#### Duplicate Collection

1. Find the collection card
2. Click **"Duplicate"** button
3. A copy is created with "(Copy)" appended to title
4. The duplicate is unpublished by default
5. Edit the copy as needed

#### Delete Collection

1. Find the collection card
2. Click **"Delete"** button
3. Confirm the deletion
4. **Note**: This also deletes associated images from storage

#### Image Management Features

- **Drag & Drop Reordering**: Grab the grip icon and drag images to reorder
- **Alt Text Editing**: Click on alt text field to edit SEO-friendly descriptions
- **Multiple Uploads**: Upload multiple images at once (batch upload)
- **Image Preview**: Hover over images to see full preview

### Categories Management

#### Create a Category

1. Click **"Categories"** tab
2. Click **"New Category"** button
3. Fill in:
   - **Name**: Category name
   - **Slug**: URL-friendly identifier (auto-generates)
4. Click **"Save Category"**

#### Edit Category

1. Find the category in the table
2. Click the **Edit** icon
3. Make changes
4. Click **"Save Category"**

#### Delete Category

1. Find the category in the table
2. Click the **Delete** icon
3. **Note**: Cannot delete categories with existing collections

### Analytics

View performance metrics:
- **Total Views**: Number of collection views
- **Total Collections**: Count of all collections
- **Published**: Number of published collections
- **Top Viewed Collections**: Ranked list of most viewed projects

---

## SEO Features (Automatic)

The system automatically generates SEO-friendly content:

1. **URL Slugs**: Auto-generated from titles (e.g., "Modern House" → "modern-house")
2. **SEO Titles**: Optimized titles with brand name
3. **Meta Descriptions**: Auto-generated or custom
4. **Image Alt Text**: Descriptive alt text for each image
5. **Duplicate Prevention**: System ensures unique slugs

---

## Tips & Best Practices

### Image Optimization
- ✅ Upload high-quality images (system optimizes automatically)
- ✅ Use descriptive filenames (helps with alt text generation)
- ✅ Recommended: 3-8 images per collection
- ✅ Supported formats: JPG, PNG, WEBP

### Content Guidelines
- ✅ Write clear, descriptive titles
- ✅ Include detailed descriptions (helps with SEO)
- ✅ Assign appropriate categories
- ✅ Use "Draft" mode to prepare collections before publishing

### Performance
- ✅ Keep image files under 10MB each (system handles compression)
- ✅ Use categories to organize large portfolios
- ✅ Regular use of analytics to understand what content performs best

---

## Troubleshooting

### "Failed to upload images"
- **Solution**: Check storage bucket exists and has correct policies
- Verify you're signed in as authenticated user

### "Cannot create collection"
- **Solution**: Ensure database tables were created (run SQL script)
- Check that slug is unique

### "Images not showing on public site"
- **Solution**: Ensure collection is **Published** (checkbox)
- Verify storage bucket has public access enabled

### "Cannot delete category"
- **Solution**: Remove or reassign all collections in that category first

### Login Issues
- **Solution**: Verify admin user was created in Supabase Auth
- Check "Auto Confirm User" was enabled
- Try password reset if needed

---

## Keyboard Shortcuts

- **Drag Images**: Click and hold grip icon to reorder
- **Quick Save**: After editing, click "Save" button
- **Close Modal**: Click X or press ESC key

---

## Support & Resources

- **Supabase Dashboard**: https://app.supabase.com/project/melliunqrbsurjmxmgxh
- **Storage Management**: Check storage bucket usage and files
- **Database**: View and query your data directly
- **Authentication**: Manage admin users and access

---

## Security Notes

- ✅ Only authenticated users can access admin dashboard
- ✅ Public users can only view published collections
- ✅ All image uploads are stored securely in Supabase
- ✅ Database uses Row Level Security (RLS) policies
- ✅ Change your admin password regularly

---

## What's Next?

1. ✅ Complete database setup
2. ✅ Create admin user
3. ✅ Sign in to admin dashboard
4. ✅ Create your first category
5. ✅ Upload your first collection
6. ✅ Publish and view on public site
7. ✅ Monitor analytics to track performance

**Happy Portfolio Management! 🎨**
