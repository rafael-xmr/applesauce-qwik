import {
  $,
  component$,
  noSerialize,
  useContext,
  useOnWindow,
  useSignal,
} from "@qwik.dev/core";
import { useExtensionSignerAsyncAction } from "../hooks/use-extension-signin";
import {
  AccountManagerContext,
  AccountManagerStoreContext,
} from "../providers/account-manager";

export const ExtensionSigner = component$(() => {
  const accountManagerCtx = useContext(AccountManagerContext);
  const accountManagerStoreCtx = useContext(AccountManagerStoreContext);
  const extensionAsyncAction = noSerialize(useExtensionSignerAsyncAction());

  const hasNip07Extension = useSignal(false);

  useOnWindow(
    "load",
    $(() => {
      hasNip07Extension.value = !!window.nostr;
    }),
  );

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
              accountManagerStoreCtx.activeAccountId = undefined;
              accountManagerStoreCtx.resolvedProfile = undefined;
              accountManagerStoreCtx.accountType = undefined;
            }}
          >
            Sign out
          </button>
        </>
      ) : hasNip07Extension.value ? (
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
