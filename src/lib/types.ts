// ─── Enum Types ──────────────────────────────────────────────────────────────

export type UserRole =
  | "ADMIN"
  | "MANAGER"
  | "STAFF"
  | "FABRICATOR"
  | "INSTALLER"
  | "MEASUREMENT_TECH";

export type CustomerType = "DIRECT" | "CONTRACTOR_REFERRED";

export type JobType = "COUNTERTOP" | "REPAIR" | "CABINET_INSTALL" | "COMMERCIAL";

export type ProjectStatus =
  | "NEW_LEAD"
  | "CONSULTATION_PENDING"
  | "MEASUREMENT_NEEDED"
  | "MEASUREMENT_SCHEDULED"
  | "MEASUREMENT_COMPLETE"
  | "ESTIMATE_DRAFT"
  | "ESTIMATE_SENT"
  | "AWAITING_APPROVAL"
  | "INVOICE_CREATED"
  | "INVOICE_SENT"
  | "DEPOSIT_PENDING"
  | "DEPOSIT_PAID"
  | "MATERIAL_ORDERED"
  | "WAITING_FOR_STONE"
  | "READY_FOR_FABRICATION"
  | "IN_FABRICATION"
  | "FABRICATION_COMPLETE"
  | "INSTALL_SCHEDULING_PENDING"
  | "INSTALL_SCHEDULED"
  | "INSTALLED"
  | "FINAL_PAYMENT_PENDING"
  | "CLOSED";

export type SecondaryStatus =
  | "ON_HOLD"
  | "REPAIR_JOB"
  | "CABINET_INSTALL_ONLY"
  | "COMMERCIAL_PROJECT"
  | "WAITING_ON_CUSTOMER"
  | "WAITING_ON_CONTRACTOR"
  | "WAITING_ON_MATERIAL"
  | "ISSUE_DELAY";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type DeliveryStatus =
  | "NOT_ORDERED"
  | "ORDERED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "AT_SHOP";

export type PaymentType = "DEPOSIT" | "PROGRESS" | "FINAL" | "REFUND";

export type PaymentMethod =
  | "CASH"
  | "CHECK"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "TRANSFER"
  | "ZELLE"
  | "OTHER";

export type PaymentStatus =
  | "PENDING"
  | "PARTIAL"
  | "PAID"
  | "OVERDUE"
  | "REFUNDED";

export type EventType =
  | "MEASUREMENT"
  | "FABRICATION"
  | "INSTALLATION"
  | "REPAIR_VISIT"
  | "CABINET_INSTALL"
  | "CONSULTATION"
  | "DELIVERY"
  | "OTHER";

export type EventStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "RESCHEDULED";

export type FileType = "IMAGE" | "DOCUMENT" | "PDF" | "RECEIPT" | "OTHER";

export type FileCategory =
  | "BEFORE_PHOTO"
  | "AFTER_PHOTO"
  | "SITE_PHOTO"
  | "SLAB_PHOTO"
  | "RECEIPT"
  | "INVOICE"
  | "MEASUREMENT"
  | "DESIGN_REF"
  | "SIGNED_APPROVAL"
  | "NOTE"
  | "OTHER";

export type CommChannel = "EMAIL" | "SMS" | "WHATSAPP" | "PHONE" | "INTERNAL";

export type CommDirection = "INBOUND" | "OUTBOUND";

export type ConsultationStatus = "NEW" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type MilestoneStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";

// ─── Model Interfaces ────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string | null;
  avatar: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  altPhone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  customerType: CustomerType;
  contractorId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  contractor?: Contractor | null;
}

