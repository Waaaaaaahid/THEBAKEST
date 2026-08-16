/*
# Harden admin functions — revoke anon EXECUTE

## Why
The security advisor flagged that all SECURITY DEFINER admin functions were
executable by the `anon` role via the REST API. Although every function body
checks `is_admin()` and raises "Not authorized" for non-admins, defense-in-depth
dictates that `anon` should not have EXECUTE on these functions at all. Only
`authenticated` needs access (the app uses the anon-key client with a user
session, so calls run as `authenticated`).

## Changes
- REVOKE EXECUTE on all admin_* and helper functions from `anon`.
- Keep GRANT EXECUTE to `authenticated`.
- `is_admin()` stays callable by authenticated (it only reads the caller's own
  profile role and returns a boolean — no sensitive data).
*/

REVOKE EXECUTE ON FUNCTION admin_list_all_orders() FROM anon;
REVOKE EXECUTE ON FUNCTION admin_update_order_status(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION admin_list_pending_reviews() FROM anon;
REVOKE EXECUTE ON FUNCTION admin_list_all_reviews() FROM anon;
REVOKE EXECUTE ON FUNCTION admin_moderate_review(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION admin_list_customers() FROM anon;
REVOKE EXECUTE ON FUNCTION admin_dashboard_stats() FROM anon;
REVOKE EXECUTE ON FUNCTION admin_create_menu_item(text, text, uuid, text, text, numeric, jsonb, boolean, boolean, boolean, boolean, text[], int) FROM anon;
REVOKE EXECUTE ON FUNCTION admin_update_menu_item(uuid, text, text, uuid, text, text, numeric, jsonb, boolean, boolean, boolean, boolean, text[], int) FROM anon;
REVOKE EXECUTE ON FUNCTION admin_delete_menu_item(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION admin_promote_user(text) FROM anon;
REVOKE EXECUTE ON FUNCTION handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION is_admin() FROM anon;
