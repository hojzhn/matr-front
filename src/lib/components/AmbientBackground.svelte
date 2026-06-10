<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<!-- Solid backdrop (no gradient) -->
<div
	class="relative min-h-screen overflow-hidden bg-fill-soft text-ink transition-colors duration-500 dark:bg-canvas-from dark:text-fill"
>
	<main class="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6">
		{@render children()}
	</main>
</div>
