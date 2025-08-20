import { useState } from "react";
import { Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  ContractConfig,
  ContractFormData,
  initialFormData,
} from "@/types/contract";

interface ContractConfigFormProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  formData: ContractFormData;
  setFormData: (data: ContractFormData) => void;
  onSuccess: () => void;
}

export const ContractConfigForm = ({
  showForm,
  setShowForm,
  editingId,
  formData,
  setFormData,
  setEditingId,
  onSuccess,
}: ContractConfigFormProps) => {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
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
          .from("contract_configs")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Contract configuration updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from("contract_configs")
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Contract configuration created successfully.",
        });
      }

      resetForm();
      onSuccess();
    } catch (err) {
      console.error("Error saving config:", err);
      toast({
        title: "Error",
        description: "Failed to save contract configuration.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData(initialFormData);
      setEditingId(null);
    }
    setShowForm(open);
  };

  return (
    <Dialog open={showForm} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingId ? "Edit Configuration" : "Add New Configuration"}
          </DialogTitle>
          <DialogDescription>
            {editingId
              ? "Update the contract configuration details below."
              : "Enter the details for the new contract configuration."}
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
                  {editingId ? "Update" : "Save"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
