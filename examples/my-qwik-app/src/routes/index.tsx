import { component$, useSignal, useVisibleTask$ } from "@qwik.dev/core";
import type { DocumentHead } from "@qwik.dev/router";
import { ExtensionSigner } from "applesauce-qwik/components/extension-signer/extension-signer";
import { useAccountsProvider } from "applesauce-qwik/providers/account-manager";
import { useActionHubProvider } from "applesauce-qwik/providers/actions";
import { useEventStoreProvider } from "applesauce-qwik/providers/event-store";
import { useFactoryProvider } from "applesauce-qwik/providers/factory";
import { useCookieLoader } from "./layout";

export default component$(() => {
	useEventStoreProvider();
	useFactoryProvider();
	useActionHubProvider();

	const cookieValue = useCookieLoader();
	useAccountsProvider(JSON.parse(cookieValue.value || "{}"));

	// useVisibleTask$(() => {
	// 	const cookies = document.cookie.split(";");
	// 	for (const cookie of cookies) {
	// 		const [name, value] = cookie.trim().split("=");
	// 		if (name === "my-cookie") {
	// 			cookieValue.value = value;
	// 			break;
	// 		}
	// 	}
	// });

	return (
		<>
			<ExtensionSigner />
		</>
	);
});

export const head: DocumentHead = {
	title: "Welcome to Qwik",
	meta: [
		{
			name: "description",
			content: "Qwik site description",
		},
	],
};
