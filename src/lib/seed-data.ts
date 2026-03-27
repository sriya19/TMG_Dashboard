import { addDays, subDays, addWeeks, subWeeks, setHours, setMinutes } from "date-fns";

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

// ─── Users ──────────────────────────────────────────────────────────────────

export const users = [
  { id: "user-1", name: "Sam Patel", email: "sam@topmarble.com", role: "ADMIN", phone: "555-100-0001", active: true },
  { id: "user-2", name: "Maria Torres", email: "maria@topmarble.com", role: "MANAGER", phone: "555-100-0002", active: true },
  { id: "user-3", name: "Carlos Rivera", email: "carlos@topmarble.com", role: "INSTALLER", phone: "555-100-0003", active: true },
  { id: "user-4", name: "James Wilson", email: "james@topmarble.com", role: "INSTALLER", phone: "555-100-0004", active: true },
  { id: "user-5", name: "David Kim", email: "david@topmarble.com", role: "FABRICATOR", phone: "555-100-0005", active: true },
  { id: "user-6", name: "Mike Johnson", email: "mike@topmarble.com", role: "MEASUREMENT_TECH", phone: "555-100-0006", active: true },
];

// ─── Contractors ────────────────────────────────────────────────────────────

export const contractors = [
  { id: "contractor-1", companyName: "Elite Home Remodeling", contactName: "Robert Chen", email: "robert@eliteremodel.com", phone: "555-200-0001", specialty: "Kitchen & Bath", rating: 5, active: true, city: "Houston", state: "TX" },
  { id: "contractor-2", companyName: "Premier Kitchen & Bath", contactName: "Lisa Anderson", email: "lisa@premierkb.com", phone: "555-200-0002", specialty: "Full Remodels", rating: 4, active: true, city: "Houston", state: "TX" },
  { id: "contractor-3", companyName: "Summit Construction", contactName: "Tom Bradley", email: "tom@summitconst.com", phone: "555-200-0003", specialty: "Commercial Build-Outs", rating: 5, active: true, city: "Sugar Land", state: "TX" },
  { id: "contractor-4", companyName: "Valley Builders Group", contactName: "Anita Sharma", email: "anita@valleybuilders.com", phone: "555-200-0004", specialty: "Residential Construction", rating: 4, active: true, city: "Katy", state: "TX" },
  { id: "contractor-5", companyName: "Metro Design Build", contactName: "Jason Park", email: "jason@metrodesign.com", phone: "555-200-0005", specialty: "Interior Design & Build", rating: 3, active: true, city: "The Woodlands", state: "TX" },
];

// ─── Customers ──────────────────────────────────────────────────────────────

