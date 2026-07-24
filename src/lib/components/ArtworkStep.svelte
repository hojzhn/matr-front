<script lang="ts">
	import ImageDropzone from './ImageDropzone.svelte';
	import ChipGroup from './ui/ChipGroup.svelte';
	import SizeInput from './ui/SizeInput.svelte';
	import Button from './ui/Button.svelte';
	import IconButton from './ui/IconButton.svelte';
	import Icon from './ui/Icon.svelte';
	import Spinner from './ui/Spinner.svelte';
	import type { Snippet } from 'svelte';

	const MEDIUMS = ['Stretched', 'Unstretched', 'Paper', "Other"];

	let {
		title = $bindable(''),
		file = $bindable(null),
		artworkLink = $bindable(''),
		description = $bindable(''),
		size = $bindable(''),
		medium = $bindable(''),
		honeypot = $bindable(''),
		submitting = false,
		onback,
		onsubmit,
		captcha
	}: {
		title?: string;
		file?: File | null;
		artworkLink?: string;
		description?: string;
		size?: string;
		medium?: string;
		honeypot?: string;
		submitting?: boolean;
		onback?: () => void;
		onsubmit?: () => void;
		captcha?: Snippet;
	} = $props();

	function isValidUrl(value: string): boolean {
		try {
			const u = new URL(value.trim());
			return u.protocol === 'http:' || u.protocol === 'https:';
		} catch {
			return false;
		}
	}

	// Description is optional; everything else is required.
	const hasArtwork = $derived(!!file || isValidUrl(artworkLink));
	const valid = $derived(title.trim().length > 0 && hasArtwork && !!size && !!medium);

	let clientError = $state<string | null>(null);
	let mode = $state<'upload' | 'link'>(file ? 'upload' : artworkLink.trim() ? 'link' : 'upload');

	function formatList(items: string[]): string {
		if (items.length === 1) return items[0];
		return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
	}

	// The button is always clickable; on click we surface what's missing instead
	// of silently disabling, then only proceed when valid.
	function handleSubmit() {
		const missing: string[] = [];
		if (!title.trim()) missing.push('a title');
		if (!hasArtwork) missing.push('an image or link');
		if (!size) missing.push('a size');
		if (!medium) missing.push('a medium');

		if (missing.length) {
			clientError = `Please add ${formatList(missing)}.`;
			return;
		}
		clientError = null;
		onsubmit?.();
	}

	// Clear the message as soon as the form becomes valid.
	$effect(() => {
		if (valid) clientError = null;
	});
</script>

<h1 class="text-lg font-semibold tracking-tight">Describe your piece</h1>
<p class="mt-1 text-sm text-ink-muted dark:text-ink-faint">How would you like us to make an artwork for you?</p>

<!-- Composer -->
<div
	class="mt-5 rounded-2xl border border-line/80 bg-surface/70 p-4 dark:border-surface/10 dark:bg-surface/[0.03]"
>
	<div class="space-y-3">
		<div>
			<p class="mb-1.5 px-1 text-xs font-medium text-ink-muted dark:text-ink-faint">Title</p>
			<input
				bind:value={title}
				type="text"
				placeholder="Title of your piece"
				class="w-full rounded-lg border border-line/80 bg-surface/50 px-3 py-2 text-sm font-semibold outline-none transition-all placeholder:font-normal placeholder:text-ink-faint focus:border-brand-ring focus:ring-2 focus:ring-brand-ring/30 dark:border-surface/10 dark:bg-surface/[0.03] dark:placeholder:text-ink-muted"
			/>
		</div>
