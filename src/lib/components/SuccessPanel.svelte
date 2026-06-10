<script lang="ts">
	import { scale } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import Icon from './ui/Icon.svelte';

	let { name, email }: { name: string; email: string } = $props();
</script>

<div
	in:scale={{ duration: 500, start: 0.8, easing: backOut }}
	class="flex flex-col items-center py-10 text-center"
>
	<div
		class="mb-5 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-success to-success-deep text-surface shadow-lg shadow-success/30"
	>
		<Icon name="check" class="h-7 w-7" />
	</div>
	<h2 class="text-xl font-semibold">You're all set, {name.split(' ')[0]}</h2>
	<p class="mt-1.5 max-w-xs text-sm text-ink-muted dark:text-ink-faint">
		Your request is in. We'll reach out at
		<span class="font-medium text-ink-strong dark:text-ink-dim">{email}</span>.
	</p>
</div>
