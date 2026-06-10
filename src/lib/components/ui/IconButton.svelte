<script lang="ts" module>
	export type IconButtonVariant = 'outline' | 'overlay' | 'ghost';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'outline',
		onclick,
		ariaLabel,
		class: cls = '',
		children
	}: {
		variant?: IconButtonVariant;
		onclick?: (e: MouseEvent) => void;
		ariaLabel: string;
		class?: string;
		children: Snippet;
	} = $props();

	const VARIANTS: Record<IconButtonVariant, string> = {
		outline:
			'h-11 w-11 shrink-0 rounded-xl border border-line/80 bg-surface/60 text-ink-body transition hover:bg-surface dark:border-surface/10 dark:bg-surface/[0.03] dark:text-ink-dim dark:hover:bg-surface/[0.07]',
		overlay:
			'h-7 w-7 rounded-full bg-shade/50 text-surface backdrop-blur-md transition hover:bg-shade/70',
		ghost:
			'h-9 w-9 rounded-full border border-surface/20 bg-surface/10 text-ink-body backdrop-blur-md transition-all hover:scale-105 hover:bg-surface/20 active:scale-95 dark:border-surface/10 dark:bg-surface/5 dark:text-ink-dim'
	};
</script>

<button
	type="button"
	{onclick}
	aria-label={ariaLabel}
	class="grid place-items-center {VARIANTS[variant]} {cls}"
>
	{@render children()}
</button>
