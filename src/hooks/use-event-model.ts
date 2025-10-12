import {
	type ComputedSignal,
	type NoSerialize,
	noSerialize,
	type QRL,
	useContext,
	useResource$,
	useSignal,
	useTask$,
	useVisibleTask$,
} from "@qwik.dev/core";
import {
	type ModelConstructor,
	withImmediateValueOrDefault,
} from "applesauce-core";
import {
	catchError,
	lastValueFrom,
	map,
	type Observable,
	of,
	timeout,
} from "rxjs";
import { EventStoreContext } from "../providers/event-store.js";

/** Runs and subscribes to a model on the event store */
export function useEventModel<T extends unknown, Args extends Array<any>>(
	factory: ComputedSignal<NoSerialize<QRL<ModelConstructor<T, Args>>>>,
	args: Args,
) {
	const eventStore = useContext(EventStoreContext);

	const subject =
		useSignal<NoSerialize<Observable<T | undefined> | undefined>>();

	useTask$(async ({ track }) => {
		const newFactory = track(factory);

		if (newFactory)
			subject.value = noSerialize(
				eventStore.value
					.model(await newFactory.resolve(), ...args)
					.pipe(withImmediateValueOrDefault(undefined)),
			);
	});

	const clientResult = useSignal<T | undefined>(undefined);
	const shouldGetClientResult = useSignal();
	const useClientResult = useSignal();

	useVisibleTask$(
		({ track, cleanup }) => {
			const newSubject = track(subject);

			if (newSubject && shouldGetClientResult.value) {
				useClientResult.value = true;

				// if (newPubkey) {
				const sub = newSubject.subscribe({
					next: (p) => {
						clientResult.value = p;
					},
					error: () => {
						clientResult.value = undefined;
					},
				});

				cleanup(() => {
					sub?.unsubscribe();
				});
				// } else {
				// 	clientResult.value = undefined;
				// }
			}

			shouldGetClientResult.value = true;
		},
		{ strategy: "document-ready" },
	);

	return useResource$(async ({ track }) => {
		const newClientResult = track(clientResult);

		if (newClientResult) return newClientResult;
		if (!subject.value) return undefined;

		let eventValue: T | undefined;

		await lastValueFrom(
			subject.value.pipe(
				timeout(3000),
				catchError((_err) => of(undefined)),
				map((item) => {
					if (item) eventValue = item;
				}),
			),
			{ defaultValue: undefined },
		);
		return eventValue;
	});
}
