import { useComputed$ } from "@qwik.dev/core";
import type { AddressPointerWithoutD } from "applesauce-core/helpers";
import { parseCoordinate } from "applesauce-core/helpers";
import type { AddressLoaderOptions } from "applesauce-loaders/loaders";
import type { Event } from "nostr-tools";
import type { AddressPointer } from "nostr-tools/nip19";
import { useAddressableQuery } from "../queries/addressable-query";
import { useEventModel } from "./use-event-model";

export default function useReplaceableEvent(
  cord: string | AddressPointer | AddressPointerWithoutD | undefined,
  opts: AddressLoaderOptions = {},
  defaultValue?: Event | undefined,
) {
  const parsed = useComputed$(() =>
    typeof cord === "string" ? parseCoordinate(cord) : cord,
  );

  const AddressableQuery = useAddressableQuery(parsed.value, opts);

  return useEventModel(AddressableQuery, [], defaultValue);
}
