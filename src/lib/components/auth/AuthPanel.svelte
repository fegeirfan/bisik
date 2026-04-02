<script lang="ts">
	let {
		mode = 'login',
		loading = false,
		error = '',
		configured = true,
		onGoogle,
		onSubmit,
		onModeChange
	} = $props<{
		mode: 'login' | 'register';
		loading?: boolean;
		error?: string;
		configured?: boolean;
		onGoogle?: () => void;
		onSubmit: (payload: {
			email: string;
			password: string;
			displayName?: string;
			website?: string;
		}) => void;
		onModeChange: (mode: 'login' | 'register') => void;
	}>();

	let email = $state('');
	let password = $state('');
	let displayName = $state('');
	let website = $state('');

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		onSubmit({
			email,
			password,
			displayName: displayName || undefined,
			website: website || undefined
		});
	}
</script>

<section class="auth-gate">
	<div class="auth-card">
		<div class="auth-eyebrow">Bisik</div>
		<h1 class="auth-title">Masuk untuk lanjut.</h1>
		<p class="auth-copy">Daftar akun baru kalau kamu belum punya. Password minimal 6 karakter.</p>

		{#if onGoogle}
			<button class="auth-submit" type="button" disabled={loading || !configured} onclick={onGoogle}>
				Masuk dengan Google
			</button>
		{/if}

		<div class="auth-tabs">
			<button type="button" class:active={mode === 'login'} onclick={() => onModeChange('login')}>Login</button>
			<button type="button" class:active={mode === 'register'} onclick={() => onModeChange('register')}>Register</button>
		</div>

		{#if !configured}
			<div class="auth-alert">
				Konfigurasi Supabase belum tersedia.
			</div>
		{/if}

		<form class="auth-form" onsubmit={handleSubmit}>
			<label class="auth-honeypot" aria-hidden="true">
				<span>Website</span>
				<input bind:value={website} type="text" autocomplete="off" tabindex="-1" />
			</label>

			{#if mode === 'register'}
				<label>
					<span>Nama</span>
					<input bind:value={displayName} type="text" placeholder="Nama panggilan" autocomplete="nickname" />
				</label>
			{/if}

			<label>
				<span>Email</span>
				<input bind:value={email} type="email" placeholder="nama@email.com" autocomplete="email" required />
			</label>

			<label>
				<span>Password</span>
				<input bind:value={password} type="password" placeholder="Minimal 6 karakter" autocomplete="current-password" minlength="6" required />
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
