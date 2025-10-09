import {
	type NoSerialize,
	noSerialize,
	type Signal,
	useContext,
	useSignal,
	useTask$,
} from "@qwik.dev/core";
import {
	type ModelConstructor,
	withImmediateValueOrDefault,
} from "applesauce-core";
import hash_sum from "hash-sum";
import { type Observable, of } from "rxjs";
import { EventStoreContext } from "../providers/event-store.js";
import { useObservableEagerMemo } from "./use-observable-memo.js";

/** Runs and subscribes to a model on the event store */
export function useEventModel<T extends unknown, Args extends Array<any>>(
	factory: ModelConstructor<T, Args>,
	args?: Args | null,
): Signal<T | undefined> {
	const eventStore = useContext(EventStoreContext);

	const subject =
		useSignal<NoSerialize<() => Observable<T | undefined> | undefined>>();

	useTask$(() => {
		subject.value = noSerialize(() => {
			if (args)
				return eventStore.value
					.model(factory, ...args)
					.pipe(withImmediateValueOrDefault(undefined));
			else return of(undefined);
		});
	});

	return useObservableEagerMemo(subject.value, [hash_sum(args), factory]);
}
