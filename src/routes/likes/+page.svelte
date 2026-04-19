<script >
    import Video from '$lib/components/self/Video.svelte';
import { Check } from 'lucide-svelte';

	let { data } = $props();
</script>
<h1 class="text-xl font-semibold pt-24 p-8 pb-0">Deine Likes</h1>
{#if data.videoData == null}
    <h1 class="pl-8">du hast noch nichts geliked :(</h1>
{/if}
<div class="grid grid-cols-1 md:grid-cols-3 p-8 gap-8">
	{#each data?.videoData as video}
		<Video video={video}></Video>
	{/each}
	{#if data?.videoData?.length == 0}
		<h1 class="text-3xl font-bold">es gibt noch keine videos</h1>
	{/if}
</div>
