<script>
    import { invalidateAll } from "$app/navigation";
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import * as Table from "$lib/components/ui/table/index.js";
    import { Send, Trash } from "lucide-svelte";
    import { toast } from "svelte-sonner";

    let { data } = $props();

    let code = $state("");
    let value = $state("")

    async function addCode(){
        const response = await fetch("/api/code/add", {
            method: 'POST',
            body: JSON.stringify({
                name: code,
                value
            })
        });

        if(!response.ok) {
            toast.error("Fehler beim hinzufügen des Codes");
            return;
        }
        
        code = ""
        value = ""

        await invalidateAll()

        toast.success("Code hinzugefügt")
    }
    
    async function deleteCode(id){
        const response = await fetch("/api/code/delete", {
            method: 'DELETE',
            body: JSON.stringify({
                name: id
            })
        });

        if(!response.ok) {
            toast.error("Fehler beim löschen des Codes");
            return;
        }

        await invalidateAll();
    }
</script>
<h1 class="pt-24 ml-8 text-center text-2xl font-semibold">Admin Panel > Codes</h1>
<Table.Root class="w-9/10 sm:w-2/3 m-auto mt-4">
 <Table.Header>
  <Table.Row>
   <Table.Head class="w-[100px]">Code</Table.Head>
   <Table.Head>Wert</Table.Head>
   <Table.Head class="text-end">Löschen</Table.Head>
  </Table.Row>
 </Table.Header>
 <Table.Body>
 {#each data.codes as code}
    <Table.Row>
        <Table.Cell class="font-medium">{code.id}</Table.Cell>
        <Table.Cell>{code.value}</Table.Cell>
        <Table.Cell class="flex justify-end">
        <Button size="icon" variant="destructive" onclick={() => { deleteCode(code.id) }}><Trash></Trash></Button>
        </Table.Cell>
    </Table.Row>
  {/each}
 </Table.Body>
</Table.Root>
<div class="w-full px-4 sm:w-2/3 gap-2 sm:gap-4 m-auto mt-4 flex items-center">
    <Input bind:value={code} placeholder="CODE"></Input>
    <Input bind:value={value} placeholder="5000"></Input>
    <Button onclick={addCode} size="icon"><Send></Send></Button>
</div>