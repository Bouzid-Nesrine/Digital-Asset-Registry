/**
 * ConnectWalletPrompt Component
 * 
 * Displays a prompt for users to connect their wallet when not connected.
 */

import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWalletContext } from '@/contexts/WalletContext';

interface ConnectWalletPromptProps {
  title?: string;
  description?: string;
}

export function ConnectWalletPrompt({
  title = 'Connect Your Wallet',
  description = 'Connect your MetaMask wallet to access this feature and interact with the blockchain.',
}: ConnectWalletPromptProps) {
  const { connectWallet, isConnecting } = useWalletContext();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="glass-card rounded-2xl p-8 max-w-md text-center">
        <div className="mx-auto mb-6 h-16 w-16 rounded-full gradient-primary flex items-center justify-center glow-primary">
          <Wallet className="h-8 w-8 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground mb-6">{description}</p>
        <Button
          onClick={connectWallet}
          disabled={isConnecting}
          size="lg"
          className="gap-2 gradient-primary text-primary-foreground hover:opacity-90"
        >
          <Wallet className="h-5 w-5" />
          {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
        </Button>
      </div>
    </div>
  );
}
