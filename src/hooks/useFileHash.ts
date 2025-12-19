/**
 * useFileHash Hook
 * 
 * Generates SHA-256 hash from uploaded files for blockchain registration.
 * The file content is hashed client-side - no file upload to servers.
 */

import { useState, useCallback } from 'react';

interface FileHashResult {
  file: File | null;
  hash: string | null;
  isHashing: boolean;
  error: string | null;
}

export function useFileHash() {
  const [result, setResult] = useState<FileHashResult>({
    file: null,
    hash: null,
    isHashing: false,
    error: null,
  });

  /**
   * Generate SHA-256 hash from a file
   */
  const hashFile = useCallback(async (file: File): Promise<string | null> => {
    setResult({
      file,
      hash: null,
      isHashing: true,
      error: null,
    });

    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Generate SHA-256 hash using Web Crypto API
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      
      // Convert to hex string
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      setResult({
        file,
        hash: hashHex,
        isHashing: false,
        error: null,
      });
      
      return hashHex;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to hash file';
      setResult({
        file,
        hash: null,
        isHashing: false,
        error: errorMessage,
      });
      return null;
    }
  }, []);

  /**
   * Clear the current file and hash
   */
  const clearFile = useCallback(() => {
    setResult({
      file: null,
      hash: null,
      isHashing: false,
      error: null,
    });
  }, []);

  return {
    ...result,
    hashFile,
    clearFile,
  };
}
