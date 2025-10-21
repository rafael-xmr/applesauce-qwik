import {
  $,
  component$,
  type PropsOf,
  useContext,
  useOnWindow,
  useSignal,
  useStylesScoped$,
} from "@qwik.dev/core";
import { ExtensionAccount } from "applesauce-accounts/accounts";
import { ExtensionSigner } from "applesauce-signers/signers/extension-signer";
import { nip98 } from "nostr-tools";
import LoginWithNostrIcon from "~/icons/login-with-nostr";
import {
  AccountManagerContext,
  AccountManagerStoreContext,
  AccountType,
} from "~/providers";
import styles from "./extension-authenticator.css?inline";

interface ErrorType {
  code: string | undefined;
  name?: string;
  message: string;
}

interface NostrLoginProps {
  loginUrl: string;
  httpMethod?: string;
  onClick?: (eventB64: string) => void;
  onSuccess?: (data: unknown) => void;
  onError?: (error: { code: string | undefined; message: string }) => void;
}

export const ExtensionAuthenticator = component$<NostrLoginProps>(
  (props: PropsOf<"button"> & NostrLoginProps) => {
    const accountManagerCtx = useContext(AccountManagerContext);
    const accountManagerStoreCtx = useContext(AccountManagerStoreContext);

    const errorSignal = useSignal<string | null>(null);
    const hasNip07Extension = useSignal(false);
    const httpMethod = props.httpMethod || "post";

    useOnWindow(
      "load",
      $(() => {
        hasNip07Extension.value = !!window.nostr;
      }),
    );

    useStylesScoped$(styles);

    const handleSuccess = $((data: any) => {
      const pubkey = data.pubkey;

      const signer = new ExtensionSigner();

      // Get the existing account or create a new one
      const account =
        accountManagerCtx.value.accountManager.accounts.find(
          (a) => a.type === ExtensionAccount.type && a.pubkey === pubkey,
        ) ?? new ExtensionAccount(pubkey, signer);

      if (!accountManagerCtx.value.accountManager.accounts.includes(account))
        accountManagerCtx.value.accountManager.addAccount(account);

      accountManagerCtx.value.accountManager.setActive(account);
      accountManagerStoreCtx.activeAccountId = account.id;
      accountManagerStoreCtx.accountType = AccountType.Extension;
      if (props.onSuccess && typeof props.onSuccess === "function") {
        props.onSuccess(data);
      }
    });

    const handleError = $((error: ErrorType) => {
      errorSignal.value = error.message;

      if (props.onError && typeof props.onError === "function") {
        props.onError(error);
      }
    });

    return (
      <>
        {errorSignal.value && (
          <label class="error-label" for="extension-authenticator-button">
            {errorSignal.value}
          </label>
        )}
        <button
          id="extension-authenticator-button"
          class={props.class || "nostr-one"}
          type="button"
          onClick$={async () => {
            let eventB64 = "";

            try {
              eventB64 = await nip98.getToken(props.loginUrl, httpMethod, (e) =>
                window.nostr?.signEvent(e),
              );
            } catch (e) {
              const error = e as ErrorType;
              handleError({ code: "nip98_error", message: error.message });
              return;
            }

            // if (props.onClick && typeof props.onClick === "function") {
            // props.onClick(eventB64);
            //   return;
            // }

            try {
              const response = await fetch(props.loginUrl, {
                method: httpMethod.toUpperCase(),
                headers: {
                  Authorization: `Nostr ${eventB64}`,
                },
                ...(httpMethod === "post" && { body: JSON.stringify({}) }),
              });

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const data = await response.json();
              handleSuccess(data);
            } catch (e) {
              const error = e as ErrorType;
              handleError({
                code: error.name || "fetch_error",
                message: error.message,
              });
            }
          }}
          disabled={!hasNip07Extension.value}
          title={
            hasNip07Extension.value ? "Login using Nostr" : "NIP07 not detected"
          }
        >
          <LoginWithNostrIcon class="icon" />
          <slot>Login with Nostr</slot>
        </button>
      </>
    );
  },
);
