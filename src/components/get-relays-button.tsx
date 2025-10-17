import {
	$,
	component$,
	useContext,
	useOnWindow,
	useSignal,
} from "@qwik.dev/core";
import type { StoredRelays } from "~/utils";
import {
	AccountManagerContext,
	RelayPoolContext,
	RelaysStoreContext,
} from "../providers";

export const GetRelaysButton = component$(() => {
	const accountManagerCtx = useContext(AccountManagerContext);
	const relayPoolCtx = useContext(RelayPoolContext);
	const relaysStoreCtx = useContext(RelaysStoreContext);

	const newRelayInput = useSignal("");
	const newRelayRead = useSignal(true);
	const newRelayWrite = useSignal(true);

	const hasExtension = useSignal(false);

	useOnWindow(
		"load",
		$(() => {
			hasExtension.value = !!window.nostr;
		}),
	);

	return (
		<>
			<ul>
				{Object.entries(relayPoolCtx.value.relays).map(
					([name, relay], index) => (
						<li key={name}>
							{name}
							<label>
								<input
									type="checkbox"
									checked={relay.read}
									onChange$={() => {
										relayPoolCtx.value.relays[index].read = !relay.read;
									}}
								/>
								Read
							</label>
							<label>
								<input
									type="checkbox"
									checked={relay.write}
									onChange$={() => {
										relayPoolCtx.value.relays[index].write = !relay.write;
									}}
								/>
								Write
							</label>
							<button
								type="button"
								onClick$={() => {
									delete relayPoolCtx.value.relays[name];
								}}
							>
								Delete
							</button>
						</li>
					),
				)}
			</ul>

			<div>
				<input
					type="text"
					value={newRelayInput.value}
					onInput$={(e) => {
						newRelayInput.value = (e.target as HTMLInputElement).value;
					}}
					placeholder="wss://new.relay.com"
				/>
				<label>
					<input
						type="checkbox"
						checked={newRelayRead.value}
						onChange$={() => {
							newRelayRead.value = !newRelayRead.value;
						}}
					/>
					Read
				</label>
				<label>
					<input
						type="checkbox"
						checked={newRelayWrite.value}
						onChange$={() => {
							newRelayWrite.value = !newRelayWrite.value;
						}}
					/>
					Write
				</label>
				<button
					type="button"
					onClick$={() => {
						const relayUrl = newRelayInput.value.trim();
						if (/^wss?:\/\/.+/.test(relayUrl)) {
							relayPoolCtx.value.relays[relayUrl] = {
								read: newRelayRead.value,
								write: newRelayWrite.value,
							};
							newRelayInput.value = "";
							newRelayRead.value = true;
							newRelayWrite.value = true;
						} else {
							alert(
								"Please enter a valid relay URL starting with wss:// or ws://",
							);
						}
					}}
				>
					Add Relay
				</button>
			</div>

			{accountManagerCtx.value.activeAccount ? (
				<button
					type="button"
					onClick$={async () => {
						const fetchedRelays =
							(await accountManagerCtx.value.activeAccount?.getRelays()) as
								| StoredRelays
								| undefined;

						if (fetchedRelays) {
							relaysStoreCtx.relays = {
								...relayPoolCtx.value.relays,
								...fetchedRelays,
							};
						}
					}}
				>
					Get relays from extension
				</button>
			) : (
				<button type="button" disabled={true}>
					No Nostr relays
				</button>
			)}
		</>
	);
});
