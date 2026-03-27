/**
 * QuickBooks Online Integration Service
 *
 * Handles invoice sync, payment status, customer references,
 * and deposit/final payment mapping with QuickBooks Online.
 *
 * Setup required:
 * 1. Create a QuickBooks Developer account
 * 2. Register an app and get client ID/secret
 * 3. Configure OAuth2 redirect URI
 * 4. Set environment variables (see .env.example)
 */

export interface QBInvoice {
  id: string;
  docNumber: string;
  customerId: string;
  customerName: string;
  totalAmount: number;
  balance: number;
  dueDate: string;
  status: "Paid" | "Open" | "Overdue" | "Voided";
  lineItems: QBLineItem[];
}

export interface QBLineItem {
  description: string;
  amount: number;
  quantity: number;
}

export interface QBPayment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber: string;
}

export interface QBCustomer {
  id: string;
  displayName: string;
  email: string;
  phone: string;
  balance: number;
}

class QuickBooksService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private realmId: string | null = null;
  private baseUrl = "https://quickbooks.api.intuit.com/v3";

  /**
   * Initialize OAuth2 connection with QuickBooks
   */
  async authenticate(authCode: string): Promise<void> {
    // TODO: Exchange auth code for access/refresh tokens
    // POST to https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer
    console.log("[QB] Authenticating with code:", authCode);
    this.accessToken = "mock_access_token";
    this.refreshToken = "mock_refresh_token";
    this.realmId = process.env.QB_REALM_ID || "mock_realm";
  }

  /**
   * Refresh expired access token
   */
  async refreshAccessToken(): Promise<void> {
    // TODO: Use refresh token to get new access token
    console.log("[QB] Refreshing access token");
  }

  /**
   * Create an invoice in QuickBooks
   */
  async createInvoice(data: {
    customerName: string;
    customerEmail: string;
    lineItems: { description: string; amount: number }[];
    dueDate: string;
    projectRef: string;
  }): Promise<QBInvoice> {
    console.log("[QB] Creating invoice for:", data.customerName);
    // TODO: POST /v3/company/{realmId}/invoice
    return {
      id: `qb-inv-${Date.now()}`,
      docNumber: `INV-${Date.now()}`,
      customerId: "qb-cust-1",
      customerName: data.customerName,
      totalAmount: data.lineItems.reduce((sum, item) => sum + item.amount, 0),
      balance: data.lineItems.reduce((sum, item) => sum + item.amount, 0),
      dueDate: data.dueDate,
      status: "Open",
      lineItems: data.lineItems.map((item) => ({
        ...item,
        quantity: 1,
      })),
    };
  }

  /**
   * Get invoice status from QuickBooks
   */
  async getInvoice(invoiceId: string): Promise<QBInvoice | null> {
    console.log("[QB] Getting invoice:", invoiceId);
    // TODO: GET /v3/company/{realmId}/invoice/{invoiceId}
    return null;
  }

  /**
   * Record a payment in QuickBooks
   */
  async recordPayment(data: {
    invoiceId: string;
    amount: number;
    paymentMethod: string;
    date: string;
  }): Promise<QBPayment> {
    console.log("[QB] Recording payment for invoice:", data.invoiceId);
    // TODO: POST /v3/company/{realmId}/payment
    return {
      id: `qb-pay-${Date.now()}`,
      invoiceId: data.invoiceId,
      amount: data.amount,
      paymentDate: data.date,
      paymentMethod: data.paymentMethod,
      referenceNumber: `REF-${Date.now()}`,
    };
  }

  /**
   * Sync payment status for a project's invoices
   */
  async syncPaymentStatus(projectInvoiceNumber: string): Promise<{
    status: string;
    balance: number;
    payments: QBPayment[];
  }> {
    console.log("[QB] Syncing payment status for:", projectInvoiceNumber);
    // TODO: Query QB for invoice and its payments
    return { status: "Open", balance: 0, payments: [] };
  }

  /**
   * Find or create a customer in QuickBooks
   */
  async findOrCreateCustomer(data: {
    name: string;
    email: string;
    phone: string;
  }): Promise<QBCustomer> {
    console.log("[QB] Finding/creating customer:", data.name);
    // TODO: Query then create if not found
    return {
      id: `qb-cust-${Date.now()}`,
      displayName: data.name,
      email: data.email,
      phone: data.phone,
      balance: 0,
    };
  }

  /**
   * Get outstanding balances report
   */
  async getOutstandingBalances(): Promise<
    { customerName: string; balance: number; invoices: string[] }[]
  > {
    console.log("[QB] Getting outstanding balances");
    // TODO: Run A/R aging report
    return [];
  }
}

export const quickbooksService = new QuickBooksService();
