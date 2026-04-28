import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ isPro: false });

    const { data, error } = await supabase
      .from('subscribers')
      .select('is_pro')
      .eq('email', email)
      .single();

    if (error || !data) return NextResponse.json({ isPro: false });
    return NextResponse.json({ isPro: data.is_pro });
  } catch (err: any) {
    return NextResponse.json({ isPro: false });
  }
}
