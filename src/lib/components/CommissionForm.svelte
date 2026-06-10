<script lang="ts">
	import { scale, fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { env as publicEnv } from '$env/dynamic/public';
	import GlassCard from './ui/GlassCard.svelte';
	import ProgressSteps from './ui/ProgressSteps.svelte';
	import BrandMark from './BrandMark.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import WelcomeStep from './WelcomeStep.svelte';
	import ArtworkStep from './ArtworkStep.svelte';
	import SuccessPanel from './SuccessPanel.svelte';
	import Turnstile from './ui/Turnstile.svelte';

	const TOTAL_STEPS = 2;

	// Signed timing token issued by +page.server.ts (anti-bot).
	let { formToken = '' }: { formToken?: string } = $props();

	const turnstileSiteKey = publicEnv.PUBLIC_TURNSTILE_SITE_KEY ?? '';

	let step = $state(1);
	let submitting = $state(false);
	let done = $state(false);
	let submitError = $state<string | null>(null);

	// Measured heights of each panel, so the body can animate its height between
	// steps (otherwise the card snaps when a shorter panel becomes active).
	let welcomeH = $state(0);
	let artworkH = $state(0);
	let successH = $state(0);

	const showWelcome = $derived(!done && step === 1);
	const showArtwork = $derived(!done && step === 2);
	const activeHeight = $derived(done ? successH : step === 1 ? welcomeH : artworkH);

	// Step 1
	let name = $state('');
	let email = $state('');

	// Step 2
	let imageFile = $state<File | null>(null);
	let artworkLink = $state('');
	let description = $state('');
	let size = $state('');
	let medium = $state('');

	// Anti-spam
	let honeypot = $state('');
	let turnstileToken = $state('');
	let turnstile = $state<{ reset: () => void } | null>(null);

	function next() {
		step = 2;
	}

	function back() {
		step = 1;
	}

	async function submit() {
		submitting = true;
		submitError = null;

		if (turnstileSiteKey && !turnstileToken) {
			submitError = 'Please complete the verification below.';
			submitting = false;
			return;
		}

		const form = new FormData();
		form.append('name', name);
		form.append('email', email);
		form.append('description', description);
		form.append('size', size);
		form.append('medium', medium);
		if (imageFile) {
			form.append('image', imageFile);
		} else {
			form.append('artworkLink', artworkLink);
		}
		// Anti-spam fields
		form.append('company', honeypot);
		form.append('formToken', formToken);
		form.append('turnstileToken', turnstileToken);

		try {
			// Don't set Content-Type — the browser adds the multipart boundary.
			const res = await fetch('/api/submissions', { method: 'POST', body: form });
			const data = await res.json().catch(() => ({ ok: false }));

			if (res.ok && data.ok) {
				done = true;
			} else {
				submitError = data.error ?? 'Something went wrong. Please try again.';
			}
		} catch {
			submitError = 'Network error. Please check your connection and try again.';
		} finally {
			submitting = false;
			// A Turnstile token is single-use; refresh it for any retry.
			if (!done) {
				turnstileToken = '';
				turnstile?.reset();
			}
		}
	}
</script>

<div in:scale={{ duration: 600, start: 0.96, opacity: 0, easing: quintOut }} class="w-full max-w-md">
	<GlassCard>
		<!-- Header -->
		<header class="flex items-center justify-between gap-3 px-6 pt-6">
			<BrandMark title="Commission Artwork" subtitle="Custom artwork for you" />
			<ThemeToggle />
		</header>

		<!-- Progress -->
		<div class="px-6 pt-5">
			<ProgressSteps current={step} total={TOTAL_STEPS} />
		</div>

		<!-- Body — panels overlap (only the active one is in flow); the wrapper's
		     height animates to the active panel so it grows AND shrinks smoothly. -->
		<div
			class="relative overflow-hidden transition-[height] duration-300 ease-out"
			style="height: {activeHeight ? `${activeHeight}px` : 'auto'}"
		>
			<!-- Step 1 -->
			<div
				bind:clientHeight={welcomeH}
				inert={!showWelcome}
				class="px-6 pb-6 pt-5 transition-all duration-300 ease-out {showWelcome
					? 'relative translate-x-0 opacity-100'
					: 'pointer-events-none absolute inset-x-0 top-0 -translate-x-4 opacity-0'}"
			>
				<WelcomeStep bind:name bind:email onnext={next} />
			</div>

			<!-- Step 2 -->
			<div
				bind:clientHeight={artworkH}
				inert={!showArtwork}
				class="px-6 pb-6 pt-5 transition-all duration-300 ease-out {showArtwork
					? 'relative translate-x-0 opacity-100'
					: `pointer-events-none absolute inset-x-0 top-0 opacity-0 ${done ? '-translate-x-4' : 'translate-x-4'}`}"
			>
				<ArtworkStep
					bind:file={imageFile}
					bind:artworkLink
					bind:description
					bind:size
					bind:medium
					bind:honeypot
					{submitting}
					onback={back}
					onsubmit={submit}
				>
					{#snippet captcha()}
						{#if turnstileSiteKey}
							<Turnstile bind:this={turnstile} siteKey={turnstileSiteKey} bind:token={turnstileToken} />
						{/if}
					{/snippet}
				</ArtworkStep>
				{#if submitError}
					<p
						in:fade
						class="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-center text-xs font-medium text-danger"
					>
						{submitError}
					</p>
				{/if}
			</div>

			<!-- Success -->
			<div
				bind:clientHeight={successH}
				inert={!done}
				class="px-6 pb-6 pt-5 transition-all duration-300 ease-out {done
					? 'relative translate-x-0 opacity-100'
					: 'pointer-events-none absolute inset-x-0 top-0 translate-x-4 opacity-0'}"
			>
				<SuccessPanel {name} {email} />
			</div>
		</div>
	</GlassCard>

	<p class="mt-4 text-center text-xs text-ink-faint dark:text-ink-muted">
		Step {step} of {TOTAL_STEPS} · Your details stay private
	</p>
</div>
