<script >
    import Video from '$lib/components/self/Video.svelte';
    import Check from '@lucide/svelte/icons/check';
	let { data } = $props();
</script>
{#if data.pinnedVideo}
<h1 class="text-center text-3xl font-semibold pt-24">Vom Team empfohlen</h1>
<div class="pt-4 flex justify-center">
	<div class="aspect-video w-full sm:w-1/2 px-8">
		<Video video={data.pinnedVideo}></Video>
	</div>
</div>
{/if}
<div class="grid grid-cols-1 md:grid-cols-3 p-8 gap-8 pt-24">
	{#each data?.videoData as video}
		<Video video={video}></Video>
	{/each}
	{#if data?.videoData?.length == 0}
		<h1 class="text-3xl font-bold">es gibt noch keine videos</h1>
	{/if}
</div>
