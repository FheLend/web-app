
import { Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useThemeStyles } from '@/lib/themeUtils';

interface AdminVerificationProps {
  error: string | null;
  verifyingAdmin: boolean;
  handleVerifyAdmin: () => Promise<void>;
  isConnected: boolean;
}

export const AdminVerification = ({
  error,
  verifyingAdmin,
  handleVerifyAdmin,
  isConnected
}: AdminVerificationProps) => {
  const { cardStyles } = useThemeStyles();

  return (
    <div className="container mx-auto py-12 px-4">
      <div className={`${cardStyles} max-w-md mx-auto p-6 rounded-lg`}>
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <Shield className="h-16 w-16 text-cryptic-accent" />
          <h1 className="text-2xl font-bold">Admin Access Required</h1>
          <p className="text-muted-foreground">
            This page requires admin privileges. Please verify that you own the admin wallet.
          </p>
          <Button 
            onClick={handleVerifyAdmin} 
            disabled={verifyingAdmin || !isConnected}
            className="w-full"
          >
            {verifyingAdmin ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              "Verify Admin Status"
            )}
          </Button>
          {error && (
            <p className="text-destructive text-sm">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};
