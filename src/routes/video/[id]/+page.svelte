<script>
    import { goto, invalidateAll } from '$app/navigation';
    import Button from '$lib/components/ui/button/button.svelte';
    import { Heart, Pencil, Send, Share2, ThumbsDown, ThumbsUp, Trash, Check, Ellipsis, Pin, PinOff, Bot, DollarSign, Coins, Gem, Crown } from 'lucide-svelte';
    import { toast } from 'svelte-sonner';
    import * as ButtonGroup from "$lib/components/ui/button-group";
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import Input from '$lib/components/ui/input/input.svelte';
    import Textarea from '$lib/components/ui/textarea/textarea.svelte';
    import Spinner from '$lib/components/ui/spinner/spinner.svelte';
    import LinkText from '$lib/components/self/LinkText.svelte';
    import { PUBLIC_CLOUDFLARE_IMAGE, PUBLIC_CLOUDFLARE_STREAM_CUSTOMER } from '$env/static/public';
    import Name from '$lib/components/self/Name.svelte';
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import Badge from '$lib/components/ui/badge/badge.svelte';
    import Info from '@lucide/svelte/icons/info';
    import * as Popover from "$lib/components/ui/popover"
    let { data } = $props();

    let videoLikeType = $derived(data.video.type);
    let likes = $derived(data.video.likes);
    let dislikes = $derived(data.video.dislikes);

    let originalLikes = $derived(data.video.likes);
    let originalDislikes = $derived(data.video.dislikes);

    let subscribed = $derived(data.video.subdata);
    let subscribers = $derived(data.video.subscribers);

    let editedTitle = $derived(data.video.title);
    let editedDescription = $derived(data.video.description);

    let editVideoOpen = $state(false);
    let editVideoButtonDisabled = $derived(editedTitle.length == 0 || editedTitle.length > 30 || editedDescription.length == 0 || editedDescription.length > 150 || editingVideo);
    let editingVideo = $state(false);

    let sendingComment = $state(false);
    let comment = $state("");
    let sendCommentDisabled = $derived(comment.length == 0 || comment.length > 150 || sendingComment);

    let comments = $state(data.video.commentData);

    let donationValue = $state(0);
    let donationOpen = $state(false);

    async function deleteVideo(){
        const response = await fetch("/api/video/delete", {
            method: 'POST',
            body: JSON.stringify({
                videoId: data.video.id
            })
        });

        toast.success("Video gelöscht.")
        goto("/");
    }

    async function editVideo(){
        editingVideo = true;
        const response = await fetch("/api/video/edit", {
            method: 'POST',
            body: JSON.stringify({
                videoId: data.video.id, 
                newTitle: editedTitle,
                newDescription: editedDescription
            })
        });

        toast.success("Video bearbeitet.")
        editingVideo = false;

        editVideoOpen = false;

        await invalidateAll();
    }

    async function setLike(newState){
        if(videoLikeType == "like" && newState == ""){
            likes--;
        }
        if(videoLikeType == "dislike" && newState == ""){
            dislikes--;
        }

        if(videoLikeType == "" && newState == "like"){
            likes++;
        }
        if(videoLikeType == "" && newState == "dislike"){
            dislikes++;
        }

        if(videoLikeType == "like" && newState == "dislike"){
            likes--;
            dislikes++;
        }
        if(videoLikeType == "dislike" && newState == "like"){
            likes++;
            dislikes--;
        }

        videoLikeType = newState;

        await fetch("/api/video/like", {
            method: 'POST',
            body: JSON.stringify({
                videoId: data.video.id,
                newState
            })
        });
    }

    async function toggleSub(){
        if(subscribed){
            subscribed = false;
            subscribers--;
        }
        else{
            subscribed = true;
            subscribers++;
        }

        await fetch("/api/subscribe", {
            method: 'POST',
            body: JSON.stringify({
                channel: data.video.user
            })
        });
    }

    async function shareToClipBoard(){
        const url = new URL(`/video/${data.video.id}`, window.location.origin).toString();
		const title = data.video.title;
		const text = `${title}\n${url}`;
        await navigator.clipboard.writeText(url);
        toast.success("In die Zwischenablage kopiert"),
        await navigator.share({ title, text, url });
    }

    async function sendComment(){
        sendingComment = true;
        const response = await fetch("/api/comment", {
            method: 'POST',
            body: JSON.stringify({
                video: data.video.id,
                comment,
                donation: donationValue
            })
        });

        if(!response.ok){
            comment = "";
            comments = data.video.commentData;
            sendingComment = false;
            toast.error("Dein Kommentar konnte nicht veröffentlicht werden")
        }

        const result = await response.json()

        toast.success(result.message)

        await invalidateAll();
        comment = "";
        comments = data.video.commentData;
        donationValue = 0;
        sendingComment = false;
    }

    async function deleteComment(id){
        await fetch("/api/comment", {
            method: 'DELETE',
            body: JSON.stringify({
                id
            })
        });
        await invalidateAll();
        comments = data.video.commentData;
        toast.success("Kommentar gelöscht")
    }

    async function toggleCommentLike(id){
        for(let i = 0; i < comments.length; i++){
            if(comments[i].id == id){
                if(comments[i].userCommentLikeData.length == 0){  
                    comments[i].userCommentLikeData = [true];
                    comments[i].totalCommentLikes++;
                }
                else{
                    comments[i].userCommentLikeData = [];
                    comments[i].totalCommentLikes--;
                }
            }
        }
        await fetch("/api/comment/like", {
            method: 'POST',
            body: JSON.stringify({
                id
            })
        });
    }

    async function pinComment(comment){
        const response = await fetch("/api/comment/pin", {
            method: 'POST',
            body: JSON.stringify({
                comment
            })
        });

        if(!response.ok){
            return toast.error("Kommentar konnte nicht angepinnt werden")
        }

        const result = await response.json()

        await invalidateAll();

        comments = data.video.commentData;
    }

    async function pinVideo(){
        const response = await fetch("/api/video/pin", {
            method: 'POST',
            body: JSON.stringify({
                video: data.video.id
            })
        })

        if(!response.ok){
            return toast.error("Video konnte nicht angepinnt werden");
        }

        const result = await response.json()

        toast.success("Video angepinnt")
    }
