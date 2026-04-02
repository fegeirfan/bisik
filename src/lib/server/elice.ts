import { ELICE_API_BASE_URL, ELICE_API_KEY } from '$env/static/private';

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

function candidateChatCompletionsUrls() {
	if (!ELICE_API_BASE_URL) throw new Error('ELICE_API_BASE_URL belum diisi.');
	const base = ELICE_API_BASE_URL.replace(/\/+$/, '');

	if (base.endsWith('/v1/chat/completions')) return [base];
	if (base.includes('/v1/')) return [base];

	// Support both interpretations:
	// - ELICE_API_BASE_URL is already the full endpoint (mlapi.run/<uuid>)
	// - ELICE_API_BASE_URL is a base URL and needs /v1/chat/completions appended
	return [base, `${base}/v1/chat/completions`];
}

export async function eliceChatCompletion(args: {
	messages: ChatMessage[];
	maxTokens?: number;
	temperature?: number;
}) {
	if (!ELICE_API_KEY) throw new Error('ELICE_API_KEY belum diisi.');

	let response: Response | null = null;
	let lastText = '';

	const urls = candidateChatCompletionsUrls();
	for (const url of urls) {
		response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${ELICE_API_KEY}`
			},
			body: JSON.stringify({
				model: 'openai/gpt-oss-20b',
				messages: args.messages,
				max_tokens: args.maxTokens ?? 512,
				temperature: args.temperature ?? 0.6
			})
		});

		if (response.ok) break;

		lastText = await response.text().catch(() => '');
		if (response.status === 404 && urls.length > 1) {
			// try the next candidate url
			continue;
		}

		break;
	}

	if (!response || !response.ok) {
		const status = response?.status ?? 0;
		throw new Error(`AI error (${status}). ${lastText || 'Unknown error'}`);
	}

	const json = (await response.json()) as any;
	const content: string | undefined = json?.choices?.[0]?.message?.content;
	if (!content) throw new Error('AI response kosong.');
	return content;
}
