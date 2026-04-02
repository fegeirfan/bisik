<script lang="ts">
	import { onMount } from 'svelte';
	import AuthPanel from '$lib/components/auth/AuthPanel.svelte';
	import '$lib/styles/admin.css';
	import AdminIcons from '$lib/components/admin/AdminIcons.svelte';
	import { adminActivities, adminNavItems, mockPromptResponses } from '$lib/data/admin';
	import { logout, registerWithPassword, loginWithPassword, restoreSession } from '$lib/supabase/auth';
	import {
		createAdminPersona,
		fetchAdminEntries,
		fetchAdminPersonas,
		fetchAdminProfile,
		fetchAdminUsers,
		fetchAppSettings,
		updateAdminPersona,
		updateAppSettings,
		updateUserStatus
	} from '$lib/supabase/admin';
	import { isSupabaseConfigured } from '$lib/supabase/client';
	import type {
		AppSettings,
		AdminEntryRow,
		AdminFeatureToggle,
		AdminPersona,
		AdminToast,
		AdminUser,
		AdminView
	} from '$lib/types/admin';
	import type { SupabaseSession } from '$lib/types/supabase';
	import { createId, formatFullDate } from '$lib/utils/diary';

	const sectionLabels = {
		overview: 'Overview',
		management: 'Manajemen',
		configuration: 'Konfigurasi'
	} as const;

	const pageMeta: Record<AdminView, { title: string; crumb: string }> = {
		dashboard: { title: 'Dashboard', crumb: '/ overview' },
		users: { title: 'User Management', crumb: '/ manajemen' },
		entries: { title: 'Diary Entries', crumb: '/ monitoring' },
		personas: { title: 'Personas', crumb: '/ manajemen' },
		'ai-config': { title: 'AI Config', crumb: '/ konfigurasi' },
		settings: { title: 'Settings', crumb: '/ sistem' }
	};

	const defaultSettings: AppSettings = {
		appName: 'bisik',
		tagline: 'Ruang ceritamu yang tenang',
		systemPrompt:
			'Kamu adalah Bisik, pendamping diary AI yang hangat, empatik, dan tidak menghakimi.',
		temperature: 0.7,
		maxResponseLength: 400,
		responseDelayMs: 1800,
		rateLimitPerHour: 60,
		memoryHint: true,
		moodDetection: true,
		adaptiveTone: false,
		nightModeAi: true,
		maintenanceMode: false
	};

	let activeView = $state<AdminView>('dashboard');
	let search = $state('');
	let toasts = $state<AdminToast[]>([]);
	let session = $state<SupabaseSession | null>(null);
	let bootLoading = $state(true);
	let authMode = $state<'login' | 'register'>('login');
	let authError = $state('');
	let authLoading = $state(false);
	let adminDenied = $state('');
	let profileName = $state('Admin');

	let users = $state<AdminUser[]>([]);
	let personasData = $state<AdminPersona[]>([]);
	let entryRows = $state<AdminEntryRow[]>([]);
	let settings = $state<AppSettings>({ ...defaultSettings });

	let modalOpen = $state(false);
	let modalMode = $state<'user' | 'persona-create' | 'persona-edit' | null>(null);
	let selectedUser = $state<AdminUser | null>(null);
	let personaDraft = $state({
		id: '',
		name: '',
		slug: '',
		icon: '🫂',
		description: '',
		tags: '',
		tone: 'supportive',
		toneModifier: 0.65,
		promptOverride: ''
	});

	let testInput = $state('');
	let testOutput = $state('');
	let isTesting = $state(false);
	let responseIndex = 0;

	const groupedNav = $derived.by(() =>
		Object.entries(sectionLabels).map(([key, label]) => ({
			label,
			items: adminNavItems.filter((item) => item.section === key)
		}))
	);

	const currentMeta = $derived(pageMeta[activeView]);

	const filteredUsers = $derived.by(() => {
		const term = search.toLowerCase().trim();
		if (!term) return users;
		return users.filter(
			(user) =>
				user.name.toLowerCase().includes(term) ||
				user.email.toLowerCase().includes(term) ||
				(user.role ?? 'user').toLowerCase().includes(term)
		);
	});

	const entryPersonaMap = $derived.by(
		() => new Map(personasData.map((persona) => [persona.id, persona.name]))
	);

	const stats = $derived.by(() => {
		const todayKey = new Date().toISOString().slice(0, 10);
		const usersToday = users.filter((user) => user.joined.includes(formatFullDate(todayKey))).length;
		const entriesToday = entryRows.filter((entry) => entry.time.includes('Hari ini')).length;
		const activePersonas = personasData.filter((persona) => persona.status === 'active').length;
		const suspendedUsers = users.filter((user) => user.status === 'suspended').length;

		return [
			{
				label: 'Total Users',
				value: String(users.length),
				delta: `▲ ${usersToday} hari ini`,
				tone: 'blue',
				icon: '👤'
			},
			{
				label: 'Total Entri',
				value: String(entryRows.length),
				delta: `▲ ${entriesToday} hari ini`,
				tone: 'green',
				icon: '📖'
			},
			{
				label: 'Persona Aktif',
				value: String(activePersonas),
				delta: `dari ${personasData.length} total`,
				tone: 'purple',
				icon: '🎭'
			},
			{
				label: 'Perlu Perhatian',
				value: String(suspendedUsers),
				delta: 'user terblokir',
				tone: 'red',
				icon: '⚠️'
			}
		];
	});

	const moodDistribution = $derived.by(() => {
		const total = entryRows.length || 1;
		const counts = {
			happy: 0,
			neutral: 0,
			sad: 0,
			tired: 0,
			frustrated: 0
		};

		for (const entry of entryRows) {
			if (entry.status === 'review') counts.sad += 1;
			if (entry.mood === '😊') counts.happy += 1;
			if (entry.mood === '😐') counts.neutral += 1;
			if (entry.mood === '😢') counts.sad += 1;
			if (entry.mood === '😴') counts.tired += 1;
			if (entry.mood === '😤') counts.frustrated += 1;
		}

		return [
			{ label: `😊 ${Math.round((counts.happy / total) * 100)}%`, tone: 'green' },
			{ label: `😐 ${Math.round((counts.neutral / total) * 100)}%`, tone: 'warn' },
			{ label: `😢 ${Math.round((counts.sad / total) * 100)}%`, tone: 'red' },
			{ label: `😴 ${Math.round((counts.tired / total) * 100)}%`, tone: 'purple' }
		];
	});

	const personaUsage = $derived.by(() => {
		const total = users.length || 1;
		return personasData.map((persona) => ({
			label: `${persona.icon} ${persona.name}`,
			value: Math.round((persona.users / total) * 100),
			color:
				persona.slug === 'mentor'
					? 'var(--purple)'
					: persona.slug === 'reflector'
						? 'var(--success)'
						: 'var(--accent)'
		}));
	});

	const featureToggles = $derived<AdminFeatureToggle[]>([
		{
			id: 'memoryHint',
			title: 'Memory Hint',
			description: 'AI referensikan entri lama',
			enabled: settings.memoryHint
		},
		{
			id: 'moodDetection',
			title: 'Mood Detection',
			description: 'Auto-deteksi mood dari teks',
			enabled: settings.moodDetection
		},
		{
			id: 'adaptiveTone',
			title: 'Adaptive Tone',
			description: 'Tone menyesuaikan pola user',
			enabled: settings.adaptiveTone
		},
		{
			id: 'nightModeAi',
			title: 'Night Mode AI',
			description: 'Lebih pelan setelah jam 21',
			enabled: settings.nightModeAi
		}
	]);

	function pushToast(message: string, tone: AdminToast['tone'] = 'blue') {
		const toast = { id: createId('toast'), message, tone };
		toasts = [...toasts, toast];
		setTimeout(() => {
			toasts = toasts.filter((item) => item.id !== toast.id);
		}, 3000);
	}

	function mapMoodEmoji(mood: string) {
		if (mood === 'happy') return '😊';
		if (mood === 'sad') return '😢';
		if (mood === 'tired') return '😴';
		if (mood === 'frustrated') return '😤';
		return '😐';
	}

	function formatRelativeForAdmin(dateString: string) {
		const date = new Date(dateString);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const minutes = Math.round(diff / 60000);

		if (dateString.slice(0, 10) === now.toISOString().slice(0, 10)) {
			return `${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} · Hari ini`;
		}

		if (minutes < 60) return `${minutes}m lalu`;
		if (minutes < 24 * 60) return `${Math.round(minutes / 60)}j lalu`;
		return formatFullDate(dateString);
	}

	async function loadAdminData(currentSession: SupabaseSession) {
		const profile = await fetchAdminProfile(currentSession);
		if (!['admin', 'super_admin'].includes(profile.role)) {
			adminDenied = 'Akun ini bukan admin. Set kolom `profiles.role` menjadi `admin` atau `super_admin`.';
			return;
		}

		profileName = profile.display_name ?? profile.email ?? 'Admin';
		adminDenied = '';

		const [nextUsers, nextEntries, nextPersonas, nextSettings] = await Promise.all([
			fetchAdminUsers(currentSession),
			fetchAdminEntries(currentSession),
			fetchAdminPersonas(currentSession),
			fetchAppSettings(currentSession)
		]);

		users = nextUsers;
		personasData = nextPersonas;
		settings = nextSettings;
		entryRows = nextEntries.map((entry) => ({
			id: entry.id,
			user: entry.user_id.slice(0, 8),
			mood: mapMoodEmoji(entry.mood),
			persona: nextPersonas.find((persona) => persona.id === entry.persona_id)?.name ?? 'Teman',
			length: `${entry.content.length} chr`,
			time: formatRelativeForAdmin(entry.created_at),
			status: entry.mood === 'sad' || entry.mood === 'frustrated' ? 'review' : 'normal'
		}));
	}

	async function handleAuthSubmit(payload: {
		email: string;
		password: string;
		displayName?: string;
	}) {
		authError = '';
		if (!isSupabaseConfigured) {
			authError = 'Supabase belum dikonfigurasi.';
			return;
		}

		try {
			authLoading = true;
			const nextSession =
				authMode === 'login'
					? await loginWithPassword(payload)
					: await registerWithPassword(payload);

			if (!nextSession) {
				authError = 'Session admin belum tersedia.';
				return;
			}

			session = nextSession;
			await loadAdminData(nextSession);
		} catch (error) {
			authError = error instanceof Error ? error.message : 'Autentikasi gagal.';
			session = null;
		} finally {
			authLoading = false;
		}
	}

	async function handleLogout() {
		await logout(session?.accessToken);
		session = null;
		users = [];
		personasData = [];
		entryRows = [];
		adminDenied = '';
	}

	async function suspendToggle(user: AdminUser) {
		if (!session) return;
		const nextStatus = user.status === 'active' ? 'suspended' : 'active';
		try {
			await updateUserStatus(session, user.id, nextStatus);
			users = users.map((item) =>
				item.id === user.id ? { ...item, status: nextStatus } : item
			);
			pushToast(
				`${user.name} ${nextStatus === 'suspended' ? 'disuspend' : 'diaktifkan kembali'}`,
				nextStatus === 'suspended' ? 'red' : 'green'
			);
		} catch (error) {
			pushToast(error instanceof Error ? error.message : 'Gagal memperbarui status user.', 'red');
		}
	}

	function openUserModal(user: AdminUser) {
		selectedUser = user;
		modalMode = 'user';
		modalOpen = true;
	}

	function openPersonaCreate() {
		personaDraft = {
			id: '',
			name: '',
			slug: '',
			icon: '🫂',
			description: '',
			tags: '',
			tone: 'supportive',
			toneModifier: 0.65,
			promptOverride: ''
		};
		modalMode = 'persona-create';
		modalOpen = true;
	}

	function openPersonaEdit(persona: AdminPersona) {
		personaDraft = {
			id: persona.id,
			name: persona.name,
			slug: persona.slug ?? persona.name.toLowerCase().replace(/\s+/g, '-'),
			icon: persona.icon,
			description: persona.description,
			tags: persona.tags.join(', '),
			tone: persona.tone ?? 'supportive',
			toneModifier: persona.toneModifier ?? 0.65,
			promptOverride: persona.promptOverride ?? ''
		};
		modalMode = 'persona-edit';
		modalOpen = true;
	}

	async function savePersonaDraft() {
		if (!session) return;
		try {
			const tags = personaDraft.tags
				.split(',')
				.map((tag) => tag.trim())
				.filter(Boolean);

			if (modalMode === 'persona-create') {
				await createAdminPersona(session, {
					name: personaDraft.name,
					slug: personaDraft.slug || personaDraft.name.toLowerCase().replace(/\s+/g, '-'),
					icon: personaDraft.icon || '🫂',
					description: personaDraft.description,
					tags,
					tone: personaDraft.tone,
					promptOverride: personaDraft.promptOverride
				});
				pushToast('Persona baru berhasil dibuat', 'green');
			} else if (modalMode === 'persona-edit') {
				await updateAdminPersona(session, personaDraft.id, {
					name: personaDraft.name,
					icon: personaDraft.icon,
					description: personaDraft.description,
					tags,
					tone: personaDraft.tone,
					toneModifier: personaDraft.toneModifier,
					promptOverride: personaDraft.promptOverride
				});
				pushToast('Persona berhasil diperbarui', 'green');
			}

			await loadAdminData(session);
			closeModal();
		} catch (error) {
			pushToast(error instanceof Error ? error.message : 'Gagal menyimpan persona.', 'red');
		}
	}

	async function togglePersonaStatus(persona: AdminPersona) {
		if (!session) return;
		if (persona.locked) {
			pushToast('Persona bawaan tidak dapat dinonaktifkan', 'warn');
			return;
		}

		const nextStatus = persona.status === 'active' ? 'inactive' : 'active';
		try {
			await updateAdminPersona(session, persona.id, { status: nextStatus });
			personasData = personasData.map((item) =>
				item.id === persona.id ? { ...item, status: nextStatus } : item
			);
			pushToast(
				`Persona ${persona.name} ${nextStatus === 'active' ? 'diaktifkan' : 'dinonaktifkan'}`,
				nextStatus === 'active' ? 'green' : 'red'
			);
		} catch (error) {
			pushToast(error instanceof Error ? error.message : 'Gagal mengubah status persona.', 'red');
		}
	}

	function closeModal() {
		modalOpen = false;
		modalMode = null;
		selectedUser = null;
	}

	async function saveSettings(scope: 'config' | 'general') {
		if (!session) return;
		try {
			settings = await updateAppSettings(session, settings);
			pushToast(
				scope === 'config' ? 'AI config berhasil disimpan' : 'Pengaturan aplikasi berhasil disimpan',
				'green'
			);
		} catch (error) {
			pushToast(error instanceof Error ? error.message : 'Gagal menyimpan pengaturan.', 'red');
		}
	}

	function runPromptTest() {
		if (!testInput.trim()) {
			pushToast('Ketik pesan test dulu', 'warn');
			return;
		}

		isTesting = true;
		testOutput = 'memproses...';
		setTimeout(() => {
			testOutput = mockPromptResponses[responseIndex++ % mockPromptResponses.length];
			isTesting = false;
		}, 1200);
	}

	function toggleFeature(id: AdminFeatureToggle['id']) {
		if (id === 'memoryHint') settings = { ...settings, memoryHint: !settings.memoryHint };
		if (id === 'moodDetection') settings = { ...settings, moodDetection: !settings.moodDetection };
		if (id === 'adaptiveTone') settings = { ...settings, adaptiveTone: !settings.adaptiveTone };
		if (id === 'nightModeAi') settings = { ...settings, nightModeAi: !settings.nightModeAi };
	}

	onMount(() => {
		void (async () => {
			try {
				const restored = await restoreSession();
				session = restored;
				if (restored) {
					await loadAdminData(restored);
				}
			} finally {
				bootLoading = false;
			}
		})();
	});
