
export interface ContractConfig {
  id: string;
  name: string;
  contract_address: string;
  network: string;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContractFormData {
  name: string;
  contract_address: string;
  network: string;
  description: string;
  active: boolean;
}

export const initialFormData: ContractFormData = {
  name: '',
  contract_address: '',
  network: '',
  description: '',
  active: true,
};
