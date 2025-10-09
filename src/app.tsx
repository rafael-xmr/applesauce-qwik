import { component$ } from "@qwik.dev/core";
import { ExtensionSigner } from "./components/extension-signer";
import { useAccountsProvider } from "./providers/account-manager";
import { useActionHubProvider } from "./providers/action-hub";
import { useEventFactoryProvider } from "./providers/event-factory";
import { useEventStoreProvider } from "./providers/event-store";

export const App = component$(() => {
	useEventStoreProvider();
	useEventFactoryProvider();
	useActionHubProvider();
	useAccountsProvider();

	return (
		<>
			<ExtensionSigner />
		</>
	);
});
