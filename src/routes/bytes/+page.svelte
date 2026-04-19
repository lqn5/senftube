<script>
    import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
    import Flame from "$lib/assets/flame.png";
    import { ArrowRight, Coins, Lock } from 'lucide-svelte';
    import Button from '$lib/components/ui/button/button.svelte';
    import Check from '@lucide/svelte/icons/check';
    import { toast } from 'svelte-sonner';
    import Spinner from '$lib/components/ui/spinner/spinner.svelte';
    import { invalidateAll } from '$app/navigation';
    import * as Item from "$lib/components/ui/item/index.js";
    import TriangleAlert from '@lucide/svelte/icons/triangle-alert';

    let { data } = $props();

    let streakRewards = $state(data.streakRewards);

    function isToday(date) {
        if(date == null){
            return false;
        }
        const today = new Date();
        return (
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate()
        );
    }

    async function collectStreakReward(reward){
        reward.collecting = true;

        const response = await fetch("/api/streak/collect", {
            method: 'POST',
            body: JSON.stringify({
                days: reward.days
            })
        });

        const result = await response.json();

        reward.collecting = false;

        if(!result.ok){
            toast.error("Streak konnte nicht eingesammelt werden")
        }

        else{
            reward.collected = true;
            toast.success(result.message)
        }

        await invalidateAll();
    }
</script>
<h1 class="pt-24 pl-8 text-4xl font-semibold">Bytes</h1>
<p class="ml-8 text-muted-foreground">Du hast {data.user.coins} Bytes</p>
<hr class="mt-4">
{#if data.showStreakAlert && data.user.streak >= 1}
<Item.Root variant="outline" class="w-fit mt-4 ml-8">
    <Item.Media>
        <TriangleAlert class="size-5" />
    </Item.Media>
    <Item.Content>
        <Item.Title>Du kannst deine Streak verlängern!</Item.Title>
        <Item.Description>
            Du willst doch nicht etwa deine tolle {data.user.streak}-Tage-Streak verlieren, oder?
        </Item.Description>
    </Item.Content>
    <Item.Actions>
        <Button size="sm" href="/upload"><ArrowRight></ArrowRight> Video hochladen</Button>
    </Item.Actions>
</Item.Root>
{/if}
<h1 class="pl-8 font-semibold text-3xl pt-4">Streak - {data.user.streak} {data.user.streak == 1 ? "Tag" : "Tage"}</h1>
<p class="ml-8 text-muted-foreground">Höchste Streak: {data.user.maxStreak} {data.user.maxStreak == 1 ? "Tag" : "Tage"}</p>
<div class="flex flex-col gap-4 ml-8 mt-4">
    {#each streakRewards as reward}
        {#if data.user.maxStreak < reward.days}
        <div class="flex items-center gap-2">
            <div class="flex gap-2 text-muted-foreground w-28">
                <Lock></Lock> {reward.days} Tage
            </div>
            <Button disabled class="mt-2">Einsammeln</Button>
        </div>
        {:else}
        <div class="flex items-center gap-2">
            <div class="flex gap-2 w-28">
                <Check></Check> {reward.days} Tage
            </div>
            {#if reward.collected}
                <Button class="mt-2" disabled>Eingesammelt</Button>
            {:else}
                <Button class="mt-2 drop-shadow-[0_0_12px_rgba(255,0,0,0.5)]" onclick={() => {collectStreakReward(reward)}}>
                    {#if reward.collecting}
                        <Spinner></Spinner>
                    {/if}
                    Einsammeln
                </Button>
            {/if}
        </div>
        {/if}
    {/each}
</div>
<p class="pl-8 mt-4 text-muted-foreground">Poste jeden Tag ein Video, um deine Streak zu erhöhen</p>
<hr class="mt-4">
<h1 class="pl-8 font-semibold text-3xl pt-4">Quests <span class="text-xl text-muted-foreground">({new Date().toLocaleDateString('de-DE')})</span></h1>
{#if data.user.streak > 1}
    <p class="pl-8 text-muted-foreground">Wegen deiner {data.user.streak}-Tage-Streak bekommst du mehr Belohnungen!</p>
{/if}
<div class="flex flex-col pl-8 pt-2 pb-8">
    {#if isToday(data.user.lastUploadedVideo)}
        <div class="flex gap-2 items-center pointer-events-none line-through text-muted-foreground">
            <Checkbox checked></Checkbox> <p>Video hochladen ({100 + data.user.streak*3} Bytes)</p>
        </div>
    {:else}
        <div class="flex gap-2 items-center pointer-events-none">
            <Checkbox></Checkbox> <p>Video hochladen ({100 + data.user.streak*3} Bytes)</p>
        </div> 
    {/if}
    {#if isToday(data.user.lastCommented)}
        <div class="flex gap-2 items-center pointer-events-none line-through text-muted-foreground">
            <Checkbox checked></Checkbox> <p>Kommentieren ({50 + data.user.streak*3} Bytes)</p>
        </div>
    {:else}
        <div class="flex gap-2 items-center pointer-events-none">
            <Checkbox></Checkbox> <p>Kommentieren ({50 + data.user.streak*3} Bytes)</p>
        </div> 
    {/if}
</div>