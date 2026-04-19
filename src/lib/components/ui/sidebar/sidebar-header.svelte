<script>
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="sidebar-header"
	data-sidebar="header"
	class={cn("gap-2 p-2 [--radius:var(--radius-xl)] flex flex-col", className)}
	{...restProps}
>
	{@render children?.()}
</div>