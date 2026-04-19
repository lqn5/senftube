<script>
    let { text, color, donation } = $props()
</script>
{#if color == "default" || !color}
    <span>{text}</span>
{/if}
{#if color == "aqua"}
    <span class="text-cyan-400">{text}</span>
{/if}
{#if color == "rose"}
    <span class="bg-linear-to-tr from-rose-300 to-red-400 bg-clip-text text-transparent">{text}</span>
{/if}
{#if color == "gold"}
    <span class="bg-linear-to-tr from-yellow-300 to-amber-300 bg-clip-text text-transparent">{text}</span>
{/if}
{#if color == "comic"}
    <span style="font-family: 'Comic'">{text}</span>
{/if}
{#if color == "obsidian"}
    <span class="bg-linear-to-tr from-violet-400 to-indigo-500 bg-clip-text text-transparent">{text}</span>
{/if}
{#if color == "neo"}
    <span class="bg-linear-to-tr from-emerald-400 bg-clip-text to-lime-400 text-transparent drop-shadow-[0_0_8px_rgba(0,255,0,0.6)]">{text}</span>
{/if}
{#if color == "astra"}
    <span class="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">{text}</span>
{/if}
{#if color == "rainbow"}
    <span class="bg-linear-to-tr from-blue-300 via-green-400 to-red-300 bg-clip-text text-transparent animated-background">{text}</span>
{/if}