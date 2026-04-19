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
	data-slot="input-otp-group"
	class={cn("has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 has-aria-invalid:border-destructive rounded-4xl has-aria-invalid:ring-[3px] flex items-center", className)}
	{...restProps}
>
	{@render children?.()}
</div>