import type { ComputedSignal } from "@qwik.dev/core";
import type { AddressPointerWithoutD } from "applesauce-core/helpers/pointers";
import type { AddressLoaderOptions } from "applesauce-loaders/loaders/address-loader";
import type { Event } from "nostr-tools";
import type { AddressPointer } from "nostr-tools/nip19";
import { useAddressableQuery } from "../queries/addressable-query";
import { useEventModel } from "./use-event-model";

export default function useReplaceableEvent(
	cord:
		| ComputedSignal<AddressPointer>
		| ComputedSignal<AddressPointerWithoutD>
		| ComputedSignal<undefined>
		| ComputedSignal<null>,
	opts: AddressLoaderOptions = {},
	defaultValue?: Event | undefined,
) {
	const AddressableQuery = useAddressableQuery(cord, opts);

	return useEventModel(AddressableQuery, [], defaultValue);
}
