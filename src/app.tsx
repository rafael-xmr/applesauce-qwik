import { Counter } from "./components/counter/counter";
import { ExtensionSigner } from "./components/extension-signer/extension-signer";
import { Logo } from "./components/logo/logo";
import { component$, useSignal } from "@qwik.dev/core";
import { useEventStoreProvider } from "./providers/event-store";
import { useFactoryProvider } from "./providers/factory";
import { useAccountsProvider } from "./providers/accounts";
import { useActionHubProvider } from "./providers/actions";
import type { IEventStore } from "applesauce-core";
import type { EventFactory } from "applesauce-factory";
import type { AccountManager } from "applesauce-accounts";
import type { ActionHub } from "applesauce-actions";

export const App = component$(() => {
	const eventStore = useSignal<IEventStore | undefined>();
	const factory = useSignal<EventFactory | undefined>();
	const accounts = useSignal<AccountManager | undefined>();
	const actionHub = useSignal<ActionHub | undefined>();

	useEventStoreProvider(eventStore);
	useFactoryProvider(factory);
	useAccountsProvider(accounts);
	useActionHubProvider(eventStore, factory, actionHub);

	console.log("EventStore in Logo:", eventStore.value);
	console.log("Factory in Logo:", factory.value);
	console.log("Accounts in Logo:", accounts.value);
	console.log("ActionHub in Logo:", actionHub.value);

	return (
		<>
			<Logo />
			<Counter />
			<ExtensionSigner />
		</>
	);
});
