import { useContext } from "@qwik.dev/core";
import { RelayPoolContext } from "../providers";

export function useRelayPool() {
	const relayPool = useContext(RelayPoolContext);
	return relayPool.value.relayPool;
}
