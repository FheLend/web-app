
import { Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useThemeStyles } from '@/lib/themeUtils';
import { ContractConfig } from '@/types/contract';

interface ContractConfigTableProps {
  configs: ContractConfig[];
  onEdit: (config: ContractConfig) => void;
  onDelete: () => void;
}

export const ContractConfigTable = ({ configs, onEdit, onDelete }: ContractConfigTableProps) => {
  const { toast } = useToast();
  const { cardStyles, tableHeader, tableBody, tableRow } = useThemeStyles();

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
      
      onDelete();
    } catch (err) {
      console.error('Error deleting config:', err);
      toast({
        title: "Error",
        description: "Failed to delete contract configuration.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`${cardStyles} overflow-hidden rounded-lg`}>
      <Table>
        <TableHeader className={tableHeader}>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contract Address</TableHead>
            <TableHead>Network</TableHead>
            <TableHead>Description</TableHead>
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
              <TableCell>{config.description || '-'}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(config)}
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
  );
};
