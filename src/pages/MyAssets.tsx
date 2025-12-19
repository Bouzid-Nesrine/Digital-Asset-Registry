import { useState, useEffect, useCallback } from 'react';
import { Package, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { AssetCard } from '@/components/AssetCard';
import { TransferModal } from '@/components/TransferModal';
import { GrantAccessModal } from '@/components/GrantAccessModal';
import { ConnectWalletPrompt } from '@/components/ConnectWalletPrompt';
import { useWalletContext } from '@/contexts/WalletContext';
import { getMyAssets } from '@/services/blockchain';
import { Asset } from '@/types/asset';

export default function MyAssets() {
  const { isConnected, address } = useWalletContext();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [grantOpen, setGrantOpen] = useState(false);

  const fetchAssets = useCallback(async () => {
    if (!address) return;
    setIsLoading(true);
    try {
      const result = await getMyAssets(address);
      setAssets(result);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => { if (isConnected && address) fetchAssets(); }, [isConnected, address, fetchAssets]);

  if (!isConnected) {
    return <div className="min-h-screen bg-background"><Navbar /><ConnectWalletPrompt title="View Your Assets" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">My Assets</h1>
            <p className="text-muted-foreground">Assets you own or have access to</p>
          </div>
          <Button variant="outline" onClick={fetchAssets} disabled={isLoading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />Refresh
          </Button>
        </div>
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3].map(i => <div key={i} className="h-64 rounded-lg bg-secondary animate-pulse" />)}</div>
        ) : assets.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-xl">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Assets Found</h3>
            <p className="text-muted-foreground">Register your first asset to get started.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                isOwner={asset.owner.toLowerCase() === address?.toLowerCase()}
                onTransfer={() => { setSelectedAsset(asset); setTransferOpen(true); }}
                onGrantAccess={() => { setSelectedAsset(asset); setGrantOpen(true); }}
              />

            //   <AssetCard
            //   key={asset.id}
            //   asset={asset}
            //   isOwner={asset.owner.toLowerCase() === address?.toLowerCase()}
            //   onTransfer={handleTransfer}
            //   onGrantAccess={handleGrantAccess}
            // />

            ))}
          </div>
        )}
      </main>
      {selectedAsset && (
        <>
          <TransferModal asset={selectedAsset} open={transferOpen} onOpenChange={setTransferOpen} onSuccess={fetchAssets} />
          <GrantAccessModal asset={selectedAsset} open={grantOpen} onOpenChange={setGrantOpen} onSuccess={fetchAssets} />
        </>
      )}
    </div>
  );
}
