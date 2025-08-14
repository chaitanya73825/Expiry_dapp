/**
 * This file contains the generated ABI definitions for the ExpiryX smart contract.
 * Generated from the Move smart contract at address: message_board_addr::expiry_x
 */

export const MODULE_ADDRESS = "message_board_addr";
export const MODULE_NAME = "expiry_x";

export const EXPIRY_X_ABI = {
  address: MODULE_ADDRESS,
  name: MODULE_NAME,
  friends: [],
  exposed_functions: [
    {
      name: "grant_permission",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: [
        "signer",  // owner
        "address", // spender
        "u64",     // amount
        "u64"      // expiry_timestamp
      ],
      return: []
    },
    {
      name: "revoke_permission",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: [
        "signer", // owner
        "u64"     // permission_id
      ],
      return: []
    },
    {
      name: "spend_tokens",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: [
        "signer",  // spender
        "u64",     // permission_id
        "u64",     // amount
        "address"  // recipient
      ],
      return: []
    },
    {
      name: "get_permission",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: ["u64"], // permission_id
      return: ["address", "address", "u64", "u64", "u64", "bool"]
    },
    {
      name: "get_permissions_by_owner",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: ["address"], // owner
      return: ["vector<u64>"]
    },
    {
      name: "get_permissions_by_spender",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: ["address"], // spender
      return: ["vector<u64>"]
    },
    {
      name: "is_permission_valid",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: ["u64"], // permission_id
      return: ["bool"]
    },
    {
      name: "get_remaining_allowance",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: ["u64"], // permission_id
      return: ["u64"]
    },
    {
      name: "get_total_permissions",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: [],
      return: ["u64"]
    }
  ],
  structs: [
    {
      name: "Permission",
      is_native: false,
      abilities: ["store", "drop", "copy"],
      generic_type_params: [],
      fields: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "amount", type: "u64" },
        { name: "spent", type: "u64" },
        { name: "expiry_timestamp", type: "u64" },
        { name: "is_active", type: "bool" }
      ]
    },
    {
      name: "PermissionsStore",
      is_native: false,
      abilities: ["key"],
      generic_type_params: [],
      fields: [
        { name: "permissions", type: "vector<Permission>" },
        { name: "next_id", type: "u64" }
      ]
    }
  ]
};

// Type definitions for TypeScript
export interface Permission {
  owner: string;
  spender: string;
  amount: number;
  spent: number;
  expiryTimestamp: number;
  isActive: boolean;
}

export interface PermissionGrantedEvent {
  owner: string;
  spender: string;
  amount: number;
  expiryTimestamp: number;
  permissionId: number;
}

export interface PermissionRevokedEvent {
  owner: string;
  spender: string;
  permissionId: number;
  remainingAmount: number;
}

export interface PermissionExpiredEvent {
  owner: string;
  spender: string;
  permissionId: number;
  remainingAmount: number;
}

export interface TokensSpentEvent {
  owner: string;
  spender: string;
  permissionId: number;
  amountSpent: number;
  remainingAmount: number;
}
