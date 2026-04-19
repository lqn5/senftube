<script>
    import { PUBLIC_CLOUDFLARE_IMAGE } from "$env/static/public";
    import { Check } from "lucide-svelte";

    let { video } = $props()
</script>
<a href={"/video/" + video.id} data-sveltekit-preload-data="off">
    <div>
        <div class="relative">
            <img alt="thumbnail" class="aspect-video w-full rounded-xl" src={"https://imagedelivery.net/" + PUBLIC_CLOUDFLARE_IMAGE + "/" + video.thumbnail + "/public"}>
            <h1 class="bg-background/80 p-1 px-2 text-sm rounded-xl absolute bottom-2 right-2">{video.duration}</h1>
        </div>
        <div class="flex mt-2 gap-4 items-center shrink-0">
            <img src={"https://imagedelivery.net/" + PUBLIC_CLOUDFLARE_IMAGE + "/" + video.image + "/public"} class="h-10 w-10 rounded-full object-cover" alt="">
            <div>
                <h1 class="text-xl font-semibold">{video.title}</h1>
                <h1 class="text-sm text-muted-foreground flex gap-1">
                    <span class="flex gap-1 items-center truncate">
                        @{video.atHandle}
                        {#if video.verified}
                            <Check size={14}></Check>
                        {/if}
                    </span>
                    <span class="shrink-0">
                        • {video.views} Aufrufe • {video.timestamp.toLocaleDateString('de-DE')}
                    </span>
                </h1>
            </div>
        </div>
    </div>
</a>