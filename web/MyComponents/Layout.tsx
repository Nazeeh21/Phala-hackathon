import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/router";
import { ReactElement } from "react";

export const Layout: React.FC<{ children: ReactElement }> = ({ children }) => {
  const router = useRouter();
  return (
    <div className="w-full">
      <div className="flex p-6 items-center justify-between">
        <div className="text-3xl font-semibold">Travellery</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/")}
            className="p-2 bg-slate-200 border-2 border-blue-700 rounded-md"
          >
            Add flights
          </button>
          <button
            onClick={() => router.push("/my-nfts")}
            className="p-2 border-slate-500 border-2 bg-blue-200 rounded-md"
          >
            My NFTS
          </button>
          <ConnectButton />
        </div>
      </div>
      {children}
    </div>
  );
};
