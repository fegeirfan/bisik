import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isQdrantConfigured, ensureCollection } from '$lib/server/qdrant';
import { eliceChatCompletion } from '$lib/server/elice';

export const GET: RequestHandler = async ({ url }) => {
	const live = url.searchParams.get('live') === '1';

	const status: Record<string, unknown> = {
		ok: true,
		qdrantConfigured: isQdrantConfigured(),
		eliceConfigured: true
	};

	if (!live) {
		return json(status);
	}

	try {
		if (isQdrantConfigured()) {
			await ensureCollection();
			status.qdrant = 'ok';
		} else {
			status.qdrant = 'skipped';
		}
	} catch (error) {
		status.qdrant = error instanceof Error ? error.message : 'qdrant_error';
		status.ok = false;
	}

	try {
		const reply = await eliceChatCompletion({
			messages: [
				{ role: 'system', content: 'Reply with: OK' },
				{ role: 'user', content: 'ping' }
			],
			maxTokens: 5,
			temperature: 0
		});
		status.elice = reply.slice(0, 40);
	} catch (error) {
		status.elice = error instanceof Error ? error.message : 'elice_error';
		status.ok = false;
	}

	return json(status);
};

