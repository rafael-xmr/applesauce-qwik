import { useContext } from "@qwik.dev/core";
import { ExtensionAccount } from "applesauce-accounts/accounts";
import { ExtensionSigner } from "applesauce-signers/signers/extension-signer";
import {
  AccountManagerContext,
  AccountManagerStoreContext,
  AccountType,
} from "../providers";
import { useAsyncAction } from "./use-async-action";

export function useExtensionSignerAsyncAction() {
  const accountManagerCtx = useContext(AccountManagerContext);
  const accountManagerStoreCtx = useContext(AccountManagerStoreContext);

  const extension = useAsyncAction(async () => {
    if (!window.nostr) throw new Error("Missing NIP-07 signer extension");

    const signer = new ExtensionSigner();
    const pubkey = await signer.getPublicKey();

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
  });

  return extension;
}
