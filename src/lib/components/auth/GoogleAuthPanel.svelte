<script lang="ts">
	let { configured = true, loading = false, error = '', onGoogle } = $props<{
		configured?: boolean;
		loading?: boolean;
		error?: string;
		onGoogle: () => void | Promise<void>;
	}>();
</script>

<section class="auth-gate">
	<div class="auth-card">
		<div class="auth-eyebrow">Bisik</div>
		<h1 class="auth-title">Masuk dengan Google</h1>
		<p class="auth-copy">Login dipakai untuk menyimpan jurnal dan membuka halaman lain.</p>

		{#if !configured}
			<div class="auth-alert">Konfigurasi Supabase belum tersedia.</div>
		{/if}

		{#if error}
			<div class="auth-error">{error}</div>
		{/if}

		<button class="auth-submit" type="button" disabled={loading || !configured} onclick={onGoogle}>
			{#if loading}
				Memproses...
			{:else}
				Lanjut dengan Google
			{/if}
		</button>
	</div>
</section>

