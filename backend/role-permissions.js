export const ROLE_PERMISSIONS = {
  admin: {
    dashboard: true,
    viewOrders: true,
    manageOrders: true,
    viewCustomers: true,
    viewPayments: true,
    viewMenu: true,
    manageMenu: true,
    viewCategories: true,
    manageCategories: true,
    viewReviews: true,
    manageReviews: true,
    viewSettings: true,
    manageSettings: true,
  },
  manager: {
    dashboard: true,
    viewOrders: true,
    manageOrders: false,
    viewCustomers: true,
    viewPayments: true,
    viewMenu: true,
    manageMenu: false,
    viewCategories: true,
    manageCategories: false,
    viewReviews: true,
    manageReviews: false,
    viewSettings: true,
    manageSettings: false,
  },
};

export function hasPermission(role, permission) {
  return Boolean(ROLE_PERMISSIONS[role]?.[permission]);
}
