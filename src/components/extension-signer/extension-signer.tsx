import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { useExtensionSigner } from "../../hooks/use-extension-signin";
import { useActiveAccount } from "../../hooks/use-active-account";
import { useAccountManager } from "../../providers/accounts";
import { $ } from "@qwik.dev/core";

export const ExtensionSigner = component$(() => {
	const manager = useAccountManager();

	const extension = useExtensionSigner();
	const hasExtension = useSignal(false);

	const activeAccount = useActiveAccount();

	useVisibleTask$(() => {
		hasExtension.value = !!window.nostr;
	});

	const signout = $(() => {
		if (manager?.active) {
			manager.removeAccount(manager.active);
			manager.clearActive();
		}
	});

	return (
		<>
			{activeAccount ? (
				<>
					<label for="button">Signed in as {activeAccount.pubkey}</label>
					<button id="button" type="button" onClick$={signout}>
						Sign out
					</button>
				</>
			) : (
				hasExtension.value && (
					<button
						type="button"
						onClick$={() => extension.run()}
						disabled={extension?.loading.value}
					>
						{extension?.loading.value
							? "Signing in..."
							: "Sign in with extension"}
					</button>
				)
			)}
		</>
	);
});
