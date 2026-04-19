<script>
	import { cn } from "$lib/utils.js";
	import { PaginationLink } from "./index.js";
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';

	let { class: className, ...restProps } = $props();
</script>

<PaginationLink
	aria-label="Go to previous page"
	size="default"
	class={cn("pl-2!", className)}
	{...restProps}
>
	<ChevronLeftIcon data-icon="inline-start" />
	<span class="cn-pagination-previous-text hidden sm:block">Previous</span>
</PaginationLink>