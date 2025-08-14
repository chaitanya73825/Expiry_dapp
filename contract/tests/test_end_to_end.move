#[test_only]
module message_board_addr::test_expiry_x {
    use std::signer;
    use aptos_framework::timestamp;
    use aptos_framework::account;

    use message_board_addr::expiry_x;

    #[test(aptos_framework = @0x1, deployer = @message_board_addr, owner = @0x100, spender = @0x200)]
    fun test_grant_and_spend_permission(
        aptos_framework: &signer,
        deployer: &signer,
        owner: &signer,
        spender: &signer,
    ) {
        // Initialize the blockchain
        timestamp::set_time_has_started_for_testing(aptos_framework);
        
        // Create accounts
        account::create_account_for_test(signer::address_of(deployer));
        account::create_account_for_test(signer::address_of(owner));
        account::create_account_for_test(signer::address_of(spender));
        
        // Initialize the module
        expiry_x::init_module_for_test(deployer);
        
        // Test granting permission
        let amount = 100000;
        let expiry = timestamp::now_seconds() + 3600; // 1 hour from now
        
        expiry_x::grant_permission(owner, signer::address_of(spender), amount, expiry);
        
        // Verify permission was created
        let (perm_owner, perm_spender, perm_amount, perm_spent, perm_expiry, perm_active) = 
            expiry_x::get_permission(0);
        
        assert!(perm_owner == signer::address_of(owner), 0);
        assert!(perm_spender == signer::address_of(spender), 1);
        assert!(perm_amount == amount, 2);
        assert!(perm_spent == 0, 3);
        assert!(perm_expiry == expiry, 4);
        assert!(perm_active == true, 5);
        
        // Test spending (just tracking, not actual token transfer)
        let spend_amount = 50000;
        expiry_x::spend_tokens(spender, 0, spend_amount, signer::address_of(spender));
        
        // Verify spend was recorded
        let (_, _, _, new_spent, _, _) = expiry_x::get_permission(0);
        assert!(new_spent == spend_amount, 6);
        
        // Verify remaining allowance
        let remaining = expiry_x::get_remaining_allowance(0);
        assert!(remaining == amount - spend_amount, 7);
    }

    #[test(aptos_framework = @0x1, deployer = @message_board_addr, owner = @0x100)]
    fun test_revoke_permission(aptos_framework: &signer, deployer: &signer, owner: &signer) {
        // Initialize timestamp
        timestamp::set_time_has_started_for_testing(aptos_framework);
        
        // Initialize the module
        expiry_x::init_module_for_test(deployer);
        
        // Grant permission first
        let spender = @0x200;
        let amount = 100000;
        let expiry = timestamp::now_seconds() + 3600; // 1 hour from now
        
        expiry_x::grant_permission(owner, spender, amount, expiry);
        
        // Verify permission is active
        let (_, _, _, _, _, active_before) = expiry_x::get_permission(0);
        assert!(active_before == true, 0);
        
        // Revoke the permission
        expiry_x::revoke_permission(owner, 0);
        
        // Verify permission is no longer active
        let (_, _, _, _, _, active_after) = expiry_x::get_permission(0);
        assert!(active_after == false, 1);
    }
}
