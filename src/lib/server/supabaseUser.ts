import { supabaseRequest } from '$lib/supabase/client';

export async function fetchUserIdFromAccessToken(accessToken: string) {
	const user = await supabaseRequest<{ id: string }>('/auth/v1/user', { token: accessToken });
	return user.id;
}

