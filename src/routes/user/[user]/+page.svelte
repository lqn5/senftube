<script>
    import LinkText from '$lib/components/self/LinkText.svelte';
    import Button from '$lib/components/ui/button/button.svelte';
    import { Heart, Pencil, Share2, Info, Check, Shield } from 'lucide-svelte';
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import Video from '$lib/components/self/Video.svelte';
    import { PUBLIC_CLOUDFLARE_IMAGE } from '$env/static/public';
    import Name from '$lib/components/self/Name.svelte';
    import Badge from '$lib/components/ui/badge/badge.svelte';

    let { data } = $props();

    let user = $derived(data?.profileUser);
    let subscribed = $derived(data.subdata);
    let subscribers = $derived(data.subscribers);

    let bioOpen = $state(false);
    // \CUSTOMIZE: add badges here as well
    // example
    // [
    //  {
    //    image: "example.com/example.png",
    //    text: "Example badge",
    //    price: 100,
    //    id: "example",
    //    ordering: false
    //  }
    // ]
    const BADGE_DEFINITIONS = [
       // add here
    ];

    let badges = $derived(
        BADGE_DEFINITIONS.map(b => ({
            ...b,
            equipped: data.equippedBadges.includes(b.id)
        }))
    );

    async function toggleSub() {
        if (subscribed) {
            subscribed = false;
            subscribers--;
        } else {
            subscribed = true;
            subscribers++;
        }

        await fetch("/api/subscribe", {
            method: 'POST',
            body: JSON.stringify({
                channel: data.profileUser.id
            })
        });
    }

    async function shareToClipBoard() {
        const url = new URL(`/user/${user.atHandle}`, window.location.origin).toString();
        const title = user.name;
        const text = `${title}\n${url}`;
        await navigator.clipboard.writeText(url);
        toast.success("In die Zwischenablage kopiert");
        await navigator.share({ title, text, url });
    }
</script>

{#if user}
<div class="w-full pt-24"></div>
<div class="flex-col sm:flex-row flex gap-4 ml-8 shrink-0">
    <img src={"https://imagedelivery.net/" + PUBLIC_CLOUDFLARE_IMAGE + "/" + user.image + "/public"} class="h-32 w-32 rounded-full sm:m-0 m-auto object-cover" alt="">
    <div class="text-center sm:text-left">
        <h1 class="text-2xl font-semibold flex items-center gap-1 justify-center sm:justify-start">
            <Name color={user.nameColor} text={user.name}></Name>
            {#if user.verified}
                <Check></Check>
            {/if}
            {#if user.role == "admin"}
                <Badge><Shield fill="white"></Shield>Admin</Badge>
            {/if}
        </h1>
        <h1 class="text-sm text-muted-foreground mt-1">@{user.atHandle} • {subscribers} Abonnent{subscribers != 1 ? "en" : ""}</h1>
        <div class="flex gap-1 text-muted-foreground mt-1 justify-center sm:justify-start">
            <LinkText text={user.bio.substring(0, 30).split("\n")[0]}></LinkText>
            <button onclick={() => { bioOpen = true }} class="text-foreground cursor-pointer">...mehr</button>
        </div>
        <div class="mt-4 justify-center sm:justify-start gap-2 flex">
            {#if data.user.atHandle != user.atHandle}
                <Button size="lg" onclick={toggleSub}>
                    {#if !subscribed}
                        <Heart></Heart>Abonnieren
                    {:else}
                        <Heart fill="white"></Heart>Abonniert
                    {/if}
                </Button>
            {/if}
            <Button size="lg" onclick={shareToClipBoard}><Share2></Share2>Teilen</Button>
            {#if data.user.atHandle == user.atHandle}
                <Button size="lg" href="/me"><Pencil></Pencil>Kanal bearbeiten</Button>
            {/if}
        </div>
    </div>
</div>

{#if badges.filter(b => b.equipped).length != 0}
<div class="mx-8 m-auto grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
    {#each badges.filter(b => b.equipped) as badge}
        <div class="flex border bg-muted/20">
            <img class="w-16 h-16 object-contain self-center shrink-0" src={badge.image} alt="">
            <div class="p-2">
                <h1>{badge.text}</h1>
            </div>
        </div>
    {/each}
</div>
{/if}

<div class="grid grid-cols-1 md:grid-cols-3 p-8 gap-8">
    {#each data?.videoData as video}
        <Video video={video}></Video>
    {/each}
    {#if data?.videoData?.length == 0}
        <h1 class="text-xl font-semibold text-center pt-12">Der benutzer hat keine Videos.</h1>
    {/if}
</div>

<AlertDialog.Root bind:open={bioOpen}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Benutzerdaten</AlertDialog.Title>
        </AlertDialog.Header>
        <div class="flex flex-col gap-2">
            <h1 class="text-xl font-semibold">Beschreibung</h1>
            <LinkText text={user.bio}></LinkText>
            <div class="flex gap-2 items-center mt-2">
                <Info></Info>Am {user.createdAt.toLocaleDateString('de-DE')} beigetreten
            </div>
        </div>
        <AlertDialog.Footer>
            <AlertDialog.Cancel>Fertig</AlertDialog.Cancel>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

{:else}
    <h1 class="text-center pt-24 text-3xl font-semibold">Der Benutzer existiert nicht (mehr)</h1>
    <div class="underline w-full flex justify-center text-2xl mt-4">
        <a href="/">Zurück zum Feed</a>
    </div>
{/if}