module message_board_addr::expiry_x {
    use std::vector;
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_framework::object::{Self, ExtendRef};

    // Error codes
    const E_PERMISSION_NOT_EXISTS: u64 = 1;
    const E_PERMISSION_EXPIRED: u64 = 2;
    const E_INSUFFICIENT_PERMISSION: u64 = 3;
    const E_NOT_AUTHORIZED: u64 = 4;
    const E_ALREADY_EXISTS: u64 = 5;
    const E_INVALID_EXPIRY: u64 = 6;

    // Permission structure
    struct Permission has store, drop, copy {
        owner: address,
        spender: address,
        amount: u64,
        spent: u64,
        expiry_timestamp: u64,
        is_active: bool,
    }

    // Global permissions store
    struct PermissionsStore has key {
        permissions: vector<Permission>,
        next_id: u64,
    }

    const PERMISSIONS_OBJECT_SEED: vector<u8> = b"expiry_x_permissions";

    struct PermissionsObjectController has key {
        extend_ref: ExtendRef,
    }

    // Events
    #[event]
    struct PermissionGranted has drop, store {
        owner: address,
        spender: address,
        amount: u64,
        expiry_timestamp: u64,
        permission_id: u64,
    }

    #[event]
    struct PermissionRevoked has drop, store {
        owner: address,
        spender: address,
        permission_id: u64,
        remaining_amount: u64,
    }

    #[event]
    struct PermissionExpired has drop, store {
        owner: address,
        spender: address,
        permission_id: u64,
        remaining_amount: u64,
    }

    #[event]
    struct TokensSpent has drop, store {
        owner: address,
        spender: address,
        permission_id: u64,
        amount_spent: u64,
        remaining_amount: u64,
    }

    // This function is only called once when the module is published for the first time.
    fun init_module(sender: &signer) {
        let constructor_ref = &object::create_named_object(sender, PERMISSIONS_OBJECT_SEED);
        let permissions_signer = &object::generate_signer(constructor_ref);
        
        move_to(permissions_signer, PermissionsObjectController {
            extend_ref: object::generate_extend_ref(constructor_ref),
        });
        
        move_to(permissions_signer, PermissionsStore {
            permissions: vector::empty(),
            next_id: 0,
        });
    }

    // ======================== Write functions ========================

    /// Grant spending permission to another address
    public entry fun grant_permission(
        owner: &signer,
        spender: address,
        amount: u64,
        expiry_timestamp: u64,
    ) acquires PermissionsStore {
        let owner_addr = signer::address_of(owner);
        let current_time = timestamp::now_seconds();
        
        // Validate expiry is in the future
        assert!(expiry_timestamp > current_time, E_INVALID_EXPIRY);
        
        let permissions_store = borrow_global_mut<PermissionsStore>(get_permissions_obj_address());
        let permission_id = permissions_store.next_id;
        
        let permission = Permission {
            owner: owner_addr,
            spender,
            amount,
            spent: 0,
            expiry_timestamp,
            is_active: true,
        };
        
        vector::push_back(&mut permissions_store.permissions, permission);
        permissions_store.next_id = permissions_store.next_id + 1;
        
        // Emit event
        event::emit(PermissionGranted {
            owner: owner_addr,
            spender,
            amount,
            expiry_timestamp,
            permission_id,
        });
    }

    /// Revoke a permission before expiry
    public entry fun revoke_permission(
        owner: &signer,
        permission_id: u64,
    ) acquires PermissionsStore {
        let owner_addr = signer::address_of(owner);
        let permissions_store = borrow_global_mut<PermissionsStore>(get_permissions_obj_address());
        
        assert!(permission_id < vector::length(&permissions_store.permissions), E_PERMISSION_NOT_EXISTS);
        
        let permission = vector::borrow_mut(&mut permissions_store.permissions, permission_id);
        assert!(permission.owner == owner_addr, E_NOT_AUTHORIZED);
        assert!(permission.is_active, E_PERMISSION_NOT_EXISTS);
        
        let remaining_amount = permission.amount - permission.spent;
        permission.is_active = false;
        
        // Emit event
        event::emit(PermissionRevoked {
            owner: owner_addr,
            spender: permission.spender,
            permission_id,
            remaining_amount,
        });
    }

