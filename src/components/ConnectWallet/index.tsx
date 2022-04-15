import React, { Fragment } from 'react';
import { useWallet } from 'use-wallet';
import styles from './index.less';

import { MetaMaskIcon, WalletConnectIcon } from '../Icon';

export function ConnectWallet() {
  const wallet = useWallet();
  const handleConnectMetaMask = () => {
    wallet.connect('injected');
  };
  const handleConnectWalletConnect = () => {
    wallet.connect('walletconnect');
  };

  return (
    <Fragment>
      <ConnectButton
        icon={<MetaMaskIcon />}
        name="MetaMask"
        desc="Connect to your MetaMask wallet"
        onClick={handleConnectMetaMask}
      />
      <ConnectButton
        icon={<WalletConnectIcon />}
        name="Wallet Connect"
        desc="Scan with WalletConnect to connect"
        onClick={handleConnectWalletConnect}
      />
    </Fragment>
  );
}

declare interface ConnectButtonProps {
  icon: React.ReactNode;
  name: string;
  desc: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

function ConnectButton({ icon, name, desc, onClick }: ConnectButtonProps) {
  return (
    <button type="button" className={styles.container} onClick={onClick}>
      <div className={styles.walletInfo}>
        {icon}
        <div className={styles.walletName}>{name}</div>
      </div>
      <div className={styles.walletDesc}>{desc}</div>
    </button>
  );
}
