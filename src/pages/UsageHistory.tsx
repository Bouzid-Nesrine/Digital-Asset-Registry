import { useState, useEffect } from 'react';
import { History, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { getUsageHistory } from '@/services/blockchain';
import { UsageRecord, ActionType } from '@/types/asset';
import { cn } from '@/lib/utils';

const actionColors: Record<ActionType, string> = {
  registered: 'bg-success/20 text-success border-success/30',
  accessed: 'bg-accent/20 text-accent border-accent/30',
  transferred: 'bg-primary/20 text-primary border-primary/30',
  access_granted: 'bg-warning/20 text-warning border-warning/30',
  access_revoked: 'bg-destructive/20 text-destructive border-destructive/30',
};

export default function UsageHistory() {
  const [history, setHistory] = useState<UsageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    setIsLoading(true);
    const result = await getUsageHistory();
    setHistory(result);
    setIsLoading(false);
  };

  useEffect(() => { fetchHistory(); }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Usage History</h1>
            <p className="text-muted-foreground">All blockchain activity for digital assets</p>
          </div>
          <Button variant="outline" onClick={fetchHistory} disabled={isLoading} className="gap-2">
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />Refresh
          </Button>
        </div>
        <div className="glass-card rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center"><History className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No history found.</p></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Asset</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead className="hidden md:table-cell">Wallet</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((record) => (
                  <TableRow key={record.id} className="border-border">
                    <TableCell className="font-medium">{record.assetName}</TableCell>
                    <TableCell><Badge variant="outline" className={cn('capitalize', actionColors[record.action])}>{record.action.replace('_', ' ')}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-sm">{record.walletAddress.slice(0,6)}...{record.walletAddress.slice(-4)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{new Date(record.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  );
}
