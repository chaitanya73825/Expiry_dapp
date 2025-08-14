export const NETWORK = import.meta.env.VITE_APP_NETWORK ?? "devnet";
export const MODULE_ADDRESS = import.meta.env.VITE_MODULE_ADDRESS ?? "message_board_addr";
export const APTOS_API_KEY = import.meta.env.VITE_APTOS_API_KEY;

// ExpiryX Blockchain Configuration
export const BLOCKCHAIN_MODE: 'real' | 'mock' | 'json' = 'real';
export const REAL_CONTRACT_ADDRESS = MODULE_ADDRESS; // Will be updated after deployment

// Resource types for your contract
export const RESOURCE_TYPES = {
    PERMISSIONS_STORE: `${MODULE_ADDRESS}::expiry_x::PermissionsStore`,
    PERMISSIONS_CONTROLLER: `${MODULE_ADDRESS}::expiry_x::PermissionsObjectController`,
} as const;
