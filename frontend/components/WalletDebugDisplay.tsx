import React from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

const WalletDebugDisplay: React.FC = () => {
  const { account, connected, signAndSubmitTransaction, wallet, network } = useWallet();

  return (
    <div className="wallet-debug-container" style={{ 
      position: 'fixed', 
      top: '20px', 
      right: '20px', 
      zIndex: 10000,
      maxWidth: '300px'
    }}>
      <div className="wallet-debug" data-wallet-debug="true">
        <h4>Wallet Debug</h4>
        <div className="debug-item">
          Connected: {connected ? '✅' : '❌'}
        </div>
        {account && (
          <div className="debug-item account-info">
            Account: {account.address.toString().substring(0, 10)}...
          </div>
        )}
        <div className="debug-item transaction-status">
          signAndSubmitTransaction: {signAndSubmitTransaction ? '✅' : '❌'}
        </div>
        {wallet && (
          <div className="debug-item wallet-info">
            Wallet: {wallet.name}
          </div>
        )}
        {network && (
          <div className="debug-item network-info">
            Network: {network.name}
          </div>
        )}
        <div className="debug-item test-info">
          Test Wallet Transaction: Ready
        </div>
      </div>
    </div>
  );
};

export default WalletDebugDisplay;
