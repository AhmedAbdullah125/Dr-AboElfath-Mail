import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { UpdateMailInput } from '@/lib/types';

// GET /api/mails/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('mails')
    .select(`*, attachments:mail_attachments(*)`)
    .eq('id', params.id)
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 404 });
  }

  return NextResponse.json({ data, error: null });
}

// PUT /api/mails/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient();
  const body: UpdateMailInput = await request.json();

  const { id, ...updates } = body;

  const { data, error } = await supabase
    .from('mails')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .select(`*, attachments:mail_attachments(*)`)
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, error: null });
}

// DELETE /api/mails/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient();

  // Delete attachments from storage first
  const { data: attachments } = await supabase
    .from('mail_attachments')
    .select('file_url, file_name')
    .eq('mail_id', params.id);

  if (attachments && attachments.length > 0) {
    const paths = attachments.map((a) => {
      const url = new URL(a.file_url);
      return url.pathname.split('/object/public/mail-attachments/')[1];
    });
    await supabase.storage.from('mail-attachments').remove(paths);
  }

  const { error } = await supabase.from('mails').delete().eq('id', params.id);

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: { id: params.id }, error: null });
}
