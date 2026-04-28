import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Flutterwave webhook:', JSON.stringify(body));

    if (body.event === 'charge.completed' && body.data.status === 'successful') {
      const email = body.data.customer.email;
      const ref = body.data.tx_ref;
      const amount = body.data.amount;
      const currency = body.data.currency;

      // Save subscriber to Supabase
      const { error } = await supabase
        .from('subscribers')
        .upsert({
          email,
          is_pro: true,
          paid_at: new Date().toISOString(),
          payment_ref: ref,
          currency,
          amount
        }, { onConflict: 'email' });

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log('Subscriber saved:', email);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