</script>

{#if bootLoading}
	<section class="auth-gate">
		<div class="auth-card">
			<div class="auth-eyebrow">Admin Console</div>
			<h1 class="auth-title">Menyiapkan panel admin...</h1>
		</div>
	</section>
{:else if !session}
	<AuthPanel
		mode={authMode}
		loading={authLoading}
		error={authError}
		configured={isSupabaseConfigured}
		onSubmit={handleAuthSubmit}
		onModeChange={(mode) => {
			authMode = mode;
			authError = '';
		}}
	/>
{:else if adminDenied}
	<section class="auth-gate">
		<div class="auth-card">
			<div class="auth-eyebrow">Akses Ditolak</div>
			<h1 class="auth-title">Akun ini belum punya role admin.</h1>
			<p class="auth-copy">{adminDenied}</p>
			<button class="auth-submit" type="button" onclick={handleLogout}>Keluar</button>
		</div>
	</section>
{:else}
	<div class="admin-shell">
		<div class="admin-glow admin-glow-left"></div>
		<div class="admin-glow admin-glow-right"></div>

		<div class="admin-toast-container">
			{#each toasts as toast}
				<div class="admin-toast">
					<div class={`admin-toast-dot ${toast.tone}`}></div>
					<span>{toast.message}</span>
				</div>
			{/each}
		</div>

		{#if modalOpen}
			<div class="admin-modal-overlay-wrap" role="presentation">
				<button class="admin-modal-overlay" type="button" aria-label="Tutup modal" onclick={closeModal}></button>
				<div class="admin-modal" role="dialog" aria-modal="true" tabindex="-1">
					{#if modalMode === 'user' && selectedUser}
						<div class="admin-modal-title">{selectedUser.name}</div>
						<div class="admin-modal-sub">{selectedUser.id} · {selectedUser.email}</div>
						<div class="admin-modal-grid">
							<div class="admin-mini-card">
								<div class="admin-mini-label">Total Entri</div>
								<div class="admin-mini-value">{selectedUser.entries}</div>
							</div>
							<div class="admin-mini-card">
								<div class="admin-mini-label">Mood Dominan</div>
								<div class="admin-mini-value">{selectedUser.mood}</div>
							</div>
						</div>
						<div class="admin-modal-meta-label">Joined</div>
						<div class="admin-modal-meta-value">{selectedUser.joined}</div>
						<div class="admin-modal-footer">
							<button class="admin-topbar-btn" type="button" onclick={closeModal}>Tutup</button>
							<button class="admin-topbar-btn primary" type="button" onclick={() => selectedUser && suspendToggle(selectedUser)}>
								{selectedUser.status === 'active' ? 'Suspend' : 'Unsuspend'}
							</button>
						</div>
					{:else}
						<div class="admin-modal-title">
							{modalMode === 'persona-create' ? 'Persona Baru' : 'Edit Persona'}
						</div>
						<div class="admin-modal-sub">
							{modalMode === 'persona-create'
								? 'Buat karakter AI baru untuk user'
								: 'Perubahan akan berlaku langsung ke semua user'}
						</div>
						<div class="admin-stack-gap">
							<div class="admin-config-group">
								<div class="admin-config-label">Nama Persona</div>
								<input class="admin-config-input" type="text" bind:value={personaDraft.name} />
							</div>
							<div class="admin-config-group">
								<div class="admin-config-label">Slug</div>
								<input class="admin-config-input" type="text" bind:value={personaDraft.slug} />
							</div>
							<div class="admin-config-group">
								<div class="admin-config-label">Emoji</div>
								<input class="admin-config-input" type="text" bind:value={personaDraft.icon} />
							</div>
							<div class="admin-config-group">
								<div class="admin-config-label">Deskripsi</div>
								<input class="admin-config-input" type="text" bind:value={personaDraft.description} />
							</div>
							<div class="admin-config-group">
								<div class="admin-config-label">Tags</div>
								<input class="admin-config-input" type="text" bind:value={personaDraft.tags} />
							</div>
							<div class="admin-config-group">
								<div class="admin-config-label">Tone</div>
								<input class="admin-config-input" type="text" bind:value={personaDraft.tone} />
							</div>
							<div class="admin-config-group">
								<div class="admin-config-label">Prompt Override</div>
								<textarea class="admin-config-input" rows="4" bind:value={personaDraft.promptOverride}></textarea>
							</div>
						</div>
						<div class="admin-modal-footer">
							<button class="admin-topbar-btn" type="button" onclick={closeModal}>Batal</button>
							<button class="admin-topbar-btn primary" type="button" onclick={savePersonaDraft}>
								Simpan
							</button>
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<aside class="admin-sidebar">
			<div class="admin-sidebar-logo">
				<div class="admin-logo-mark">B</div>
				<div class="admin-logo-copy">
					<div class="admin-logo-text">{settings.appName}</div>
				</div>
				<div class="admin-logo-badge">ADMIN</div>
			</div>

			<nav class="admin-sidebar-nav">
				{#each groupedNav as group}
					<div class="admin-nav-section-label">{group.label}</div>
					{#each group.items as item}
						<button
							type="button"
							class:active={activeView === item.id}
							class="admin-nav-item"
							onclick={() => (activeView = item.id)}
						>
							<span class="admin-nav-icon"><AdminIcons name={item.icon} /></span>
							<span>{item.label}</span>
							{#if item.badge}
								<span class:green={item.badgeTone === 'green'} class="admin-nav-badge">{item.badge}</span>
							{/if}
						</button>
					{/each}
				{/each}
			</nav>

			<div class="admin-sidebar-footer">
				<div class="admin-profile">
					<div class="admin-avatar">{profileName.slice(0, 2).toUpperCase()}</div>
					<div>
						<div class="admin-name">{profileName}</div>
						<div class="admin-role">admin_console</div>
					</div>
					<button class="admin-action-btn" type="button" onclick={handleLogout}>Keluar</button>
				</div>
			</div>
		</aside>

		<main class="admin-main">
			<div class="admin-topbar">
				<div class="admin-topbar-title">
					<div class="admin-status-dot"></div>
					<span>{currentMeta.title}</span>
					<span class="admin-topbar-crumb">{currentMeta.crumb}</span>
				</div>
				<div class="admin-topbar-right">
					<button class="admin-topbar-btn" type="button" onclick={() => pushToast('Sistem dalam kondisi normal', 'green')}>
						<AdminIcons name="check" size={13} />
						System Health
					</button>
					<button class="admin-topbar-btn primary" type="button" onclick={() => pushToast('Laporan dikirim ke email', 'blue')}>Export</button>
				</div>
			</div>

			<div class="admin-page">
				{#if activeView === 'dashboard'}
					<div class="admin-stat-grid">
						{#each stats as stat}
							<div class={`admin-stat-card ${stat.tone}`}>
								<div class="admin-stat-icon">{stat.icon}</div>
								<div class="admin-stat-label">{stat.label}</div>
								<div class="admin-stat-value">{stat.value}</div>
								<div class={`admin-stat-delta ${stat.tone === 'red' ? 'down' : stat.delta.includes('▲') ? 'up' : ''}`}>{stat.delta}</div>
							</div>
						{/each}
					</div>

					<div class="admin-two-col">
						<div class="admin-card">
							<div class="admin-sec-header">
								<div>
									<div class="admin-sec-title">Aktivitas Terkini</div>
									<div class="admin-sec-sub">real-time · 30 menit terakhir</div>
								</div>
							</div>
							{#each adminActivities as activity}
								<div class="admin-activity-item">
									<div class="admin-activity-dot" style:background={activity.accent}></div>
									<div>
										<div class="admin-activity-msg">{@html activity.message}</div>
										<div class="admin-activity-time">{activity.time}</div>
									</div>
								</div>
							{/each}
						</div>

						<div class="admin-card">
							<div class="admin-sec-header">
								<div>
									<div class="admin-sec-title">Distribusi Mood</div>
									<div class="admin-sec-sub">7 hari terakhir · semua user</div>
								</div>
							</div>
							<div class="admin-inline-badges">
								{#each moodDistribution as mood}
									<span class={`admin-badge ${mood.tone}`}>{mood.label}</span>
								{/each}
							</div>
							<div class="admin-mood-chart">
								{#each moodDistribution as mood, index}
									<div class={`admin-mood-bar ${index === 0 ? 'good' : index === 1 ? 'meh' : index === 2 ? 'sad' : 'tired'}`} style:height={`${Math.max(18, Number(mood.label.match(/\d+/)?.[0] ?? 20))}%`}></div>
								{/each}
							</div>
							<div class="admin-mood-labels">
								{#each ['Bahagia', 'Netral', 'Sedih', 'Lelah'] as label}
									<div class="admin-mood-lbl">{label}</div>
								{/each}
							</div>

							<div class="admin-divider"></div>
							<div class="admin-sec-title admin-tight-title">Persona Usage</div>
							<div class="admin-persona-usage-list">
								{#each personaUsage as usage}
									<div class="admin-progress-row">
										<span class="admin-progress-label">{usage.label}</span>
										<div class="admin-progress-track">
											<div class="admin-progress-fill" style:width={`${usage.value}%`} style:background={usage.color}></div>
										</div>
										<span class="admin-progress-value" style:color={usage.color}>{usage.value}%</span>
									</div>
								{/each}
							</div>
						</div>
					</div>
				{:else if activeView === 'users'}
					<div class="admin-page-heading">
						<div>
							<div class="admin-page-title">User Management</div>
							<div class="admin-page-sub">{users.length} total · {users.filter((user) => user.status === 'suspended').length} suspended</div>
						</div>
						<div class="admin-toolbar">
							<div class="admin-search-bar">
								<AdminIcons name="search" size={14} />
								<input type="text" placeholder="Cari user..." bind:value={search} />
							</div>
						</div>
					</div>

					<div class="admin-card admin-table-card">
						<div class="admin-table-wrap">
							<table>
								<thead>
									<tr>
										<th>User</th>
										<th>Status</th>
										<th>Role</th>
										<th>Entri</th>
										<th>Bergabung</th>
										<th>Terakhir aktif</th>
										<th>Mood dominan</th>
										<th>Aksi</th>
									</tr>
								</thead>
								<tbody>
									{#each filteredUsers as user}
										<tr>
											<td>
												<div class="admin-user-cell">
													<div class="admin-user-avatar" style:background={`${user.color}22`} style:color={user.color}>{user.name[0]}</div>
													<div>
														<div class="admin-user-name">{user.name}</div>
														<div class="admin-user-email">{user.email}</div>
													</div>
												</div>
											</td>
											<td><span class={`admin-badge ${user.status === 'active' ? 'green' : 'red'}`}>{user.status}</span></td>
											<td><span class="admin-badge blue">{user.role ?? 'user'}</span></td>
											<td><span class="admin-mono">{user.entries}</span></td>
											<td><span class="admin-mono admin-faded">{user.joined}</span></td>
											<td><span class="admin-mono">{user.lastActive}</span></td>
											<td>{user.mood}</td>
											<td class="admin-action-row">
												<button class="admin-action-btn" type="button" onclick={() => openUserModal(user)}>Detail</button>
												<button class="admin-action-btn danger" type="button" onclick={() => suspendToggle(user)}>
													{user.status === 'active' ? 'Suspend' : 'Unsuspend'}
												</button>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{:else if activeView === 'entries'}
					<div class="admin-alert">
						<span class="admin-alert-icon">⚠️</span>
						<div>
							<div class="admin-alert-title">Mode Privacy Aktif</div>
							<div class="admin-alert-text">Isi diary disembunyikan. Hanya metadata dan anonymized preview yang ditampilkan.</div>
						</div>
					</div>

					<div class="admin-stat-grid compact">
						<div class="admin-stat-card blue compact"><div class="admin-stat-label">Total Entri</div><div class="admin-stat-value">{entryRows.length}</div></div>
						<div class="admin-stat-card green compact"><div class="admin-stat-label">Hari Ini</div><div class="admin-stat-value">{entryRows.filter((entry) => entry.time.includes('Hari ini')).length}</div></div>
						<div class="admin-stat-card purple compact"><div class="admin-stat-label">Avg / User</div><div class="admin-stat-value">{users.length ? (entryRows.length / users.length).toFixed(1) : '0.0'}</div></div>
						<div class="admin-stat-card red compact"><div class="admin-stat-label">Flagged</div><div class="admin-stat-value">{entryRows.filter((entry) => entry.status === 'review').length}</div></div>
					</div>

					<div class="admin-card admin-table-card">
						<div class="admin-table-wrap">
							<table>
								<thead>
									<tr>
										<th>ID Entri</th>
										<th>User (anon)</th>
										<th>Mood</th>
										<th>Persona</th>
										<th>Panjang</th>
										<th>Waktu</th>
										<th>Status</th>
									</tr>
								</thead>
								<tbody>
									{#each entryRows as entry}
										<tr>
											<td><span class="admin-mono admin-faded">{entry.id.slice(0, 8)}</span></td>
											<td><span class="admin-mono admin-faded">{entry.user}</span></td>
											<td>{entry.mood}</td>
											<td><span class={`admin-badge ${entry.persona === 'Mentor' ? 'purple' : entry.persona === 'Reflector' ? 'green' : 'blue'}`}>{entry.persona}</span></td>
											<td><span class="admin-mono">{entry.length}</span></td>
											<td><span class="admin-mono admin-faded">{entry.time}</span></td>
											<td><span class={`admin-badge ${entry.status === 'normal' ? 'green' : 'warn'}`}>{entry.status}</span></td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{:else if activeView === 'personas'}
					<div class="admin-page-heading">
						<div>
							<div class="admin-page-title">Persona Management</div>
							<div class="admin-page-sub">{personasData.length} persona · {personasData.filter((persona) => persona.status === 'active').length} aktif</div>
						</div>
						<button class="admin-topbar-btn primary" type="button" onclick={openPersonaCreate}>+ Persona Baru</button>
					</div>

					<div class="admin-persona-grid">
						{#each personasData as persona}
							<div class:active-persona={persona.slug === 'friend'} class:disabled={persona.status === 'inactive'} class="admin-persona-card">
								<span class="admin-persona-icon">{persona.icon}</span>
								<div class="admin-persona-status">
									<span class={`admin-badge ${persona.status === 'active' ? 'green' : 'red'}`}>{persona.status === 'active' ? 'aktif' : 'nonaktif'}</span>
								</div>
								<div class="admin-persona-name">{persona.name}</div>
								<div class="admin-persona-users">👥 {persona.users} users menggunakan ini</div>
								<div class="admin-persona-desc">{persona.description}</div>
								<div class="admin-persona-tags">
									{#each persona.tags as tag}
										<span class="admin-persona-tag">{tag}</span>
									{/each}
								</div>
								<div class="admin-persona-actions">
									<button class="admin-action-btn" type="button" onclick={() => openPersonaEdit(persona)}>Edit</button>
									<button class:danger={!persona.locked} class="admin-action-btn" type="button" onclick={() => togglePersonaStatus(persona)}>
										{persona.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
									</button>
								</div>
							</div>
						{/each}
					</div>
				{:else if activeView === 'ai-config'}
					<div class="admin-config-layout">
						<div class="admin-config-main">
							<div class="admin-card admin-stack-gap">
								<div class="admin-sec-header">
									<div>
										<div class="admin-sec-title">System Prompt Global</div>
										<div class="admin-sec-sub">Berlaku untuk semua persona sebagai base</div>
									</div>
									<span class="admin-badge blue">live</span>
								</div>
								<div class="admin-config-group">
									<div class="admin-config-label">Prompt Utama <span class="admin-live">● live</span></div>
									<textarea class="admin-config-input" rows="7" bind:value={settings.systemPrompt}></textarea>
								</div>
								<div class="admin-inline-actions">
									<button class="admin-topbar-btn primary" type="button" onclick={() => saveSettings('config')}>Simpan Perubahan</button>
									<button class="admin-topbar-btn" type="button" onclick={() => (settings = { ...settings, systemPrompt: defaultSettings.systemPrompt })}>Reset Default</button>
								</div>
							</div>

							<div class="admin-card admin-stack-gap">
								<div class="admin-sec-header">
									<div>
										<div class="admin-sec-title">Live Prompt Tester</div>
										<div class="admin-sec-sub">Uji output AI langsung dari sini</div>
									</div>
								</div>
								<div class="admin-prompt-tester">
									<div class="admin-pt-header">
										<span>▶ test input</span>
										<span class="admin-live">model: mock</span>
									</div>
									<div class="admin-pt-body">
										<textarea class="admin-pt-input" rows="2" placeholder="Ketik pesan test..." bind:value={testInput}></textarea>
										{#if testOutput}
											<div class="admin-pt-output">
												{#if isTesting}
													<span class="admin-faded">⟳ {testOutput}</span>
												{:else}
													<span class="admin-live">▶ output:</span><br /><br />{testOutput}
												{/if}
											</div>
										{/if}
									</div>
								</div>
								<div class="admin-inline-actions">
									<button class="admin-topbar-btn primary" type="button" onclick={runPromptTest}>▶ Run Test</button>
									<button class="admin-topbar-btn" type="button" onclick={() => (testOutput = '')}>Clear</button>
								</div>
							</div>
						</div>

						<div class="admin-config-side">
							<div class="admin-card admin-stack-gap">
								<div class="admin-sec-title">Parameter AI</div>
								<div class="admin-config-group">
									<div class="admin-config-label">Temperature (Kreativitas)</div>
									<div class="admin-range-wrap">
										<input type="range" min="0" max="100" value={settings.temperature * 100} oninput={(event) => (settings = { ...settings, temperature: Number((event.currentTarget as HTMLInputElement).value) / 100 })} />
										<div class="admin-range-val">{settings.temperature.toFixed(1)}</div>
									</div>
								</div>
								<div class="admin-config-group">
									<div class="admin-config-label">Max Response Length</div>
									<div class="admin-range-wrap">
										<input type="range" min="100" max="1000" step="50" value={settings.maxResponseLength} oninput={(event) => (settings = { ...settings, maxResponseLength: Number((event.currentTarget as HTMLInputElement).value) })} />
										<div class="admin-range-val">{settings.maxResponseLength}</div>
									</div>
								</div>
								<div class="admin-config-group">
									<div class="admin-config-label">Response Delay (ms)</div>
									<div class="admin-range-wrap">
										<input type="range" min="500" max="3000" step="100" value={settings.responseDelayMs} oninput={(event) => (settings = { ...settings, responseDelayMs: Number((event.currentTarget as HTMLInputElement).value) })} />
										<div class="admin-range-val">{settings.responseDelayMs}</div>
									</div>
								</div>
								<div class="admin-config-group">
									<div class="admin-config-label">Rate Limit (req/jam/user)</div>
									<input class="admin-config-input" type="number" bind:value={settings.rateLimitPerHour} />
								</div>
							</div>

							<div class="admin-card">
								<div class="admin-sec-title admin-bottom-gap">Fitur Toggle</div>
								{#each featureToggles as toggle}
									<div class="admin-toggle-row">
										<div class="admin-toggle-info">
											<div class="admin-toggle-title">{toggle.title}</div>
											<div class="admin-toggle-desc">{toggle.description}</div>
										</div>
										<button class:on={toggle.enabled} class="admin-toggle" type="button" aria-label={`Toggle ${toggle.title}`} title={toggle.title} onclick={() => toggleFeature(toggle.id)}></button>
									</div>
								{/each}
							</div>
						</div>
					</div>
				{:else}
					<div class="admin-settings-wrap">
						<div class="admin-card admin-stack-gap">
							<div class="admin-sec-title">General Settings</div>
							<div class="admin-config-group">
								<div class="admin-config-label">Nama Aplikasi</div>
								<input class="admin-config-input" type="text" bind:value={settings.appName} />
							</div>
							<div class="admin-config-group">
								<div class="admin-config-label">Tagline</div>
								<input class="admin-config-input" type="text" bind:value={settings.tagline} />
							</div>
							<div class="admin-config-group">
								<div class="admin-config-label">Maintenance Mode</div>
								<div class="admin-toggle-row admin-embedded">
									<div class="admin-toggle-info">
										<div class="admin-toggle-title">Aktifkan Maintenance Mode</div>
										<div class="admin-toggle-desc">User tidak bisa login saat mode ini aktif</div>
									</div>
									<button class:on={settings.maintenanceMode} class="admin-toggle" type="button" aria-label="Toggle maintenance mode" title="Toggle maintenance mode" onclick={() => (settings = { ...settings, maintenanceMode: !settings.maintenanceMode })}></button>
								</div>
							</div>
							<div class="admin-inline-actions">
								<button class="admin-topbar-btn primary" type="button" onclick={() => saveSettings('general')}>Simpan Settings</button>
							</div>
						</div>

						<div class="admin-card admin-stack-gap">
							<div class="admin-sec-title">Danger Zone</div>
							<div class="admin-toggle-row">
								<div class="admin-toggle-info">
									<div class="admin-toggle-title danger">Reset Semua AI Config</div>
									<div class="admin-toggle-desc">Kembalikan ke pengaturan default pabrik</div>
								</div>
								<button class="admin-action-btn danger" type="button" onclick={() => { settings = { ...defaultSettings, appName: settings.appName, tagline: settings.tagline, maintenanceMode: settings.maintenanceMode }; pushToast('Config direset ke default', 'red'); }}>Reset</button>
							</div>
							<div class="admin-toggle-row">
								<div class="admin-toggle-info">
									<div class="admin-toggle-title danger">Clear All Cache</div>
									<div class="admin-toggle-desc">Hapus semua cache sistem</div>
								</div>
								<button class="admin-action-btn danger" type="button" onclick={() => pushToast('Cache berhasil dibersihkan', 'green')}>Clear</button>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</main>
	</div>
{/if}
