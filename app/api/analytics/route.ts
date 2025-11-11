import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// POST: Track analytics event
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    
    const { collection_id, event_type } = body;
    
    if (!collection_id || !event_type) {
      return NextResponse.json(
        { error: 'collection_id and event_type are required' },
        { status: 400 }
      );
    }
    
    // Insert analytics event
    const { error: analyticsError } = await supabase
      .from('analytics')
      .insert({
        collection_id,
        event_type,
      });
    
    if (analyticsError) throw analyticsError;
    
    // If it's a view event, increment the collection's view_count
    if (event_type === 'view') {
      const { error: updateError } = await supabase.rpc('increment_view_count', {
        collection_id_param: collection_id
      });
      
      // If the function doesn't exist, manually increment
      if (updateError) {
        const { data: collection } = await supabase
          .from('collections')
          .select('view_count')
          .eq('id', collection_id)
          .single();
        
        if (collection) {
          await supabase
            .from('collections')
            .update({ view_count: (collection.view_count || 0) + 1 })
            .eq('id', collection_id);
        }
      }
    }
    
    return NextResponse.json({ message: 'Event tracked' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to track event' },
      { status: 500 }
    );
  }
}

// GET: Fetch analytics summary
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collection_id');
    const days = parseInt(searchParams.get('days') || '30');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    let query = supabase
      .from('analytics')
      .select('*')
      .gte('created_at', startDate.toISOString());
    
    if (collectionId) {
      query = query.eq('collection_id', collectionId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Group by event type
    const summary: Record<string, number> = {};
    data?.forEach((event: any) => {
      summary[event.event_type] = (summary[event.event_type] || 0) + 1;
    });
    
    // Get top viewed collections
    const { data: topCollections } = await supabase
      .from('collections')
      .select('id, title, view_count')
      .order('view_count', { ascending: false })
      .limit(10);
    
    return NextResponse.json({
      summary,
      topCollections: topCollections || [],
      totalEvents: data?.length || 0,
      period: `${days} days`
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
