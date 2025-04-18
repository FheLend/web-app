
import { useEffect, useState } from 'react';
import { PlusCircle, Loader2, Shield } from 'lucide-react';
import { useAdminAuthContext } from '@/providers/AdminAuthProvider';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useThemeStyles } from '@/lib/themeUtils';
import { AdminVerification } from '@/components/AdminVerification';
import NotFound from './NotFound';
import { ContractConfigForm } from '@/components/settings/ContractConfigForm';
import { ContractConfigTable } from '@/components/settings/ContractConfigTable';
import { ContractConfig, ContractFormData, initialFormData } from '@/types/contract';

export default function Settings() {
  const { isAdmin, potentialAdmin, isLoading, error, verifyAdmin } = useAdminAuthContext();
  const { isConnected } = useAccount();
  const [verifyingAdmin, setVerifyingAdmin] = useState(false);
  const [configs, setConfigs] = useState<ContractConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ContractFormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { cardStyles } = useThemeStyles();

  useEffect(() => {
    if (isAdmin) {
      fetchConfigs();
    }
  }, [isAdmin]);

  const handleVerifyAdmin = async () => {
    setVerifyingAdmin(true);
    console.log("Starting admin verification...");
    const success = await verifyAdmin();
    setVerifyingAdmin(false);
    
    if (success) {
      toast({
        title: "Verification Successful",
        description: "You have been verified as an admin.",
      });
      fetchConfigs();
    } else {
      toast({
        title: "Verification Failed",
        description: error || "Failed to verify admin status.",
        variant: "destructive",
      });
    }
  };

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contract_configs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setConfigs(data || []);
    } catch (err) {
      console.error('Error fetching configs:', err);
      toast({
        title: "Error",
        description: "Failed to load contract configurations.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (config: ContractConfig) => {
    setFormData({
      name: config.name,
      contract_address: config.contract_address,
      network: config.network,
      description: config.description || '',
      active: config.active,
    });
    setEditingId(config.id);
    setShowForm(true);
  };

  if (!isLoading && !potentialAdmin) {
    return <NotFound />;
  }

  if (!isAdmin && potentialAdmin) {
    return (
      <AdminVerification
        error={error}
        verifyingAdmin={verifyingAdmin}
        handleVerifyAdmin={handleVerifyAdmin}
        isConnected={isConnected}
      />
    );
  }

  if (!potentialAdmin) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className={`${cardStyles} max-w-md mx-auto p-6 rounded-lg`}>
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <Shield className="h-16 w-16 text-destructive" />
            <h1 className="text-2xl font-bold">Unauthorized Access</h1>
            <p className="text-muted-foreground">
              You don't have permission to access this page. Only admin wallets can view and manage contract configurations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Contract Configurations</h1>
        <Button onClick={() => setShowForm(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Configuration
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-cryptic-accent" />
        </div>
      ) : configs.length === 0 ? (
        <div className={`${cardStyles} p-8 text-center`}>
          <p className="text-muted-foreground">No contract configurations found.</p>
          <Button onClick={() => setShowForm(true)} className="mt-4">
            Add Your First Configuration
          </Button>
        </div>
      ) : (
        <ContractConfigTable 
          configs={configs} 
          onEdit={handleEdit}
          onDelete={fetchConfigs}
        />
      )}

      <ContractConfigForm
        showForm={showForm}
        setShowForm={setShowForm}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        onSuccess={fetchConfigs}
      />
    </div>
  );
}
