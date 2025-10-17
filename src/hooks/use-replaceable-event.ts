import type { ComputedSignal } from "@qwik.dev/core";
import type { AddressLoaderOptions } from "applesauce-loaders/loaders/address-loader";
import type { Event } from "nostr-tools";
import { useAddressableQuery } from "../queries/addressable-query";
import { useEventModel } from "./use-event-model";

export default function useReplaceableEvent(
  coord: ComputedSignal<string | undefined>,
  opts: AddressLoaderOptions = {},
  defaultValue?: Event | undefined,
) {
  const AddressableQuery = useAddressableQuery(coord, opts);

  return useEventModel(AddressableQuery, coord, [], defaultValue);
}
