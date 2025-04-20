
import { useState, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [potentialAdmin, setPotentialAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { toast } = useToast();

  // Check if wallet is admin on mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isConnected || !address) {
        setIsAdmin(false);
        setPotentialAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        // Check current session first
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Current session:", session);
        
        if (session?.user?.user_metadata?.wallet_address?.toLowerCase() === address.toLowerCase()) {
          console.log("User is already authenticated as admin");
          setIsAdmin(true);
          setPotentialAdmin(true);
          setIsLoading(false);
          return;
        }

        // If no valid session, check if wallet is in admin list
        const { data, error: queryError } = await supabase
          .from('admin_wallets')
          .select('wallet_address')
          .ilike('wallet_address', address)
          .single();
        
        if (queryError) {
          console.log("Not an admin wallet:", queryError);
          setIsAdmin(false);
          setPotentialAdmin(false);
        } else if (data) {
          console.log("Potential admin wallet found, needs verification:", data);
          setPotentialAdmin(true);
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError('Failed to check admin status');
        setIsAdmin(false);
        setPotentialAdmin(false);
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

    setError(null);

    try {
      // Create message to sign
      const message = `I am verifying that I control the wallet address ${address} to access admin settings. Timestamp: ${Date.now()}`;
      
      // Request signature
      const signature = await signMessageAsync({ 
        message,
        account: address
      });
      
      console.log("Signature obtained:", signature);
      
      // Verify the signature using our edge function
      const response = await supabase.functions.invoke('verify-admin', {
        body: {
          signature,
          message,
          walletAddress: address
        }
      });

      console.log("Edge function response:", response);

      if (response.error) {
        const errorMessage = response.error.message || 'Verification failed';
        console.error("Verification error:", errorMessage);
        setError(errorMessage);
        setIsAdmin(false);
        toast({
          title: "Verification Failed",
          description: errorMessage,
          variant: "destructive"
        });
        return false;
      }

      if (response.data?.success && response.data?.session) {
        // Set the new session
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: response.data.session.access_token,
          refresh_token: response.data.session.refresh_token
        });

        if (sessionError) {
          console.error("Session setting error:", sessionError);
          setError('Failed to set authentication session');
          toast({
            title: "Authentication Error",
            description: "Failed to set authentication session",
            variant: "destructive"
          });
          return false;
        }

        setIsAdmin(true);
        toast({
          title: "Verification Successful",
          description: "You have been verified as an admin.",
        });
        return true;
      }

      setError('Verification failed');
      setIsAdmin(false);
      toast({
        title: "Verification Failed",
        description: "Could not verify admin status",
        variant: "destructive"
      });
      return false;
    } catch (err) {
      console.error('Error verifying admin:', err);
      setError('Failed to verify admin status');
      setIsAdmin(false);
      toast({
        title: "Error",
        description: "Failed to verify admin status",
        variant: "destructive"
      });
      return false;
    }
  };

  return { isAdmin, potentialAdmin, isLoading, error, verifyAdmin };
}
