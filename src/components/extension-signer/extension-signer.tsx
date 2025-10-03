import {
	component$,
	noSerialize,
	useSignal,
	useVisibleTask$,
} from "@qwik.dev/core";
import { useActiveAccount } from "../../hooks/use-active-account";
import { useExtensionSigner } from "../../hooks/use-extension-signin";
import { useAccountManager } from "../../providers/account-manager";

export const ExtensionSigner = component$(() => {
	const manager = useAccountManager();

	const extension = useExtensionSigner();
	const hasExtension = useSignal(false);

	const activeAccount = noSerialize(useActiveAccount());

	const relays = useSignal();

	useVisibleTask$(() => {
		hasExtension.value = !!window.nostr;
	});

	return (
		<>
			{!manager ? (
				<button type="button" disabled={true}>
					Waiting for Account Manager to be ready
				</button>
			) : activeAccount ? (
				<>
					<div>
						<label for="button">Signed in as {activeAccount.pubkey}</label>
						<button
							id="button"
							type="button"
							onClick$={() => {
								if (manager && activeAccount) {
									manager.removeAccount(activeAccount);
									manager.clearActive();
								}
							}}
						>
							Sign out
						</button>
					</div>

					<div>
						<button
							type="button"
							onClick$={async () => {
								relays.value = await activeAccount.getRelays();
							}}
						>
							{relays.value
								? Object.entries(relays.value).map(
										(entry) =>
											`${entry[0]}: read: ${entry[1].read}, write: ${entry[1].write}`,
									)
								: "Get relays"}
						</button>
					</div>
				</>
			) : hasExtension.value ? (
				<button
					type="button"
					onClick$={() => extension.run()}
					disabled={extension?.loading.value}
				>
					{extension?.loading.value
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
