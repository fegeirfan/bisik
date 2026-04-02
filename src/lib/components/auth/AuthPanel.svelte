<script lang="ts">
	let {
		mode = 'login',
		loading = false,
		error = '',
		configured = true,
		onSubmit,
		onModeChange
	} = $props<{
		mode: 'login' | 'register';
		loading?: boolean;
		error?: string;
		configured?: boolean;
		onSubmit: (payload: { email: string; password: string; displayName?: string }) => void;
		onModeChange: (mode: 'login' | 'register') => void;
	}>();

	let email = $state('');
	let password = $state('');
	let displayName = $state('');

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		onSubmit({
			email,
			password,
			displayName: displayName || undefined
		});
	}
</script>

<section class="auth-gate">
	<div class="auth-card">
		<div class="auth-eyebrow">Bisik x Supabase</div>
		<h1 class="auth-title">Masuk dulu untuk menyimpan diary, persona, dan refined journal.</h1>
		<p class="auth-copy">
			AI chat nanti bisa kita kembangkan terpisah. Sekarang fokusnya auth dan penyimpanan data utama.
		</p>

		<div class="auth-tabs">
			<button type="button" class:active={mode === 'login'} onclick={() => onModeChange('login')}>Login</button>
			<button type="button" class:active={mode === 'register'} onclick={() => onModeChange('register')}>Register</button>
		</div>

		{#if !configured}
			<div class="auth-alert">
				`PUBLIC_SUPABASE_URL` dan `PUBLIC_SUPABASE_ANON_KEY` belum diisi. Lihat `.env.example`.
			</div>
		{/if}

		<form class="auth-form" onsubmit={handleSubmit}>
			{#if mode === 'register'}
				<label>
					<span>Nama</span>
					<input bind:value={displayName} type="text" placeholder="Nama panggilan" />
				</label>
			{/if}

			<label>
				<span>Email</span>
				<input bind:value={email} type="email" placeholder="nama@email.com" required />
			</label>

			<label>
				<span>Password</span>
				<input bind:value={password} type="password" placeholder="Minimal 6 karakter" minlength="6" required />
			</label>

			{#if error}
				<div class="auth-error">{error}</div>
			{/if}

			<button class="auth-submit" type="submit" disabled={loading || !configured}>
				{#if loading}
					Memproses...
				{:else if mode === 'login'}
					Masuk
				{:else}
					Buat Akun
				{/if}
			</button>
		</form>
	</div>
</section>
