import {
	component$,
	noSerialize,
	useContext,
	useSignal,
	useVisibleTask$,
} from "@qwik.dev/core";
import { useExtensionSignerAsyncAction } from "../hooks/use-extension-signin";
import { AccountManagerContext } from "../providers/account-manager";

export const ExtensionSigner = component$(() => {
	const accountManagerCtx = useContext(AccountManagerContext);
	const extensionAsyncAction = noSerialize(useExtensionSignerAsyncAction());

	const hasExtension = useSignal(false);

	useVisibleTask$(() => {
		hasExtension.value = !!window.nostr;
	});

	return (
		<>
			{accountManagerCtx.value.activeAccount ? (
				<>
					<label for="button">
						Signed in as {accountManagerCtx.value.activeAccount.pubkey}
					</label>
					<button
						id="button"
						type="button"
						onClick$={() => {
							if (accountManagerCtx.value.activeAccount) {
								accountManagerCtx.value.accountManager.removeAccount(
									accountManagerCtx.value.activeAccount,
								);
								accountManagerCtx.value.accountManager.clearActive();
							}
						}}
					>
						Sign out
					</button>
				</>
			) : hasExtension.value ? (
				<button
					type="button"
					onClick$={() => extensionAsyncAction?.run()}
					disabled={extensionAsyncAction?.loading.value}
				>
					{extensionAsyncAction?.loading.value
						? "Signing in..."
						: "Sign in with extension"}
				</button>
			) : (
				<button type="button" disabled={true}>
					No Nostr extension found
				</button>
			)}
		</>
	);
});
