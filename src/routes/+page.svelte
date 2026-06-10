<script lang="ts">
	import AmbientBackground from '$lib/components/AmbientBackground.svelte';
	import CommissionForm from '$lib/components/CommissionForm.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Matr Labs</title>
</svelte:head>

<AmbientBackground>
	<CommissionForm formToken={data.formToken} />
</AmbientBackground>
