/**
 * QuickBooks Online Integration Service
 *
 * Real implementation using QuickBooks Online API v3.
 * Uses OAuth2 for authentication with token refresh.
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
  private tokenExpiry: number = 0;
  private baseUrl = "https://quickbooks.api.intuit.com/v3";
  private sandboxUrl = "https://sandbox-quickbooks.api.intuit.com/v3";

  constructor() {
    this.realmId = process.env.QUICKBOOKS_REALM_ID || null;
    this.refreshToken = process.env.QUICKBOOKS_REFRESH_TOKEN || null;
    this.accessToken = process.env.QUICKBOOKS_ACCESS_TOKEN || null;
  }

  private get apiBase(): string {
    return process.env.NODE_ENV === "production" ? this.baseUrl : this.sandboxUrl;
  }

  private get isConfigured(): boolean {
    return !!(process.env.QUICKBOOKS_CLIENT_ID && process.env.QUICKBOOKS_CLIENT_SECRET && this.realmId);
  }

  async authenticate(authCode: string): Promise<{ accessToken: string; refreshToken: string }> {
    const clientId = process.env.QUICKBOOKS_CLIENT_ID!;
    const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET!;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/quickbooks/callback`;

    const response = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: authCode,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`QB auth failed: ${response.status}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

    return { accessToken: data.access_token, refreshToken: data.refresh_token };
  }

  async refreshAccessToken(): Promise<void> {
    if (!this.isConfigured || !this.refreshToken) {
      console.warn("[QB] Not configured - using mock mode");
      return;
    }

    const clientId = process.env.QUICKBOOKS_CLIENT_ID!;
    const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET!;

    try {
      const response = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: this.refreshToken,
        }),
      });

      if (!response.ok) throw new Error(`Token refresh failed: ${response.status}`);

      const data = await response.json();
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;
      this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    } catch (error) {
      console.error("[QB] Token refresh error:", error);
    }
  }

  private async apiCall(method: string, endpoint: string, body?: unknown): Promise<unknown> {
    if (!this.isConfigured) {
      console.log(`[QB Mock] ${method} ${endpoint}`);
      return null;
    }

    if (Date.now() >= this.tokenExpiry) {
      await this.refreshAccessToken();
    }

    const url = `${this.apiBase}/company/${this.realmId}${endpoint}`;
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`QB API error: ${response.status} ${error}`);
    }

    return response.json();
  }

  async createInvoice(data: {
    customerName: string;
    customerEmail: string;
    lineItems: { description: string; amount: number }[];
    dueDate: string;
    projectRef: string;
  }): Promise<QBInvoice> {
    console.log("[QB] Creating invoice for:", data.customerName);

    // Find or create customer first
    const customer = await this.findOrCreateCustomer({
      name: data.customerName,
      email: data.customerEmail,
      phone: "",
    });

    const invoiceBody = {
      CustomerRef: { value: customer.id },
      DueDate: data.dueDate,
      Line: data.lineItems.map((item, i) => ({
        Amount: item.amount,
        DetailType: "SalesItemLineDetail",
        Description: item.description,
        SalesItemLineDetail: {
          ItemRef: { value: "1", name: "Services" },
          UnitPrice: item.amount,
          Qty: 1,
        },
        LineNum: i + 1,
      })),
      PrivateNote: `TMG Project: ${data.projectRef}`,
    };

    const result = await this.apiCall("POST", "/invoice", invoiceBody);

    if (!result) {
      // Mock response
      const total = data.lineItems.reduce((sum, item) => sum + item.amount, 0);
      return {
        id: `qb-inv-${Date.now()}`,
        docNumber: `INV-${Date.now()}`,
        customerId: customer.id,
        customerName: data.customerName,
        totalAmount: total,
        balance: total,
        dueDate: data.dueDate,
        status: "Open",
        lineItems: data.lineItems.map(item => ({ ...item, quantity: 1 })),
      };
    }

    const inv = (result as { Invoice: Record<string, unknown> }).Invoice;
    return {
      id: String(inv.Id),
      docNumber: String(inv.DocNumber),
      customerId: String((inv.CustomerRef as { value: string }).value),
      customerName: data.customerName,
      totalAmount: Number(inv.TotalAmt),
      balance: Number(inv.Balance),
      dueDate: String(inv.DueDate),
      status: Number(inv.Balance) === 0 ? "Paid" : "Open",
      lineItems: data.lineItems.map(item => ({ ...item, quantity: 1 })),
    };
  }

  async getInvoice(invoiceId: string): Promise<QBInvoice | null> {
    console.log("[QB] Getting invoice:", invoiceId);
    const result = await this.apiCall("GET", `/invoice/${invoiceId}`);
    if (!result) return null;

    const inv = (result as { Invoice: Record<string, unknown> }).Invoice;
    return {
      id: String(inv.Id),
      docNumber: String(inv.DocNumber),
      customerId: String((inv.CustomerRef as { value: string }).value),
      customerName: String((inv.CustomerRef as { name: string }).name),
      totalAmount: Number(inv.TotalAmt),
      balance: Number(inv.Balance),
      dueDate: String(inv.DueDate),
      status: Number(inv.Balance) === 0 ? "Paid" : "Open",
      lineItems: [],
    };
  }

  async recordPayment(data: {
    invoiceId: string;
    amount: number;
    paymentMethod: string;
    date: string;
  }): Promise<QBPayment> {
    console.log("[QB] Recording payment for invoice:", data.invoiceId);

    const paymentBody = {
      TotalAmt: data.amount,
      CustomerRef: { value: "1" },
      Line: [{
        Amount: data.amount,
        LinkedTxn: [{
          TxnId: data.invoiceId,
          TxnType: "Invoice",
        }],
      }],
      PaymentMethodRef: { value: "1" },
      TxnDate: data.date,
    };

    const result = await this.apiCall("POST", "/payment", paymentBody);

    if (!result) {
      return {
        id: `qb-pay-${Date.now()}`,
        invoiceId: data.invoiceId,
        amount: data.amount,
        paymentDate: data.date,
        paymentMethod: data.paymentMethod,
        referenceNumber: `REF-${Date.now()}`,
      };
    }

    const pay = (result as { Payment: Record<string, unknown> }).Payment;
    return {
      id: String(pay.Id),
      invoiceId: data.invoiceId,
      amount: data.amount,
      paymentDate: data.date,
      paymentMethod: data.paymentMethod,
      referenceNumber: String(pay.Id),
    };
  }

  async syncPaymentStatus(invoiceNumber: string): Promise<{
    status: string;
    balance: number;
    payments: QBPayment[];
  }> {
    console.log("[QB] Syncing payment status for:", invoiceNumber);

    const query = `SELECT * FROM Invoice WHERE DocNumber = '${invoiceNumber}'`;
    const result = await this.apiCall("GET", `/query?query=${encodeURIComponent(query)}`);

    if (!result) return { status: "Unknown", balance: 0, payments: [] };

    const response = result as { QueryResponse?: { Invoice?: Record<string, unknown>[] } };
    const invoices = response.QueryResponse?.Invoice || [];
    if (invoices.length === 0) return { status: "Not Found", balance: 0, payments: [] };

    const inv = invoices[0];
    const balance = Number(inv.Balance);
    return {
      status: balance === 0 ? "Paid" : "Open",
      balance,
      payments: [],
    };
  }

  async findOrCreateCustomer(data: {
    name: string;
    email: string;
    phone: string;
  }): Promise<QBCustomer> {
    console.log("[QB] Finding/creating customer:", data.name);

    // Try to find existing customer
    const query = `SELECT * FROM Customer WHERE DisplayName = '${data.name.replace(/'/g, "\\'")}'`;
    const searchResult = await this.apiCall("GET", `/query?query=${encodeURIComponent(query)}`);

    if (searchResult) {
      const response = searchResult as { QueryResponse?: { Customer?: Record<string, unknown>[] } };
      const customers = response.QueryResponse?.Customer || [];
      if (customers.length > 0) {
        const c = customers[0];
        return {
          id: String(c.Id),
          displayName: String(c.DisplayName),
          email: String((c.PrimaryEmailAddr as { Address?: string })?.Address || ""),
          phone: String((c.PrimaryPhone as { FreeFormNumber?: string })?.FreeFormNumber || ""),
          balance: Number(c.Balance || 0),
        };
      }
    }

    // Create new customer
    const createBody = {
      DisplayName: data.name,
      PrimaryEmailAddr: data.email ? { Address: data.email } : undefined,
      PrimaryPhone: data.phone ? { FreeFormNumber: data.phone } : undefined,
    };

    const createResult = await this.apiCall("POST", "/customer", createBody);

    if (!createResult) {
      return {
        id: `qb-cust-${Date.now()}`,
        displayName: data.name,
        email: data.email,
        phone: data.phone,
        balance: 0,
      };
    }

    const c = (createResult as { Customer: Record<string, unknown> }).Customer;
    return {
      id: String(c.Id),
      displayName: String(c.DisplayName),
      email: data.email,
      phone: data.phone,
      balance: 0,
    };
  }

  async getOutstandingBalances(): Promise<{ customerName: string; balance: number; invoices: string[] }[]> {
    console.log("[QB] Getting outstanding balances");

    const query = "SELECT * FROM Invoice WHERE Balance > '0'";
    const result = await this.apiCall("GET", `/query?query=${encodeURIComponent(query)}`);

    if (!result) return [];

    const response = result as { QueryResponse?: { Invoice?: Record<string, unknown>[] } };
    const invoices = response.QueryResponse?.Invoice || [];

    const byCustomer: Record<string, { customerName: string; balance: number; invoices: string[] }> = {};
    for (const inv of invoices) {
      const name = String((inv.CustomerRef as { name?: string })?.name || "Unknown");
      if (!byCustomer[name]) byCustomer[name] = { customerName: name, balance: 0, invoices: [] };
      byCustomer[name].balance += Number(inv.Balance);
      byCustomer[name].invoices.push(String(inv.DocNumber));
    }

    return Object.values(byCustomer);
  }

  getAuthUrl(): string {
    const clientId = process.env.QUICKBOOKS_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/quickbooks/callback`;
    const scopes = "com.intuit.quickbooks.accounting";
    return `https://appcenter.intuit.com/connect/oauth2?client_id=${clientId}&response_type=code&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=tmg_dashboard`;
  }
}

export const quickbooksService = new QuickBooksService();
