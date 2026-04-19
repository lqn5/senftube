<script >
    import Video from '$lib/components/self/Video.svelte';
import { onMount } from 'svelte';

	let { data } = $props();
</script>

{#if data?.videoData?.length == 0}
    <h1 class="text-xl font-semibold pt-24 p-8">Es gibt keine Videos, die zu dem Suchbegriff passen.</h1>
{:else}
    <h1 class="p-8 pb-4 pt-24 text-xl font-semibold">Ergebnisse für "{data.query}"</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 p-8 pt-0 gap-8">
        {#each data?.videoData as video}
            <Video video={video}></Video>
        {/each}
    </div>
{/if}