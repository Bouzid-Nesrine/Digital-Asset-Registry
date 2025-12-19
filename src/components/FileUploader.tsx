/**
 * FileUploader Component
 * 
 * Drag-and-drop file upload component that generates SHA-256 hash.
 * Files are only hashed locally - nothing is uploaded to servers.
 */

import { useCallback } from 'react';
import { Upload, File, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  file: File | null;
  hash: string | null;
  isHashing: boolean;
  error: string | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

export function FileUploader({
  file,
  hash,
  isHashing,
  error,
  onFileSelect,
  onClear,
}: FileUploaderProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        onFileSelect(droppedFile);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        onFileSelect(selectedFile);
      }
    },
    [onFileSelect]
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={cn(
            'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8',
            'border-border bg-secondary/30 transition-colors',
            'hover:border-primary/50 hover:bg-secondary/50 cursor-pointer'
          )}
        >
          <input
            type="file"
            onChange={handleFileInput}
            className="absolute inset-0 cursor-pointer opacity-0"
            accept="*/*"
          />
          <Upload className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm text-foreground font-medium">
            Drop your file here or click to browse
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            File will be hashed locally (SHA-256) - not uploaded
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="rounded-lg bg-primary/20 p-2">
                <File className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Hash Status */}
          <div className="mt-3 pt-3 border-t border-border">
            {isHashing ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating SHA-256 hash...
              </div>
            ) : hash ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-success">
                  <Check className="h-4 w-4" />
                  Hash generated successfully
                </div>
                <p className="text-xs font-mono text-muted-foreground break-all bg-background/50 p-2 rounded">
                  {hash}
                </p>
              </div>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