    /// Spend tokens using granted permission
    public entry fun spend_tokens(
        spender: &signer,
        permission_id: u64,
        amount: u64,
        _recipient: address,
    ) acquires PermissionsStore {
        let spender_addr = signer::address_of(spender);
        let current_time = timestamp::now_seconds();
        let permissions_store = borrow_global_mut<PermissionsStore>(get_permissions_obj_address());
        
        assert!(permission_id < vector::length(&permissions_store.permissions), E_PERMISSION_NOT_EXISTS);
        
        let permission = vector::borrow_mut(&mut permissions_store.permissions, permission_id);
        assert!(permission.spender == spender_addr, E_NOT_AUTHORIZED);
        assert!(permission.is_active, E_PERMISSION_NOT_EXISTS);
        
        // Check if permission has expired
        if (current_time >= permission.expiry_timestamp) {
            permission.is_active = false;
            let remaining_amount = permission.amount - permission.spent;
            
            event::emit(PermissionExpired {
                owner: permission.owner,
                spender: permission.spender,
                permission_id,
                remaining_amount,
            });
            
            abort E_PERMISSION_EXPIRED
        };
        
        // Check if enough allowance remains
        let remaining_allowance = permission.amount - permission.spent;
        assert!(amount <= remaining_allowance, E_INSUFFICIENT_PERMISSION);
        
        // Note: In a real implementation, this would transfer tokens from owner to recipient
        // For this demo, we'll just update the spent amount to track usage
        // The actual token transfer would require the owner's signature or a proper escrow mechanism
        
        // Update spent amount
        permission.spent = permission.spent + amount;
        let new_remaining = permission.amount - permission.spent;
        
        // If fully spent, deactivate
        if (permission.spent >= permission.amount) {
            permission.is_active = false;
        };
        
        // Emit event
        event::emit(TokensSpent {
            owner: permission.owner,
            spender: permission.spender,
            permission_id,
            amount_spent: amount,
            remaining_amount: new_remaining,
        });
    }

    // ======================== Read Functions ========================

    #[view]
    public fun get_permission(permission_id: u64): (address, address, u64, u64, u64, bool) acquires PermissionsStore {
        let permissions_store = borrow_global<PermissionsStore>(get_permissions_obj_address());
        assert!(permission_id < vector::length(&permissions_store.permissions), E_PERMISSION_NOT_EXISTS);
        
        let permission = vector::borrow(&permissions_store.permissions, permission_id);
        (
            permission.owner,
            permission.spender,
            permission.amount,
            permission.spent,
            permission.expiry_timestamp,
            permission.is_active
        )
    }

    #[view]
    public fun get_permissions_by_owner(owner: address): vector<u64> acquires PermissionsStore {
        let permissions_store = borrow_global<PermissionsStore>(get_permissions_obj_address());
        let result = vector::empty<u64>();
        let length = vector::length(&permissions_store.permissions);
        let i = 0;
        
        while (i < length) {
            let permission = vector::borrow(&permissions_store.permissions, i);
            if (permission.owner == owner) {
                vector::push_back(&mut result, i);
            };
            i = i + 1;
        };
        
        result
    }

    #[view]
    public fun get_permissions_by_spender(spender: address): vector<u64> acquires PermissionsStore {
        let permissions_store = borrow_global<PermissionsStore>(get_permissions_obj_address());
        let result = vector::empty<u64>();
        let length = vector::length(&permissions_store.permissions);
        let i = 0;
        
        while (i < length) {
            let permission = vector::borrow(&permissions_store.permissions, i);
            if (permission.spender == spender) {
                vector::push_back(&mut result, i);
            };
            i = i + 1;
        };
        
        result
    }

