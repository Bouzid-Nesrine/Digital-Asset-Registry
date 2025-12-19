/**
 * Navbar Component
 * 
 * Main navigation bar with wallet connection button and navigation links.
 */

import { Link, useLocation } from 'react-router-dom';
import { Wallet, Menu, X, FileText, Package, History, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWalletContext } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';

const navLinks = [
  { path: '/register', label: 'Register Asset', icon: Plus },
  { path: '/my-assets', label: 'My Assets', icon: Package },
  { path: '/history', label: 'Usage History', icon: History },
];

export function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    isConnected,
    address,
    isCorrectNetwork,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
  } = useWalletContext();

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold gradient-text">Digital Asset Registry</h1>
              <p className="text-xs text-muted-foreground">Blockchain DApp</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path}>
                <Button
                  variant={location.pathname === path ? 'secondary' : 'ghost'}
                  className={cn(
                    'gap-2',
                    location.pathname === path && 'bg-secondary'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center gap-3">
            {isConnected ? (
              <div className="flex items-center gap-2">
                {!isCorrectNetwork && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={switchToSepolia}
                    className="hidden sm:flex"
                  >
                    Switch to Sepolia
                  </Button>
                )}
                <div className="hidden sm:flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
                  <div className={cn(
                    'h-2 w-2 rounded-full',
                    isCorrectNetwork ? 'bg-success' : 'bg-warning'
                  )} />
                  <span className="text-sm font-mono text-foreground">
                    {truncateAddress(address!)}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={disconnectWallet}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={connectWallet}
                disabled={isConnecting}
                className="gap-2 gradient-primary text-primary-foreground hover:opacity-90"
              >
                <Wallet className="h-4 w-4" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 animate-slide-up">
            <div className="flex flex-col gap-2">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={location.pathname === path ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Button>
                </Link>
              ))}
              {isConnected && !isCorrectNetwork && (
                <Button
                  variant="destructive"
                  onClick={switchToSepolia}
                  className="w-full"
                >
                  Switch to Sepolia
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
