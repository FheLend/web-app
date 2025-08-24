import { Permit } from "cofhejs/web";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { ShieldCheckIcon } from "@heroicons/react/24/solid";
import {
  useCofhejsActivePermit,
  useCofhejsAllPermits,
  useCofhejsModalStore,
  useCofhejsRemovePermit,
  useCofhejsSetActivePermit,
  useCofhejsStatus,
} from "@/hooks/useCofhejs";
import { arbitrumSepolia, sepolia } from "wagmi/chains";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useThemeStyles } from "@/lib/themeUtils";
import { cn } from "@/lib/utils";
import { hardhatHaLink } from "@/configs/wagmi";
import { isProd } from "@/constant";
import { InfoIcon, TriangleAlertIcon } from "lucide-react";

const targetNetworks = isProd
  ? [arbitrumSepolia, sepolia]
  : [arbitrumSepolia, sepolia, hardhatHaLink];

export const CofhejsPortal = () => {
  const { chainId, account, initialized } = useCofhejsStatus();
  const activePermit = useCofhejsActivePermit();
  const { walletButtonStyles, dropdownMenuContent, dropdownMenuItem } =
    useThemeStyles();

  const setGeneratePermitModalOpen = useCofhejsModalStore(
    (state) => state.setGeneratePermitModalOpen
  );
  const removePermit = useCofhejsRemovePermit();

  const networkName = chainId
    ? targetNetworks.find((network) => network.id === Number(chainId))?.name
    : undefined;

  const handleCreatePermit = () => {
    setGeneratePermitModalOpen(true);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={walletButtonStyles}>
          <ShieldCheckIcon className="h-4 w-4" />
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={cn(dropdownMenuContent, "p-4 w-80")}>
        <div className="flex flex-row justify-center items-center gap-2 px-2 py-1">
          <ShieldCheckIcon className="h-5 w-5 text-cofhe-primary" />
          <span className="font-bold">Cofhejs Portal</span>
        </div>
        <div className="flex flex-col gap-1 mt-2">
          <div className="font-semibold">Initialization Status</div>
          <InfoRow
            className="h-8"
            label="Initialized"
            value={initialized ? "Yes" : "No"}
            valueClassName={initialized ? "text-primary" : "text-destructive"}
          />
          <InfoRow
            className="h-8"
            label="Account"
            value={
              account
                ? account.slice(0, 6) + "..." + account.slice(-4)
                : "Not connected"
            }
          />
          <InfoRow
            className="h-8"
            label="Network"
            value={networkName ? networkName : "Not connected"}
          />
        </div>
        <div className="flex flex-col gap-1 mt-2">
          <div className="font-semibold">Permits</div>
          {activePermit && (
            <PermitItem
              key="active"
              permit={activePermit}
              isActive={true}
              onRemove={removePermit}
            />
          )}
          <AllPermitsList />

          <Button
            size="sm"
            onClick={handleCreatePermit}
            className={`btn btn-sm btn-cofhe mt-2 w-full ${
              !initialized && "btn-disabled"
            }`}
          >
            Create Permit
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const AllPermitsList = () => {
  const activePermit = useCofhejsActivePermit();
  const allPermits = useCofhejsAllPermits();
  const removePermit = useCofhejsRemovePermit();

  if (allPermits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 bg-muted py-6 rounded-sm">
        <span className="text-base-content/50 text-sm">None</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 mt-1">
      {allPermits.map(({ data: permit, success }, index) => {
        if (!success || !permit || permit.getHash() === activePermit?.getHash())
          return null;
        return (
          <PermitItem
            key={index}
            permit={permit}
            isActive={false}
            onRemove={removePermit}
          />
        );
      })}
    </div>
  );
};

const InfoRow = ({
  label,
  value,
  className,
  valueClassName,
}: {
  label: string;
  value: string;
  className?: string;
  valueClassName?: string;
}) => {
  return (
    <div
      className={`flex flex-row justify-between items-center text-sm gap-6 ${className}`}
    >
      <span className="text-left text-nowrap">{label}</span>
      <span className={`font-bold text-nowrap text-right ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
};

const PermitItem = ({
  permit,
  isActive,
  onRemove,
}: {
  permit: Permit;
  isActive: boolean;
  onRemove: (hash: string) => void;
}) => {
  const setActivePermit = useCofhejsSetActivePermit();
  const hash = permit.getHash();

  return (
    <div className="flex flex-col bg-muted p-4 rounded-sm">
      {isActive && (
        <div className="text-xs font-semibold text-primary">Active Permit</div>
      )}
      {isActive && <br />}
      <InfoRow className="text-xs" label="Name" value={permit.name} />
      <InfoRow
        className="text-xs"
        label="Id"
        value={`${hash.slice(0, 6)}...${hash.slice(-4)}`}
      />
      <br />
      <InfoRow
        className="text-xs"
        label="Issuer"
        value={permit.issuer.slice(0, 6) + "..." + permit.issuer.slice(-4)}
      />
      <InfoRow
        className="text-xs"
        label="Expires"
        value={new Date(Number(permit.expiration) * 1000).toLocaleDateString()}
      />
      {permit.expiration * 1000 < Date.now() && (
        <div className="flex items-center justify-end text-xs text-destructive font-medium">
          Expired
          <TriangleAlertIcon size={16} className="ml-1" />
        </div>
      )}
      {!isActive && (
        <div className="flex justify-end gap-2 mt-2">
          <Button size="xs" onClick={() => setActivePermit(permit.getHash())}>
            Use
          </Button>
          <Button
            variant="destructive"
            size="xs"
            onClick={() => onRemove(permit.getHash())}
            title="Remove permit"
          >
            Delete
          </Button>
        </div>
      )}
    </div>
  );
};
