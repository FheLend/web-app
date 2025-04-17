
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Loader2, 
  PlusCircle, 
  Trash, 
  Edit, 
  Save,
  X 
} from 'lucide-react';
import { useAdminAuthContext } from '@/providers/AdminAuthProvider';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useThemeStyles } from '@/lib/themeUtils';

interface ContractConfig {
  id: string;
  name: string;
  contract_address: string;
  network: string;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface FormData {
  name: string;
  contract_address: string;
  network: string;
  description: string;
  active: boolean;
}

const initialFormData: FormData = {
  name: '',
  contract_address: '',
  network: '',
  description: '',
  active: true,
};

export default function Settings() {
  const { isAdmin, isLoading, error, verifyAdmin } = useAdminAuthContext();
  const { isConnected } = useAccount();
  const [verifyingAdmin, setVerifyingAdmin] = useState(false);
  const [configs, setConfigs] = useState<ContractConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { cardStyles, tableHeader, tableBody, tableRow } = useThemeStyles();

  useEffect(() => {
    if (isAdmin && !loading) {
      fetchConfigs();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin && !isLoading && !verifyingAdmin) {
      // Don't redirect, just show the verification page
      console.log("User is not an admin, showing verification UI");
    }
  }, [isAdmin, isLoading, verifyingAdmin, navigate]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('contract_configs')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Contract configuration updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('contract_configs')
          .insert([formData]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Contract configuration created successfully.",
        });
      }
      
      resetForm();
      fetchConfigs();
    } catch (err) {
      console.error('Error saving config:', err);
      toast({
        title: "Error",
        description: "Failed to save contract configuration.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this configuration?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('contract_configs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Contract configuration deleted successfully.",
      });
      
      fetchConfigs();
    } catch (err) {
      console.error('Error deleting config:', err);
      toast({
        title: "Error",
        description: "Failed to delete contract configuration.",
        variant: "destructive",
      });
    }
  };

  if (!isAdmin) {
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
                  Verifying...
                </>
              ) : "Verify Admin Status"}
            </Button>
            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}
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
        <div className={`${cardStyles} overflow-hidden rounded-lg`}>
          <Table>
            <TableHeader className={tableHeader}>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contract Address</TableHead>
                <TableHead>Network</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className={tableBody}>
              {configs.map((config) => (
                <TableRow key={config.id} className={tableRow}>
                  <TableCell className="font-medium">{config.name}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {config.contract_address.substring(0, 6)}...{config.contract_address.substring(config.contract_address.length - 4)}
                  </TableCell>
                  <TableCell>{config.network}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${config.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {config.active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(config)}
                      className="mr-1"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(config.id)}
                      className="text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Configuration' : 'Add New Configuration'}</DialogTitle>
            <DialogDescription>
              {editingId 
                ? 'Update the contract configuration details below.' 
                : 'Enter the details for the new contract configuration.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="contract_address">Contract Address</Label>
                <Input
                  id="contract_address"
                  name="contract_address"
                  value={formData.contract_address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="network">Network</Label>
                <Input
                  id="network"
                  name="network"
                  value={formData.network}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-cryptic-accent focus:ring-cryptic-accent"
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {editingId ? 'Update' : 'Save'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
