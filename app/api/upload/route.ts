import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Force dynamic rendering — env vars not available at build time
export const dynamic = 'force-dynamic';

// POST /api/upload
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const mailId = formData.get('mail_id') as string | null;

    if (!file || !mailId) {
      return NextResponse.json({ data: null, error: 'file and mail_id are required' }, { status: 400 });
    }

    const fileName = `${mailId}/${Date.now()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from('mail-attachments')
      .upload(fileName, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      return NextResponse.json({ data: null, error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from('mail-attachments')
      .getPublicUrl(fileName);

    const { data: attachmentData, error: dbError } = await supabase
      .from('mail_attachments')
      .insert({
        mail_id: mailId,
        file_name: file.name,
        file_url: publicUrlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ data: null, error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ data: attachmentData, error: null }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected server error';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}

// DELETE /api/upload?attachment_id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const attachmentId = searchParams.get('attachment_id');

    if (!attachmentId) {
      return NextResponse.json({ data: null, error: 'attachment_id is required' }, { status: 400 });
    }

    const { data: attachment, error: fetchError } = await supabase
      .from('mail_attachments')
      .select('file_url')
      .eq('id', attachmentId)
      .single();

    if (fetchError || !attachment) {
      return NextResponse.json({ data: null, error: 'Attachment not found' }, { status: 404 });
    }

    try {
      const url = new URL(attachment.file_url);
      const storagePath = url.pathname.split('/object/public/mail-attachments/')[1];
      if (storagePath) {
        await supabase.storage.from('mail-attachments').remove([storagePath]);
      }
    } catch {
      // If storage removal fails, continue to remove the DB record
    }

    const { error: deleteError } = await supabase
      .from('mail_attachments')
      .delete()
      .eq('id', attachmentId);

    if (deleteError) {
      return NextResponse.json({ data: null, error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ data: { id: attachmentId }, error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected server error';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
