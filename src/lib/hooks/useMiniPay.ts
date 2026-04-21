"use client";

import { useConnect } from "wagmi";
import { useEffect, useState, useCallback } from "react";

const MINIPAY_IDS = [
  "io.coinbase.wallet",
  "com.coincash.wallet",
  "com.rabbyio.changeWallet",
];

export function useMiniPay() {
  const { connectors, connect } = useConnect();
  const [isMiniPayAvailable, setIsMiniPayAvailable] = useState(false);
  const [isInMiniPayBrowser, setIsInMiniPayBrowser] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [miniPayConnector, setMiniPayConnector] = useState<ReturnType<typeof connectors[number]>>();

  const detectMiniPayBrowser = useCallback(() => {
    if (typeof window === "undefined") return false;
    
    const ua = navigator.userAgent.toLowerCase();
    const isMiniPayUA = ua.includes("minipay") || 
                        ua.includes("coincash") ||
                        ua.includes("coinbase") ||
                        (ua.includes("mobile") && ua.includes("celo"));
    
    const hasMiniPayWindow = typeof window !== "undefined" && 
                             "ethereum" in window && 
                             (window as unknown as { ethereum?: { isMiniPay?: boolean } }).ethereum?.isMiniPay === true;
    
    return isMiniPayUA || hasMiniPayWindow;
  }, []);

  useEffect(() => {
    setIsInMiniPayBrowser(detectMiniPayBrowser());
  }, [detectMiniPayBrowser]);

  useEffect(() => {
    const connector = connectors.find((c) => {
      const id = c.id.toLowerCase();
      const name = c.name.toLowerCase();
      return MINIPAY_IDS.some(
        (mid) => id.includes(mid.replace(".", "")) || name.includes(mid.replace(".", ""))
      );
    });

    setIsMiniPayAvailable(!!connector);
    setMiniPayConnector(connector);
  }, [connectors]);

  const connectToMiniPay = async () => {
    if (!miniPayConnector) {
      console.error("MiniPay connector not found");
      return;
    }

    setIsConnecting(true);
    try {
      await connect({ connector: miniPayConnector });
    } catch (error) {
      console.error("Failed to connect to MiniPay:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  return {
    isMiniPayAvailable: isMiniPayAvailable || isInMiniPayBrowser,
    isInMiniPayBrowser,
    connectToMiniPay,
    isConnecting,
    miniPayConnector,
  };
}