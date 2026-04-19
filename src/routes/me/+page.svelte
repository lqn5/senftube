<script>
    import Button from '$lib/components/ui/button/button.svelte';
    import Input from '$lib/components/ui/input/input.svelte';
    import Textarea from '$lib/components/ui/textarea/textarea.svelte';
    import { onMount } from 'svelte';
    import Spinner from '$lib/components/ui/spinner/spinner.svelte';
    import { Verified } from 'lucide-svelte';
    import { invalidateAll } from '$app/navigation';
    import LinkText from '$lib/components/self/LinkText.svelte';
    import { toast } from 'svelte-sonner';
    import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
    import Label from '$lib/components/ui/label/label.svelte';
    import Check from '@lucide/svelte/icons/check';
    import { PUBLIC_CLOUDFLARE_IMAGE } from '$env/static/public';
    import star from "$lib/assets/star.mp4";
    import Name from '$lib/components/self/Name.svelte';

    let { data } = $props();

    let image = $state();
    let imageInput;

    let originalName = $state("");
    let originalAtHandle = $state("");
    let originalBio = $state("");

    let name = $state("");
    let atHandle = $state("");
    let bio = $state("");

    let updatingName = $state(false);
    let updatingAtHandle = $state(false);
    let updatingBio = $state(false);
    let updatingImage = $state(false);

    let updateNameButtonDisabled = $derived(name == originalName || name.length == 0 || name.length > 30 || updatingName);
    let updateAtHandleButtonDisabled = $derived(atHandle == originalAtHandle || atHandle.length < 2 || updatingAtHandle);
    let updateBioButtonDisabled = $derived(bio == originalBio || bio.length == 0 || bio.length > 150 || updatingBio);

    let buyingName = $state(false);

    let canvas = $state();
    let ctx = $state();
    
    onMount(() => {
        originalName = data.user.name;
        originalAtHandle = data.user.atHandle;
        originalBio = data.user.bio;

        name = data.user.name;
        atHandle = data.user.atHandle;
        bio = data.user.bio;

        if(data.user.inventory.includes("neo")){
            ctx = canvas.getContext('2d');

            const w = canvas.width;
            const h = canvas.height;
            const cols = Math.floor(w / 10) + 1;
            const ypos = Array(cols).fill(0);

            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, w, h);

            setInterval(matrix, 50);
            
            function matrix () {
                ctx.fillStyle = '#0001';
                ctx.fillRect(0, 0, w, h);
                
                ctx.fillStyle = '#0f0';
                ctx.font = '7pt monospace';
                
                ypos.forEach((y, ind) => {
                    const text = String.fromCharCode(Math.random() * 128);
                    const x = ind * 10;
                    ctx.fillText(text, x, y);
                    if (y > 100 + Math.random() * 10000) ypos[ind] = 0;
                    else ypos[ind] = y + 10;
                });
            }
        }
    })

    async function uploadImage() {
        updatingImage = true;
        const requestresponse = await fetch("/api/user/update/image");
        const result = await requestresponse.json();

        const imageUploadUrl = result.uploadURL;

        const formData = new FormData();
        formData.append('file', image);

        const response = await fetch(imageUploadUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Bild-Upload fehlgeschlagen');
        }

        updatingImage = false;
        await invalidateAll();
    }

    async function updateName(){
        updatingName = true;

        const response = await fetch("/api/user/update/name", {
            method: 'POST',
            body: JSON.stringify({
                name
            })
        });

        const result = await response.json();

        if(!result.ok){
            toast.error("Dein Name konnte nicht geändert werden")
            return updatingName = false;
        }

        await invalidateAll();

        originalName = name;
        updatingName = false;
    }

    async function updateAtHandle(){
        updatingAtHandle = true;
        const response = await fetch("/api/user/update/athandle", {
            method: 'POST',
            body: JSON.stringify({
                atHandle
            })
        });

        let result = null;
        try {
            result = await response.json();
        } catch {
            result = null;
        }

        if(!response.ok || !result?.ok) {
            toast.error(result?.message || "Fehler beim Ändern des @Namens");
            updatingAtHandle = false;
            return;
        }

        await invalidateAll();

        originalAtHandle = atHandle;
        updatingAtHandle = false;
    }

    async function updateBio(){
        updatingBio = true;

        const response = await fetch("/api/user/update/bio", {
            method: 'POST',
            body: JSON.stringify({
                bio
            })
        });

        if(!response.ok) {
            toast.error("Fehler beim Speichern der Bio");
            updatingBio = false;
            return;
        }

        const result = await response.json();
        
        await invalidateAll();

        originalBio = bio;

        updatingBio = false;
    }

    async function equipName(type){
        const response = await fetch("/api/user/update/name-color", {
            method: 'POST',
            body: JSON.stringify({
                type
            })
        });

        if(!response.ok) {
            toast.error("Fehler beim ändern der Namensfarbe zu " + type);
            return;
        }

        await invalidateAll();
    }

    async function buyName(name){
        buyingName = true;
        const response = await fetch("/api/user/update/name-color/buy", {
            method: 'POST',
            body: JSON.stringify({
                type: name
            })
        });

        buyingName = false;

        if(!response.ok) {
            toast.error("Fehler beim kaufen der Namensfarbe");
            return;
        }

        await invalidateAll();
    }

    const shopItems = [
        { text: "Aqua", color: "aqua", price: 400 },
        { text: "Rosé", color: "rose", price: 600 },
        { text: "Gold", color: "gold", price: 800 },
        { text: "Comic", color: "comic", price: 1000},
        { text: "Obsidian", color: "obsidian", price: 1200 }
    ]
