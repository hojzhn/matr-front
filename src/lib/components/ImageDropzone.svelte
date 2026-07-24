<script lang="ts">
	import { scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import Icon from './ui/Icon.svelte';
	import IconButton from './ui/IconButton.svelte';
	import { MAX_IMAGE_BYTES, MAX_IMAGE_LABEL } from '$lib/constants';

	let { file = $bindable(null) }: { file?: File | null } = $props();

	let preview = $state<string | null>(null);
	let dragOver = $state(false);
	let error = $state<string | null>(null);

	function load(f: File | undefined | null) {
		if (!f) return;
		if (!f.type.startsWith('image/')) {
			error = 'That file isn’t an image.';
			return;
		}
		if (f.size > MAX_IMAGE_BYTES) {
			error = `Image is too large (max ${MAX_IMAGE_LABEL}).`;
			return;
		}
		error = null;
		file = f;
		const reader = new FileReader();
		reader.onload = (e) => (preview = e.target?.result as string);
		reader.readAsDataURL(f);
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		load(e.dataTransfer?.files?.[0]);
	}

	function onPick(e: Event) {
		load((e.target as HTMLInputElement).files?.[0]);
	}

	function clear() {
		file = null;
		preview = null;
		error = null;
	}
</script>

{#if preview}
	<div in:scale={{ duration: 300, start: 0.95, easing: quintOut }} class="relative">
		<img src={preview} alt="preview" class="h-44 w-full rounded-xl object-cover" />
		<IconButton variant="overlay" class="absolute right-2 top-2" onclick={clear} ariaLabel="Remove image">
			<Icon name="close" class="h-4 w-4" />
		</IconButton>
	</div>
{:else}
	<label
		ondragover={(e) => {
			e.preventDefault();
			dragOver = true;
		}}
		ondragleave={() => (dragOver = false)}
		ondrop={onDrop}
		class="flex h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-center transition-all {dragOver
			? 'border-brand-ring bg-brand-ring/10 dark:bg-brand-soft/10'
			: 'border-ink-dim/80 dark:border-surface/15'}"
	>
		<input type="file" accept="image/*" class="hidden" onchange={onPick} />
		<div
			class="grid h-10 w-10 place-items-center rounded-full bg-fill text-ink-muted dark:bg-surface/10 dark:text-ink-dim"
		>
			<Icon name="upload" class="h-5 w-5" />
		</div>
		<p class="text-sm font-medium">
			Drop an image or <span class="text-brand dark:text-brand-ring">browse</span>
		</p>
		<p class="text-xs text-ink-faint">PNG, JPG up to {MAX_IMAGE_LABEL}</p>
	</label>
{/if}

{#if error}
	<p class="mt-1.5 px-1 text-xs text-danger">{error}</p>
{/if}
