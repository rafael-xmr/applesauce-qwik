import { useContext } from "@qwik.dev/core";
import { AccountManagerContext } from "../providers/account-manager";

export function useActiveAccount() {
	const accountManagerCtx = useContext(AccountManagerContext);
	return accountManagerCtx.value.activeAccount;
}