export const customers = [
  { id: "cust-1", firstName: "Maria", lastName: "Martinez", email: "maria.martinez@email.com", phone: "555-300-0001", address: "1234 Oak Lane", city: "Houston", state: "TX", zip: "77001", customerType: "DIRECT" as const, contractorId: null },
  { id: "cust-2", firstName: "John", lastName: "Thompson", email: "john.t@email.com", phone: "555-300-0002", address: "567 Elm Street", city: "Houston", state: "TX", zip: "77002", customerType: "DIRECT" as const, contractorId: null },
  { id: "cust-3", firstName: "Sarah", lastName: "Rivera", email: "sarah.r@email.com", phone: "555-300-0003", address: "890 Pine Ave", city: "Sugar Land", state: "TX", zip: "77479", customerType: "CONTRACTOR_REFERRED" as const, contractorId: "contractor-1" },
  { id: "cust-4", firstName: "Michael", lastName: "Nguyen", email: "m.nguyen@email.com", phone: "555-300-0004", address: "234 Maple Dr", city: "Katy", state: "TX", zip: "77494", customerType: "CONTRACTOR_REFERRED" as const, contractorId: "contractor-2" },
  { id: "cust-5", firstName: "Emily", lastName: "Davis", email: "emily.d@email.com", phone: "555-300-0005", address: "678 Cedar Blvd", city: "Houston", state: "TX", zip: "77003", customerType: "DIRECT" as const, contractorId: null },
  { id: "cust-6", firstName: "David", lastName: "Garcia", email: "d.garcia@email.com", phone: "555-300-0006", address: "901 Birch Rd", city: "Pearland", state: "TX", zip: "77581", customerType: "CONTRACTOR_REFERRED" as const, contractorId: "contractor-1" },
  { id: "cust-7", firstName: "Jessica", lastName: "Lee", email: "jessica.lee@email.com", phone: "555-300-0007", address: "345 Walnut St", city: "Houston", state: "TX", zip: "77004", customerType: "DIRECT" as const, contractorId: null },
  { id: "cust-8", firstName: "Robert", lastName: "Brown", email: "r.brown@email.com", phone: "555-300-0008", address: "789 Spruce Ln", city: "The Woodlands", state: "TX", zip: "77380", customerType: "CONTRACTOR_REFERRED" as const, contractorId: "contractor-4" },
  { id: "cust-9", firstName: "Amanda", lastName: "Wilson", email: "a.wilson@email.com", phone: "555-300-0009", address: "123 Ash Ct", city: "Houston", state: "TX", zip: "77005", customerType: "DIRECT" as const, contractorId: null },
  { id: "cust-10", firstName: "Daniel", lastName: "Kim", email: "d.kim@email.com", phone: "555-300-0010", address: "456 Cypress Way", city: "Missouri City", state: "TX", zip: "77459", customerType: "CONTRACTOR_REFERRED" as const, contractorId: "contractor-3" },
  { id: "cust-11", firstName: "Oakwood Restaurant", lastName: "Group", email: "mgmt@oakwoodrest.com", phone: "555-300-0011", address: "2100 Westheimer Rd", city: "Houston", state: "TX", zip: "77006", customerType: "DIRECT" as const, contractorId: null },
  { id: "cust-12", firstName: "Metro Office", lastName: "Properties", email: "facilities@metroprop.com", phone: "555-300-0012", address: "500 Main St", city: "Houston", state: "TX", zip: "77002", customerType: "CONTRACTOR_REFERRED" as const, contractorId: "contractor-3" },
];

// ─── Projects ───────────────────────────────────────────────────────────────

