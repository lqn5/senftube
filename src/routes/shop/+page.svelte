<script>
    import { invalidateAll } from "$app/navigation";
    import Badge from "$lib/components/ui/badge/badge.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import Spinner from "$lib/components/ui/spinner/spinner.svelte";
    import { toast } from "svelte-sonner";

    let { data } = $props();

    let coins = $state(data.user.coins);

    const userBadges = data.user.userBadges;
    const equippedBadges = data.user.equippedBadges;

    let sortingBy = $state("");

    let equippedCount = $derived(badges.filter(b => b.equipped).length);

    // \CUSTOMIZE: add badges here
    // example
    // [
    //  {
    //    image: "example.com/example.png",
    //    text: "Example badge",
    //    price: 100,
    //    id: "example",
    //    ordering: false,
    //    equipped: equippedBadges.includes("example"),
    //    owned: userBadges.includes("example")
    //  }
    // ]
    let badges = $state([
        // add here
    ]);

    async function orderBadge(badge){
        badge.ordering = true;

        toast.info(badge.id + " wird bestellt.")

        const response = await fetch("/api/badge/order", {
            method: 'POST',
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                badgeId: badge.id
            })
        });

        const result = await response.json();

        if(!response.ok || !result.ok){
            toast.error(result.message ?? "Badge konnte nicht bestellt werden.");
            return badge.ordering = false;
        }

        badge.ordering = false;
        badge.owned = true;
        coins -= badge.price;
        await invalidateAll();
    }

    async function equipBadge(badge){
        badge.ordering = true;

        toast.info(badge.id + " wird equippiert.")

        const response = await fetch("/api/badge/equip", {
            method: 'POST',
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                badgeId: badge.id
            })
        });

        const result = await response.json();

        if(!response.ok || !result.ok){
            toast.error(result.message ?? "Badge konnte nicht equippiert werden.");
            return badge.ordering = false;
        }

        badge.ordering = false;
        badge.equipped = result.equipped ?? !badge.equipped;

        await invalidateAll();
    }
</script>
<div class="pt-24">
{#if equippedCount != 0}
<div class="mx-8 mb-8 m-auto border rounded-xl p-4 bg-muted/20 grid grid-cols-1 md:grid-cols-3 gap-4">
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
</div>
<h1 class="pl-8 text-2xl font-semibold">Shop</h1>
<p class="pl-8 mt-2 text-muted-foreground">Du hast {coins} Bytes</p>
<div class="w-fit flex gap-2 items-center pl-8 mt-2">
    <Badge class="cursor-pointer" onclick={() => {sortingBy == "bought" ? sortingBy = "" : sortingBy = "bought"}} variant={sortingBy == 'bought' ? "default" : "outline"}>Verfügbar</Badge>
    <Badge class="cursor-pointer" onclick={() => {sortingBy == "notbought" ? sortingBy = "" : sortingBy = "notbought"}} variant={sortingBy == 'notbought' ? "default" : "outline"}>Nicht gekauft</Badge>
    <Badge class="cursor-pointer" onclick={() => {sortingBy == "equipped" ? sortingBy = "" : sortingBy = "equipped"}} variant={sortingBy == 'equipped' ? "default" : "outline"}>Angelegt</Badge>
</div>
<div class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 px-8 pt-4">
    {#if sortingBy == ""}
    {#each badges as badge}
        <div class="p-4 border rounded-xl bg-muted/20">
            <div class="flex border bg-muted/20">
                <img class="w-16 h-16 object-contain self-center shrink-0" src={badge.image} alt="">
                <div class="p-2">
                    <h1>{badge.text}</h1>
                </div>
            </div>
            {#if !badge.owned}
            <Button onclick={() => {orderBadge(badge)}} disabled={badge.ordering || coins < badge.price} class="w-full mt-2">
                {#if badge.ordering}
                    <Spinner></Spinner>
                {/if}
                Erwerben × {badge.price} Bytes
            </Button>
            {:else}
            <Button disabled={badge.ordering || (!badge.equipped && equippedCount >= 3)} onclick={() => { equipBadge(badge) }} class="w-full mt-2">
                {#if badge.ordering}
                    <Spinner></Spinner>
                {/if}
                {badge.equipped ? 'Ablegen' : 'Anlegen'}
            </Button>
            {/if}
        </div>
    {/each}
    {:else if sortingBy == "bought"}
    {#each badges.filter(b => b.owned) as badge}
        <div class="p-4 border rounded-xl bg-muted/20">
            <div class="flex border bg-muted/20">
                <img class="w-16 h-16 object-contain self-center shrink-0" src={badge.image} alt="">
                <div class="p-2">
                    <h1>{badge.text}</h1>
                </div>
            </div>
            {#if !badge.owned}
            <Button onclick={() => {orderBadge(badge)}} disabled={badge.ordering || coins < badge.price} class="w-full mt-2">
                {#if badge.ordering}
                    <Spinner></Spinner>
                {/if}
                Erwerben × {badge.price} Bytes
            </Button>
            {:else}
            <Button disabled={badge.ordering || (!badge.equipped && equippedCount >= 3)} onclick={() => { equipBadge(badge) }} class="w-full mt-2">
                {#if badge.ordering}
                    <Spinner></Spinner>
                {/if}
                {badge.equipped ? 'Ablegen' : 'Anlegen'}
            </Button>
            {/if}
        </div>
    {/each}
    {:else if sortingBy == "notbought"}
    {#each badges.filter(b => !b.owned) as badge}
        <div class="p-4 border rounded-xl bg-muted/20">
            <div class="flex border bg-muted/20">
                <img class="w-16 h-16 object-contain self-center shrink-0" src={badge.image} alt="">
                <div class="p-2">
                    <h1>{badge.text}</h1>  
                </div>
            </div>
            {#if !badge.owned}
            <Button onclick={() => {orderBadge(badge)}} disabled={badge.ordering || coins < badge.price} class="w-full mt-2">
                {#if badge.ordering}
                    <Spinner></Spinner>
                {/if}
                Erwerben × {badge.price} Bytes
            </Button>
            {:else}
            <Button disabled={badge.ordering || (!badge.equipped && equippedCount >= 3)} onclick={() => { equipBadge(badge) }} class="w-full mt-2">
                {#if badge.ordering}
                    <Spinner></Spinner>
                {/if}
                {badge.equipped ? 'Ablegen' : 'Anlegen'}
            </Button>
            {/if}
        </div>
    {/each}
    {:else if sortingBy == "equipped"}
    {#each badges.filter(b => b.equipped) as badge}
        <div class="p-4 border rounded-xl bg-muted/20">
            <div class="flex border bg-muted/20">
                <img class="w-16 h-16 object-contain self-center shrink-0" src={badge.image} alt="">
                <div class="p-2">
                    <h1>{badge.text}</h1>
                </div>
            </div>
            {#if !badge.owned}
            <Button onclick={() => {orderBadge(badge)}} disabled={badge.ordering || coins < badge.price} class="w-full mt-2">
                {#if badge.ordering}
                    <Spinner></Spinner>
                {/if}
                Erwerben × {badge.price} Bytes
            </Button>
            {:else}
            <Button disabled={badge.ordering || (!badge.equipped && equippedCount >= 3)} onclick={() => { equipBadge(badge) }} class="w-full mt-2">
                {#if badge.ordering}
                    <Spinner></Spinner>
                {/if}
                {badge.equipped ? 'Ablegen' : 'Anlegen'}
            </Button>
            {/if}
        </div>
    {/each}
    {/if}
</div>
