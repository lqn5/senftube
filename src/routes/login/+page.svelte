<script>
    import { enhance } from '$app/forms';
    import { toast } from 'svelte-sonner';
    import Button from '$lib/components/ui/button/button.svelte';
    import Input from '$lib/components/ui/input/input.svelte';
	import Image from "$lib/assets/mymind-tZCrFpSNiIQ-unsplash.jpg";
	import SenftubeLogo from "$lib/assets/senftubeklein.png";
    import Label from '$lib/components/ui/label/label.svelte';
	import * as InputGroup from "$lib/components/ui/input-group";
    import { AtSign } from 'lucide-svelte';
	import * as Accordion from "$lib/components/ui/accordion/index.js";

    let { form } = $props();

    const handleEnhance = () => {
        return async ({ result, update }) => {
            if (result.type === 'failure' && result.data?.message) {
                toast.error(result.data.message);
            }
            await update();
        };
    };
</script>
<div class="flex w-full h-dvh overflow-x-hidden">
	<div class="h-dvh w-full md:w-1/2 flex items-center justify-center">
		<div class="p-4 w-full sm:p-0 sm:w-2/3 m-auto">
			<h1 class="text-center text-4xl mb-8 font-semibold">SenfTube</h1>
			<form method="post" action="?/signInEmail" use:enhance={handleEnhance}>
				<Label class="mb-2" for="email">Email</Label>
				<Input id="email" placeholder="mail@senftube.com" class="mb-4" type="email" name="email"/>
				<div class="mb-2 flex justify-between">
					<Label for="password">Passwort</Label>
				</div>
				<Input id="password" placeholder="Password" class="mb-4" type="password" name="password"/>
				<Accordion.Root>
					<Accordion.Item>
						<Accordion.Trigger>Ich mag mich registrieren</Accordion.Trigger>
						<Accordion.Content>
							<Label class="mb-2" for="password">Benutzername</Label>
							<InputGroup.Root class="mb-4">
								<InputGroup.Addon><AtSign></AtSign></InputGroup.Addon>
								<InputGroup.Input placeholder="mike" name="atname"></InputGroup.Input>
							</InputGroup.Root>
							<Label class="mb-2" for="password">Anzeigename</Label>
							<Input placeholder="Mike H." class="mb-4" name="name"/>
							<Label class="mb-2" for="password">Zauberwort</Label>
							<Input placeholder="Zauberwort" type="password" class="mb-4" name="friendsecret"/>
							<Button class="w-full" type="submit" formaction="?/signUpEmail">Registrieren</Button>
						</Accordion.Content>
					</Accordion.Item>
				</Accordion.Root>
				<Button type="submit" class="w-full mt-4">Anmelden</Button>
			</form>
			
		</div>
	</div>
	<div class="w-1/2 hidden md:block overflow-hidden">
		<img class="h-dvh w-full" src={Image} alt="">
	</div>
</div>