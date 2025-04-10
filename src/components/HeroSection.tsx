import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { useTheme } from "@/providers/ThemeProvider";
import { cn } from "@/lib/utils";
import Lottie from "lottie-react";
import animationData from "@/assets/felend_animation.json";

export function HeroSection() {
  const { isConnected } = useAccount();
  const { open } = useAppKit();
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        "relative overflow-hidden py-16 md:py-24",
        theme === "dark"
          ? "bg-cryptic-dark"
          : "bg-gradient-to-b from-accent/5 to-accent/10"
      )}
    >
      {/* Animated background elements */}
      <div
        className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-glow opacity-20 animate-float"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-glow opacity-10 animate-float"
        style={{ animationDelay: "-3s" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="text-center sm:text-left mb-10">
          <p className="text-cryptic-accent font-medium tracking-wide mb-3">
            Total Value Locked:{" "}
            <span
              className={cn(
                "text-cryptic-highlight",
                theme === "dark" ? "animate-glow" : ""
              )}
            >
              ₿ 72,538.45
            </span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="font-spaceGrotesk text-4xl md:text-5xl lg:text-6xl font-bold mb-6 relative">
              <span
                className={theme === "dark" ? "text-glow" : "text-foreground"}
              >
                Fully
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cryptic-accent to-cryptic-highlight">
                Encrypted Lending
              </span>
              <div className="absolute -left-6 -top-6 w-12 h-12 border border-cryptic-accent/30 rounded-full opacity-70"></div>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-lg">
              FeLend is the first DeFi lending protocol that leverages Fully
              Homomorphic Encryption (FHE) to enable private computation.
            </p>

            {!isConnected && (
              <Button
                className="bg-cryptic-accent hover:bg-cryptic-accent/90 text-white"
                onClick={() => open()}
              >
                <Lock className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            )}
          </div>

          <div className="hidden md:block relative">
            <div className="absolute inset-0 bg-purple-glow opacity-40 blur-2xl rounded-full"></div>

            {/* Lottie Animation - replacing the previous FHE Visualization */}
            <div className="relative z-10 flex justify-center items-center">
              <div className="w-[700px] absolute translate-y-[-30px]">
                <Lottie
                  animationData={animationData}
                  loop={true}
                  className="w-full h-full"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
