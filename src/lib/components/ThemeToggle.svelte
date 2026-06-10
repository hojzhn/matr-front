<script lang="ts">
	import { onMount } from 'svelte';
	import IconButton from './ui/IconButton.svelte';
	import Icon from './ui/Icon.svelte';

	let dark = $state(false);

	onMount(() => {
		dark = document.documentElement.classList.contains('dark');
	});

	function toggle() {
		dark = !dark;
		document.documentElement.classList.toggle('dark', dark);
		try {
			localStorage.setItem('theme', dark ? 'dark' : 'light');
		} catch (e) {}
	}
</script>

<IconButton variant="ghost" onclick={toggle} ariaLabel="Toggle theme">
	<Icon name={dark ? 'sun' : 'moon'} class="h-[18px] w-[18px]" />
</IconButton>
