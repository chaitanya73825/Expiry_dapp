import { aptosClient } from "./aptosClient";
import { AccountAddress, U64, InputEntryFunctionData } from "@aptos-labs/ts-sdk";

// Contract address from your .env
const MODULE_ADDRESS = import.meta.env.VITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS;
const MODULE_NAME = "expiry_x";

export interface Permission {
  id: number;
  owner: string;
  spender: string;
  amount: string;
  spent: string;
  expiryTimestamp: string;
  isActive: boolean;
}

export class ExpiryXService {
  private aptos = aptosClient();

  // Grant a new permission
  async grantPermission(
    spenderAddress: string,
    amount: string,
    expiryTimestamp: string
  ): Promise<any> {
    const transaction: InputEntryFunctionData = {
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::grant_permission`,
      functionArguments: [
        AccountAddress.fromString(spenderAddress),
        new U64(parseInt(amount)),
        new U64(parseInt(expiryTimestamp))
      ],
    };

    return transaction;
  }

  // Revoke a permission
  async revokePermission(
    permissionId: string
  ): Promise<any> {
    const transaction: InputEntryFunctionData = {
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::revoke_permission`,
      functionArguments: [
        new U64(parseInt(permissionId))
      ],
    };

    return transaction;
  }

  // Spend tokens using permission
  async spendTokens(
    permissionId: string,
    amount: string,
    recipient: string
  ): Promise<any> {
    const transaction: InputEntryFunctionData = {
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::spend_tokens`,
      functionArguments: [
        new U64(parseInt(permissionId)),
        new U64(parseInt(amount)),
        AccountAddress.fromString(recipient)
      ],
    };

    return transaction;
  }

  // View functions
  async getPermission(permissionId: string): Promise<Permission | null> {
    try {
      const result = await this.aptos.view({
        payload: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_permission`,
          functionArguments: [new U64(parseInt(permissionId))]
        }
      });

      if (result && result.length >= 6) {
        return {
          id: parseInt(permissionId),
          owner: result[0] as string,
          spender: result[1] as string,
          amount: result[2] as string,
          spent: result[3] as string,
          expiryTimestamp: result[4] as string,
          isActive: result[5] as boolean
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching permission:", error);
      return null;
    }
  }

  async getPermissionsByOwner(ownerAddress: string): Promise<string[]> {
    try {
      const result = await this.aptos.view({
        payload: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_permissions_by_owner`,
          functionArguments: [AccountAddress.fromString(ownerAddress)]
        }
      });

      return (result[0] as string[]) || [];
    } catch (error) {
      console.error("Error fetching permissions by owner:", error);
      return [];
    }
  }

  async getPermissionsBySpender(spenderAddress: string): Promise<string[]> {
    try {
      const result = await this.aptos.view({
        payload: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_permissions_by_spender`,
          functionArguments: [AccountAddress.fromString(spenderAddress)]
        }
      });

      return (result[0] as string[]) || [];
    } catch (error) {
      console.error("Error fetching permissions by spender:", error);
      return [];
    }
  }

  async isPermissionValid(permissionId: string): Promise<boolean> {
    try {
      const result = await this.aptos.view({
        payload: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::is_permission_valid`,
          functionArguments: [new U64(parseInt(permissionId))]
        }
      });

      return result[0] as boolean;
    } catch (error) {
      console.error("Error checking permission validity:", error);
      return false;
    }
  }

  async getRemainingAllowance(permissionId: string): Promise<string> {
    try {
      const result = await this.aptos.view({
        payload: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_remaining_allowance`,
          functionArguments: [new U64(parseInt(permissionId))]
        }
      });

      return result[0] as string;
    } catch (error) {
      console.error("Error fetching remaining allowance:", error);
      return "0";
    }
  }

  async getTotalPermissions(): Promise<string> {
    try {
      const result = await this.aptos.view({
        payload: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_total_permissions`,
          functionArguments: []
        }
      });

      return result[0] as string;
    } catch (error) {
      console.error("Error fetching total permissions:", error);
      return "0";
    }
  }

  // Utility functions
  formatAmount(amount: string): string {
    const num = parseFloat(amount);
    return (num / 100000000).toFixed(2); // Convert from octas to APT
  }

  formatAddress(address: string): string {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  calculateTimeRemaining(expiryTimestamp: string): { days: number, status: 'active' | 'expiring' | 'expired' } {
    const now = Math.floor(Date.now() / 1000);
    const expiry = parseInt(expiryTimestamp);
    const secondsRemaining = expiry - now;
    
    if (secondsRemaining <= 0) {
      return { days: 0, status: 'expired' };
    }
    
    const daysRemaining = Math.ceil(secondsRemaining / (24 * 60 * 60));
    
    if (daysRemaining <= 7) {
      return { days: daysRemaining, status: 'expiring' };
    }
    
    return { days: daysRemaining, status: 'active' };
  }
}

export const expiryXService = new ExpiryXService();