</script>
<h1 class="sm:pl-8 pt-24 font-semibold sm:text-left text-center text-3xl">Einstellungen</h1>
<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-8 pt-4">
    <div class="bg-muted/20 p-2 rounded-xl border">
        <Input bind:value={name} placeholder="Mike H."></Input>
        <Button class="mt-2 w-full" onclick={updateName} disabled={updateNameButtonDisabled}>
            {#if updatingName}
                <Spinner></Spinner>
            {/if}
            Namen übernehmen
        </Button>
    </div>
    <div class="bg-muted/20 p-2 rounded-xl border">
        <Input bind:value={atHandle} placeholder="@mike"></Input>
        <Button class="mt-2 w-full" onclick={updateAtHandle} disabled={updateAtHandleButtonDisabled}>
            {#if updatingAtHandle}
                <Spinner></Spinner>
            {/if}
            @Namen übernehmen
        </Button>
    </div>
    <div class="bg-muted/20 p-2 rounded-xl border">
        <Textarea bind:value={bio} placeholder="Yoo freunde!"></Textarea>
        <Button class="mt-2 w-full" onclick={updateBio} disabled={updateBioButtonDisabled}>
            {#if updatingBio}
                <Spinner></Spinner>
            {/if}
            Bio übernehmen
        </Button>
    </div>
    <div class="bg-muted/20 border rounded-2xl p-4 flex-col sm:flex-row flex gap-4 items-start overflow-hidden"> 
        <button onclick={() => imageInput.click()} class="shrink-0 m-auto sm:m-0 relative w-24 h-24 rounded-full overflow-hidden">
            {#if updatingImage}
                <div class="absolute inset-0 z-10 flex items-center justify-center bg-muted/80">
                    <Spinner class="h-14 w-14" />
                </div>
            {/if}
            <img
                alt="profile"
                class="w-full h-full object-cover z-0 bg-muted"
                class:opacity-50={updatingImage}
                src={"https://imagedelivery.net/" + PUBLIC_CLOUDFLARE_IMAGE + "/" + data.user.image + "/public"}
            />
        </button>
        <div class="w-full sm:w-fit">
            <div class="flex gap-1 items-center justify-center w-full sm:justify-start text-xl font-semibold">
                <Name text={data.user.name} color={data.user.nameColor}></Name>
                {#if data.user.verified}
                    <Check></Check>
                {/if}
            </div>
            <h3 class="text-sm text-muted-foreground mb-1 text-center sm:text-left">@{data.user.atHandle}</h3>
            <LinkText class="text-sm" text={data.user.bio}></LinkText>
            <input bind:this={imageInput} hidden accept="image/*" type="file" onchange={(e) => {image = e.target.files[0]; uploadImage()}} />
        </div>
    </div>
</div>
<h1 class="sm:pl-8 font-semibold sm:text-left text-center text-3xl">Namensfarben</h1>
<p class="sm:pl-8 text-muted-foreground sm:text-left text-center">Du hast {data.user.coins} Bytes</p>
<div class="px-8 grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2 mb-4">
    <div class="border rounded-xl p-4 flex flex-col gap-2">
        <h1 class="text-center text-2xl font-semibold">Standard</h1>
        <Button onclick={() => {equipName("default")}} class="w-full" disabled={data.user.nameColor == "default"}>{data.user.nameColor != "default" ? "Ausrüsten" : "Ausgerüstet"}</Button>
    </div>
    {#each shopItems as item}
        <div class="border rounded-xl p-4 flex flex-col gap-2">
            <h1 class="text-2xl text-center font-semibold">
                <Name text={item.text} color={item.color}></Name>
            </h1>
            {#if !data.user.inventory.includes(item.color)}
                <Button onclick={() => {buyName(item.color)}} class="w-full" disabled={data.user.coins < item.price || buyingName}>
                    Kaufen - {item.price} Bytes
                </Button>
            {:else}
                <Button onclick={() => {equipName(item.color)}} class="w-full" disabled={data.user.nameColor == item.color}>{data.user.nameColor != item.color ? "Ausrüsten" : "Ausgerüstet"}</Button>
            {/if}
        </div>
    {/each}
    <h1 class="font-semibold sm:text-left mt-4 text-center text-3xl sm:col-span-2">Special</h1>
    {#if !data.user.inventory.includes("neo") && !data.user.inventory.includes("astra") && !data.user.inventory.includes("rainbow")}
        <h1 class="text-muted-foreground sm:text-left text-center -mt-4 sm:col-span-2">Du hast noch keine Special-Farben gefunden.</h1>
    {/if}
    {#if data.user.inventory.includes("neo")}
        <div class="border rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden">
            <canvas bind:this={canvas} class="absolute top-0 left-0 w-full z-0 opacity-40"></canvas>
            <h1 class="text-2xl text-center font-semibold">
                <Name text="Neo" color="neo"></Name>
            </h1>
            <Button onclick={() => {equipName("neo")}} class="w-full z-10" disabled={data.user.nameColor == "neo"}>{data.user.nameColor != "neo" ? "Ausrüsten" : "Ausgerüstet"}</Button>
        </div>
    {/if}
    {#if data.user.inventory.includes("astra")}
        <div class="border rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden">
            <video src={star} class="absolute object-cover top-0 left-0" autoplay loop></video>
            <h1 class="text-2xl text-center font-semibold">
                <Name text="Astra" color="astra"></Name>
            </h1>
            <Button onclick={() => {equipName("astra")}} class="w-full z-10" disabled={data.user.nameColor == "astra"}>{data.user.nameColor != "astra" ? "Ausrüsten" : "Ausgerüstet"}</Button>
        </div>
    {/if}
    {#if data.user.inventory.includes("rainbow")}
        <div class="border rounded-xl p-4 flex flex-col gap-2 relative bg-linear-to-tr from-blue-300/10 via-green-400/10 to-red-300/10 animated-background">
            <h1 class="text-2xl text-center font-semibold">
                <Name text="Rainbow" color="rainbow"></Name>
            </h1>
            <Button onclick={() => {equipName("rainbow")}} class="w-full z-10" disabled={data.user.nameColor == "rainbow"}>{data.user.nameColor != "rainbow" ? "Ausrüsten" : "Ausgerüstet"}</Button>
        </div>
    {/if}
</div>
