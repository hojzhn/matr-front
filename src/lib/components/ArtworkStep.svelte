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

	const hasArtwork = $derived(!!file || isValidUrl(artworkLink));
	const valid = $derived(
		title.trim().length > 0 && hasArtwork && description.trim().length > 0 && !!size && !!medium
	);
</script>

<h1 class="text-lg font-semibold tracking-tight">Describe your piece</h1>
<p class="mt-1 text-sm text-ink-muted dark:text-ink-faint">How would you like us to make an artwork for you?</p>

<!-- Composer -->
<div
	class="mt-5 rounded-2xl border border-line/80 bg-surface/70 p-2 transition-all focus-within:border-brand-ring focus-within:ring-2 focus-within:ring-brand-ring/30 dark:border-surface/10 dark:bg-surface/[0.03]"
>
	<input
		bind:value={title}
		type="text"
		placeholder="Title of your piece"
		class="mb-2 w-full bg-transparent px-3 py-2 text-sm font-semibold outline-none placeholder:font-normal placeholder:text-ink-faint dark:placeholder:text-ink-muted"
	/>

	<ImageDropzone bind:file linked={!file && artworkLink.trim().length > 0} />

	{#if !file}
		<div class="mt-2 flex items-center gap-2 px-1">
			<span class="text-xs font-medium text-ink-faint">or paste a link</span>
			<input
				bind:value={artworkLink}
				type="url"
				inputmode="url"
				placeholder="https://…"
				class="min-w-0 flex-1 rounded-lg border border-line/80 bg-surface/50 px-3 py-1.5 text-xs outline-none transition-all placeholder:text-ink-faint focus:border-brand-ring focus:ring-2 focus:ring-brand-ring/30 dark:border-surface/10 dark:bg-surface/[0.03] dark:placeholder:text-ink-muted"
			/>
		</div>
	{/if}

	<textarea
		bind:value={description}
		rows="2"
		placeholder="Describe your piece…"
		class="thin-scroll my-2 w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-ink-faint dark:placeholder:text-ink-muted"
	></textarea>
<hr class="mb-4 border-line/80 dark:border-surface/10"/>
	<div class="space-y-2.5 px-1 pb-1">
		<SizeInput label="Size" bind:value={size} />
		<ChipGroup label="Medium" options={MEDIUMS} bind:value={medium} />
	</div>
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

<!-- Actions -->
<div class="mt-5 flex gap-3">
	<IconButton variant="outline" onclick={onback} ariaLabel="Back">
		<Icon name="arrow-left" class="h-4 w-4" />
	</IconButton>
	<Button class="flex-1" onclick={onsubmit} disabled={!valid} loading={submitting}>
		{#if submitting}
			<Spinner class="h-4 w-4" />
			Submitting…
		{:else}
			Submit
			<Icon name="send" class="h-4 w-4" />
		{/if}
	</Button>
</div>
