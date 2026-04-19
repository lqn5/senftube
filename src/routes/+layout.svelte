<script>
	import './layout.css';
	import favicon from '$lib/assets/senftubeklein.png';
	import { ModeWatcher } from "mode-watcher";
	import { Toaster } from "$lib/components/ui/sonner/index.js";
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/button/button.svelte';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
    import { toast } from 'svelte-sonner';
    import { Play, Plus, Search } from 'lucide-svelte';
	import * as InputGroup from "$lib/components/ui/input-group";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import Input from '$lib/components/ui/input/input.svelte';
    import { goto, invalidateAll } from '$app/navigation';
    import Scrambled from '$lib/components/self/Scrambled.svelte';
	import { page } from '$app/stores';
    import { PUBLIC_CLOUDFLARE_IMAGE } from '$env/static/public';
    import Badge from '$lib/components/ui/badge/badge.svelte';

	let { children, data } = $props();
	
	let signingOut = $state(false);
	let redeemOpen = $state(false);
	let searchOpen = $state(false);
	let codeToRedeem = $state("");
	let checkingCode = $state(false);
	let searchQuery = $state($page.url.searchParams.get('q'));

	let checkCodeButtonDisabled = $derived(checkingCode || codeToRedeem.length == 0);

	const handleEnhance = () => {
		signingOut = true;
		toast.info("Du wirst abgemeldet...")
		
        return async ({ result, update }) => {
			await update();
            signingOut = false;
        };
    };

	async function redeemCode(){
		checkingCode = true;

		const response = await fetch("/api/code?c=" + codeToRedeem)
		const result = await response.json();
		

		if(result.ok){
			toast.success("Du erhältst " + result.coins + " Bytes.");
			redeemOpen = false;
		}

		else{
			toast.error(result.message || "Code existiert nicht!");
		}

		checkingCode = false;
		codeToRedeem = "";

		await invalidateAll();
	}

	function navigateToSearch(e){
		if(e){
			e.preventDefault();
		}
		if(!searchQuery || searchQuery.length == 0){
			return;
		}

		goto("/search?q=" + searchQuery);
		searchOpen = false;
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>


<Toaster richColors position="top-right" />
<ModeWatcher />
{#if data.user}
<div class="w-full z-10 flex items-center justify-between px-8 py-4 fixed bg-background border-b">
	<a class="text-2xl font-medium flex gap-2 items-center" href="/"><Play fill="white"></Play><span class="text-xl sm:text-2xl">SenfTube</span></a>
	<form onsubmit={navigateToSearch} class="hidden sm:flex w-fit min-w-1/3 absolute left-1/2 -translate-x-1/2">
		<InputGroup.Root class="w-full">
				<InputGroup.Input bind:value={searchQuery} placeholder="Ich suche..."></InputGroup.Input>
				<InputGroup.Addon>
					<button onclick={navigateToSearch} type="submit"><Search></Search></button>
				</InputGroup.Addon>
		</InputGroup.Root> 
	</form>
	<div class="flex gap-2 items-center">
		<Button class="flex sm:hidden" size="icon" href="/upload">
			<Plus></Plus>
		</Button>
		<Button class="hidden sm:flex" href="/upload">
			<Plus></Plus>
			<h1>Erstellen</h1>
		</Button>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger class="shrink-0">
			<div class="relative">
				<img class="h-9 w-9 rounded-full object-cover" src={"https://imagedelivery.net/" + PUBLIC_CLOUDFLARE_IMAGE + "/" + data.user.image + "/public"} alt="">
				{#if data.collectableAchievements+data.collectableStreakRewards>0}<Badge class="absolute -top-2 -right-2">{data.collectableStreakRewards + data.collectableAchievements}</Badge>{/if}
			</div>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				<DropdownMenu.Group>
				<DropdownMenu.Label>Menü</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<a href="/me">
					<DropdownMenu.Item>Einstellungen</DropdownMenu.Item>
				</a>
				<a href="/shop">
					<DropdownMenu.Item>Shop</DropdownMenu.Item>
				</a>
				<a href="/likes">
					<DropdownMenu.Item>Meine Likes</DropdownMenu.Item>
				</a>
				<a href="/bytes">
					<DropdownMenu.Item>
						{#if data.collectableStreakRewards>0}<Badge>{data.collectableStreakRewards}</Badge>{/if}
						Streak
					</DropdownMenu.Item>
				</a>
				<a href="/achievements">
					<DropdownMenu.Item>
						{#if data.collectableAchievements>0}<Badge>{data.collectableAchievements}</Badge>{/if}
						Achievements
					</DropdownMenu.Item>
				</a>
				<a href="/leaderboards">
					<DropdownMenu.Item>Leaderboards</DropdownMenu.Item>
				</a>
				<a href={"/user/" + data.user.atHandle}>
					<DropdownMenu.Item>Mein Kanal</DropdownMenu.Item>
				</a>
				{#if data.user.role == "admin"}
					<a href="/admin">
						<DropdownMenu.Item>Admin</DropdownMenu.Item>
					</a>
					<a href="/admin/codes">
						<DropdownMenu.Item>Codes</DropdownMenu.Item>
					</a>
				{/if}
				<DropdownMenu.Item onclick={() => {redeemOpen = true}}>Code einlösen</DropdownMenu.Item>
				<DropdownMenu.Item onclick={() => {searchOpen = true}}>Suchen</DropdownMenu.Item>
				<!--
				<DropdownMenu.Item class="text-transparent bg-clip-text font-semibold italic bg-linear-to-tr from-yellow-500 to-amber-300"><Scrambled></Scrambled></DropdownMenu.Item>
				-->
				<DropdownMenu.Item>				
					<form method="post" action="/?/signOut" use:enhance={handleEnhance}>
						<button type="submit" class="flex gap-2 items-center" disabled={signingOut}>
							{#if signingOut}
								<Spinner></Spinner>
							{/if}
							Abmelden
						</button>
					</form>
				</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</div>
{/if}

{@render children()}

<AlertDialog.Root bind:open={redeemOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
		<AlertDialog.Title>Code einlösen</AlertDialog.Title>
		<AlertDialog.Description>
			Hier kannst du Codes einlösen, um Belohnungen zu erhalten.
		</AlertDialog.Description>
		</AlertDialog.Header>
		<Input bind:value={codeToRedeem} placeholder="CODE" class="font-mono"></Input>
		<AlertDialog.Footer>
		<AlertDialog.Cancel>
			Abbrechen
		</AlertDialog.Cancel>
		<AlertDialog.Action onclick={redeemCode} bind:disabled={checkCodeButtonDisabled}>
			{#if checkingCode}
				<Spinner></Spinner>
			{/if}
			Einlösen
		</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
<AlertDialog.Root bind:open={searchOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
		<AlertDialog.Title>Suchen</AlertDialog.Title>
		<AlertDialog.Description>
			Hier kannst du nach Videos oder Benutzern suchen
		</AlertDialog.Description>
		</AlertDialog.Header>
		<Input bind:value={searchQuery} placeholder="Ich suche nach..."></Input>
		<AlertDialog.Footer>
		<AlertDialog.Cancel>
			Abbrechen
		</AlertDialog.Cancel>
		<AlertDialog.Action onclick={navigateToSearch}>
			Suchen
		</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
