import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ReactElement } from "react";

export const Layout: React.FC<{ children: ReactElement }> = ({ children }) => {
  return (
    <div className="w-full h-full">
      <div className="flex p-5 justify-between w-full">
        <div className="text-3xl font-semibold">Travellery</div>
        <ConnectButton />
      </div>
      {children}
    </div>
  );
};
