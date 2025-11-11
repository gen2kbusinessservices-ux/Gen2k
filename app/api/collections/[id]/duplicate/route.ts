import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// POST: Duplicate collection
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the original collection
    const { data: original, error: fetchError } = await supabase
      .from('collections')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (fetchError) throw fetchError;
    
    if (!original) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }
    
    // Generate unique slug
    let newSlug = `${original.slug}-copy`;
    let counter = 1;
    
    while (true) {
      const { data: existing } = await supabase
        .from('collections')
        .select('id')
        .eq('slug', newSlug)
        .single();
      
      if (!existing) break;
      
      newSlug = `${original.slug}-copy-${counter}`;
      counter++;
    }
    
    // Create duplicate
    const { data: duplicate, error: createError } = await supabase
      .from('collections')
      .insert({
        title: `${original.title} (Copy)`,
        slug: newSlug,
        description: original.description,
        seo_title: original.seo_title,
        seo_description: original.seo_description,
        category_id: original.category_id,
        images: original.images,
        is_published: false, // Set to unpublished by default
        order: original.order + 1,
      })
      .select()
      .single();
    
    if (createError) throw createError;
    
    return NextResponse.json(
      { collection: duplicate, message: 'Collection duplicated successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to duplicate collection' },
      { status: 500 }
    );
  }
}