export const projects = [
  // Early stage - leads and measurements
  {
    id: "proj-1", projectNumber: "TMG-2024-001", name: "Martinez Kitchen Countertops",
    jobType: "COUNTERTOP", status: "NEW_LEAD", priority: "MEDIUM",
    customerId: "cust-1", contractorId: null, assignedToId: "user-2",
    jobAddress: "1234 Oak Lane", jobCity: "Houston", jobState: "TX",
    totalEstimate: null, deposit: null, balanceDue: null,
    createdAt: subDays(today, 2),
  },
  {
    id: "proj-2", projectNumber: "TMG-2024-002", name: "Thompson Master Bath Vanity",
    jobType: "COUNTERTOP", status: "MEASUREMENT_SCHEDULED", priority: "MEDIUM",
    customerId: "cust-2", contractorId: null, assignedToId: "user-6",
    jobAddress: "567 Elm Street", jobCity: "Houston", jobState: "TX",
    totalEstimate: null, deposit: null, balanceDue: null,
    createdAt: subDays(today, 5),
  },
  {
    id: "proj-3", projectNumber: "TMG-2024-003", name: "Rivera Kitchen Remodel",
    jobType: "COUNTERTOP", status: "MEASUREMENT_COMPLETE", priority: "HIGH",
    customerId: "cust-3", contractorId: "contractor-1", assignedToId: "user-2",
    jobAddress: "890 Pine Ave", jobCity: "Sugar Land", jobState: "TX",
    totalEstimate: 5200, deposit: 2600, balanceDue: 5200,
    createdAt: subDays(today, 8),
  },

  // Mid pipeline - estimates, deposits, material
  {
    id: "proj-4", projectNumber: "TMG-2024-004", name: "Nguyen Kitchen Granite",
    jobType: "COUNTERTOP", status: "ESTIMATE_SENT", priority: "MEDIUM",
    customerId: "cust-4", contractorId: "contractor-2", assignedToId: "user-2",
    jobAddress: "234 Maple Dr", jobCity: "Katy", jobState: "TX",
    totalEstimate: 4800, deposit: 2400, balanceDue: 4800,
    createdAt: subDays(today, 12),
  },
  {
    id: "proj-5", projectNumber: "TMG-2024-005", name: "Davis Outdoor Kitchen",
    jobType: "COUNTERTOP", status: "DEPOSIT_PAID", priority: "HIGH",
    customerId: "cust-5", contractorId: null, assignedToId: "user-1",
    jobAddress: "678 Cedar Blvd", jobCity: "Houston", jobState: "TX",
    totalEstimate: 7500, deposit: 3750, balanceDue: 3750,
    createdAt: subDays(today, 18),
  },
  {
    id: "proj-6", projectNumber: "TMG-2024-006", name: "Garcia Fireplace Surround",
    jobType: "COUNTERTOP", status: "WAITING_FOR_STONE", priority: "MEDIUM",
    customerId: "cust-6", contractorId: "contractor-1", assignedToId: "user-5",
    jobAddress: "901 Birch Rd", jobCity: "Pearland", jobState: "TX",
    totalEstimate: 3200, deposit: 1600, balanceDue: 1600,
    createdAt: subDays(today, 22),
  },

  // Fabrication and install phase
  {
    id: "proj-7", projectNumber: "TMG-2024-007", name: "Lee Kitchen Quartz",
    jobType: "COUNTERTOP", status: "IN_FABRICATION", priority: "HIGH",
    customerId: "cust-7", contractorId: null, assignedToId: "user-5",
    jobAddress: "345 Walnut St", jobCity: "Houston", jobState: "TX",
    totalEstimate: 5800, deposit: 2900, balanceDue: 2900,
    createdAt: subDays(today, 30),
  },
  {
    id: "proj-8", projectNumber: "TMG-2024-008", name: "Brown Master Bath Marble",
    jobType: "COUNTERTOP", status: "INSTALL_SCHEDULED", priority: "HIGH",
    customerId: "cust-8", contractorId: "contractor-4", assignedToId: "user-3",
    jobAddress: "789 Spruce Ln", jobCity: "The Woodlands", jobState: "TX",
    totalEstimate: 6200, deposit: 3100, balanceDue: 3100,
    createdAt: subDays(today, 35),
  },
  {
    id: "proj-9", projectNumber: "TMG-2024-009", name: "Wilson Bar Top Granite",
    jobType: "COUNTERTOP", status: "FINAL_PAYMENT_PENDING", priority: "LOW",
    customerId: "cust-9", contractorId: null, assignedToId: "user-3",
    jobAddress: "123 Ash Ct", jobCity: "Houston", jobState: "TX",
    totalEstimate: 2800, deposit: 1400, balanceDue: 1400,
    createdAt: subDays(today, 45),
  },

  // Repair jobs
  {
    id: "proj-10", projectNumber: "TMG-2024-010", name: "Martinez Countertop Chip Repair",
    jobType: "REPAIR", status: "MEASUREMENT_NEEDED", priority: "LOW",
    customerId: "cust-1", contractorId: null, assignedToId: "user-6",
    jobAddress: "1234 Oak Lane", jobCity: "Houston", jobState: "TX",
    totalEstimate: 350, deposit: null, balanceDue: 350,
    secondaryStatus: "REPAIR_JOB",
    createdAt: subDays(today, 3),
  },
  {
    id: "proj-11", projectNumber: "TMG-2024-011", name: "Kim Granite Seam Repair",
    jobType: "REPAIR", status: "INSTALL_SCHEDULED", priority: "MEDIUM",
    customerId: "cust-10", contractorId: "contractor-3", assignedToId: "user-3",
    jobAddress: "456 Cypress Way", jobCity: "Missouri City", jobState: "TX",
    totalEstimate: 500, deposit: 250, balanceDue: 250,
    secondaryStatus: "REPAIR_JOB",
    createdAt: subDays(today, 10),
  },

  // Cabinet install jobs
  {
    id: "proj-12", projectNumber: "TMG-2024-012", name: "Davis Cabinet Installation",
    jobType: "CABINET_INSTALL", status: "DEPOSIT_PENDING", priority: "MEDIUM",
    customerId: "cust-5", contractorId: null, assignedToId: "user-4",
    jobAddress: "678 Cedar Blvd", jobCity: "Houston", jobState: "TX",
    totalEstimate: 2200, deposit: 1100, balanceDue: 2200,
    secondaryStatus: "CABINET_INSTALL_ONLY",
    createdAt: subDays(today, 7),
  },
  {
    id: "proj-13", projectNumber: "TMG-2024-013", name: "Nguyen Bathroom Cabinets",
    jobType: "CABINET_INSTALL", status: "IN_FABRICATION", priority: "LOW",
    customerId: "cust-4", contractorId: "contractor-2", assignedToId: "user-4",
    jobAddress: "234 Maple Dr", jobCity: "Katy", jobState: "TX",
    totalEstimate: 1800, deposit: 900, balanceDue: 900,
    secondaryStatus: "CABINET_INSTALL_ONLY",
    createdAt: subDays(today, 20),
  },

  // Commercial / big projects
  {
    id: "proj-14", projectNumber: "TMG-2024-014", name: "Oakwood Restaurant Bar & Counter",
    jobType: "COMMERCIAL", status: "IN_FABRICATION", priority: "URGENT",
    customerId: "cust-11", contractorId: null, assignedToId: "user-1",
    jobAddress: "2100 Westheimer Rd", jobCity: "Houston", jobState: "TX",
    totalEstimate: 28000, deposit: 14000, balanceDue: 14000,
    secondaryStatus: "COMMERCIAL_PROJECT",
    createdAt: subDays(today, 60),
  },
  {
    id: "proj-15", projectNumber: "TMG-2024-015", name: "Metro Office Lobby & Reception",
    jobType: "COMMERCIAL", status: "MATERIAL_ORDERED", priority: "HIGH",
    customerId: "cust-12", contractorId: "contractor-3", assignedToId: "user-1",
    jobAddress: "500 Main St", jobCity: "Houston", jobState: "TX",
    totalEstimate: 42000, deposit: 21000, balanceDue: 21000,
    secondaryStatus: "COMMERCIAL_PROJECT",
    createdAt: subDays(today, 45),
  },
];

