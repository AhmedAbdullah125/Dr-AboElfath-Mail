import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { CreateMailInput } from '@/lib/types';

// GET /api/mails?category=inbox
export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  let query = supabase
    .from('mails')
    .select(`
      *,
      attachments:mail_attachments(*)
    `)
    .order('mail_date', { ascending: false })
    .order('mail_time', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, error: null });
}

// POST /api/mails
export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  const body: CreateMailInput = await request.json();

  const { subject, category, from_address, to_address, mail_date, mail_time, body: mailBody } = body;

  if (!subject || !category || !from_address || !to_address || !mail_date || !mail_time) {
    return NextResponse.json({ data: null, error: 'Missing required fields' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('mails')
    .insert({
      subject,
      category,
      from_address,
      to_address,
      mail_date,
      mail_time,
      body: mailBody || '',
    })
    .select(`*, attachments:mail_attachments(*)`)
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, error: null }, { status: 201 });
}
