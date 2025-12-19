/**
 * AssetCard Component
 * 
 * Displays asset information in a card format with action buttons.
 */

import { Link } from 'react-router-dom';
import { Eye, Send, UserPlus, Database, Code, BookOpen, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Asset, AssetType } from '@/types/asset';
import { cn } from '@/lib/utils';

interface AssetCardProps {
  asset: Asset;
  isOwner: boolean;
  onTransfer?: () => void;
  onGrantAccess?: () => void;
}

const assetTypeConfig: Record<AssetType, { icon: typeof Database; color: string }> = {
  Dataset: { icon: Database, color: 'bg-accent/20 text-accent border-accent/30' },
  Model: { icon: Cpu, color: 'bg-primary/20 text-primary border-primary/30' },
  Code: { icon: Code, color: 'bg-success/20 text-success border-success/30' },
  'Research Paper': { icon: BookOpen, color: 'bg-warning/20 text-warning border-warning/30' },
};

export function AssetCard({ asset, isOwner, onTransfer, onGrantAccess }: AssetCardProps) {
  const { icon: TypeIcon, color } = assetTypeConfig[asset.type];
  
  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="group relative overflow-hidden border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      {/* Gradient accent line */}
      <div className="absolute inset-x-0 top-0 h-1 gradient-primary opacity-0 transition-opacity group-hover:opacity-100" />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn('rounded-lg p-2 border', color)}>
              <TypeIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground line-clamp-1">{asset.name}</h3>
              <Badge variant="outline" className={cn('mt-1 text-xs', color)}>
                {asset.type}
              </Badge>
            </div>
          </div>
          {isOwner && (
            <Badge variant="secondary" className="text-xs">
              Owner
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {asset.description}
        </p>
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>
            <span className="text-foreground/70">Owner:</span>{' '}
            <span className="font-mono">{truncateAddress(asset.owner)}</span>
          </p>
          <p>
            <span className="text-foreground/70">Created:</span>{' '}
            {formatDate(asset.createdAt)}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 pt-3 border-t border-border">
        <Link to={`/asset/${asset.id}`} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full gap-1">
            <Eye className="h-3 w-3" />
            View
          </Button>
        </Link>
        {isOwner && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onTransfer}
              className="gap-1"
            >
              <Send className="h-3 w-3" />
              Transfer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onGrantAccess}
              className="gap-1"
            >
              <UserPlus className="h-3 w-3" />
              Grant
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
