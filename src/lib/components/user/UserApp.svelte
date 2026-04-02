<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import AuroraBackground from '$lib/components/chrome/AuroraBackground.svelte';
	import BottomNav from '$lib/components/chrome/BottomNav.svelte';
	import Header from '$lib/components/chrome/Header.svelte';
	import ChatSection from '$lib/components/sections/ChatSection.svelte';
	import HomeSection from '$lib/components/sections/HomeSection.svelte';
	import TimelineSection from '$lib/components/sections/TimelineSection.svelte';
	import WriteSection from '$lib/components/sections/WriteSection.svelte';
	import { initialEntries, moods, personas, starterReplies } from '$lib/data/diary';
	import {
		loginWithGoogle,
		logout,
		restoreSession
	} from '$lib/supabase/auth';
	import {
		createDiaryEntry,
		createRefinedJournal,
		fetchDiaryEntries,
		fetchPersonas,
		fetchProfile,
		saveSelectedPersona,
		updateLastSeen
	} from '$lib/supabase/diary';
	import type {
		AppView,
		ChatMessage,
		DiaryEntry,
		MoodValue,
		PersonaOption,
		RefinedJournal
	} from '$lib/types/diary';
	import type { SupabaseSession } from '$lib/types/supabase';
	import { isSupabaseConfigured } from '$lib/supabase/client';
	import { buildRefinedJournal } from '$lib/utils/refined';
	import { buildInsight, countStreak, createId, getGreeting, getMoodMeta } from '$lib/utils/diary';

	let activeView = $state<AppView>('write');
	let selectedPersona = $state<PersonaOption>(personas[0]);
	let availablePersonas = $state<PersonaOption[]>([...personas]);
	let isPersonaOpen = $state(false);
	let draftTitle = $state('');
	let draftContent = $state('');
	let selectedMood = $state<MoodValue | undefined>(undefined);
	let showHint = $state(false);
	let chatInput = $state('');
	let entries = $state<DiaryEntry[]>([...initialEntries]);
	let guestRefined = $state<RefinedJournal | null>(null);
	let chatMessages = $state<ChatMessage[]>([
		{
			id: createId('chat'),
			role: 'user',
			content: initialEntries[0].content,
			timestamp: initialEntries[0].createdAt,
			mood: initialEntries[0].mood
		}
	]);
	let expandedIds = $state(new Set<string>([initialEntries[0].id]));
	let isTyping = $state(false);
	let hintTimer: ReturnType<typeof setTimeout> | undefined;
	let replyTimer: ReturnType<typeof setTimeout> | undefined;
	let starterReplyIndex = 0;
	let chatSeeded = $state(false);
	let session = $state<SupabaseSession | null>(null);
	let authError = $state('');
	let authLoading = $state(false);
	let bootLoading = $state(true);
	let syncMessage = $state('');

	const greeting = $derived(getGreeting());
	const latestEntry = $derived(entries[0]);
	const currentMoodMeta = $derived(getMoodMeta(latestEntry?.mood ?? 'neutral'));
	const streak = $derived(countStreak(entries));
	const recentInsight = $derived(latestEntry?.insight ?? 'Kamu sedang membangun ruang aman untuk dirimu sendiri.');
	const trail = $derived(entries.slice(0, 14).map((entry) => getMoodMeta(entry.mood)).reverse());

	function navigate(view: AppView) {
		if (!session && view === 'timeline') return;

		activeView = view;
		isPersonaOpen = false;

		if (view === 'chat' && !chatSeeded) {
			chatSeeded = true;
			queueAssistantReply(starterReplies[starterReplyIndex++ % starterReplies.length]);
		}
	}

	function selectPersona(persona: PersonaOption) {
		selectedPersona = persona;
		isPersonaOpen = false;
		if (session) {
			void persistPersona(persona.id);
		}
	}

	function updateDraftContent(value: string) {
		draftContent = value;
		const shouldShowHint = value.trim().length > 80;

		if (shouldShowHint) {
			showHint = true;
			clearTimeout(hintTimer);
			hintTimer = setTimeout(() => {
				showHint = false;
			}, 4000);
		}
	}

	function chooseMood(mood: MoodValue) {
		selectedMood = mood;
	}

	function chooseQuickMood(mood: MoodValue) {
		selectedMood = mood;
		navigate('write');
	}

	function submitEntry() {
		const content = draftContent.trim();
		if (!content) return;

		const mood = selectedMood ?? 'neutral';
		const now = new Date().toISOString();
		const nextEntry: DiaryEntry = {
			id: createId('entry'),
			title: draftTitle.trim() || undefined,
			content,
			mood,
			tag: getMoodMeta(mood).defaultTag,
			insight: buildInsight(entries, mood, content),
			createdAt: now,
			personaId: selectedPersona.id
		};

		void persistEntry(nextEntry);
	}

	function buildAssistantReply(entry: DiaryEntry) {
		const personaTone: Record<string, string> = {
			friend: 'Aku dengar ini terasa berat buatmu.',
			mentor: 'Mari kita pelan-pelan rapikan apa yang paling mendesak dari semua ini.',
			reflector: 'Ada pola rasa kehilangan kendali yang cukup terasa di tulisanmu.'
		};

		return `${personaTone[selectedPersona.slug] ?? 'Aku menangkap banyak hal yang sedang bergerak di dalam dirimu.'} ${entry.insight}`;
	}

	function queueAssistantReply(content: string) {
		clearTimeout(replyTimer);
		isTyping = true;
		replyTimer = setTimeout(() => {
			chatMessages = [
				...chatMessages,
				{
					id: createId('chat'),
					role: 'assistant',
					content,
					timestamp: new Date().toISOString()
				}
			];
			isTyping = false;
		}, 1500);
	}

	async function sendChat() {
		const content = chatInput.trim();
		if (!content) return;

		const userMessage: ChatMessage = {
			id: createId('chat'),
			role: 'user',
			content,
			timestamp: new Date().toISOString(),
			mood: selectedMood
		};

		const nextMessages = [...chatMessages, userMessage];
		chatMessages = nextMessages;
		chatInput = '';

		if (!session) {
			const replies = [
				'Kita bisa berhenti sebentar dan memilih satu hal yang paling ingin kamu pahami dulu.',
				'Kalau bagian ini terasa kusut, aku bisa bantu mengubahnya jadi kalimat yang lebih sederhana.',
				'Terdengar seperti kamu sedang menanggung banyak hal sekaligus. Mana yang paling berat di dada?',
				'Boleh juga kalau malam ini fokusnya cuma menenangkan diri, bukan menyelesaikan semuanya.'
			];

			queueAssistantReply(replies[starterReplyIndex++ % replies.length]);
			return;
		}

		clearTimeout(replyTimer);
		isTyping = true;

		try {
			const response = await fetch('/api/ai/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${session.accessToken}`
				},
				body: JSON.stringify({
					messages: nextMessages.slice(-12).map((m) => ({ role: m.role, content: m.content })),
					persona: { slug: selectedPersona.slug, name: selectedPersona.name },
					mood: selectedMood ?? null
				})
			});

			const payload = (await response.json().catch(() => null)) as { reply?: string; error?: string } | null;
			if (!response.ok) {
				throw new Error(payload?.error ?? 'Gagal memproses AI.');
			}

			const reply = payload?.reply?.trim();
			if (!reply) throw new Error('AI tidak mengembalikan jawaban.');

			chatMessages = [
				...nextMessages,
				{
					id: createId('chat'),
					role: 'assistant',
					content: reply,
					timestamp: new Date().toISOString()
				}
			];
		} catch (error) {
			authError = error instanceof Error ? error.message : 'Gagal memproses AI.';
			queueAssistantReply('Aku denger kamu. Mau kamu ceritain bagian yang paling berat dulu?');
		} finally {
			isTyping = false;
		}
	}

	function toggleEntry(id: string) {
		const next = new Set(expandedIds);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		expandedIds = next;
	}

	function closePersonaMenu(event: MouseEvent) {
		const target = event.target as HTMLElement | null;
		if (!target?.closest('.persona-shell')) {
			isPersonaOpen = false;
		}
	}

	async function loadUserData(currentSession: SupabaseSession) {
		syncMessage = 'Menyinkronkan diary...';

		const [profile, personaList, diaryList] = await Promise.all([
			fetchProfile(currentSession),
			fetchPersonas(currentSession),
			fetchDiaryEntries(currentSession)
		]);

		if (profile.account_status === 'suspended') {
			throw new Error('Akun ini sedang disuspend. Hubungi admin untuk mengaktifkannya kembali.');
		}

		availablePersonas = personaList.length > 0 ? personaList : [...personas];
		entries = diaryList;
		expandedIds = new Set(diaryList[0] ? [diaryList[0].id] : []);

		if (diaryList[0]) {
			chatMessages = [
				{
					id: createId('chat'),
					role: 'user',
					content: diaryList[0].content,
					timestamp: diaryList[0].createdAt,
					mood: diaryList[0].mood
				}
			];
		} else {
			chatMessages = [];
		}

		const personaFromProfile =
			availablePersonas.find((persona) => persona.id === profile.selected_persona_id) ??
			availablePersonas[0] ??
			personas[0];

		selectedPersona = personaFromProfile;
		void updateLastSeen(currentSession);
		syncMessage = '';
	}

	async function persistPersona(personaId: string) {
		if (!session) return;

		try {
			await saveSelectedPersona(session, personaId);
		} catch (error) {
			console.error(error);
		}
	}

	async function persistEntry(entry: DiaryEntry) {
		if (!session) {
			const refinedDraft = buildRefinedJournal({
				id: entry.id,
				title: entry.title,
				content: entry.content,
				mood: entry.mood,
				insight: entry.insight
			});

			const nextEntry: DiaryEntry = {
				...entry,
				refinedJournal: refinedDraft
			};

			guestRefined = refinedDraft;
			entries = [nextEntry, ...entries];
			expandedIds = new Set([nextEntry.id, ...expandedIds]);
			chatMessages = [
				{
					id: createId('chat'),
					role: 'user',
					content: nextEntry.content,
					timestamp: nextEntry.createdAt,
					mood: nextEntry.mood
				}
			];

			draftTitle = '';
			draftContent = '';
			selectedMood = nextEntry.mood;
			showHint = false;
			chatInput = '';
			chatSeeded = true;

			syncMessage = 'Revisi journal dibuat. Login dengan Google untuk menyimpan.';
			setTimeout(() => {
				syncMessage = '';
			}, 2000);

			navigate('chat');
			queueAssistantReply(buildAssistantReply(nextEntry));
			return;
		}

		try {
			syncMessage = 'Menyimpan diary...';
			const savedEntry = await createDiaryEntry(session, entry);

			void fetch('/api/index-diary', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${session.accessToken}`
				},
				body: JSON.stringify({
					diaryEntryId: savedEntry.id,
					content: entry.content,
					title: entry.title ?? null,
					mood: entry.mood,
					createdAt: savedEntry.created_at
				})
			}).catch(() => {
				// ignore indexing errors for now
			});

			const localRefined = buildRefinedJournal({
				id: savedEntry.id,
				title: entry.title,
				content: entry.content,
				mood: entry.mood,
				insight: entry.insight
			});

			let refinedContent = localRefined.content;
			let refinedSummary = localRefined.summary ?? null;

			try {
				const response = await fetch('/api/ai/refine', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${session.accessToken}`
					},
					body: JSON.stringify({
						diaryEntryId: savedEntry.id,
						content: entry.content,
						mood: entry.mood,
						persona: selectedPersona.slug
					})
				});

				const payload = (await response.json().catch(() => null)) as
					| { refined?: string; summary?: string; error?: string }
					| null;
				if (response.ok && payload?.refined) {
					refinedContent = payload.refined.trim();
					refinedSummary = payload.summary?.trim() || null;
				}
			} catch {
				// fallback to local refined
			}

			const refinedDraft: RefinedJournal = {
				id: createId('refined'),
				diaryEntryId: savedEntry.id,
				title: entry.title ?? 'Refined Journal',
				content: refinedContent,
				summary: refinedSummary ?? undefined,
				createdAt: new Date().toISOString()
			};

			const savedRefined = await createRefinedJournal(session, refinedDraft);

			const nextEntry: DiaryEntry = {
				id: savedEntry.id,
				title: savedEntry.title ?? undefined,
				content: savedEntry.content,
				mood: savedEntry.mood,
				tag: savedEntry.tag ?? undefined,
				insight: savedEntry.insight ?? entry.insight,
				createdAt: savedEntry.created_at,
				personaId: savedEntry.persona_id ?? undefined,
				refinedJournal: {
					id: savedRefined.id,
					diaryEntryId: savedRefined.diary_entry_id,
					title: savedRefined.title ?? undefined,
					content: savedRefined.content,
					summary: savedRefined.summary ?? undefined,
					createdAt: savedRefined.created_at
				} satisfies RefinedJournal
			};

			entries = [nextEntry, ...entries];
			expandedIds = new Set([nextEntry.id, ...expandedIds]);
			chatMessages = [
				{
					id: createId('chat'),
					role: 'user',
					content: nextEntry.content,
					timestamp: nextEntry.createdAt,
					mood: nextEntry.mood
				}
			];

			draftTitle = '';
			draftContent = '';
			selectedMood = nextEntry.mood;
			showHint = false;
			chatInput = '';
			chatSeeded = true;
			syncMessage = 'Diary tersimpan.';
			navigate('chat');

			clearTimeout(replyTimer);
			isTyping = true;
			try {
				const response = await fetch('/api/ai/chat', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${session.accessToken}`
					},
					body: JSON.stringify({
						messages: [{ role: 'user', content: nextEntry.content }],
						persona: { slug: selectedPersona.slug, name: selectedPersona.name },
						mood: nextEntry.mood
					})
				});
				const payload = (await response.json().catch(() => null)) as { reply?: string } | null;
				const reply = payload?.reply?.trim();
				if (response.ok && reply) {
					chatMessages = [
						{
							id: createId('chat'),
							role: 'user',
							content: nextEntry.content,
							timestamp: nextEntry.createdAt,
							mood: nextEntry.mood
						},
						{
							id: createId('chat'),
							role: 'assistant',
							content: reply,
							timestamp: new Date().toISOString()
						}
					];
				} else {
					queueAssistantReply(buildAssistantReply(nextEntry));
				}
			} catch {
				queueAssistantReply(buildAssistantReply(nextEntry));
			} finally {
				isTyping = false;
			}
		} catch (error) {
			authError = error instanceof Error ? error.message : 'Gagal menyimpan diary.';
		} finally {
			setTimeout(() => {
				syncMessage = '';
			}, 1500);
		}
	}

	async function handleGoogleLogin() {
		authError = '';

		if (!isSupabaseConfigured) {
			authError = 'Supabase belum dikonfigurasi.';
			return;
		}

		try {
			authLoading = true;
			await loginWithGoogle(window.location.origin);
		} catch (error) {
			authError = error instanceof Error ? error.message : 'Autentikasi gagal.';
		} finally {
			authLoading = false;
		}
	}

	async function handleLogout() {
		await logout(session?.accessToken);
		session = null;
		entries = [...initialEntries];
		guestRefined = null;
		chatMessages = [
			{
				id: createId('chat'),
				role: 'user',
				content: initialEntries[0].content,
				timestamp: initialEntries[0].createdAt,
				mood: initialEntries[0].mood
			}
		];
		selectedPersona = personas[0];
		activeView = 'write';
	}

	onMount(() => {
		window.addEventListener('click', closePersonaMenu);
		void (async () => {
			try {
				const restored = await restoreSession();
				session = restored;
				if (restored) {
					await loadUserData(restored);
				}
			} finally {
				bootLoading = false;
			}
		})();
		return () => {
			window.removeEventListener('click', closePersonaMenu);
		};
	});

	onDestroy(() => {
		clearTimeout(replyTimer);
		clearTimeout(hintTimer);
	});
</script>

<div class="app-shell">
	<AuroraBackground />
	{#if bootLoading}
		<section class="auth-gate">
			<div class="auth-card">
				<div class="auth-eyebrow">Memuat sesi</div>
				<h1 class="auth-title">Menyiapkan koneksi jurnalmu...</h1>
			</div>
		</section>
	{:else}
		<Header
			{activeView}
			persona={selectedPersona}
			personas={availablePersonas}
			{isPersonaOpen}
			onTogglePersona={() => (isPersonaOpen = !isPersonaOpen)}
			onSelectPersona={selectPersona}
			onOpenTimeline={session ? () => navigate('timeline') : undefined}
			showTimeline={Boolean(session)}
			authLabel={session?.user.email ?? 'Guest'}
			authActionText={session ? 'Keluar' : 'Masuk'}
			onSignOut={session ? handleLogout : handleGoogleLogin}
		/>

		{#if activeView === 'home'}
			<HomeSection
				{greeting}
				entryCount={entries.length}
				{streak}
				currentMood={currentMoodMeta}
				{moods}
				recentEntry={latestEntry}
				{recentInsight}
				onStartWriting={() => navigate('write')}
				onQuickMood={chooseQuickMood}
				onOpenChat={() => navigate('chat')}
			/>
		{:else if activeView === 'write'}
			<WriteSection
				title={draftTitle}
				content={draftContent}
				{selectedMood}
				{moods}
				charCount={draftContent.length}
				{showHint}
				onTitleInput={(value) => (draftTitle = value)}
				onContentInput={updateDraftContent}
				onMoodSelect={chooseMood}
				onSubmit={submitEntry}
			/>
		{:else if activeView === 'chat'}
			<ChatSection
				messages={chatMessages}
				persona={selectedPersona}
				{selectedMood}
				typing={isTyping}
				input={chatInput}
				onInput={(value) => (chatInput = value)}
				onSend={sendChat}
			/>
		{:else if activeView === 'timeline'}
			<TimelineSection
				{entries}
				{trail}
				{expandedIds}
				onToggleEntry={toggleEntry}
			/>
		{:else}
			<HomeSection
				{greeting}
				entryCount={entries.length}
				{streak}
				currentMood={currentMoodMeta}
				{moods}
				recentEntry={latestEntry}
				{recentInsight}
				onStartWriting={() => navigate('write')}
				onQuickMood={chooseQuickMood}
				onOpenChat={() => navigate('chat')}
			/>
		{/if}

		{#if !session && activeView === 'write' && guestRefined}
			<section class="guest-refined">
				<div class="guest-refined-title">Revisi journal</div>
				<pre class="guest-refined-content">{guestRefined.content}</pre>
			</section>
		{/if}

		{#if syncMessage}
			<div class="floating-hint show">{syncMessage}</div>
		{/if}

		<BottomNav
			activeView={activeView}
			hidden={activeView === 'chat'}
			showTimeline={Boolean(session)}
			onNavigate={navigate}
		/>
	{/if}
</div>
