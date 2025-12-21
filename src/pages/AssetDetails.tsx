import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Database, Code, Cpu, BookOpen, Send, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { TransferModal } from '@/components/TransferModal';
import { GrantAccessModal } from '@/components/GrantAccessModal';
import { useWalletContext } from '@/contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { getAssetById, revokeAccess } from '@/services/blockchain';
import { Asset, AssetType } from '@/types/asset';
import { cn } from '@/lib/utils';

const icons: Record<AssetType, typeof Database> = { Dataset: Database, Model: Cpu, Code: Code, 'Research Paper': BookOpen };

export default function AssetDetails() {
  const { id } = useParams<{ id: string }>();
  const { isConnected, address } = useWalletContext();
  const { toast } = useToast();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transferOpen, setTransferOpen] = useState(false);
  const [grantOpen, setGrantOpen] = useState(false);

  const fetchAsset = async () => {
    if (!id) return;
    console.log("Fetching asset with id:", id);
    setIsLoading(true);
    const result = await getAssetById(id);
    setAsset(result);
    setIsLoading(false);
  };

  useEffect(() => { fetchAsset(); }, [id]);

  const isOwner = asset && address && asset.owner.toLowerCase() === address.toLowerCase();
  const Icon = asset ? icons[asset.type] : Database;

  const handleRevoke = async (userAddr: string) => {
    if (!asset || !address) return;
    const result = await revokeAccess(asset.id, address, userAddr);
    if (result.success) {
      toast({ title: 'Access Revoked', description: `Revoked access for ${userAddr.slice(0,8)}...` });
      fetchAsset();
    } else {
      toast({ title: 'Failed', description: result.error, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background"><Navbar /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></div>;
  }

  if (!asset) {
    return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-4 py-20 text-center"><h2 className="text-xl font-semibold">Asset Not Found</h2><Link to="/my-assets"><Button className="mt-4">Back to Assets</Button></Link></div></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Link to="/my-assets"><Button variant="ghost" className="gap-2 mb-6"><ArrowLeft className="h-4 w-4" />Back</Button></Link>
        <div className="glass-card rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="rounded-lg gradient-primary p-3"><Icon className="h-6 w-6 text-primary-foreground" /></div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{asset.name}</h1>
              <Badge variant="outline" className="mt-2">{asset.type}</Badge>
            </div>
            {isOwner && <Badge variant="secondary">Owner</Badge>}
          </div>
          <p className="text-muted-foreground mb-6">{asset.description}</p>
          <div className="space-y-3 text-sm">
            <div><span className="text-muted-foreground">Owner:</span> <span className="font-mono text-foreground">{asset.owner}</span></div>
            <div><span className="text-muted-foreground">Hash:</span> <span className="font-mono text-foreground break-all">{asset.hash}</span></div>
            <div><span className="text-muted-foreground">Created:</span> <span className="text-foreground">{new Date(asset.createdAt).toLocaleString()}</span></div>
          </div>
          {isOwner && isConnected && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-border">
              <Button onClick={() => setTransferOpen(true)} className="gap-2"><Send className="h-4 w-4" />Transfer</Button>
              <Button variant="outline" onClick={() => setGrantOpen(true)} className="gap-2"><UserPlus className="h-4 w-4" />Grant Access</Button>
            </div>
          )}
        </div>
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Authorized Users ({asset.authorizedUsers.length})</h3>
          {asset.authorizedUsers.length === 0 ? (
            <p className="text-muted-foreground text-sm">No users have been granted access.</p>
          ) : (
            <div className="space-y-2">{asset.authorizedUsers.map((user) => (
              <div key={user} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="font-mono text-sm text-foreground">{user}</span>
                {isOwner && <Button variant="ghost" size="sm" onClick={() => handleRevoke(user)} className="text-destructive"><UserMinus className="h-4 w-4" /></Button>}
              </div>
            ))}</div>
          )}
        </div>
      </main>
      {asset && <><TransferModal asset={asset} open={transferOpen} onOpenChange={setTransferOpen} onSuccess={fetchAsset} /><GrantAccessModal asset={asset} open={grantOpen} onOpenChange={setGrantOpen} onSuccess={fetchAsset} /></>}
    </div>
  );
}
