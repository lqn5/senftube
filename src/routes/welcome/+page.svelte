<script>
    import Button from "$lib/components/ui/button/button.svelte";
    import { Home, Settings, Star, Upload } from "lucide-svelte";

</script>
<div class="w-full h-dvh flex justify-center items-center">
    <div class="rounded-xl p-4 border bg-muted/20">
        <h1 class="text-center text-2xl font-semibold mb-4">
            Willkommen auf SenfTube!
        </h1>
        <div class="flex flex-col gap-2">
            <Button href="/">
                <Home></Home>
                Zur Hauptseite
            </Button>
            <Button href="/upload">
                <Upload></Upload>
                Ein Video hochladen
            </Button>
            <Button href="/me">
                <Settings></Settings>
                Zu den Einstellungen
            </Button>
        </div>
    </div>
</div>