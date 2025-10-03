import { component$ } from "@qwik.dev/core";
import { ExtensionSigner } from "./components/extension-signer/extension-signer";
import {
	useAccountsProvider,
	type StoredData,
} from "./providers/account-manager";
import { useActionHubProvider } from "./providers/actions";
import { useEventStoreProvider } from "./providers/event-store";
import { useFactoryProvider } from "./providers/factory";

export interface AppProps {
	accountData: StoredData | undefined;
}

export const App = component$<AppProps>(({ accountData }) => {
	useEventStoreProvider();
	useFactoryProvider();
	useActionHubProvider();
	useAccountsProvider(accountData);

	return (
		<>
			<ExtensionSigner />
		</>
	);
});