    #[view]
    public fun is_permission_valid(permission_id: u64): bool acquires PermissionsStore {
        let permissions_store = borrow_global<PermissionsStore>(get_permissions_obj_address());
        if (permission_id >= vector::length(&permissions_store.permissions)) {
            return false
        };
        
        let permission = vector::borrow(&permissions_store.permissions, permission_id);
        let current_time = timestamp::now_seconds();
        
        permission.is_active && 
        current_time < permission.expiry_timestamp && 
        permission.spent < permission.amount
    }

    #[view]
    public fun get_remaining_allowance(permission_id: u64): u64 acquires PermissionsStore {
        let permissions_store = borrow_global<PermissionsStore>(get_permissions_obj_address());
        assert!(permission_id < vector::length(&permissions_store.permissions), E_PERMISSION_NOT_EXISTS);
        
        let permission = vector::borrow(&permissions_store.permissions, permission_id);
        permission.amount - permission.spent
    }

    #[view]
    public fun get_total_permissions(): u64 acquires PermissionsStore {
        let permissions_store = borrow_global<PermissionsStore>(get_permissions_obj_address());
        vector::length(&permissions_store.permissions)
    }

    // ======================== Helper functions ========================

    fun get_permissions_obj_address(): address {
        object::create_object_address(&@message_board_addr, PERMISSIONS_OBJECT_SEED)
    }

    fun get_permissions_obj_signer(): signer acquires PermissionsObjectController {
        object::generate_signer_for_extending(&borrow_global<PermissionsObjectController>(get_permissions_obj_address()).extend_ref)
    }

    // ======================== Unit Tests ========================

    #[test_only]
    public fun init_module_for_test(sender: &signer) {
        init_module(sender);
    }

    #[test_only]
    use aptos_framework::account;
    #[test_only]
    use aptos_framework::aptos_coin;

    #[test(aptos_framework = @0x1, deployer = @message_board_addr, owner = @0x100, spender = @0x200)]
    public fun test_grant_and_spend_permission(
        aptos_framework: &signer,
        deployer: &signer,
        owner: &signer,
        spender: &signer,
    ) acquires PermissionsStore {
        // Initialize the blockchain
        timestamp::set_time_has_started_for_testing(aptos_framework);
        
        // Create accounts
        account::create_account_for_test(signer::address_of(deployer));
        account::create_account_for_test(signer::address_of(owner));
        account::create_account_for_test(signer::address_of(spender));
        
        // Initialize coins and fund accounts
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);
        coin::register<AptosCoin>(owner);
        coin::register<AptosCoin>(spender);
        
        let initial_balance = 1000000;
        aptos_coin::mint(aptos_framework, signer::address_of(owner), initial_balance);
        
        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
        
        // Initialize the module
        init_module(deployer);
        
        // Test granting permission
        let amount = 100000;
        let expiry = timestamp::now_seconds() + 3600; // 1 hour from now
        
        grant_permission(owner, signer::address_of(spender), amount, expiry);
        
        // Verify permission was created
        let (perm_owner, perm_spender, perm_amount, perm_spent, perm_expiry, perm_active) = 
            get_permission(0);
        
        assert!(perm_owner == signer::address_of(owner), 0);
        assert!(perm_spender == signer::address_of(spender), 1);
        assert!(perm_amount == amount, 2);
        assert!(perm_spent == 0, 3);
        assert!(perm_expiry == expiry, 4);
        assert!(perm_active == true, 5);
        
        // Test spending
        let spend_amount = 50000;
        spend_tokens(spender, 0, spend_amount, signer::address_of(spender));
        
        // Verify spend was recorded
        let (_, _, _, new_spent, _, _) = get_permission(0);
        assert!(new_spent == spend_amount, 6);
        
        // Verify remaining allowance
        let remaining = get_remaining_allowance(0);
        assert!(remaining == amount - spend_amount, 7);
    }
}
