import { noSerialize, useContext } from "@builder.io/qwik";
import { useSignal, useVisibleTask$ } from "@qwik.dev/core";
import type { IAccount } from "applesauce-accounts";
import { AccountsContext } from "../providers/account-manager";
import { useObservableEagerState } from "./use-observable-eager-state";

export function useActiveAccount(): IAccount | undefined {
	const accountManager = useContext(AccountsContext);
	const activeSubject = useSignal(accountManager?.value?.active$);

	useVisibleTask$(({ track }) => {
		const newAccountManager = track(accountManager);
		if (newAccountManager) activeSubject.value = newAccountManager.active$;
	});

	return useObservableEagerState(
		noSerialize(activeSubject.value),
		activeSubject,
	);
}
