<script lang="ts">
	import TextField from './ui/TextField.svelte';
	import Button from './ui/Button.svelte';
	import Icon from './ui/Icon.svelte';

	let {
		name = $bindable(''),
		email = $bindable(''),
		onnext
	}: { name?: string; email?: string; onnext?: () => void } = $props();

	const emailOk = $derived(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
	const valid = $derived(name.trim().length > 1 && emailOk);
</script>

<h1 class="text-lg font-semibold tracking-tight">Hello!</h1>
<p class="mt-1 text-sm text-ink-muted dark:text-ink-faint">Tell us who you are to get started.</p>

<div class="mt-6 space-y-4">
	<TextField label="Name" bind:value={name} placeholder="John Doe" />
	<TextField
		label="Email"
		type="email"
		bind:value={email}
		placeholder="john@example.com"
		error={email && !emailOk ? 'Enter a valid email' : ''}
	/>
</div>

<Button class="mt-6 w-full" onclick={onnext} disabled={!valid}>
	Continue
	<Icon name="arrow-right" class="h-4 w-4 transition-transform group-enabled:group-hover:translate-x-0.5" />
</Button>
