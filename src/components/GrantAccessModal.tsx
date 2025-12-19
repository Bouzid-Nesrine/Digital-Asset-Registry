/**
 * GrantAccessModal Component
 * 
 * Modal dialog for granting access to an asset for a specific wallet.
 */

import { useState } from 'react';
import { UserPlus, Loader2 } from 'lucide-react';
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
import { grantAccess } from '@/services/blockchain';
import { useWalletContext } from '@/contexts/WalletContext';

interface GrantAccessModalProps {
  asset: Asset;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function GrantAccessModal({ asset, open, onOpenChange, onSuccess }: GrantAccessModalProps) {
  const [userAddress, setUserAddress] = useState('');
  const [isGranting, setIsGranting] = useState(false);
  const { address } = useWalletContext();
  const { toast } = useToast();

  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(userAddress);
  const isAlreadyAuthorized = asset.authorizedUsers.some(
    (user) => user.toLowerCase() === userAddress.toLowerCase()
  );

  const handleGrantAccess = async () => {
    if (!address || !isValidAddress) return;

    setIsGranting(true);

    try {
      const result = await grantAccess(asset.id, address, userAddress);

      if (result.success) {
        toast({
          title: 'Access Granted',
          description: `${userAddress.slice(0, 8)}... can now access "${asset.name}".`,
        });
        onSuccess();
        onOpenChange(false);
        setUserAddress('');
      } else {
        toast({
          title: 'Failed to Grant Access',
          description: result.error || 'Failed to grant access.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Failed to Grant Access',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsGranting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Grant Access
          </DialogTitle>
          <DialogDescription>
            Allow another wallet to access "{asset.name}". You can revoke access later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="user-address">Wallet Address to Authorize</Label>
            <Input
              id="user-address"
              placeholder="0x..."
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              className="font-mono"
            />
            {userAddress && !isValidAddress && (
              <p className="text-sm text-destructive">
                Please enter a valid Ethereum address
              </p>
            )}
            {isAlreadyAuthorized && (
              <p className="text-sm text-warning">
                This address already has access to this asset
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleGrantAccess}
            disabled={!isValidAddress || isAlreadyAuthorized || isGranting}
            className="gap-2"
          >
            {isGranting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Granting...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Grant Access
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
