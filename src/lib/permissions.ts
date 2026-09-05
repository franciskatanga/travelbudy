/**
 * Central RBAC permission registry.
 * Access control MUST check permission keys, never role names directly,
 * so new roles can be composed without code changes.
 */
export const PERMISSIONS = {
  BOOKING_VIEW: "booking.view",
  BOOKING_CREATE: "booking.create",
  BOOKING_MODIFY: "booking.modify",
  BOOKING_CANCEL: "booking.cancel",
  CUSTOMER_VIEW: "customer.view",
  CUSTOMER_CREATE: "customer.create",
  LEAD_VIEW: "lead.view",
  LEAD_CREATE: "lead.create",
  QUOTE_VIEW: "quote.view",
  QUOTE_CREATE: "quote.create",
  PROPOSAL_SEND: "proposal.send",
  PAYMENT_VIEW: "payment.view",
  PAYMENT_REFUND: "payment.refund",
  SUPPLIER_VIEW: "supplier.view",
  SUPPLIER_VERIFY: "supplier.verify",
  SUPPLIER_SUSPEND: "supplier.suspend",
  PRODUCT_CREATE: "product.create",
  PRODUCT_PUBLISH: "product.publish",
  COMMISSION_VIEW: "commission.view",
  ANALYTICS_VIEW: "analytics.view",
  DISPUTE_MANAGE: "dispute.manage",
  USER_IMPERSONATE: "user.impersonate",
  SYSTEM_SETTINGS: "system.settings",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Default role -> permission mapping used by the seed script. Editable in DB thereafter. */
export const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  traveller: [PERMISSIONS.BOOKING_VIEW, PERMISSIONS.BOOKING_CREATE],
  agent: [
    PERMISSIONS.LEAD_VIEW,
    PERMISSIONS.LEAD_CREATE,
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.CUSTOMER_CREATE,
    PERMISSIONS.QUOTE_VIEW,
    PERMISSIONS.QUOTE_CREATE,
    PERMISSIONS.PROPOSAL_SEND,
    PERMISSIONS.BOOKING_VIEW,
    PERMISSIONS.BOOKING_CREATE,
    PERMISSIONS.COMMISSION_VIEW,
  ],
  agency_owner: [
    PERMISSIONS.LEAD_VIEW,
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.QUOTE_VIEW,
    PERMISSIONS.BOOKING_VIEW,
    PERMISSIONS.BOOKING_MODIFY,
    PERMISSIONS.COMMISSION_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
  ],
  supplier_manager: [
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_PUBLISH,
    PERMISSIONS.BOOKING_VIEW,
    PERMISSIONS.BOOKING_MODIFY,
    PERMISSIONS.ANALYTICS_VIEW,
  ],
  supplier_staff_reservations: [PERMISSIONS.BOOKING_VIEW, PERMISSIONS.BOOKING_MODIFY],
  supplier_staff_finance: [PERMISSIONS.PAYMENT_VIEW, PERMISSIONS.COMMISSION_VIEW],
  super_admin: Object.values(PERMISSIONS),
  operations_admin: [
    PERMISSIONS.BOOKING_VIEW,
    PERMISSIONS.BOOKING_MODIFY,
    PERMISSIONS.SUPPLIER_VIEW,
    PERMISSIONS.SUPPLIER_VERIFY,
    PERMISSIONS.DISPUTE_MANAGE,
  ],
  finance_admin: [PERMISSIONS.PAYMENT_VIEW, PERMISSIONS.PAYMENT_REFUND, PERMISSIONS.COMMISSION_VIEW],
  compliance_admin: [PERMISSIONS.SUPPLIER_VERIFY, PERMISSIONS.SUPPLIER_SUSPEND],
  customer_support: [PERMISSIONS.CUSTOMER_VIEW, PERMISSIONS.BOOKING_VIEW, PERMISSIONS.USER_IMPERSONATE],
  content_manager: [PERMISSIONS.PRODUCT_PUBLISH],
  marketing_manager: [PERMISSIONS.ANALYTICS_VIEW],
  analyst: [PERMISSIONS.ANALYTICS_VIEW],
};

export function hasPermission(userPermissions: string[], required: PermissionKey): boolean {
  return userPermissions.includes(required);
}
