import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/Navbar';
import { FileUploader } from '@/components/FileUploader';
import { ConnectWalletPrompt } from '@/components/ConnectWalletPrompt';
import { useWalletContext } from '@/contexts/WalletContext';
import { useFileHash } from '@/hooks/useFileHash';
import { useToast } from '@/hooks/use-toast';
import { registerAsset } from '@/services/blockchain';
import { AssetType } from '@/types/asset';

const assetTypes: AssetType[] = ['Dataset', 'Model', 'Code', 'Research Paper'];

export default function RegisterAsset() {
  const navigate = useNavigate();
  const { isConnected, address } = useWalletContext();
  const { file, hash, isHashing, error, hashFile, clearFile } = useFileHash();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [type, setType] = useState<AssetType | ''>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = useCallback((selectedFile: File) => {
    hashFile(selectedFile);
  }, [hashFile]);

  const isFormValid = name.trim() && type && description.trim() && hash && !isHashing;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !address || !hash) return;

    setIsSubmitting(true);
    try {
      const result = await registerAsset(name, type as AssetType, description, hash, address);
      if (result.success) {
        toast({ title: 'Asset Registered', description: `Transaction hash: ${result.hash?.slice(0, 16)}...` });
        navigate('/my-assets');
      } else {
        toast({ title: 'Registration Failed', description: result.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return <div className="min-h-screen bg-background"><Navbar /><ConnectWalletPrompt title="Connect to Register Assets" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Register New Asset</h1>
          <p className="text-muted-foreground">Create an immutable record of your digital asset on the blockchain.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Asset Name</Label>
            <Input id="name" placeholder="Enter asset name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Asset Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as AssetType)}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>{assetTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Describe your asset" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          </div>
          <div className="space-y-2">
            <Label>File (for hash generation)</Label>
            <FileUploader file={file} hash={hash} isHashing={isHashing} error={error} onFileSelect={handleFileSelect} onClear={clearFile} />
          </div>
          <Button type="submit" disabled={!isFormValid || isSubmitting} className="w-full gap-2 gradient-primary text-primary-foreground">
            {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Registering...</> : <><FileText className="h-4 w-4" />Register Asset</>}
          </Button>
        </form>
      </main>
    </div>
  );
}
