<script lang="ts">
	import RatingGroup from '$lib/coral/kit/rating-group/rating-group.svelte';
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center gap-3">
		<span class="w-20 text-sm text-muted-foreground">disabled</span>
		<RatingGroup value={3} disabled aria-label="Calificación deshabilitada" />
	</div>
	<div class="flex items-center gap-3">
		<span class="w-20 text-sm text-muted-foreground">readonly</span>
		<RatingGroup value={3} readonly />
	</div>
	<div class="flex items-center gap-3" dir="rtl">
		<span class="w-20 text-sm text-muted-foreground">rtl</span>
		<RatingGroup value={2.5} allowHalf aria-label="التقييم" />
	</div>
</div>