<hr class="my-4 border-line/80 dark:border-surface/10"/>
		<div>
			<p class="mb-1.5 px-1 text-xs font-medium text-ink-muted dark:text-ink-faint">Image</p>
			<div
				class="mb-2 flex rounded-full border border-line/80 bg-surface/50 p-1 dark:border-surface/10 dark:bg-surface/[0.03]"
			>
				<button
					type="button"
					onclick={() => {
						mode = 'upload';
						artworkLink = '';
					}}
					class="flex-1 rounded-full py-1.5 text-xs font-medium transition-all {mode === 'upload'
						? 'bg-gradient-to-r from-brand to-brand-accent text-surface shadow shadow-brand-soft/30'
						: 'text-ink-muted hover:text-brand dark:text-ink-dim'}"
				>
					Upload
				</button>
				<button
					type="button"
					onclick={() => {
						mode = 'link';
						file = null;
					}}
					class="flex-1 rounded-full py-1.5 text-xs font-medium transition-all {mode === 'link'
						? 'bg-gradient-to-r from-brand to-brand-accent text-surface shadow shadow-brand-soft/30'
						: 'text-ink-muted hover:text-brand dark:text-ink-dim'}"
				>
					Link
				</button>
			</div>

			{#if mode === 'upload'}
				<ImageDropzone bind:file />
			{:else}
				<div
					class="flex h-36 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-ink-dim/80 px-4 text-center transition-all focus-within:border-brand-ring focus-within:ring-2 focus-within:ring-brand-ring/30 dark:border-surface/15"
				>
					<div
						class="grid h-10 w-10 place-items-center rounded-full bg-fill text-ink-muted dark:bg-surface/10 dark:text-ink-dim"
					>
						<Icon name="link" class="h-5 w-5" />
					</div>
							<p class="text-sm font-medium">
						Provide a link to your image
		</p>
					<input
						bind:value={artworkLink}
						type="url"
						inputmode="url"
						placeholder="http://drive.google.com/..."
						class="w-full max-w-xs bg-transparent text-center text-sm outline-none placeholder:text-ink-faint dark:placeholder:text-ink-muted"
					/>
				</div>
			{/if}
		</div>
<hr class="my-4 border-line/80 dark:border-surface/10"/>
		<div>
			<p class="mb-1.5 px-1 text-xs font-medium text-ink-muted dark:text-ink-faint">Description</p>
			<textarea
				bind:value={description}
				rows="2"
				placeholder="Describe your piece… (optional)"
				class="thin-scroll w-full resize-none rounded-lg border border-line/80 bg-surface/50 px-3 py-2 text-sm outline-none transition-all placeholder:text-ink-faint focus:border-brand-ring focus:ring-2 focus:ring-brand-ring/30 dark:border-surface/10 dark:bg-surface/[0.03] dark:placeholder:text-ink-muted"
			></textarea>
		</div>
	</div>
<hr class="my-4 border-line/80 dark:border-surface/10"/>

		<SizeInput label="Size" bind:value={size} />
	<hr class="my-4 border-line/80 dark:border-surface/10"/>
		<ChipGroup label="Medium" options={MEDIUMS} bind:value={medium} />

</div>

<!-- Honeypot — hidden from real users; bots that auto-fill fields trip it. -->
<input
	bind:value={honeypot}
	name="company"
	type="text"
	tabindex="-1"
	autocomplete="off"
	aria-hidden="true"
	class="pointer-events-none absolute h-0 w-0 opacity-0"
	style="left: -9999px"
/>

{#if captcha}
	<div class="mt-4 flex justify-center">
		{@render captcha()}
	</div>
{/if}

{#if clientError}
	<p class="mt-3 text-center text-xs font-medium text-danger">{clientError}</p>
{/if}

<!-- Actions -->
<div class="mt-3 flex gap-3">
	<IconButton variant="outline" onclick={onback} ariaLabel="Back">
		<Icon name="arrow-left" class="h-4 w-4" />
	</IconButton>
	<Button class="flex-1" onclick={handleSubmit} loading={submitting}>
		{#if submitting}
			<Spinner class="h-4 w-4" />
			Submitting…
		{:else}
			Submit
			<Icon name="send" class="h-4 w-4" />
		{/if}
	</Button>
</div>
