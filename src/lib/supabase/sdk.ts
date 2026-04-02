import { createClient } from '@supabase/supabase-js';
import { supabaseAnonKey, supabaseUrl } from '$lib/supabase/client';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: true
	}
});

