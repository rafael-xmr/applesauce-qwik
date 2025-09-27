import { ExtensionSigner } from "applesauce-signers";
import { useAsyncAction } from "./use-async-action";
import { ExtensionAccount } from "applesauce-accounts/accounts";
import { useAccountManager } from "../providers/accounts";

export function useExtensionSigner() {
	const manager = useAccountManager();

	const extension = useAsyncAction(async () => {
		if (!window.nostr) throw new Error("Missing NIP-07 signer extension");
		if (!manager) throw new Error("Missing account manager");

		const signer = new ExtensionSigner();
		const pubkey = await signer.getPublicKey();

		// Get the existing account or create a new one
		const account =
			manager.accounts.find(
				(a) => a.type === ExtensionAccount.type && a.pubkey === pubkey,
			) ?? new ExtensionAccount(pubkey, signer);

		if (!manager.accounts.includes(account)) manager.addAccount(account);

		manager.setActive(account);
	});

	return extension;
}
