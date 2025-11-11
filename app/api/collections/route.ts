import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET: Fetch all collections
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');
    const categoryId = searchParams.get('category_id');
    
    let query = supabase
      .from('collections')
      .select('*, category:categories(*)');
    
    if (published === 'true') {
      query = query.eq('is_published', true);
    }
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    const { data, error } = await query.order('order', { ascending: true });
    
    if (error) throw error;
    
    return NextResponse.json({ collections: data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

// POST: Create new collection
export async function POST(request: NextRequest) {
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
    
    // Validate required fields
    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      );
    }
    
    // Check if slug already exists
    const { data: existing } = await supabase
      .from('collections')
      .select('id')
      .eq('slug', slug)
      .single();
    
    if (existing) {
      return NextResponse.json(
        { error: 'A collection with this slug already exists' },
        { status: 409 }
      );
    }
    
    const { data, error } = await supabase
      .from('collections')
      .insert({
        title,
        slug,
        description: description || '',
        seo_title: seo_title || title,
        seo_description: seo_description || description || '',
        category_id: category_id || null,
        images: images || [],
        is_published: is_published || false,
        order: order || 0,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({ collection: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create collection' },
      { status: 500 }
    );
  }
}