</script>
<div class="pt-16 h-dvh">
    <div style="position: relative;" class="pt-128 h-full rounded-xl overflow-hidden mx-4 mt-4">
    <iframe
        src={"https://customer-" + PUBLIC_CLOUDFLARE_STREAM_CUSTOMER + ".cloudflarestream.com/" + data.video.videoFile + "/iframe?autoplay=true&poster=https://customer-" + PUBLIC_CLOUDFLARE_STREAM_CUSTOMER + ".cloudflarestream.com/" + data.video.videoFile + "/thumbnails/thumbnail.jpg"}
        loading="lazy"
        style="border: none; position: absolute; top: 0; left: 0; height: 100%; width: 100%;"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowfullscreen="true"
    ></iframe>
    </div>
    <h1 class="pt-8 px-4 sm:px-8 text-3xl font-semibold">{data.video.title}</h1>
    <div class="px-4 sm:px-8 mt-4 w-full justify-between sm:flex gap-4 grid grid-cols-1">
        <div class="flex gap-2 flex-col sm:flex-row">
            <a href={"/user/" + data.video.atHandle} class="flex gap-4 mr-2">
                <img src={"https://imagedelivery.net/" + PUBLIC_CLOUDFLARE_IMAGE + "/" + data.video.image + "/public"} class="h-12 w-12 rounded-full object-cover" alt="">     
                <div>
                    <p class="font-semibold flex items-center gap-1 text-xl">
                        <Name color={data.video.nameColor} text={data.video.name}></Name>
                        {#if data.video.verified}
                            <Check size={16}></Check>
                        {/if}
                    </p>
                    <p class="text-muted-foreground text-sm">{subscribers} Abonnent{subscribers == 1 ? '' : 'en'}</p>
                </div>
            </a>
            <div class="mt-2 sm:mt-0 sm:justify-start justify-center flex gap-1">
            {#if data.user.id != data.video.user}
                <Button onclick={toggleSub}>
                {#if !subscribed}
                    <Heart></Heart>Abonnieren
                {:else}
                    <Heart fill="white"></Heart>Abonniert
                {/if}
                </Button>
            {/if}
            <Button onclick={shareToClipBoard} size="icon"><Share2></Share2></Button>
            {#if data.user.id == data.video.user || data.user.role == "admin"}
                <Button onclick={() => {editVideoOpen = true}} size="icon"><Pencil></Pencil></Button>
                <Button onclick={deleteVideo} size="icon" variant="destructive"><Trash></Trash></Button>
            {/if}
            {#if data.user.role == "admin"}
                <Button onclick={pinVideo} size="icon"><Crown></Crown></Button>
            {/if}
            </div>
        </div>
        <div>
            <ButtonGroup.Root class="w-full sm:w-fit">
                <Button onclick={() => {if(videoLikeType == "like"){setLike("")}else{setLike("like")}}} size="lg" class="w-1/2 sm:w-fit">
                    {#if videoLikeType == "like"}
                        <ThumbsUp fill="white"></ThumbsUp>
                    {:else}
                        <ThumbsUp></ThumbsUp>
                    {/if}
                    {likes}
                </Button>
                <Button onclick={() => {if(videoLikeType == "dislike"){setLike("")}else{setLike("dislike")}}} size="lg" class="w-1/2 sm:w-fit">
                    {#if videoLikeType == "dislike"}
                        <ThumbsDown fill="white"></ThumbsDown>
                    {:else}
                        <ThumbsDown></ThumbsDown>
                    {/if}
                    {dislikes}
                </Button>
            </ButtonGroup.Root>
        </div>
    </div>
    <div class="p-4 rounded-xl bg-muted/40 mx-4 sm:mx-8 mt-4 border">
        <div class="flex items-center gap-2">
            <p class="font-semibold">
                {data.video.views} Aufrufe {data.video.timestamp.toLocaleDateString('de-DE')}
            </p>
            {#if data.video.aigc}
                <Badge variant="outline"><Info></Info>KI-Generiert</Badge>
            {/if}
        </div>
        <LinkText text={data.video.description}></LinkText>
    </div>
    <h1 class="ml-4 sm:ml-8 mt-4 font-semibold">KOMMENTARE - {data.video.commentData.length}</h1>
    <div class="flex flex-col gap-4 p-4 bg-muted/40 border mx-4 rounded-xl sm:mx-8 mt-2 overflow-x-auto">
        <div class="flex gap-4">
            <img src={"https://imagedelivery.net/" + PUBLIC_CLOUDFLARE_IMAGE + "/" + data.user.image + "/public"} class="h-12 w-12 rounded-full object-cover" alt="">
            <div class="w-full">
                <h1 class="flex gap-1 items-center font-semibold">
                    <Name color={data.video.viewerData.nameColor} text={data.user.name}></Name>
                    {#if data.video.viewerData.verified}
                        <Check size={18}></Check>
                    {/if}
                    <span class="font-normal text-sm text-muted-foreground sm:block hidden">• @{data.user.atHandle}</span>
                    {#if donationValue != 0}
                        <h1 class="text-muted-foreground text-sm font-normal flex gap-1 items-center font-semibold">
                            • 💎
                            <Name text={donationValue} color={donationValue == 100 ? "default" : donationValue == 250 ? "neo" : donationValue == 500 ? "astra" : "default"}></Name>
                        </h1>
                    {/if}
                </h1>
                <div class="mt-1 flex gap-2">
                    <Input bind:value={comment} placeholder="Ich find das Video ziemlich ..."></Input>
                    {#if data.user.id != data.video.user}
                    <Popover.Root bind:open={donationOpen}>
                        <Popover.Trigger>
                            <Button size="icon">
                                <Coins></Coins>
                            </Button>
                        </Popover.Trigger>
                        <Popover.Content>
                            <h1 class="font-semibold">Spende hinzufügen</h1>
                            <p class="text-muted-foreground -mt-2">Hier kannst du auswählen, wie viel du spenden möchtest. Du hast {data.video.viewerData.coins} Bytes.</p>
                            <div class="grid grid-cols-4 gap-2">
                                <button onclick={donationValue = 0} class="cursor-pointer rounded-xl flex items-center justify-center bg-muted/20 px-4 border text-xl font-semibold" class:bg-red-800={donationValue == 0}>
                                    0
                                </button>
                                <button disabled={data.video.viewerData.coins < 100} onclick={donationValue = 100} class="disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-xl flex items-center justify-center bg-muted/20 px-4 border text-xl font-semibold" class:bg-red-800={donationValue == 100}>
                                    100
                                </button>
                                <button disabled={data.video.viewerData.coins < 250} onclick={donationValue = 250} class="disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-xl flex items-center justify-center bg-muted/20 px-4 border text-xl font-semibold" class:bg-red-800={donationValue == 250}>
                                    250
                                </button>
                                <button disabled={data.video.viewerData.coins < 500} onclick={donationValue = 500} class="disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-xl flex items-center justify-center bg-muted/20 px-4 border text-xl font-semibold" class:bg-red-800={donationValue == 500}>
                                    500
                                </button>
                            </div>
                            <Button onclick={() => {donationOpen = false}} class="w-full">Spende setzen</Button>
                        </Popover.Content>
                    </Popover.Root>
                    {/if}
                    <Button disabled={sendCommentDisabled} onclick={sendComment} size="icon">
                        {#if sendingComment}
                            <Spinner></Spinner>
                        {:else}
                            <Send></Send>
                        {/if}
                    </Button>
                </div>
            </div>
        </div>
        {#each comments as comment}
            <div class="w-full flex justify-between">
                <div class="flex gap-4">
                    <img src={"https://imagedelivery.net/" + PUBLIC_CLOUDFLARE_IMAGE + "/" + comment.userImage + "/public"} class="h-12 w-12 rounded-full object-cover" alt="">
                    <div class="min-w-0">
                        <h1 class="font-semibold flex gap-2 items-center -mb-1">
                            <a href={"/user/" + comment.atHandle} class="flex gap-1 items-center py-0.5 overflow-visible">
                                <Name color={comment.nameColor} text={comment.name}></Name>
                                {#if comment.verified}
                                    <Check size={18}></Check>
                                {/if}
                                <span class="font-normal text-sm text-muted-foreground shrink-0 sm:block hidden">• @{comment.atHandle} • {comment.timestamp.toLocaleDateString('de-DE')}</span>
                                {#if comment.donation != 0}
                                    <h1 class="text-muted-foreground text-sm font-normal flex gap-1 items-center font-semibold">
                                        • 💎
                                        <Name text={comment.donation} color={comment.donation == 100 ? "default" : comment.donation == 250 ? "neo" : comment.donation == 500 ? "astra" : "default"}></Name>
                                    </h1>
                                {/if}
                            </a>
                            {#if comment.pinned}
                                <Pin></Pin>
                            {/if}
                            {#if data.video.viewerData.id == data.video.userId}
                                <DropdownMenu.Root>
                                    <DropdownMenu.Trigger>
                                        <Ellipsis></Ellipsis>
                                    </DropdownMenu.Trigger>
                                    <DropdownMenu.Content>
                                        <DropdownMenu.Group>
                                        <DropdownMenu.Label>Kommentar verwalten</DropdownMenu.Label>
                                        <DropdownMenu.Separator />
                                        <button class="w-full" onclick={() => {pinComment(comment.id)}}>
                                            {#if comment.pinned}
                                                <DropdownMenu.Item><PinOff></PinOff>Nicht mehr anpinnen</DropdownMenu.Item>
                                            {:else}
                                                <DropdownMenu.Item><Pin></Pin>Anpinnen</DropdownMenu.Item>
                                            {/if}
                                        </button>
                                        </DropdownMenu.Group>
                                    </DropdownMenu.Content>
                                </DropdownMenu.Root>
                            {/if}
                            <button class="flex gap-1 items-center" onclick={() => {toggleCommentLike(comment.id)}}>
                                {#if comment.userCommentLikeData.length != 0}
                                    <Heart size={16} fill="white"></Heart>
                                {:else}
                                    <Heart size={16}></Heart>
                                {/if}
                                {comment.totalCommentLikes}
                            </button>
                            {#if comment.userId == data.user.id || data.user.role == "admin"}
                                <Button class="h-6 w-6 rounded-xl" onclick={() => {deleteComment(comment.id)}} size="icon" variant="destructive"><Trash></Trash></Button>
                            {/if}
                        </h1>
                        <LinkText text={comment.content}></LinkText>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>

<AlertDialog.Root bind:open={editVideoOpen}>
 <AlertDialog.Content>
  <AlertDialog.Header>
    <AlertDialog.Title>Video Bearbeiten</AlertDialog.Title>
    <Input placeholder="Titel" bind:value={editedTitle}></Input>
    <Textarea placeholder="Beschreibung" bind:value={editedDescription}></Textarea>
  </AlertDialog.Header>
  <AlertDialog.Footer>
   <AlertDialog.Cancel>Abbrechen</AlertDialog.Cancel>
   <AlertDialog.Action onclick={editVideo} bind:disabled={editVideoButtonDisabled}>
    {#if editingVideo}
        <Spinner></Spinner>
    {/if}
    Bearbeiten
   </AlertDialog.Action>
  </AlertDialog.Footer>
 </AlertDialog.Content>
</AlertDialog.Root>
