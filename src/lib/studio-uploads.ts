import { supabase } from '@/integrations/supabase/client';
import { validateStudioUpload } from './studio-core';

export async function saveStudioUpload(file: File, engine: string) {
  validateStudioUpload(file);
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error('Sign in to save files to your studio.');
  if (!data.user) return { saved: false as const };
  const path = `${data.user.id}/${crypto.randomUUID()}/${file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120) || 'upload'}`;
  const { error: uploadError } = await supabase.storage.from('nixora-uploads').upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw new Error('File upload failed. Please try again.');
  const { error: recordError } = await supabase.from('studio_uploads').insert({ user_id: data.user.id, path, name: file.name.slice(0, 255), mime_type: file.type, size_bytes: file.size, engine: engine.slice(0, 100) });
  if (recordError) { await supabase.storage.from('nixora-uploads').remove([path]); throw new Error('Your file could not be added to the library.'); }
  return { saved: true as const, path };
}
export async function studioFileLink(path: string) {
  const { data, error } = await supabase.storage.from('nixora-uploads').createSignedUrl(path, 60);
  if (error || !data) throw new Error('File access unavailable.');
  return data.signedUrl;
}
export async function deleteStudioUpload(id: string, path: string) {
  const { error } = await supabase.storage.from('nixora-uploads').remove([path]);
  if (error) throw new Error('File could not be deleted.');
  const { error: rowError } = await supabase.from('studio_uploads').delete().eq('id', id);
  if (rowError) throw new Error('File listing could not be removed.');
}