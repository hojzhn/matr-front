import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

/**
 * Server-only Supabase client using the SERVICE ROLE key.
 *
 * Files under `lib/server/**` are guaranteed by SvelteKit never to be bundled
 * into client code, so the privileged key stays secret. The service role
 * bypasses Row Level Security — the `submissions` table has RLS enabled with no
 * policies, so only this trusted server path can read/write it.
 *
 * Read lazily (not at module load) so a build without env vars doesn't crash,
 * and so `$env/dynamic/private` is resolved at runtime on Vercel.
 */
let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
	if (client) return client;

	const url = env.SUPABASE_URL;
	const key = env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !key) {
		throw new Error('Supabase is not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
	}

	client = createClient(url, key, { auth: { persistSession: false } });
	return client;
}

/** Storage bucket holding uploaded artwork images. */
export const SUBMISSIONS_BUCKET = 'submissions';
