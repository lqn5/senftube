<script>
    let { text } = $props();

    const pattern = /(https?:\/\/[^\s]+)|@([a-zA-Z0-9_]+)|(:[a-zA-Z0-9_]+:)/g;
	//\CUSTOMIZE: add emojis here
	// example:
	// ":example:": {
	//	image: "https://example.com/example.png"
	// }

	const emojis = {
	}

    function parse(text) {
        const parts = [];
        let lastIndex = 0;
        for (const match of text.matchAll(pattern)) {
            const full = match[0];
            const index = match.index ?? 0;
            if (index > lastIndex) {
                parts.push({ type: 'text', value: text.slice(lastIndex, index) });
            }

			if (full.startsWith('http://') || full.startsWith('https://')) {
				parts.push({ type: 'link', value: full, href: full });
			} else if (full.startsWith(':') && full.endsWith(':')) {
				if (full in emojis) {
					parts.push({ type: 'emoji', value: full });
				} else {
					parts.push({ type: 'text', value: full });
				}
			} else {
				const username = match[2];
				parts.push({ type: 'mention', value: `@${username}`, href: `/user/${encodeURIComponent(username)}` });
			}

            lastIndex = index + full.length;
        }
        if (lastIndex < text.length) {
            parts.push({ type: 'text', value: text.slice(lastIndex) });
        }
        return parts;
    }

    let parts = $derived(parse(text));
</script>

<p class="whitespace-pre-wrap">
    {#each parts as part}
        {#if part.type === 'text'}
            {part.value}
        {:else if part.type === 'emoji'}
			<img src={emojis[part.value].image} class="inline-block w-7 h-7 align-middle"/>
        {:else}
            <a class="underline text-blue-500" href={part.href}>{part.value}</a>
        {/if}
    {/each}
</p>