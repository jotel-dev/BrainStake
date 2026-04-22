"use client";

import { useAccount, useConnect, Connector } from "wagmi";
import { useEffect, useState, useCallback } from "react";

export function useMiniPay() {
  const { connectors, connect } = useConnect();
  const { isConnected } = useAccount();
  const [isMiniPayAvailable, setIsMiniPayAvailable] = useState(false);
  const [isInMiniPayBrowser, setIsInMiniPayBrowser] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [miniPayConnector, setMiniPayConnector] = useState<Connector | null>(null);

  const detectMiniPayBrowser = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    
    const ua = navigator.userAgent.toLowerCase();
    const isMiniPayUA = ua.includes("minipay") || 
                        ua.includes("coincash") ||
                        ua.includes("coinbase");
    
    const hasMiniPayFlag = "ethereum" in window && 
                           (window as unknown as { ethereum?: { isMiniPay?: boolean } }).ethereum?.isMiniPay === true;
    
    return isMiniPayUA || hasMiniPayFlag;
  }, []);

  useEffect(() => {
    setIsInMiniPayBrowser(detectMiniPayBrowser());
  }, [detectMiniPayBrowser]);

  useEffect(() => {
    const miniPayConnectorInstance = connectors.find((c) => {
      const id = c.id.toLowerCase();
      const name = c.name.toLowerCase();
      return id.includes("coinbase") || 
             name.includes("coinbase") ||
             id.includes("coincash") ||
             name.includes("coincash");
    }) || null;

    setIsMiniPayAvailable(!!miniPayConnectorInstance);
    setMiniPayConnector(miniPayConnectorInstance);
  }, [connectors]);

  const connectToMiniPay = useCallback(async () => {
    if (!miniPayConnector) {
      console.error("MiniPay connector not found");
      return;
    }

    if (isConnected) return;

    setIsConnecting(true);
    try {
      await connect({ connector: miniPayConnector });
    } catch (error) {
      console.error("Failed to connect to MiniPay:", error);
    } finally {
      setIsConnecting(false);
    }
  }, [miniPayConnector, connect, isConnected]);

  const autoConnectIfMiniPay = useCallback(async () => {
    if (isInMiniPayBrowser && !isConnected && miniPayConnector) {
      await connectToMiniPay();
    }
  }, [isInMiniPayBrowser, isConnected, miniPayConnector, connectToMiniPay]);

  return {
    isMiniPayAvailable: isMiniPayAvailable || isInMiniPayBrowser,
    isInMiniPayBrowser,
    connectToMiniPay,
    autoConnectIfMiniPay,
    isConnecting,
    miniPayConnector,
  };
}