export interface Contractor {
  id: string;
  companyName: string;
  contactName: string;
  email: string | null;
  phone: string;
  altPhone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  licenseNumber: string | null;
  specialty: string | null;
  rating: number | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  projectNumber: string;
  name: string;
  jobType: JobType;
  status: ProjectStatus;
  secondaryStatus: SecondaryStatus | null;
  priority: Priority;
  customerId: string;
  contractorId: string | null;
  assignedToId: string | null;
  jobAddress: string | null;
  jobCity: string | null;
  jobState: string | null;
  jobZip: string | null;
  sqft: number | null;
  linearFt: number | null;
  laborRate: number | null;
  stoneRate: number | null;
  edgePrice: number | null;
  sinkCutoutPrice: number | null;
  backsplashPrice: number | null;
  waterfallPrice: number | null;
  additionalCosts: number | null;
  totalEstimate: number | null;
  deposit: number | null;
  finalPayment: number | null;
  balanceDue: number | null;
  estimateDate: string | null;
  approvalDate: string | null;
  depositPaidDate: string | null;
  finalPaidDate: string | null;
  completionDate: string | null;
  notes: string | null;
  internalNotes: string | null;
  aiSummary: string | null;
  aiNextSteps: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  contractor?: Contractor | null;
  assignedTo?: User | null;
  scope?: ProjectScope | null;
  materials?: ProjectMaterial[];
  payments?: Payment[];
  scheduleEvents?: ScheduleEvent[];
  statusHistory?: StatusHistory[];
  files?: ProjectFile[];
  projectNotes?: ProjectNote[];
  communications?: CommunicationLog[];
  milestones?: ProjectMilestone[];
}

