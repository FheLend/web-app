import { useCallback, useMemo } from "react";
import { useEffect, useState, useRef } from "react";
import { PermitOptions, cofhejs, permitStore } from "cofhejs/web";
import { PublicClient, WalletClient, createWalletClient, http } from "viem";
import { PrivateKeyAccount, privateKeyToAccount } from "viem/accounts";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { create, useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import * as chains from "wagmi/chains";
import { useToast } from "./use-toast";
import { hardhatHaLink } from "@/configs/wagmi";
import { isProd } from "@/constant";

const targetNetworks = isProd
  ? [chains.arbitrumSepolia, chains.sepolia]
  : [chains.arbitrumSepolia, chains.sepolia, hardhatHaLink];

const ChainEnvironments = {
  // Ethereum
  [chains.mainnet.id]: "MAINNET",
  // Arbitrum
  [chains.arbitrum.id]: "MAINNET",
  // Ethereum Sepolia
  [chains.sepolia.id]: "TESTNET",
  // Arbitrum Sepolia
  [chains.arbitrumSepolia.id]: "TESTNET",
  // Hardhat
  [chains.hardhat.id]: "MOCK",
} as const;

// ZKV SIGNER
const zkvSignerPrivateKey =
  "0x6C8D7F768A6BB4AAFE85E8A2F5A9680355239C7E14646ED62B044E39DE154512";
function createWalletClientFromPrivateKey(
  publicClient: PublicClient,
  privateKey: `0x${string}`
): WalletClient {
  const account: PrivateKeyAccount = privateKeyToAccount(privateKey);
  return createWalletClient({
    account,
    chain: publicClient.chain,
    transport: http(publicClient.transport.url),
  });
}

export const useIsConnectedChainSupported = () => {
  const { chainId } = useAccount();
  return useMemo(
    () =>
      targetNetworks.some((network: chains.Chain) => network.id === chainId),
    [chainId]
  );
};

export function useInitializeCofhejs() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const isChainSupported = useIsConnectedChainSupported();
  const { toast } = useToast();
  const { setStatus } = useCofhejsStatusStore();

  // Set the initial status
  useEffect(() => {
    // If any dependency is missing, set idle state
    console.log(publicClient, walletClient, isChainSupported);
    if (!publicClient || !walletClient || !isChainSupported) {
      setStatus("idle");
      return;
    }

    // Otherwise, set pending status (will be updated after initialization)
    setStatus("pending");
  }, [publicClient, walletClient, isChainSupported]);

  const handleError = (error: string) => {
    console.error("cofhejs initialization error:", error);
    setStatus("error");
    toast({
      title: "Error",
      description: `cofhejs initialization error: ${error}`,
      variant: "destructive",
    });
  };

  useEffect(() => {
    const initializeCofhejs = async () => {
      // Early exit if any of the required dependencies are missing
      if (!publicClient || !walletClient || !isChainSupported) return;

      // Status is already set to pending in the effect above

      const chainId = publicClient?.chain.id;
      const environment =
        ChainEnvironments[chainId as keyof typeof ChainEnvironments] ??
        "TESTNET";

      const viemZkvSigner = createWalletClientFromPrivateKey(
        publicClient,
        zkvSignerPrivateKey
      );

      // Show pending toast when initialization starts
      const pendingToast = toast({
        title: "Initializing",
        description: "Cofhejs is initializing...",
        variant: "info",
        duration: 100000, // Long duration as we'll dismiss it manually
      });

      try {
        const initializationResult = await cofhejs.initializeWithViem({
          viemClient: publicClient,
          viemWalletClient: walletClient,
          environment,
          // Whether to generate a permit for the connected account during the initialization process
          // Recommended to set to false, and then call `cofhejs.generatePermit()` when the user is ready to generate a permit
          // !! if **true** - will generate a permit immediately on page load !!
          generatePermit: false,
          // Hard coded signer for submitting encrypted inputs
          // This is only used in the mock environment to submit the mock encrypted inputs so that they can be used in FHE ops.
          // This has no effect in the mainnet or testnet environments.
          mockConfig: {
            decryptDelay: 1000,
            zkvSigner: viemZkvSigner,
          },
        });

        // Dismiss the pending toast
        pendingToast.dismiss();

        if (initializationResult.success) {
          setStatus("success");
          toast({
            title: "Success",
            description: "Cofhejs initialized successfully",
            variant: "success",
          });
        } else {
          handleError(
            initializationResult.error.message ??
              String(initializationResult.error)
          );
        }
      } catch (err) {
        // Dismiss the pending toast
        pendingToast.dismiss();

        console.error("Failed to initialize cofhejs:", err);
        handleError(
          err instanceof Error
            ? err.message
            : "Unknown error initializing cofhejs"
        );
      }
    };

    initializeCofhejs();
  }, [walletClient, publicClient, isChainSupported]);
}

type CofhejsStoreState = ReturnType<typeof cofhejs.store.getState>;

const useCofhejsStore = <T>(selector: (state: CofhejsStoreState) => T) =>
  useStore(cofhejs.store, selector);

export const useCofhejsAccount = () => {
  return useCofhejsStore((state) => state.account);
};

