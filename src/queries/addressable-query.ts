import { type ComputedSignal, useComputed$, useContext, noSerialize, NoSerialize, $, type QRL } from "@qwik.dev/core";
import type { ModelConstructor } from "applesauce-core";
import type { AddressPointerWithoutD } from "applesauce-core/helpers";
import { createAddressLoader } from "applesauce-loaders/loaders";
import type { NostrEvent } from "nostr-tools";
import { of, defer, EMPTY, ignoreElements, mergeWith } from "rxjs";
import { EventStoreContext, RelayPoolContext } from "~/providers";

export function useAddressLoader(fallbackRelays?: string[] | undefined) {
  const relayPoolCtx = useContext(RelayPoolContext);
  const eventStoreCtx = useContext(EventStoreContext);

  const addressLoader = useComputed$(() => {
    return noSerialize(createAddressLoader(relayPoolCtx.value.relayPool, {
      eventStore: eventStoreCtx.value,
      // bufferTime: 500,
      extraRelays: relayPoolCtx.value.readRelays,
      lookupRelays: fallbackRelays,
    }));
  });

  return addressLoader;
}

/** A model that loads an addressable event */
export function useAddressableQuery(
  pointer: AddressPointerWithoutD | undefined | null,
  fallbackRelays?: string[] | undefined,
): ComputedSignal<NoSerialize<QRL<ModelConstructor<NostrEvent | undefined, []>>>> {
  const eventStoreCtx = useContext(EventStoreContext);
  const addressLoader = useAddressLoader(fallbackRelays);

  return useComputed$(() => {

    const addressLoaderValue = addressLoader.value;


    const res: NoSerialize<QRL<ModelConstructor<NostrEvent | undefined, []>>> = noSerialize($(() => {
      return (events) =>
        !pointer ? of(undefined) : defer(() =>
          eventStoreCtx.value.hasReplaceable(
            pointer.kind,
            pointer.pubkey,
            pointer.identifier,
          )
            ? EMPTY
            : addressLoaderValue?.(pointer) || EMPTY,
        ).pipe(
          ignoreElements(),
          mergeWith(
            events.replaceable(pointer.kind, pointer.pubkey, pointer.identifier),
          ),
        )
    }));

    return res;
  });
}
