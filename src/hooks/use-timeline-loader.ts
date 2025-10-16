import {
	noSerialize,
	useComputed$,
	useContext,
	useResource$,
} from "@qwik.dev/core";
import { createTimelineLoader } from "applesauce-loaders/loaders/timeline-loader";
import type { Event, Filter } from "nostr-tools";
import { catchError, map, of, timeout } from "rxjs";
import { lastValueFrom } from "rxjs/internal/lastValueFrom";
import { EventStoreContext, RelayPoolContext } from "../providers";

export function useTimelineLoader(filter: Filter = {}) {
	const relayPoolCtx = useContext(RelayPoolContext);
	const eventStoreCtx = useContext(EventStoreContext);

	const timelineLoader = useComputed$(() => {
		return noSerialize(
			createTimelineLoader(
				relayPoolCtx.value.relayPool,
				relayPoolCtx.value.readRelays,
				{ ...filter },
				{ eventStore: eventStoreCtx.value },
			),
		);
	});

	return timelineLoader;
}

export function useTimeline(filter?: Filter) {
	const timelineLoader = noSerialize(useTimelineLoader(filter));

	return useResource$(async () => {
		if (!timelineLoader) return undefined;

		const timelineItems: Event[] = [];

		await lastValueFrom(
			timelineLoader.value?.().pipe(
				timeout(3000),
				catchError((_err) => of(undefined)),
				map((item) => {
					if (item) {
						timelineItems.push(item);
					}
				}),
			) || of(undefined),
			{ defaultValue: undefined },
		);

		return timelineItems.sort((a, b) => b.created_at - a.created_at);
	});
}
