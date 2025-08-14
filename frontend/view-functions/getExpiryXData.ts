import { aptos, octasToApt } from "../utils/expiryXHelpers";
import { MODULE_ADDRESS, MODULE_NAME, Permission } from "../utils/expiry_x_abi";

/**
 * Get a specific permission by ID
 */
export const getPermission = async (permissionId: number): Promise<Permission | null> => {
  try {
    const response = await aptos.view({
      payload: {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_permission`,
        functionArguments: [permissionId.toString()],
      },
    });

    if (response && response.length === 6) {
      return {
        owner: response[0] as string,
        spender: response[1] as string,
        amount: octasToApt(parseInt(response[2] as string)),
        spent: octasToApt(parseInt(response[3] as string)),
        expiryTimestamp: parseInt(response[4] as string),
        isActive: response[5] as boolean,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching permission:", error);
    return null;
  }
};

/**
 * Get all permission IDs for a specific owner
 */
export const getPermissionsByOwner = async (owner: string): Promise<number[]> => {
  try {
    const response = await aptos.view({
      payload: {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_permissions_by_owner`,
        functionArguments: [owner],
      },
    });

    if (response && response.length > 0) {
      return (response[0] as string[]).map(id => parseInt(id));
    }
    return [];
  } catch (error) {
    console.error("Error fetching permissions by owner:", error);
    return [];
  }
};

/**
 * Get all permission IDs for a specific spender
 */
export const getPermissionsBySpender = async (spender: string): Promise<number[]> => {
  try {
    const response = await aptos.view({
      payload: {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_permissions_by_spender`,
        functionArguments: [spender],
      },
    });

    if (response && response.length > 0) {
      return (response[0] as string[]).map(id => parseInt(id));
    }
    return [];
  } catch (error) {
    console.error("Error fetching permissions by spender:", error);
    return [];
  }
};

/**
 * Check if a permission is still valid
 */
export const isPermissionValid = async (permissionId: number): Promise<boolean> => {
  try {
    const response = await aptos.view({
      payload: {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::is_permission_valid`,
        functionArguments: [permissionId.toString()],
      },
    });

    return response[0] as boolean;
  } catch (error) {
    console.error("Error checking permission validity:", error);
    return false;
  }
};

/**
 * Get remaining allowance for a permission
 */
export const getRemainingAllowance = async (permissionId: number): Promise<number> => {
  try {
    const response = await aptos.view({
      payload: {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_remaining_allowance`,
        functionArguments: [permissionId.toString()],
      },
    });

    return octasToApt(parseInt(response[0] as string));
  } catch (error) {
    console.error("Error fetching remaining allowance:", error);
    return 0;
  }
};

/**
 * Get total number of permissions in the system
 */
export const getTotalPermissions = async (): Promise<number> => {
  try {
    const response = await aptos.view({
      payload: {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_total_permissions`,
        functionArguments: [],
      },
    });

    return parseInt(response[0] as string);
  } catch (error) {
    console.error("Error fetching total permissions:", error);
    return 0;
  }
};

/**
 * Get all permissions for a user (both granted and received)
 */
export const getUserPermissions = async (userAddress: string): Promise<{
  granted: (Permission & { id: number })[];
  received: (Permission & { id: number })[];
}> => {
  try {
    const [grantedIds, receivedIds] = await Promise.all([
      getPermissionsByOwner(userAddress),
      getPermissionsBySpender(userAddress),
    ]);

    const [grantedPermissions, receivedPermissions] = await Promise.all([
      Promise.all(
        grantedIds.map(async (id) => {
          const permission = await getPermission(id);
          return permission ? { ...permission, id } : null;
        })
      ),
      Promise.all(
        receivedIds.map(async (id) => {
          const permission = await getPermission(id);
          return permission ? { ...permission, id } : null;
        })
      ),
    ]);

    return {
      granted: grantedPermissions.filter(Boolean) as (Permission & { id: number })[],
      received: receivedPermissions.filter(Boolean) as (Permission & { id: number })[],
    };
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    return { granted: [], received: [] };
  }
};

/**
 * Get account balance
 */
export const getAccountBalance = async (accountAddress: string): Promise<number> => {
  try {
    const resource = await aptos.getAccountResource({
      accountAddress,
      resourceType: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
    });

    const balance = (resource.data as any).coin.value;
    return octasToApt(parseInt(balance));
  } catch (error) {
    console.error("Error fetching account balance:", error);
    return 0;
  }
};
