<script>
	import { cn } from "$lib/utils.js";
	let {
		ref = $bindable(null),
		inset,
		children,
		class: className,
		...restProps
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="menubar-label"
	data-inset={inset}
	class={cn("text-muted-foreground px-3.5 py-2.5 text-xs data-inset:pl-9.5", className)}
	{...restProps}
>
	{@render children?.()}
</div>