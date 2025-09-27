import type { IAccount } from "applesauce-accounts";
import { useAccountManager } from "../providers/accounts";
import { useObservableEagerState } from "./use-observable-eager-state";

export function useActiveAccount(): IAccount | undefined {
	const manager = useAccountManager();
	if (!manager) return undefined;
	return useObservableEagerState(manager.active$);
}
