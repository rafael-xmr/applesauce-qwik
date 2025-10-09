import {
	noSerialize,
	useComputed$,
	useContext,
	useResource$,
} from "@qwik.dev/core";
import { getProfileContent } from "applesauce-core/helpers";
import { createAddressLoader } from "applesauce-loaders/loaders";
import type { ProfilePointer } from "nostr-tools/nip19";
import { catchError, firstValueFrom, map, of, take, timeout } from "rxjs";
import { EventStoreContext, RelayPoolContext } from "../providers";
import { useStoredRelaysList } from "./use-stored-relays";

export function useProfileLoader(pubkey: string | ProfilePointer) {
	const relayPoolCtx = useContext(RelayPoolContext);
	const relaysList = useStoredRelaysList();
	const eventStoreCtx = useContext(EventStoreContext);

	const profileLoader = useComputed$(() => {
		if (!pubkey || pubkey === "") return of(undefined);

		const pointer = typeof pubkey === "string" ? { pubkey } : pubkey;

		const addressLoader = createAddressLoader(relayPoolCtx.value.relayPool, {
			eventStore: eventStoreCtx.value,
			extraRelays: relaysList,
			lookupRelays: relaysList,
		});

		return addressLoader({
			kind: 0,
			pubkey: pointer.pubkey,
			relays: relaysList,
		}).pipe(
			take(1),
			map((event) => getProfileContent(event)),
		);
	});

	return profileLoader;
}

export default function useUserProfile(pubkey: string | ProfilePointer) {
	const profileLoader = noSerialize(useProfileLoader(pubkey));

	return useResource$(async () => {
		if (!pubkey || pubkey === "" || !profileLoader) return undefined;

		const profile = await firstValueFrom(
			profileLoader.value.pipe(
				timeout(3000),
				catchError((_err) => of(undefined)),
			),
			{ defaultValue: undefined },
		);

		return profile;
	});
}
