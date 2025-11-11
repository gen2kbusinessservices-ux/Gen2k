import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// POST: Upload images
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const formData = await request.formData();
    
    const files = formData.getAll('files') as File[];
    const collectionId = formData.get('collection_id') as string;
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }
    
    const uploadedImages: any[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const fileName = `${collectionId || 'temp'}_${timestamp}_${randomString}`;
      
      // Read file as buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Upload original file (we'll optimize on client side for now)
      const fullPath = `${fileName}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(fullPath, buffer, {
          contentType: file.type,
          upsert: true,
        });
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(fullPath);
      
      uploadedImages.push({
        url: publicUrl,
        thumbnail_url: publicUrl, // Will be replaced with actual thumbnail
        alt: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        width: 0,
        height: 0
      });
    }
    
    return NextResponse.json({
      images: uploadedImages,
      message: `${uploadedImages.length} image(s) uploaded successfully`
    }, { status: 200 });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload images' },
      { status: 500 }
    );
  }
}
