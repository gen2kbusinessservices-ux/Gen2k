import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET: Fetch single collection
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase
      .from('collections')
      .select('*, category:categories(*)')
      .eq('id', params.id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ collection: data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}

// PUT: Update collection
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    
    const {
      title,
      slug,
      description,
      seo_title,
      seo_description,
      category_id,
      images,
      is_published,
      order
    } = body;
    
    // Check if slug is being changed and if it conflicts
    if (slug) {
      const { data: existing } = await supabase
        .from('collections')
        .select('id')
        .eq('slug', slug)
        .neq('id', params.id)
        .single();
      
      if (existing) {
        return NextResponse.json(
          { error: 'A collection with this slug already exists' },
          { status: 409 }
        );
      }
    }
    
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (seo_title !== undefined) updateData.seo_title = seo_title;
    if (seo_description !== undefined) updateData.seo_description = seo_description;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (images !== undefined) updateData.images = images;
    if (is_published !== undefined) updateData.is_published = is_published;
    if (order !== undefined) updateData.order = order;
    
    const { data, error } = await supabase
      .from('collections')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({ collection: data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update collection' },
      { status: 500 }
    );
  }
}

// DELETE: Delete collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get collection to delete its images from storage
    const { data: collection } = await supabase
      .from('collections')
      .select('images')
      .eq('id', params.id)
      .single();
    
    // Delete images from storage
    if (collection && collection.images && Array.isArray(collection.images)) {
      for (const image of collection.images) {
        if (image.url) {
          // Extract path from URL
          const urlParts = image.url.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const thumbFileName = fileName.replace('.jpg', '_thumb.jpg');
          
          // Delete both full and thumbnail
          await supabase.storage.from('portfolio-images').remove([fileName, thumbFileName]);
        }
      }
    }
    
    // Delete collection from database
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', params.id);
    
    if (error) throw error;
    
    return NextResponse.json(
      { message: 'Collection deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete collection' },
      { status: 500 }
    );
  }
}
