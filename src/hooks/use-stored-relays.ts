import { useContext } from "@qwik.dev/core";
import { RelayPoolContext } from "../providers";

export function useStoredRelays() {
	const relayPool = useContext(RelayPoolContext);
	return relayPool.value.relays;
}

export function useStoredRelaysList() {
	const relayPool = useContext(RelayPoolContext);
	return relayPool.value.relaysList;
}
