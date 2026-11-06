import { afterAll, describe, expect, it } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
const url = process.env['SUPABASE_URL'];
const key = process.env['SUPABASE_SERVICE_ROLE_KEY'];
const pub = process.env['SUPABASE_PUBLISHABLE_KEY'];
function client(k: string) {
  if (!url) throw new Error('Missing test configuration');
  return createClient<Database>(url, k, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
    const headers = new Headers(init?.headers); if (k.startsWith('sb_') && headers.get('Authorization') === `Bearer ${k}`) headers.delete('Authorization'); headers.set('apikey', k); return fetch(input, { ...init, headers });
  } } });
}
const admin = url && key ? client(key) : null;
const ids: string[] = [];
let path = '';
afterAll(async () => { if (!admin) return; if (path) await admin.storage.from('nixora-uploads').remove([path]); for (const id of ids) { await admin.from('studio_uploads').delete().eq('user_id', id); await admin.auth.admin.deleteUser(id); } });
describe.skipIf(!admin || !pub)('private upload ownership', () => {
  it('reads own file, denies another user and denies owner role escalation', async () => {
    if (!admin || !pub) throw new Error('Integration configuration missing');
    const actors = [];
    for (let i = 0; i < 2; i++) {
      const email = `storage-fixture-${crypto.randomUUID()}@example.invalid`, password = crypto.randomUUID();
      const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
      if (created.error || !created.data.user) throw new Error('Fixture creation failed');
      ids.push(created.data.user.id); const actor = client(pub);
      const login = await actor.auth.signInWithPassword({ email, password }); if (login.error) throw new Error('Fixture sign-in failed');
      actors.push(actor);
    }
    const first = actors[0], second = actors[1], firstId = ids[0];
    if (!first || !second || !firstId) throw new Error('Fixtures missing');
    path = `${firstId}/fixture/pixel.png`;
    const bytes = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII='), c => c.charCodeAt(0));
    expect((await first.storage.from('nixora-uploads').upload(path, bytes, { contentType: 'image/png' })).error).toBeNull();
    expect((await first.from('studio_uploads').insert({ user_id: firstId, name: 'pixel.png', path, mime_type: 'image/png', size_bytes: bytes.length, engine: 'Test' })).error).toBeNull();
    expect((await first.from('studio_uploads').select('id').eq('path', path)).data).toHaveLength(1);
    expect((await first.storage.from('nixora-uploads').download(path)).error).toBeNull();
    expect((await second.from('studio_uploads').select('id').eq('path', path)).data).toEqual([]);
    expect((await second.storage.from('nixora-uploads').download(path)).error).not.toBeNull();
    expect((await second.rpc('has_role', { _user_id: ids[1] ?? '', _role: 'owner' })).data).toBe(false);
    expect((await second.from('user_roles').insert({ user_id: ids[1] ?? '', role: 'owner' })).error).not.toBeNull();
  }, 30000);
});