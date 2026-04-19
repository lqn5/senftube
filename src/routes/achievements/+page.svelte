<script>
    import { invalidateAll } from "$app/navigation";
    import Button from "$lib/components/ui/button/button.svelte";
    import Progress from "$lib/components/ui/progress/progress.svelte";
    import Spinner from "$lib/components/ui/spinner/spinner.svelte";
    import { MessageSquare, MonitorPlay, Palette, Play, Star, Trophy } from "lucide-svelte";
    import { toast } from "svelte-sonner";

    let { data } = $props();

    let achievements = $state(data.achievements);

    async function collectAchievement(achievement){
        achievement.collecting = true;

        const response = await fetch("/api/achievements/collect", {
            method: 'POST',
            body: JSON.stringify({
                achievement: achievement.id
            })
        });

        const result = await response.json();

        if(!result.ok){
            toast.error("Belohnung konnte nicht eingesammelt werden")
            return achievement.collecting = false;
        }

        toast.success(result.message);

        achievement.collecting = false;
        achievement.collected = true;
        await invalidateAll();
    }
</script>
<h1 class="pt-24 pl-8 text-2xl font-semibold">Achievements</h1>
<div class="grid grid-cols-1 lg:grid-cols-3 p-8 pt-4 gap-4">
    {#each achievements as achievement}
        <div class="border p-4 bg-muted/20 rounded-xl">
            <div class="flex gap-4">
                {#if achievement.icon == "monitor-play"}
                    <MonitorPlay size={54}></MonitorPlay>
                {/if}
                {#if achievement.icon == "star"}
                    <Star size={54}></Star>
                {/if}
                {#if achievement.icon == "trophy"}
                    <Trophy size={54}></Trophy>
                {/if}
                {#if achievement.icon == "message-square"}
                    <MessageSquare size={54}></MessageSquare>
                {/if}
                {#if achievement.icon == "palette"}
                    <Palette size={54}></Palette>
                {/if}
                {#if achievement.icon == "play"}
                    <Play size={54}></Play>
                {/if}
                <div>
                    <h1 class="text-xl font-semibold">{achievement.title}</h1>
                    <p class="text-sm text-muted-foreground">{achievement.description}</p>
                </div>
            </div>
            <div class="flex gap-2 items-center justify-between">
                <p>{achievement.value}/{achievement.max}</p>
                <Progress max={achievement.max} value={achievement.value}></Progress>
                {#if achievement.completed && !achievement.collected}
                    <Button onclick={() => {collectAchievement(achievement)}} disabled={achievement.collecting}>
                        {#if achievement.collecting}
                            <Spinner></Spinner>
                        {/if}
                        Einsammeln
                    </Button>
                {:else if achievement.collected}
                    <Button disabled>Eingesammelt</Button>
                {:else}
                    <Button disabled>Einsammeln</Button>
                {/if}
            </div>
        </div>
    {/each}
</div>