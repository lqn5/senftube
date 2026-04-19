<script>
    import { PUBLIC_CLOUDFLARE_IMAGE } from "$env/static/public";
    import Name from "$lib/components/self/Name.svelte";
    import * as Card from "$lib/components/ui/card/index"
    import * as Table from "$lib/components/ui/table/index.js"
    import { Calendar1, Gem, Play, Star, ThumbsUp } from "lucide-svelte";

    let { data } = $props();
</script>
<h1 class="text-2xl font-semibold pt-24 ml-8">Leaderboards</h1>
<div class="grid grid-cols-1 lg:grid-cols-2 m-8 gap-8">
    <Card.Root class="bg-muted/20 col-span-1 lg:col-span-2">
    <Card.Header>
        <Card.Title class="flex items-center gap-2 text-xl font-semibold"><Calendar1></Calendar1> Streak</Card.Title>
        <Card.Description>Höchste Streaks</Card.Description>
    </Card.Header>
    <Card.Content class="flex flex-col gap-2">
        <Table.Root>
            <Table.Header>
            <Table.Row>
                <Table.Head>Rang</Table.Head>
                <Table.Head>Benutzer</Table.Head>
                <Table.Head>Streak</Table.Head>
            </Table.Row>
            </Table.Header>
            <Table.Body>
                {#each data.streakResult as item, i}
                {#if data.user.atHandle == item.atHandle}
                <Table.Row class="bg-muted/50">
                    <Table.Cell class="font-medium">#{i+1}</Table.Cell>
                    <a href={"/user/" + item.atHandle}>
                    <Table.Cell class="flex gap-2 items-center">
                        <img src={"https://imagedelivery.net/" + PUBLIC_CLOUDFLARE_IMAGE + "/" + item.image + "/public"} class="h-10 w-10 rounded-full">
                        <div>
                            <span class="font-semibold"><Name text={item.name} color={item.nameColor}></Name></span>
                            <p class="text-muted-foreground">@{item.atHandle}</p>
                        </div>
                    </Table.Cell>
                    </a>
                    <Table.Cell class="font-semibold">{item.streak}</Table.Cell>
                </Table.Row>
                {:else}
                <Table.Row>
                    <Table.Cell class="font-medium">#{i+1}</Table.Cell>
                    <a href={"/user/" + item.atHandle}>
                    <Table.Cell class="flex gap-2 items-center">
                        <img src={"https://imagedelivery.net/" + PUBLIC_CLOUDFLARE_IMAGE + "/" + item.image + "/public"} class="h-10 w-10 rounded-full">
                        <div>
                            <span class="font-semibold"><Name text={item.name} color={item.nameColor}></Name></span>
                            <p class="text-muted-foreground">@{item.atHandle}</p>
                        </div>
                    </Table.Cell>
                    </a>
                    <Table.Cell class="font-semibold">{item.streak}</Table.Cell>
                </Table.Row>
                {/if}
                {/each}
            </Table.Body>
        </Table.Root>
    </Card.Content>
    </Card.Root>
    
    <Card.Root class="bg-muted/20">
    <Card.Header>
        <Card.Title class="flex items-center gap-2 text-xl font-semibold"><Play fill="white"></Play> Views</Card.Title>
        <Card.Description>Views aller Videos kombiniert</Card.Description>
    </Card.Header>
    <Card.Content class="flex flex-col gap-2">
        <Table.Root>
            <Table.Header>
            <Table.Row>
                <Table.Head>Rang</Table.Head>
                <Table.Head>Benutzer</Table.Head>
                <Table.Head>Views</Table.Head>
            </Table.Row>
            </Table.Header>
            <Table.Body>
                {#each data.viewsResult as item, i}
                {#if data.user.atHandle == item.atHandle}
                <Table.Row class="bg-muted/50">
                    <Table.Cell class="font-medium">#{i+1}</Table.Cell>
                    <a href={"/user/" + item.atHandle}>
                    <Table.Cell class="flex gap-2 items-center">
                        <img src={"https://imagedelivery.net/" + PUBLIC_CLOUDFLARE_IMAGE + "/" + item.image + "/public"} class="h-10 w-10 rounded-full">
                        <div>
                            <span class="font-semibold"><Name text={item.name} color={item.nameColor}></Name></span>
                            <p class="text-muted-foreground">@{item.atHandle}</p>
                        </div>
                    </Table.Cell>
                    </a>
                    <Table.Cell class="font-semibold">{item.totalViews}</Table.Cell>
                </Table.Row>
                {:else}
                <Table.Row>
                    <Table.Cell class="font-medium">#{i+1}</Table.Cell>
                    <a href={"/user/" + item.atHandle}>
                    <Table.Cell class="flex gap-2 items-center">
                        <img src={"https://imagedelivery.net/" + PUBLIC_CLOUDFLARE_IMAGE + "/" + item.image + "/public"} class="h-10 w-10 rounded-full">
                        <div>
                            <span class="font-semibold"><Name text={item.name} color={item.nameColor}></Name></span>
                            <p class="text-muted-foreground">@{item.atHandle}</p>
                        </div>
                    </Table.Cell>
                    </a>
                    <Table.Cell class="font-semibold">{item.totalViews}</Table.Cell>
                </Table.Row>
                {/if}
                {/each}
            </Table.Body>
        </Table.Root>
    </Card.Content>
    </Card.Root>

    <Card.Root class="bg-muted/20">
    <Card.Header>
        <Card.Title class="flex items-center gap-2 text-xl font-semibold"><Star fill="white"></Star> Abos</Card.Title>
        <Card.Description>Abonnenten pro Kanal</Card.Description>
    </Card.Header>
    <Card.Content class="flex flex-col gap-2">
        <Table.Root>
            <Table.Header>
            <Table.Row>
                <Table.Head>Rang</Table.Head>
                <Table.Head>Benutzer</Table.Head>
                <Table.Head>Abonnenten</Table.Head>
            </Table.Row>
            </Table.Header>
            <Table.Body>
                {#each data.subsResult as item, i}
                {#if data.user.atHandle == item.atHandle}
                <Table.Row class="bg-muted/50">
                    <Table.Cell class="font-medium">#{i+1}</Table.Cell>
                    <a href={"/user/" + item.atHandle}>
                    <Table.Cell class="flex gap-2 items-center">
                        <img src={"https://imagedelivery.net/" + PUBLIC_CLOUDFLARE_IMAGE + "/" + item.image + "/public"} class="h-10 w-10 rounded-full">
                        <div>
                            <span class="font-semibold"><Name text={item.name} color={item.nameColor}></Name></span>
                            <p class="text-muted-foreground">@{item.atHandle}</p>
                        </div>
                    </Table.Cell>
                    </a>
                    <Table.Cell class="font-semibold">{item.subs}</Table.Cell>
                </Table.Row>
                {:else}
                <Table.Row>
                    <Table.Cell class="font-medium">#{i+1}</Table.Cell>
                    <a href={"/user/" + item.atHandle}>
                    <Table.Cell class="flex gap-2 items-center">
                        <img src={"https://imagedelivery.net/" + PUBLIC_CLOUDFLARE_IMAGE + "/" + item.image + "/public"} class="h-10 w-10 rounded-full">
                        <div>
                            <span class="font-semibold"><Name text={item.name} color={item.nameColor}></Name></span>
                            <p class="text-muted-foreground">@{item.atHandle}</p>
                        </div>
                    </Table.Cell>
                    </a>
                    <Table.Cell class="font-semibold">{item.subs}</Table.Cell>
                </Table.Row>
                {/if}
                {/each}
            </Table.Body>
        </Table.Root>
    </Card.Content>
    </Card.Root>

    <Card.Root class="bg-muted/20">
    <Card.Header>
        <Card.Title class="flex items-center gap-2 text-xl font-semibold"><Gem fill="white"></Gem> Bytes</Card.Title>
        <Card.Description>Bytes pro Benutzer</Card.Description>
    </Card.Header>
    <Card.Content class="flex flex-col gap-2">
        <Table.Root>
            <Table.Header>
            <Table.Row>
                <Table.Head>Rang</Table.Head>
                <Table.Head>Benutzer</Table.Head>
                <Table.Head>Bytes</Table.Head>
            </Table.Row>
            </Table.Header>
            <Table.Body>
                {#each data.coinsResult as item, i}
                {#if data.user.atHandle == item.atHandle}
                <Table.Row class="bg-muted/50">
                    <Table.Cell class="font-medium">#{i+1}</Table.Cell>
                    <a href={"/user/" + item.atHandle}>
                    <Table.Cell class="flex gap-2 items-center">
                        <img src={"https://imagedelivery.net/" + PUBLIC_CLOUDFLARE_IMAGE + "/" + item.image + "/public"} class="h-10 w-10 rounded-full">
                        <div>
                            <span class="font-semibold"><Name text={item.name} color={item.nameColor}></Name></span>
                            <p class="text-muted-foreground">@{item.atHandle}</p>
                        </div>
                    </Table.Cell>
                    </a>
                    <Table.Cell class="font-semibold">{item.coins}</Table.Cell>
                </Table.Row>
                {:else}
                <Table.Row>
                    <Table.Cell class="font-medium">#{i+1}</Table.Cell>
                    <a href={"/user/" + item.atHandle}>
                    <Table.Cell class="flex gap-2 items-center">
                        <img src={"https://imagedelivery.net/" + PUBLIC_CLOUDFLARE_IMAGE + "/" + item.image + "/public"} class="h-10 w-10 rounded-full">
                        <div>
                            <span class="font-semibold"><Name text={item.name} color={item.nameColor}></Name></span>
                            <p class="text-muted-foreground">@{item.atHandle}</p>
                        </div>
                    </Table.Cell>
                    </a>
                    <Table.Cell class="font-semibold">{item.coins}</Table.Cell>
                </Table.Row>
                {/if}
                {/each}
            </Table.Body>
        </Table.Root>
    </Card.Content>
    </Card.Root>

    <Card.Root class="bg-muted/20">
    <Card.Header>
        <Card.Title class="flex items-center gap-2 text-xl font-semibold"><ThumbsUp fill="white"></ThumbsUp> Likes</Card.Title>
        <Card.Description>Likes pro Kanal</Card.Description>
    </Card.Header>
    <Card.Content class="flex flex-col gap-2">
        <Table.Root>
            <Table.Header>
            <Table.Row>
                <Table.Head>Rang</Table.Head>
                <Table.Head>Benutzer</Table.Head>
                <Table.Head>Likes</Table.Head>
            </Table.Row>
            </Table.Header>
            <Table.Body>
                {#each data.likesResult as item, i}
                {#if data.user.atHandle == item.atHandle}
                <Table.Row class="bg-muted/50">
                    <Table.Cell class="font-medium">#{i+1}</Table.Cell>
                    <a href={"/user/" + item.atHandle}>
                    <Table.Cell class="flex gap-2 items-center">
                        <img src={"https://imagedelivery.net/" + PUBLIC_CLOUDFLARE_IMAGE + "/" + item.image + "/public"} class="h-10 w-10 rounded-full">
                        <div>
                            <span class="font-semibold"><Name text={item.name} color={item.nameColor}></Name></span>
                            <p class="text-muted-foreground">@{item.atHandle}</p>
                        </div>
                    </Table.Cell>
                    </a>
                    <Table.Cell class="font-semibold">{item.likes}</Table.Cell>
                </Table.Row>
                {:else}
                <Table.Row>
                    <Table.Cell class="font-medium">#{i+1}</Table.Cell>
                    <a href={"/user/" + item.atHandle}>
                    <Table.Cell class="flex gap-2 items-center">
                        <img src={"https://imagedelivery.net/" + PUBLIC_CLOUDFLARE_IMAGE + "/" + item.image + "/public"} class="h-10 w-10 rounded-full">
                        <div>
                            <span class="font-semibold"><Name text={item.name} color={item.nameColor}></Name></span>
                            <p class="text-muted-foreground">@{item.atHandle}</p>
                        </div>
                    </Table.Cell>
                    </a>
                    <Table.Cell class="font-semibold">{item.likes}</Table.Cell>
                </Table.Row>
                {/if}
                {/each}
            </Table.Body>
        </Table.Root>
    </Card.Content>
    </Card.Root>
</div>