export interface ProjectScope {
  id: string;
  projectId: string;
  kitchen: boolean;
  vanity: boolean;
  fireplace: boolean;
  bar: boolean;
  outdoor: boolean;
  repair: boolean;
  cabinets: boolean;
  otherArea: string | null;
  stoneMaterial: string | null;
  stoneColor: string | null;
  slabVendor: string | null;
  finishType: string | null;
  sinkDetails: string | null;
  faucetHoles: number | null;
  edgeProfile: string | null;
  backsplashType: string | null;
  fullHeightBacksplash: boolean;
  waterfall: boolean;
  miteredEdge: boolean;
  tileLabor: boolean;
  demoRemoval: boolean;
  cabinetWork: boolean;
  laborNotes: string | null;
  customerPrefs: string | null;
  customNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMaterial {
  id: string;
  projectId: string;
  materialName: string;
  vendor: string | null;
  costToUs: number | null;
  sellingPrice: number | null;
  purchaseDate: string | null;
  deliveryStatus: DeliveryStatus;
  slabPhotos: string[];
  receiptUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  projectId: string;
  invoiceNumber: string | null;
  qbReference: string | null;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod | null;
  amount: number;
  status: PaymentStatus;
  dueDate: string | null;
  paidDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleEvent {
  id: string;
  projectId: string;
  eventType: EventType;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string | null;
  allDay: boolean;
  location: string | null;
  gcalEventId: string | null;
  assignedToId: string | null;
  assignedTeam: string[];
  status: EventStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo?: User | null;
}

export interface StatusHistory {
  id: string;
  projectId: string;
  fromStatus: string | null;
  toStatus: string;
  changedById: string | null;
  note: string | null;
  createdAt: string;
  changedBy?: User | null;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  fileName: string;
  fileUrl: string;
  fileType: FileType;
  category: FileCategory;
  phase: string | null;
  fileSize: number | null;
  mimeType: string | null;
  notes: string | null;
  createdAt: string;
}

export interface ProjectNote {
  id: string;
  projectId: string;
  authorId: string | null;
  content: string;
  isInternal: boolean;
  createdAt: string;
  author?: User | null;
}

export interface CommunicationLog {
  id: string;
  projectId: string;
  channel: CommChannel;
  direction: CommDirection;
  recipient: string | null;
  subject: string | null;
  body: string | null;
  sentById: string | null;
  status: string | null;
  externalId: string | null;
  createdAt: string;
  sentBy?: User | null;
}

export interface AutomationLog {
  id: string;
  projectId: string | null;
  triggeredBy: string | null;
  eventType: string;
  action: string;
  channel: string | null;
  status: string | null;
  details: string | null;
  createdAt: string;
}

export interface ConsultationForm {
  id: string;
  customerId: string | null;
  projectId: string | null;
  customerName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  customerType: string | null;
  contractorName: string | null;
  projectType: string | null;
  areaOfWork: string | null;
  materialPref: string | null;
  colorPref: string | null;
  finishPref: string | null;
  edgePref: string | null;
  sinkFaucet: string | null;
  backsplash: string | null;
  waterfallMiter: string | null;
  timeline: string | null;
  budgetNotes: string | null;
  measurementNeeded: boolean;
  estimateRequested: boolean;
  followUpRequired: boolean;
  photoUrls: string[];
  generalNotes: string | null;
  status: ConsultationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  phase: string | null;
  dueDate: string | null;
  completedAt: string | null;
  status: MilestoneStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Status Labels ───────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  NEW_LEAD: "New Lead",
  CONSULTATION_PENDING: "Consultation Pending",
  MEASUREMENT_NEEDED: "Measurement Needed",
  MEASUREMENT_SCHEDULED: "Measurement Scheduled",
  MEASUREMENT_COMPLETE: "Measurement Complete",
  ESTIMATE_DRAFT: "Estimate Draft",
  ESTIMATE_SENT: "Estimate Sent",
  AWAITING_APPROVAL: "Awaiting Approval",
  INVOICE_CREATED: "Invoice Created",
  INVOICE_SENT: "Invoice Sent",
  DEPOSIT_PENDING: "Deposit Pending",
  DEPOSIT_PAID: "Deposit Paid",
  MATERIAL_ORDERED: "Material Ordered",
  WAITING_FOR_STONE: "Waiting for Stone",
  READY_FOR_FABRICATION: "Ready for Fabrication",
  IN_FABRICATION: "In Fabrication",
  FABRICATION_COMPLETE: "Fabrication Complete",
  INSTALL_SCHEDULING_PENDING: "Install Scheduling Pending",
  INSTALL_SCHEDULED: "Install Scheduled",
  INSTALLED: "Installed",
  FINAL_PAYMENT_PENDING: "Final Payment Pending",
  CLOSED: "Closed",
};

// ─── Status Colors ───────────────────────────────────────────────────────────

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  NEW_LEAD: "bg-blue-100 text-blue-800",
  CONSULTATION_PENDING: "bg-blue-100 text-blue-800",
  MEASUREMENT_NEEDED: "bg-purple-100 text-purple-800",
  MEASUREMENT_SCHEDULED: "bg-purple-200 text-purple-900",
  MEASUREMENT_COMPLETE: "bg-purple-300 text-purple-900",
  ESTIMATE_DRAFT: "bg-indigo-100 text-indigo-800",
  ESTIMATE_SENT: "bg-indigo-200 text-indigo-900",
  AWAITING_APPROVAL: "bg-yellow-100 text-yellow-800",
  INVOICE_CREATED: "bg-amber-100 text-amber-800",
  INVOICE_SENT: "bg-amber-200 text-amber-900",
  DEPOSIT_PENDING: "bg-orange-100 text-orange-800",
  DEPOSIT_PAID: "bg-orange-200 text-orange-900",
  MATERIAL_ORDERED: "bg-cyan-100 text-cyan-800",
  WAITING_FOR_STONE: "bg-cyan-200 text-cyan-900",
  READY_FOR_FABRICATION: "bg-teal-100 text-teal-800",
  IN_FABRICATION: "bg-teal-200 text-teal-900",
  FABRICATION_COMPLETE: "bg-teal-300 text-teal-900",
  INSTALL_SCHEDULING_PENDING: "bg-emerald-100 text-emerald-800",
  INSTALL_SCHEDULED: "bg-emerald-200 text-emerald-900",
  INSTALLED: "bg-green-200 text-green-900",
  FINAL_PAYMENT_PENDING: "bg-lime-100 text-lime-800",
  CLOSED: "bg-gray-200 text-gray-800",
};
