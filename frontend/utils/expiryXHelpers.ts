import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// Initialize Aptos client for devnet
const config = new AptosConfig({ network: Network.DEVNET });
export const aptos = new Aptos(config);

// Contract addresses - these will be set after deployment
export const EXPIRY_X_ADDRESS = process.env.REACT_APP_EXPIRY_X_ADDRESS || "0x1"; // Update after deployment

// Helper function to format address
export const formatAddress = (address: string): string => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Helper function to convert APT to octas (1 APT = 10^8 octas)
export const aptToOctas = (apt: number): number => {
  return Math.floor(apt * 100_000_000);
};

// Helper function to convert octas to APT
export const octasToApt = (octas: number): number => {
  return octas / 100_000_000;
};

// Helper function to format timestamp
export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};

// Helper function to get time remaining
export const getTimeRemaining = (expiryTimestamp: number): {
  isExpired: boolean;
  timeLeft: string;
} => {
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = expiryTimestamp - now;

  if (timeLeft <= 0) {
    return { isExpired: true, timeLeft: "Expired" };
  }

  const days = Math.floor(timeLeft / 86400);
  const hours = Math.floor((timeLeft % 86400) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);

  if (days > 0) {
    return { isExpired: false, timeLeft: `${days}d ${hours}h` };
  } else if (hours > 0) {
    return { isExpired: false, timeLeft: `${hours}h ${minutes}m` };
  } else {
    return { isExpired: false, timeLeft: `${minutes}m` };
  }
};

// Error types
export enum ExpiryXError {
  PERMISSION_NOT_EXISTS = "Permission does not exist",
  PERMISSION_EXPIRED = "Permission has expired",
  INSUFFICIENT_PERMISSION = "Insufficient permission allowance",
  NOT_AUTHORIZED = "Not authorized to perform this action",
  ALREADY_EXISTS = "Permission already exists",
  INVALID_EXPIRY = "Invalid expiry timestamp",
  NETWORK_ERROR = "Network connection error",
  TRANSACTION_FAILED = "Transaction failed",
  UNKNOWN_ERROR = "Unknown error occurred"
}

// Helper to handle contract errors
export const handleContractError = (error: any): string => {
  if (typeof error === 'string') {
    if (error.includes('E_PERMISSION_NOT_EXISTS')) return ExpiryXError.PERMISSION_NOT_EXISTS;
    if (error.includes('E_PERMISSION_EXPIRED')) return ExpiryXError.PERMISSION_EXPIRED;
    if (error.includes('E_INSUFFICIENT_PERMISSION')) return ExpiryXError.INSUFFICIENT_PERMISSION;
    if (error.includes('E_NOT_AUTHORIZED')) return ExpiryXError.NOT_AUTHORIZED;
    if (error.includes('E_ALREADY_EXISTS')) return ExpiryXError.ALREADY_EXISTS;
    if (error.includes('E_INVALID_EXPIRY')) return ExpiryXError.INVALID_EXPIRY;
  }
  
  return ExpiryXError.UNKNOWN_ERROR;
};

// Transaction options
export const DEFAULT_TRANSACTION_OPTIONS = {
  max_gas_amount: 10000,
  gas_unit_price: 100,
  expiration_timestamp_secs: Math.floor(Date.now() / 1000) + 10, // 10 seconds from now
};

// Validation helpers
export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]+$/.test(address) && address.length >= 3;
};

export const isValidAmount = (amount: number): boolean => {
  return amount > 0 && Number.isFinite(amount);
};

export const isValidTimestamp = (timestamp: number): boolean => {
  const now = Math.floor(Date.now() / 1000);
  return timestamp > now && timestamp < now + (365 * 24 * 60 * 60); // Max 1 year
};

// Development mode helpers
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

export const mockDelay = async (ms: number = 1000): Promise<void> => {
  if (isDevelopment()) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
};
