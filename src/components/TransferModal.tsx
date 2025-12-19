/**
 * TransferModal Component
 * 
 * Modal dialog for transferring asset ownership to another wallet.
 */

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Asset } from '@/types/asset';
import { transferOwnership } from '@/services/blockchain';
import { useWalletContext } from '@/contexts/WalletContext';

interface TransferModalProps {
  asset: Asset;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TransferModal({ asset, open, onOpenChange, onSuccess }: TransferModalProps) {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const { address } = useWalletContext();
  const { toast } = useToast();

  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(recipientAddress);

  const handleTransfer = async () => {
    if (!address || !isValidAddress) return;

    setIsTransferring(true);

    try {
      const result = await transferOwnership(asset.id, address, recipientAddress);

      if (result.success) {
        toast({
          title: 'Transfer Successful',
          description: `Asset "${asset.name}" has been transferred to ${recipientAddress.slice(0, 8)}...`,
        });
        onSuccess();
        onOpenChange(false);
        setRecipientAddress('');
      } else {
        toast({
          title: 'Transfer Failed',
          description: result.error || 'Failed to transfer ownership.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Transfer Failed',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Transfer Ownership
          </DialogTitle>
          <DialogDescription>
            Transfer "{asset.name}" to another wallet address. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Wallet Address</Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="font-mono"
            />
            {recipientAddress && !isValidAddress && (
              <p className="text-sm text-destructive">
                Please enter a valid Ethereum address
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={!isValidAddress || isTransferring}
            className="gap-2"
          >
            {isTransferring ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Transferring...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Confirm Transfer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
