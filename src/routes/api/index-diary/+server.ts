import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchUserIdFromAccessToken } from '$lib/server/supabaseUser';
import { hashEmbedding } from '$lib/server/hashEmbed';
import { isQdrantConfigured, upsertDiaryPoint } from '$lib/server/qdrant';

export const POST: RequestHandler = async ({ request }) => {
	const auth = request.headers.get('authorization') ?? '';
	const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : '';
	if (!token) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const body = (await request.json().catch(() => null)) as
		| {
				diaryEntryId: string;
				content: string;
				title?: string | null;
				mood?: string | null;
				createdAt?: string | null;
		  }
		| null;

	if (!body?.diaryEntryId || !body.content) {
		return json({ error: 'Bad Request' }, { status: 400 });
	}

	const userId = await fetchUserIdFromAccessToken(token);
	const vector = hashEmbedding(body.content);

	if (!isQdrantConfigured()) {
		return json({ ok: true, skipped: 'qdrant_not_configured' });
	}

	await upsertDiaryPoint({
		id: body.diaryEntryId,
		vector,
		payload: {
			user_id: userId,
			diary_entry_id: body.diaryEntryId,
			title: body.title ?? null,
			mood: body.mood ?? null,
			created_at: body.createdAt ?? null,
			content: body.content.slice(0, 4000)
		}
	});

	return json({ ok: true });
};
