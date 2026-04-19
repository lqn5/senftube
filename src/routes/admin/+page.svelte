<script>
    import { PUBLIC_CLOUDFLARE_IMAGE } from '$env/static/public';
    import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';

    let { data } = $props();

    async function toggleVerified(id){
        const response = await fetch("/api/user/update/verified", {
            method: 'POST',
            body: JSON.stringify({
                id
            })
        });

        toast.success("Geändert");
    }
</script>
<h1 class="pt-24 ml-8 text-xl font-semibold text-center sm:text-left">Admin Panel</h1>
<div class="mx-8 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
{#each data.users as user, i}
    <div class="flex items-center gap-2 p-2 bg-muted/20 rounded-xl border px-4">
        <a href={"/user/" + user.atHandle}><img src={"https://imagedelivery.net/" + PUBLIC_CLOUDFLARE_IMAGE + "/" + user.image + "/public"} alt="" class="h-8 w-8 rounded-full"></a>
        <div>
            <h1>{user.name}</h1>
            <h1 class="text-sm text-muted-foreground -mt-1">@{user.atHandle}</h1>
        </div>
        <Checkbox onclick={() => {toggleVerified(user.id)}} checked={user.verified} class="scale-150 ml-2"></Checkbox>
    </div>
{/each}
</div>