// ─── Payments ───────────────────────────────────────────────────────────────

export const payments = [
  { id: "pay-1", projectId: "proj-5", invoiceNumber: "INV-2024-005", paymentType: "DEPOSIT", amount: 3750, status: "PAID", paymentMethod: "CREDIT_CARD", paidDate: subDays(today, 14), dueDate: subDays(today, 16) },
  { id: "pay-2", projectId: "proj-6", invoiceNumber: "INV-2024-006", paymentType: "DEPOSIT", amount: 1600, status: "PAID", paymentMethod: "CHECK", paidDate: subDays(today, 18), dueDate: subDays(today, 20) },
  { id: "pay-3", projectId: "proj-7", invoiceNumber: "INV-2024-007", paymentType: "DEPOSIT", amount: 2900, status: "PAID", paymentMethod: "ZELLE", paidDate: subDays(today, 25), dueDate: subDays(today, 28) },
  { id: "pay-4", projectId: "proj-8", invoiceNumber: "INV-2024-008", paymentType: "DEPOSIT", amount: 3100, status: "PAID", paymentMethod: "CREDIT_CARD", paidDate: subDays(today, 30), dueDate: subDays(today, 32) },
  { id: "pay-5", projectId: "proj-9", invoiceNumber: "INV-2024-009", paymentType: "DEPOSIT", amount: 1400, status: "PAID", paymentMethod: "CASH", paidDate: subDays(today, 40), dueDate: subDays(today, 42) },
  { id: "pay-6", projectId: "proj-9", invoiceNumber: "INV-2024-009F", paymentType: "FINAL", amount: 1400, status: "OVERDUE", paymentMethod: null, paidDate: null, dueDate: subDays(today, 5) },
  { id: "pay-7", projectId: "proj-11", invoiceNumber: "INV-2024-011", paymentType: "DEPOSIT", amount: 250, status: "PAID", paymentMethod: "ZELLE", paidDate: subDays(today, 7), dueDate: subDays(today, 8) },
  { id: "pay-8", projectId: "proj-14", invoiceNumber: "INV-2024-014", paymentType: "DEPOSIT", amount: 14000, status: "PAID", paymentMethod: "TRANSFER", paidDate: subDays(today, 55), dueDate: subDays(today, 58) },
  { id: "pay-9", projectId: "proj-15", invoiceNumber: "INV-2024-015", paymentType: "DEPOSIT", amount: 21000, status: "PAID", paymentMethod: "TRANSFER", paidDate: subDays(today, 40), dueDate: subDays(today, 43) },
  { id: "pay-10", projectId: "proj-12", invoiceNumber: "INV-2024-012", paymentType: "DEPOSIT", amount: 1100, status: "PENDING", paymentMethod: null, paidDate: null, dueDate: addDays(today, 3) },
];

