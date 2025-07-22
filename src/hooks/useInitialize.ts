import { useEffect } from "react";
import { useInitializeCofhejs } from "./useCofhejs";
import { useContractConfig } from "./useContractConfig";

export const useInitialize = () => {
  useInitializeCofhejs();
  
  // Initialize contract configs
  useContractConfig();
};
