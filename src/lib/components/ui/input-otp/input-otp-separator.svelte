<script>
	import { cn } from "$lib/utils.js";
	import MinusIcon from '@lucide/svelte/icons/minus';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="input-otp-separator"
	role="separator"
	class={cn("[&_svg:not([class*='size-'])]:size-4 flex items-center", className)}
	{...restProps}
>
	{#if children}
		{@render children?.()}
	{:else}
		<MinusIcon  />
	{/if}
</div>