// ─── Schedule Events ────────────────────────────────────────────────────────

export const scheduleEvents = [
  {
    id: "evt-1", projectId: "proj-2", eventType: "MEASUREMENT", title: "Thompson Bath Measurement",
    startTime: setMinutes(setHours(addDays(today, 1), 9), 0),
    endTime: setMinutes(setHours(addDays(today, 1), 10), 0),
    location: "567 Elm Street, Houston, TX", assignedToId: "user-6", assignedTeam: ["Mike Johnson"],
    status: "SCHEDULED",
  },
  {
    id: "evt-2", projectId: "proj-8", eventType: "INSTALLATION", title: "Brown Master Bath Install",
    startTime: setMinutes(setHours(addDays(today, 1), 8), 0),
    endTime: setMinutes(setHours(addDays(today, 1), 14), 0),
    location: "789 Spruce Ln, The Woodlands, TX", assignedToId: "user-3", assignedTeam: ["Carlos Rivera", "James Wilson"],
    status: "CONFIRMED",
  },
  {
    id: "evt-3", projectId: "proj-11", eventType: "REPAIR_VISIT", title: "Kim Seam Repair",
    startTime: setMinutes(setHours(addDays(today, 2), 10), 0),
    endTime: setMinutes(setHours(addDays(today, 2), 12), 0),
    location: "456 Cypress Way, Missouri City, TX", assignedToId: "user-3", assignedTeam: ["Carlos Rivera"],
    status: "SCHEDULED",
  },
  {
    id: "evt-4", projectId: "proj-7", eventType: "FABRICATION", title: "Lee Kitchen Quartz Fabrication",
    startTime: setMinutes(setHours(today, 7), 0),
    endTime: setMinutes(setHours(today, 16), 0),
    location: "Shop", assignedToId: "user-5", assignedTeam: ["David Kim"],
    status: "IN_PROGRESS",
  },
  {
    id: "evt-5", projectId: "proj-14", eventType: "FABRICATION", title: "Oakwood Restaurant Counters Fab",
    startTime: setMinutes(setHours(addDays(today, 3), 7), 0),
    endTime: setMinutes(setHours(addDays(today, 5), 16), 0),
    location: "Shop", assignedToId: "user-5", assignedTeam: ["David Kim", "Carlos Rivera"],
    status: "SCHEDULED",
  },
  {
    id: "evt-6", projectId: "proj-3", eventType: "CONSULTATION", title: "Rivera Kitchen Consultation",
    startTime: setMinutes(setHours(addDays(today, 1), 14), 0),
    endTime: setMinutes(setHours(addDays(today, 1), 15), 0),
    location: "890 Pine Ave, Sugar Land, TX", assignedToId: "user-2", assignedTeam: ["Maria Torres"],
    status: "SCHEDULED",
  },
  {
    id: "evt-7", projectId: "proj-10", eventType: "MEASUREMENT", title: "Martinez Chip Repair Assessment",
    startTime: setMinutes(setHours(addDays(today, 3), 11), 0),
    endTime: setMinutes(setHours(addDays(today, 3), 12), 0),
    location: "1234 Oak Lane, Houston, TX", assignedToId: "user-6", assignedTeam: ["Mike Johnson"],
    status: "SCHEDULED",
  },
  {
    id: "evt-8", projectId: "proj-5", eventType: "INSTALLATION", title: "Davis Outdoor Kitchen Install",
    startTime: setMinutes(setHours(addDays(today, 5), 8), 0),
    endTime: setMinutes(setHours(addDays(today, 5), 16), 0),
    location: "678 Cedar Blvd, Houston, TX", assignedToId: "user-3", assignedTeam: ["Carlos Rivera", "James Wilson"],
    status: "SCHEDULED",
  },
];

// ─── Consultation Forms ─────────────────────────────────────────────────────

