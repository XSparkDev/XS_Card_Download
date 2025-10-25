'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Mail, LogOut, Settings, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfileProps {
  isOverLightSection?: boolean;
  isScrolled?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ isOverLightSection = false, isScrolled = false }) => {
  const { user, signOut, resetPassword } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    setLoading(true);
    const result = await signOut();
    
    if (result.success) {
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error?.userFriendlyMessage || "Failed to sign out",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResetError(null);

    const result = await resetPassword(resetEmail);
    
    if (result.success) {
      toast({
        title: "Password reset email sent",
        description: "Check your email for password reset instructions.",
      });
      setShowResetDialog(false);
      setResetEmail('');
    } else {
      setResetError(result.error?.userFriendlyMessage || 'Failed to send reset email');
    }
    
    setLoading(false);
  };

  const getInitials = (name: string | null) => {
    if (!name) return user.email?.charAt(0).toUpperCase() || 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className={`relative h-10 px-3 backdrop-blur-sm border rounded-full transition-all duration-300 ${
            isOverLightSection || !isScrolled
              ? "bg-slate-900/90 border-slate-700/50 hover:bg-slate-800/90 hover:border-slate-600/50 text-white" 
              : "bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30 text-white"
          }`}>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'} />
                <AvatarFallback className="text-xs bg-white/20 text-white border-0">{getInitials(user.displayName)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline">
                {user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'User'}
              </span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 backdrop-blur-lg shadow-2xl bg-slate-900/90 border border-slate-700/50" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none text-white">
                {user.displayName || 'User'}
              </p>
              <p className="text-xs leading-none text-white/70">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-700/50" />
          
          <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
            <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-white hover:bg-slate-800/50 focus:bg-slate-800/50">
            <Settings className="mr-2 h-4 w-4" />
            <span>Reset Password</span>
          </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="backdrop-blur-lg bg-slate-900/90 border border-slate-700/50">
              <DialogHeader>
                <DialogTitle className="text-white">Reset Password</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-white">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400"
                  />
                </div>
                
                {resetError && (
                  <Alert variant="destructive">
                    <AlertDescription>{resetError}</AlertDescription>
                  </Alert>
                )}
                
                <Button type="submit" className="w-full bg-custom-btn-gradient hover:opacity-90 text-white transition-opacity" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Reset Email
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <DropdownMenuItem onClick={handleSignOut} disabled={loading} className="text-white hover:bg-slate-800/50 focus:bg-slate-800/50">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
            {loading && <Loader2 className="ml-auto h-4 w-4 animate-spin" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}; 