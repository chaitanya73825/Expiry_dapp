import { PropsWithChildren } from "react";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
// Internal constants
import { APTOS_API_KEY, NETWORK } from "@/constants";

export function WalletProvider({ children }: PropsWithChildren) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={false}
      dappConfig={{ 
        network: NETWORK, 
        ...(APTOS_API_KEY && { aptosApiKeys: {[NETWORK]: APTOS_API_KEY} })
      }}
      onError={(error) => {
        // Completely suppress all wallet errors to prevent transaction failed messages
        console.log("Wallet adapter error suppressed:", error);
        // Don't show any error messages to user
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