export const consultationForms = [
  {
    id: "consult-1", customerName: "Maria Martinez", phone: "555-300-0001", email: "maria.martinez@email.com",
    address: "1234 Oak Lane, Houston, TX", customerType: "DIRECT", contractorName: null,
    projectType: "Countertop", areaOfWork: "Kitchen", materialPref: "Granite", colorPref: "Santa Cecilia",
    edgePref: "Bullnose", measurementNeeded: true, estimateRequested: true, followUpRequired: true,
    generalNotes: "Customer wants gold/brown granite for kitchen. Has existing tile backsplash to keep. Undermount sink.",
    status: "converted", createdAt: subDays(today, 5), customerId: "cust-1", projectId: "proj-1",
  },
  {
    id: "consult-2", customerName: "Amanda Wilson", phone: "555-300-0009", email: "a.wilson@email.com",
    address: "123 Ash Ct, Houston, TX", customerType: "DIRECT", contractorName: null,
    projectType: "Countertop", areaOfWork: "Bar", materialPref: "Granite", colorPref: "Absolute Black",
    edgePref: "Beveled", measurementNeeded: true, estimateRequested: true, followUpRequired: false,
    generalNotes: "Wet bar in game room. Wants polished black granite with waterfall edge on one side.",
    status: "converted", createdAt: subDays(today, 48), customerId: "cust-9", projectId: "proj-9",
  },
  {
    id: "consult-3", customerName: "Jennifer Park", phone: "555-300-0020", email: "j.park@email.com",
    address: "789 River Oaks Blvd, Houston, TX", customerType: "DIRECT", contractorName: null,
    projectType: "Countertop", areaOfWork: "Kitchen, Bathroom", materialPref: "Quartz", colorPref: "Calacatta Laza",
    edgePref: "Mitered", measurementNeeded: true, estimateRequested: true, followUpRequired: true,
    generalNotes: "Large kitchen island with waterfall + 2 bathroom vanities. Premium quartz. Budget is flexible for the right look.",
    status: "new", createdAt: subDays(today, 1), customerId: null, projectId: null,
  },
];

// ─── Project Milestones (for commercial jobs) ───────────────────────────────

export const projectMilestones = [
  { id: "ms-1", projectId: "proj-14", name: "Demo & Prep", phase: "Phase 1", status: "completed", sortOrder: 1, completedAt: subDays(today, 30) },
  { id: "ms-2", projectId: "proj-14", name: "Template & Layout", phase: "Phase 1", status: "completed", sortOrder: 2, completedAt: subDays(today, 20) },
  { id: "ms-3", projectId: "proj-14", name: "Bar Top Fabrication", phase: "Phase 2", status: "in_progress", sortOrder: 3, dueDate: addDays(today, 5) },
  { id: "ms-4", projectId: "proj-14", name: "Counter Fabrication", phase: "Phase 2", status: "pending", sortOrder: 4, dueDate: addDays(today, 10) },
  { id: "ms-5", projectId: "proj-14", name: "Installation", phase: "Phase 3", status: "pending", sortOrder: 5, dueDate: addDays(today, 15) },
  { id: "ms-6", projectId: "proj-14", name: "Final Punch List", phase: "Phase 3", status: "pending", sortOrder: 6, dueDate: addDays(today, 20) },
  { id: "ms-7", projectId: "proj-15", name: "Material Selection & Order", phase: "Phase 1", status: "completed", sortOrder: 1, completedAt: subDays(today, 10) },
  { id: "ms-8", projectId: "proj-15", name: "Lobby Reception Desk Template", phase: "Phase 1", status: "in_progress", sortOrder: 2, dueDate: addDays(today, 7) },
  { id: "ms-9", projectId: "proj-15", name: "Fabrication - Reception", phase: "Phase 2", status: "pending", sortOrder: 3, dueDate: addDays(today, 20) },
  { id: "ms-10", projectId: "proj-15", name: "Fabrication - Conference Room", phase: "Phase 2", status: "pending", sortOrder: 4, dueDate: addDays(today, 30) },
  { id: "ms-11", projectId: "proj-15", name: "Installation - All Areas", phase: "Phase 3", status: "pending", sortOrder: 5, dueDate: addDays(today, 40) },
  { id: "ms-12", projectId: "proj-15", name: "Final Walkthrough", phase: "Phase 3", status: "pending", sortOrder: 6, dueDate: addDays(today, 45) },
];

// ─── Helper: monthly revenue mock ───────────────────────────────────────────

export const monthlyRevenue = [
  { month: "Oct", revenue: 32000, costs: 14000 },
  { month: "Nov", revenue: 28000, costs: 12000 },
  { month: "Dec", revenue: 22000, costs: 9500 },
  { month: "Jan", revenue: 38000, costs: 16000 },
  { month: "Feb", revenue: 45000, costs: 19000 },
  { month: "Mar", revenue: 41000, costs: 17500 },
];