export const useCofhejsChainId = () => {
  return useCofhejsStore((state) => state.chainId);
};

export const useCofhejsInitialized = () => {
  return useCofhejsStore(
    (state) =>
      state.fheKeysInitialized &&
      state.providerInitialized &&
      state.signerInitialized
  );
};

export const useCofhejsStatus = () => {
  const chainId = useCofhejsChainId();
  const account = useCofhejsAccount();
  const initialized = useCofhejsInitialized();

  return useMemo(
    () => ({ chainId, account, initialized }),
    [chainId, account, initialized]
  );
};

// Permit Modal

interface CofhejsPermitModalStore {
  generatePermitModalOpen: boolean;
  generatePermitModalCallback?: () => void;
  setGeneratePermitModalOpen: (open: boolean, callback?: () => void) => void;
}

export const useCofhejsModalStore = create<CofhejsPermitModalStore>((set) => ({
  generatePermitModalOpen: false,
  setGeneratePermitModalOpen: (open, callback) =>
    set({
      generatePermitModalOpen: open,
      generatePermitModalCallback: callback,
    }),
}));

// Initialization Status Store
interface CofhejsInitStatusStore {
  status: "idle" | "pending" | "success" | "error";
  setStatus: (status: "idle" | "pending" | "success" | "error") => void;
}

export const useCofhejsStatusStore = create<CofhejsInitStatusStore>((set) => ({
  status: "idle",
  setStatus: (status) => set({ status }),
}));

// Export a simpler hook for components
export const useCofhejsInitStatus = () => {
  const { status } = useCofhejsStatusStore();
  return {
    status,
    isPending: status === "pending",
    isSuccess: status === "success",
    isError: status === "error",
    isIdle: status === "idle",
  };
};

// Permits

type PermitStoreState = ReturnType<typeof permitStore.store.getState>;

export const useCofhejsPermitStore = <T>(
  selector: (state: PermitStoreState) => T
) => {
  return useStore(permitStore.store, selector);
};

export const useCofhejsActivePermitHash = () => {
  const { chainId, account, initialized } = useCofhejsStatus();
  return useCofhejsPermitStore((state) => {
    if (!initialized || !chainId || !account) return undefined;
    return state.activePermitHash?.[chainId]?.[account];
  });
};

export const useCofhejsActivePermit = () => {
  const activePermitHash = useCofhejsActivePermitHash();
  return useMemo(() => {
    const permitResult = cofhejs.getPermit(activePermitHash ?? undefined);
    if (!permitResult) return null;
    if (permitResult.success) {
      return permitResult.data;
    } else {
      return null;
    }
  }, [activePermitHash]);
};

export const useCofhejsIsActivePermitValid = () => {
  const permit = useCofhejsActivePermit();
  return useMemo(() => {
    if (!permit) return { valid: false, error: "no-permit" };
    return permit.isValid();
  }, [permit]);
};

export const useCofhejsAllPermitHashes = () => {
  const { chainId, account, initialized } = useCofhejsStatus();
  return useCofhejsPermitStore(
    useShallow((state) => {
      if (!initialized || !chainId || !account) return [];
      return (
        Object.entries(state.permits?.[chainId]?.[account] ?? {})
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .filter(([_, permit]) => permit !== undefined)
          .map(([hash]) => hash)
      );
    })
  );
};

export const useCofhejsAllPermits = () => {
  const permitHashes = useCofhejsAllPermitHashes();
  return useMemo(() => {
    return permitHashes.map((hash) => cofhejs.getPermit(hash));
  }, [permitHashes]);
};

export const useCofhejsCreatePermit = () => {
  const { chainId, account, initialized } = useCofhejsStatus();
  const { toast } = useToast();

  return useCallback(
    async (permit?: PermitOptions) => {
      if (!initialized || !chainId || !account) return;
      const permitResult = await cofhejs.createPermit(permit);
      if (permitResult.success) {
        toast({
          title: "Success",
          description: "Permit created successfully",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: permitResult.error.message ?? String(permitResult.error),
          variant: "destructive",
        });
      }
      return permitResult;
    },
    [chainId, account, initialized]
  );
};

export const useCofhejsRemovePermit = () => {
  const { chainId, account, initialized } = useCofhejsStatus();
  const { toast } = useToast();

  return useCallback(
    async (permitHash: string) => {
      if (!initialized || !chainId || !account) return;
      permitStore.removePermit(chainId, account, permitHash);
      toast({
        title: "Success",
        description: "Permit removed successfully",
        variant: "success",
      });
    },
    [chainId, account, initialized]
  );
};

export const useCofhejsSetActivePermit = () => {
  const { chainId, account, initialized } = useCofhejsStatus();
  const { toast } = useToast();

  return useCallback(
    async (permitHash: string) => {
      if (!initialized || !chainId || !account) return;
      permitStore.setActivePermitHash(chainId, account, permitHash);
      toast({
        title: "Success",
        description: "Active permit updated successfully",
        variant: "success",
      });
    },
    [chainId, account, initialized]
  );
};

export const useCofhejsPermitIssuer = () => {
  const permit = useCofhejsActivePermit();
  return useMemo(() => {
    if (!permit) return null;
    return permit.issuer;
  }, [permit]);
};
