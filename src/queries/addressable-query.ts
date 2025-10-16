import {
  $,
  type ComputedSignal,
  type NoSerialize,
  noSerialize,
  type QRL,
  useComputed$,
  useContext,
} from "@qwik.dev/core";
import type { ModelConstructor } from "applesauce-core/event-store";
import type { AddressPointerWithoutD } from "applesauce-core/helpers/pointers";
import {
  type AddressLoaderOptions,
  createAddressLoader,
} from "applesauce-loaders/loaders/address-loader";
import type { NostrEvent } from "nostr-tools";
import { defer, EMPTY, ignoreElements, mergeWith, of } from "rxjs";
import { EventStoreContext, RelayPoolContext } from "~/providers";

export function useAddressLoader(opts: AddressLoaderOptions = {}) {
  const relayPoolCtx = useContext(RelayPoolContext);
  const eventStoreCtx = useContext(EventStoreContext);

  const addressLoader = useComputed$(() => {
    const relayPool = relayPoolCtx.value.relayPool;
    const eventStore = eventStoreCtx.value;
    const readRelays = relayPoolCtx.value.readRelays;

    return noSerialize(
      createAddressLoader(relayPool, {
        ...opts,
        eventStore,
        extraRelays: readRelays,
      }),
    );
  });

  return addressLoader;
}

export function useAddressableQuery(
  pointer: ComputedSignal<AddressPointerWithoutD | undefined | null>,
  opts: AddressLoaderOptions = {},
): ComputedSignal<
  NoSerialize<QRL<ModelConstructor<NostrEvent | undefined, []>>>
> {
  const eventStoreCtx = useContext(EventStoreContext);
  const addressLoader = useAddressLoader(opts);

  return useComputed$(() => {
    const addressLoaderValue = addressLoader.value;
    const eventStoreValue = noSerialize(eventStoreCtx.value);

    const pointerValue = pointer.value;

    return noSerialize(
      $(() => {
        return (events) =>
          !pointerValue
            ? of(undefined)
            : defer(() =>
              eventStoreValue?.hasReplaceable(
                pointerValue.kind,
                pointerValue.pubkey,
                pointerValue.identifier,
              )
                ? EMPTY
                : addressLoaderValue?.(pointerValue) || EMPTY,
            ).pipe(
              ignoreElements(),
              mergeWith(
                events.replaceable(
                  pointerValue.kind,
                  pointerValue.pubkey,
                  pointerValue.identifier,
                ),
              ),
            );
      }),
    );
  });
}
