
import { useState, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  // Check if wallet is admin on mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isConnected || !address) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        // Try to get the stored token
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const claims = session.user.user_metadata?.wallet_address;
          if (claims && claims.toLowerCase() === address.toLowerCase()) {
            setIsAdmin(true);
            setIsLoading(false);
            return;
          }
        }

        setIsAdmin(false);
        setIsLoading(false);
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError('Failed to check admin status');
        setIsAdmin(false);
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [isConnected, address]);

  const verifyAdmin = async () => {
    if (!isConnected || !address) {
      setError('Wallet not connected');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create a message to sign
      const message = `I am verifying that I control the wallet address ${address} to access admin settings. Timestamp: ${Date.now()}`;
      
      // Request signature
      const signature = await signMessageAsync({ message });
      
      // Verify the signature using our edge function
      const response = await supabase.functions.invoke('verify-admin', {
        body: {
          signature,
          message,
          walletAddress: address
        }
      });

      if (response.error) {
        setError(response.error.message || 'Verification failed');
        setIsAdmin(false);
        setIsLoading(false);
        return false;
      }

      if (response.data.success && response.data.token) {
        // Set the session with the token
        await supabase.auth.setSession({
          access_token: response.data.token,
          refresh_token: ''
        });
        
        setIsAdmin(true);
        setIsLoading(false);
        return true;
      } else {
        setError('Not authorized as admin');
        setIsAdmin(false);
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      console.error('Error verifying admin:', err);
      setError('Failed to verify admin status');
      setIsAdmin(false);
      setIsLoading(false);
      return false;
    }
  };

  return { isAdmin, isLoading, error, verifyAdmin };
}
