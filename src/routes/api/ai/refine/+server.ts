import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchUserIdFromAccessToken } from '$lib/server/supabaseUser';
import { hashEmbedding } from '$lib/server/hashEmbed';
import { isQdrantConfigured, searchDiaryPoints } from '$lib/server/qdrant';
import { eliceChatCompletion } from '$lib/server/elice';

function buildMemoryBlock(results: Array<{ payload?: any }>) {
	const snippets = results
		.map((r) => r.payload)
		.filter(Boolean)
		.map((p: any) => {
			const title = p.title ? `Judul: ${p.title}\n` : '';
			const mood = p.mood ? `Mood: ${p.mood}\n` : '';
			const content = String(p.content ?? '').slice(0, 800);
			return `---\n${title}${mood}${content}`;
		});

	return snippets.length ? `\n\nMEMORI USER (ringkas):\n${snippets.join('\n')}` : '';
}

export const POST: RequestHandler = async ({ request }) => {
	const auth = request.headers.get('authorization') ?? '';
	const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : '';

	const body = (await request.json().catch(() => null)) as
		| { diaryEntryId?: string; content: string; mood?: string; persona?: string }
		| null;
	if (!body?.content) return json({ error: 'Bad Request' }, { status: 400 });

	let memory = '';
	if (token && isQdrantConfigured()) {
		const userId = await fetchUserIdFromAccessToken(token);
		const results = await searchDiaryPoints({
			userId,
			vector: hashEmbedding(body.content),
			limit: 5,
			excludeId: body.diaryEntryId
		});
		memory = buildMemoryBlock(results);
	}

	const prompt = [
		'Kamu adalah Bisik, pendamping journaling yang hangat, empatik, dan tidak menghakimi.',
		'Tugasmu: revisi jurnal user agar lebih rapi, tetap menjaga maksud aslinya, dan lebih mudah dibaca.',
		'Output format:',
		'REFINED: <teks revisi>',
		'SUMMARY: <ringkasan 1-2 kalimat>'
	].join('\n');

	const content = await eliceChatCompletion({
		messages: [
			{ role: 'system', content: prompt },
			{
				role: 'user',
				content: `MOOD: ${body.mood ?? '-'}\n\nJURNAL:\n${body.content}${memory}`
			}
		],
		maxTokens: 600,
		temperature: 0.5
	});

	const refinedMatch = content.match(/REFINED:\s*([\s\S]*?)\nSUMMARY:\s*([\s\S]*)/i);
	const refined = refinedMatch ? refinedMatch[1].trim() : content.trim();
	const summary = refinedMatch ? refinedMatch[2].trim() : '';

	return json({ refined, summary });
};
