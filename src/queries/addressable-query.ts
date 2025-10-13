import {
  $,
  type ComputedSignal,
  type NoSerialize,
  noSerialize,
  type QRL,
  useComputed$,
  useContext,
} from "@qwik.dev/core";
import type { ModelConstructor } from "applesauce-core";
import type { AddressPointerWithoutD } from "applesauce-core/helpers";
import {
  type AddressLoaderOptions,
  createAddressLoader,
} from "applesauce-loaders/loaders";
import type { NostrEvent } from "nostr-tools";
import { defer, EMPTY, ignoreElements, mergeWith, of } from "rxjs";
import { EventStoreContext, RelayPoolContext } from "~/providers";

export function useAddressLoader(opts: AddressLoaderOptions = {}) {
  const relayPoolCtx = useContext(RelayPoolContext);
  const eventStoreCtx = useContext(EventStoreContext);

  const addressLoader = useComputed$(() => {
    return noSerialize(
      createAddressLoader(relayPoolCtx.value.relayPool, {
        ...opts,
        eventStore: eventStoreCtx.value,
        extraRelays: relayPoolCtx.value.readRelays,
      }),
    );
  });

  return addressLoader;
}

export function useAddressableQuery(
  pointer: AddressPointerWithoutD | undefined | null,
  opts: AddressLoaderOptions = {},
): ComputedSignal<
  NoSerialize<QRL<ModelConstructor<NostrEvent | undefined, []>>>
> {
  const eventStoreCtx = useContext(EventStoreContext);
  const addressLoader = useAddressLoader(opts);

  return useComputed$(() => {
    const addressLoaderValue = addressLoader.value;

    return noSerialize(
      $(() => {
        return (events) =>
          !pointer
            ? of(undefined)
            : defer(() =>
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
                events.replaceable(
                  pointer.kind,
                  pointer.pubkey,
                  pointer.identifier,
                ),
              ),
            );
      }),
    );
  });
}
