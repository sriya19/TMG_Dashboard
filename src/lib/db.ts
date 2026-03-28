/**
 * Database access layer with seed-data fallback.
 * When DATABASE_URL is not configured or Prisma connection fails,
 * falls back to in-memory seed data for development/demo mode.
 */

import { prisma } from "./prisma";
import * as seedData from "./seed-data";

// Check if we're in demo/seed mode (no DB connected)
let _useSeedData: boolean | null = null;

async function useSeedData(): Promise<boolean> {
  if (_useSeedData !== null) return _useSeedData;
  if (!prisma) {
    _useSeedData = true;
    return true;
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    _useSeedData = false;
  } catch {
    console.warn("[DB] No database connection - using seed data fallback");
    _useSeedData = true;
  }
  return _useSeedData;
}

// ---------- Projects ----------

export async function getProjects(filters?: {
  status?: string;
  jobType?: string;
  priority?: string;
  customerId?: string;
  contractorId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  if (await useSeedData()) {
    let filtered = [...seedData.projects];
    if (filters?.status) filtered = filtered.filter(p => p.status === filters.status);
    if (filters?.jobType) filtered = filtered.filter(p => p.jobType === filters.jobType);
    if (filters?.priority) filtered = filtered.filter(p => p.priority === filters.priority);
    if (filters?.customerId) filtered = filtered.filter(p => p.customerId === filters.customerId);
    if (filters?.contractorId) filtered = filtered.filter(p => p.contractorId === filters.contractorId);
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(s) || p.projectNumber.toLowerCase().includes(s)
      );
    }
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const start = (page - 1) * limit;
    // Attach customer and contractor data
    const enriched = filtered.map(p => ({
      ...p,
      customer: seedData.customers.find(c => c.id === p.customerId),
      contractor: p.contractorId ? seedData.contractors.find(c => c.id === p.contractorId) : null,
      assignedTo: p.assignedToId ? seedData.users.find(u => u.id === p.assignedToId) : null,
    }));
    return {
      projects: enriched.slice(start, start + limit),
      total: filtered.length,
      page,
      limit,
    };
  }

  const where: Record<string, unknown> = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.jobType) where.jobType = filters.jobType;
  if (filters?.priority) where.priority = filters.priority;
  if (filters?.customerId) where.customerId = filters.customerId;
  if (filters?.contractorId) where.contractorId = filters.contractorId;
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { projectNumber: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: { customer: true, contractor: true, assignedTo: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.project.count({ where }),
  ]);
  return { projects, total, page, limit };
}

export async function getProject(id: string) {
  if (await useSeedData()) {
    const project = seedData.projects.find(p => p.id === id);
    if (!project) return null;
    return {
      ...project,
      customer: seedData.customers.find(c => c.id === project.customerId),
      contractor: project.contractorId ? seedData.contractors.find(c => c.id === project.contractorId) : null,
      assignedTo: project.assignedToId ? seedData.users.find(u => u.id === project.assignedToId) : null,
      payments: seedData.payments.filter(p => p.projectId === project.id),
      scheduleEvents: seedData.scheduleEvents.filter(e => e.projectId === project.id),
      milestones: seedData.projectMilestones.filter(m => m.projectId === project.id),
      scope: null, // seed data doesn't have scope records
      materials: [],
      statusHistory: [],
      files: [],
      projectNotes: [],
      communications: [],
    };
  }

  return prisma.project.findUnique({
    where: { id },
    include: {
      customer: true,
      contractor: true,
      assignedTo: true,
      scope: true,
      materials: true,
      payments: { orderBy: { createdAt: "desc" } },
      scheduleEvents: { include: { assignedTo: true }, orderBy: { startTime: "asc" } },
      statusHistory: { include: { changedBy: true }, orderBy: { createdAt: "desc" } },
      files: { orderBy: { createdAt: "desc" } },
      projectNotes: { include: { author: true }, orderBy: { createdAt: "desc" } },
      communications: { orderBy: { createdAt: "desc" } },
      milestones: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function createProject(data: {
  name: string;
  jobType: string;
  customerId: string;
  contractorId?: string;
  priority?: string;
  jobAddress?: string;
  jobCity?: string;
  jobState?: string;
  jobZip?: string;
  notes?: string;
  assignedToId?: string;
}) {
  if (await useSeedData()) {
    const id = `proj-${Date.now()}`;
    const projectNumber = `TMG-${new Date().getFullYear()}-${String(seedData.projects.length + 1).padStart(3, "0")}`;
    const newProject = {
      id,
      projectNumber,
      ...data,
      status: "NEW_LEAD" as const,
      secondaryStatus: null,
      priority: (data.priority || "MEDIUM") as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
      jobType: data.jobType as "COUNTERTOP" | "REPAIR" | "CABINET_INSTALL" | "COMMERCIAL",
      contractorId: data.contractorId || null,
      assignedToId: data.assignedToId || null,
      jobAddress: data.jobAddress || null,
      jobCity: data.jobCity || null,
      jobState: data.jobState || null,
      jobZip: data.jobZip || null,
      sqft: null, linearFt: null, laborRate: null, stoneRate: null,
      edgePrice: null, sinkCutoutPrice: null, backsplashPrice: null,
      waterfallPrice: null, additionalCosts: null, totalEstimate: null,
      deposit: null, finalPayment: null, balanceDue: null,
      estimateDate: null, approvalDate: null, depositPaidDate: null,
      finalPaidDate: null, completionDate: null,
      notes: data.notes || null, internalNotes: null,
      aiSummary: null, aiNextSteps: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    seedData.projects.push(newProject as any);
    return newProject;
  }

  const count = await prisma.project.count();
  const projectNumber = `TMG-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;

  const project = await prisma.project.create({
    data: {
      projectNumber,
      name: data.name,
      jobType: data.jobType as any,
      customerId: data.customerId,
      contractorId: data.contractorId || undefined,
      priority: (data.priority as any) || "MEDIUM",
      assignedToId: data.assignedToId || undefined,
      jobAddress: data.jobAddress,
      jobCity: data.jobCity,
      jobState: data.jobState,
      jobZip: data.jobZip,
      notes: data.notes,
    },
    include: { customer: true, contractor: true },
  });

  await prisma.statusHistory.create({
    data: {
      projectId: project.id,
      toStatus: "NEW_LEAD",
      note: "Project created",
    },
  });

  return project;
}

export async function updateProject(id: string, data: Record<string, unknown>) {
  if (await useSeedData()) {
    const idx = seedData.projects.findIndex(p => p.id === id);
    if (idx === -1) return null;
    const oldProject = seedData.projects[idx];
    const updated = { ...oldProject, ...data, updatedAt: new Date().toISOString() };
    seedData.projects[idx] = updated as typeof oldProject;
    return updated;
  }

  // Handle status change logging
  if (data.status) {
    const current = await prisma.project.findUnique({ where: { id }, select: { status: true } });
    if (current && current.status !== data.status) {
      await prisma.statusHistory.create({
        data: {
          projectId: id,
          fromStatus: current.status,
          toStatus: data.status as any,
          changedById: (data.changedById as string) || undefined,
          note: (data.statusNote as string) || undefined,
        },
      });
    }
    delete data.changedById;
    delete data.statusNote;
  }

  return prisma.project.update({
    where: { id },
    data: data as any,
    include: { customer: true, contractor: true, assignedTo: true },
  });
}

// ---------- Customers ----------

export async function getCustomers(filters?: {
  type?: string;
  search?: string;
  contractorId?: string;
}) {
  if (await useSeedData()) {
    let filtered = [...seedData.customers];
    if (filters?.type) filtered = filtered.filter(c => c.customerType === filters.type);
    if (filters?.contractorId) filtered = filtered.filter(c => c.contractorId === filters.contractorId);
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(s) ||
        c.phone.includes(s) ||
        (c.email && c.email.toLowerCase().includes(s))
      );
    }
    return filtered.map(c => ({
      ...c,
      contractor: c.contractorId ? seedData.contractors.find(ct => ct.id === c.contractorId) : null,
    }));
  }

  const where: Record<string, unknown> = {};
  if (filters?.type) where.customerType = filters.type;
  if (filters?.contractorId) where.contractorId = filters.contractorId;
  if (filters?.search) {
    where.OR = [
      { firstName: { contains: filters.search, mode: "insensitive" } },
      { lastName: { contains: filters.search, mode: "insensitive" } },
      { phone: { contains: filters.search } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  return prisma.customer.findMany({ where, include: { contractor: true }, orderBy: { createdAt: "desc" } });
}

export async function createCustomer(data: {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  customerType?: string;
  contractorId?: string;
  notes?: string;
}) {
  if (await useSeedData()) {
    const newCustomer = {
      id: `cust-${Date.now()}`,
      ...data,
      email: data.email || null,
      altPhone: null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      zip: data.zip || null,
      customerType: (data.customerType || "DIRECT") as "DIRECT" | "CONTRACTOR_REFERRED",
      contractorId: data.contractorId || null,
      notes: data.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    seedData.customers.push(newCustomer as any);
    return newCustomer;
  }

  return prisma.customer.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      customerType: (data.customerType as any) || "DIRECT",
      contractorId: data.contractorId || undefined,
      notes: data.notes,
    },
    include: { contractor: true },
  });
}

// ---------- Contractors ----------

export async function getContractors(filters?: { search?: string }) {
  if (await useSeedData()) {
    let filtered = [...seedData.contractors];
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(c =>
        c.companyName.toLowerCase().includes(s) || c.contactName.toLowerCase().includes(s)
      );
    }
    return filtered;
  }

  const where: Record<string, unknown> = {};
  if (filters?.search) {
    where.OR = [
      { companyName: { contains: filters.search, mode: "insensitive" } },
      { contactName: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  return prisma.contractor.findMany({ where, orderBy: { companyName: "asc" } });
}

export async function createContractor(data: {
  companyName?: string;
  name?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  specialty?: string;
}) {
  const companyName = data.companyName || data.name || "New Contractor";
  const contactName = data.contactName || companyName;

  if (await useSeedData()) {
    const newContractor = {
      id: `contractor-${Date.now()}`,
      companyName,
      contactName,
      email: data.email || null,
      phone: data.phone || "",
      altPhone: null,
      address: null,
      city: null,
      state: null,
      zip: null,
      licenseNumber: null,
      specialty: data.specialty || null,
      rating: 5,
      notes: null,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    seedData.contractors.push(newContractor as any);
    return newContractor;
  }

  return prisma.contractor.create({
    data: { companyName, contactName, phone: data.phone || "", email: data.email, specialty: data.specialty },
  });
}

// ---------- Payments ----------

export async function getPayments(filters?: {
  status?: string;
  type?: string;
  projectId?: string;
}) {
  if (await useSeedData()) {
    let filtered = [...seedData.payments];
    if (filters?.status) filtered = filtered.filter(p => p.status === filters.status);
    if (filters?.type) filtered = filtered.filter(p => p.paymentType === filters.type);
    if (filters?.projectId) filtered = filtered.filter(p => p.projectId === filters.projectId);
    return filtered.map(p => ({
      ...p,
      project: seedData.projects.find(pr => pr.id === p.projectId),
    }));
  }

  const where: Record<string, unknown> = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.type) where.paymentType = filters.type;
  if (filters?.projectId) where.projectId = filters.projectId;
  return prisma.payment.findMany({
    where,
    include: { project: { include: { customer: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createPayment(data: {
  projectId: string;
  paymentType: string;
  amount: number;
  paymentMethod?: string;
  invoiceNumber?: string;
  dueDate?: string;
  notes?: string;
}) {
  if (await useSeedData()) {
    const newPayment = {
      id: `pay-${Date.now()}`,
      projectId: data.projectId,
      invoiceNumber: data.invoiceNumber || null,
      qbReference: null,
      paymentType: data.paymentType as "DEPOSIT" | "PROGRESS" | "FINAL" | "REFUND",
      paymentMethod: (data.paymentMethod as any) || null,
      amount: data.amount,
      status: "PENDING" as const,
      dueDate: data.dueDate || null,
      paidDate: null,
      notes: data.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    seedData.payments.push(newPayment as any);
    return newPayment;
  }

  return prisma.payment.create({
    data: {
      projectId: data.projectId,
      paymentType: data.paymentType as any,
      amount: data.amount,
      paymentMethod: data.paymentMethod as any || undefined,
      invoiceNumber: data.invoiceNumber,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      notes: data.notes,
    },
    include: { project: true },
  });
}

export async function updatePayment(id: string, data: Record<string, unknown>) {
  if (await useSeedData()) {
    const idx = seedData.payments.findIndex(p => p.id === id);
    if (idx === -1) return null;
    const updated = { ...seedData.payments[idx], ...data, updatedAt: new Date().toISOString() };
    seedData.payments[idx] = updated as typeof seedData.payments[0];
    return updated;
  }
  return prisma.payment.update({ where: { id }, data: data as any });
}

// ---------- Schedule Events ----------

export async function getScheduleEvents(filters?: {
  startDate?: string;
  endDate?: string;
  eventType?: string;
  projectId?: string;
}) {
  if (await useSeedData()) {
    let filtered = [...seedData.scheduleEvents];
    if (filters?.eventType) filtered = filtered.filter(e => e.eventType === filters.eventType);
    if (filters?.projectId) filtered = filtered.filter(e => e.projectId === filters.projectId);
    if (filters?.startDate) {
      const start = new Date(filters.startDate);
      filtered = filtered.filter(e => new Date(e.startTime) >= start);
    }
    if (filters?.endDate) {
      const end = new Date(filters.endDate);
      filtered = filtered.filter(e => new Date(e.startTime) <= end);
    }
    return filtered.map(e => ({
      ...e,
      project: seedData.projects.find(p => p.id === e.projectId),
    }));
  }

  const where: Record<string, unknown> = {};
  if (filters?.eventType) where.eventType = filters.eventType;
  if (filters?.projectId) where.projectId = filters.projectId;
  if (filters?.startDate || filters?.endDate) {
    where.startTime = {};
    if (filters?.startDate) (where.startTime as Record<string, unknown>).gte = new Date(filters.startDate);
    if (filters?.endDate) (where.startTime as Record<string, unknown>).lte = new Date(filters.endDate);
  }
  return prisma.scheduleEvent.findMany({
    where,
    include: { project: { include: { customer: true } }, assignedTo: true },
    orderBy: { startTime: "asc" },
  });
}

export async function createScheduleEvent(data: {
  projectId: string;
  eventType: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  location?: string;
  assignedToId?: string;
  assignedTeam?: string[];
  notes?: string;
}) {
  if (await useSeedData()) {
    const newEvent = {
      id: `event-${Date.now()}`,
      projectId: data.projectId,
      eventType: data.eventType as any,
      title: data.title,
      description: data.description || null,
      startTime: data.startTime,
      endTime: data.endTime || null,
      allDay: false,
      location: data.location || null,
      gcalEventId: null,
      assignedToId: data.assignedToId || null,
      assignedTeam: data.assignedTeam || [],
      status: "SCHEDULED" as const,
      notes: data.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    seedData.scheduleEvents.push(newEvent as any);
    return newEvent;
  }

  return prisma.scheduleEvent.create({
    data: {
      projectId: data.projectId,
      eventType: data.eventType as any,
      title: data.title,
      description: data.description,
      startTime: new Date(data.startTime),
      endTime: data.endTime ? new Date(data.endTime) : undefined,
      location: data.location,
      assignedToId: data.assignedToId || undefined,
      assignedTeam: data.assignedTeam || [],
      notes: data.notes,
    },
    include: { project: { include: { customer: true } }, assignedTo: true },
  });
}

// ---------- Consultations ----------

export async function getConsultations(filters?: { status?: string }) {
  if (await useSeedData()) {
    let filtered = [...seedData.consultationForms];
    if (filters?.status) filtered = filtered.filter(c => c.status === filters.status);
    return filtered;
  }

  const where: Record<string, unknown> = {};
  if (filters?.status) where.status = filters.status;
  return prisma.consultationForm.findMany({ where, orderBy: { createdAt: "desc" } });
}

export async function createConsultation(data: {
  customerName: string;
  phone: string;
  email?: string;
  address?: string;
  customerType?: string;
  contractorName?: string;
  projectType?: string;
  areaOfWork?: string;
  materialPref?: string;
  colorPref?: string;
  finishPref?: string;
  edgePref?: string;
  sinkFaucet?: string;
  backsplash?: string;
  waterfallMiter?: string;
  timeline?: string;
  budgetNotes?: string;
  measurementNeeded?: boolean;
  estimateRequested?: boolean;
  followUpRequired?: boolean;
  generalNotes?: string;
  createProject?: boolean;
}) {
  if (await useSeedData()) {
    const consultation = {
      id: `consult-${Date.now()}`,
      customerId: null,
      projectId: null,
      customerName: data.customerName,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      customerType: data.customerType || "DIRECT",
      contractorName: data.contractorName || null,
      projectType: data.projectType || null,
      areaOfWork: data.areaOfWork || null,
      materialPref: data.materialPref || null,
      colorPref: data.colorPref || null,
      finishPref: data.finishPref || null,
      edgePref: data.edgePref || null,
      sinkFaucet: data.sinkFaucet || null,
      backsplash: data.backsplash || null,
      waterfallMiter: data.waterfallMiter || null,
      timeline: data.timeline || null,
      budgetNotes: data.budgetNotes || null,
      measurementNeeded: data.measurementNeeded || false,
      estimateRequested: data.estimateRequested || false,
      followUpRequired: data.followUpRequired || false,
      photoUrls: [] as string[],
      generalNotes: data.generalNotes || null,
      status: "new" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // If createProject, also create customer + project
    let project = null;
    let customer = null;
    if (data.createProject) {
      const nameParts = data.customerName.trim().split(/\s+/);
      customer = await createCustomer({
        firstName: nameParts[0] || data.customerName,
        lastName: nameParts.slice(1).join(" ") || "",
        phone: data.phone,
        email: data.email,
        address: data.address,
        customerType: data.customerType === "Contractor Referred" ? "CONTRACTOR_REFERRED" : "DIRECT",
      });

      const jobTypeMap: Record<string, string> = {
        "Countertop": "COUNTERTOP",
        "Repair": "REPAIR",
        "Cabinet Install": "CABINET_INSTALL",
        "Commercial": "COMMERCIAL",
      };

      project = await createProject({
        name: `${data.customerName} - ${data.projectType || "New Project"}`,
        jobType: jobTypeMap[data.projectType || ""] || "COUNTERTOP",
        customerId: customer.id,
        jobAddress: data.address,
        notes: data.generalNotes,
      });
      consultation.customerId = customer.id;
      consultation.projectId = project.id;
      consultation.status = "converted" as any;
    }

    seedData.consultationForms.push(consultation as any);
    return { consultation, customer, project };
  }

  // Real DB path
  const consultation = await prisma.consultationForm.create({
    data: {
      customerName: data.customerName,
      phone: data.phone,
      email: data.email,
      address: data.address,
      customerType: (data.customerType === "Contractor Referred" ? "CONTRACTOR_REFERRED" : "DIRECT") as any,
      contractorName: data.contractorName,
      projectType: data.projectType,
      areaOfWork: data.areaOfWork,
      materialPref: data.materialPref,
      colorPref: data.colorPref,
      finishPref: data.finishPref,
      edgePref: data.edgePref,
      sinkFaucet: data.sinkFaucet,
      backsplash: data.backsplash,
      waterfallMiter: data.waterfallMiter,
      timeline: data.timeline,
      budgetNotes: data.budgetNotes,
      measurementNeeded: data.measurementNeeded || false,
      estimateRequested: data.estimateRequested || false,
      followUpRequired: data.followUpRequired || false,
      generalNotes: data.generalNotes,
    },
  });

  let project = null;
  let customer = null;
  if (data.createProject) {
    const nameParts = data.customerName.trim().split(/\s+/);
    customer = await createCustomer({
      firstName: nameParts[0] || data.customerName,
      lastName: nameParts.slice(1).join(" ") || "",
      phone: data.phone,
      email: data.email,
      address: data.address,
      customerType: data.customerType === "Contractor Referred" ? "CONTRACTOR_REFERRED" : "DIRECT",
    });

    const jobTypeMap: Record<string, string> = {
      "Countertop": "COUNTERTOP",
      "Repair": "REPAIR",
      "Cabinet Install": "CABINET_INSTALL",
      "Commercial": "COMMERCIAL",
    };

    project = await createProject({
      name: `${data.customerName} - ${data.projectType || "New Project"}`,
      jobType: jobTypeMap[data.projectType || ""] || "COUNTERTOP",
      customerId: customer.id,
      jobAddress: data.address,
      notes: data.generalNotes,
    });

    await prisma.consultationForm.update({
      where: { id: consultation.id },
      data: { customerId: customer.id, projectId: project.id, status: "COMPLETED" },
    });
  }

  return { consultation, customer, project };
}

// ---------- Notes ----------

export async function createProjectNote(data: {
  projectId: string;
  content: string;
  authorId?: string;
  isInternal?: boolean;
}) {
  if (await useSeedData()) {
    return {
      id: `note-${Date.now()}`,
      ...data,
      authorId: data.authorId || null,
      isInternal: data.isInternal ?? true,
      createdAt: new Date().toISOString(),
    };
  }

  return prisma.projectNote.create({
    data: {
      projectId: data.projectId,
      content: data.content,
      authorId: data.authorId || undefined,
      isInternal: data.isInternal ?? true,
    },
    include: { author: true },
  });
}

// ---------- Files ----------

export async function createProjectFile(data: {
  projectId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  category: string;
  fileSize?: number;
  mimeType?: string;
  phase?: string;
  notes?: string;
}) {
  if (await useSeedData()) {
    return {
      id: `file-${Date.now()}`,
      ...data,
      fileSize: data.fileSize || null,
      mimeType: data.mimeType || null,
      phase: data.phase || null,
      notes: data.notes || null,
      createdAt: new Date().toISOString(),
    };
  }

  return prisma.projectFile.create({
    data: {
      projectId: data.projectId,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileType: data.fileType as any,
      category: data.category as any,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      phase: data.phase,
      notes: data.notes,
    },
  });
}

export async function deleteProjectFile(id: string) {
  if (await useSeedData()) return { id };
  return prisma.projectFile.delete({ where: { id } });
}

// ---------- Users ----------

export async function getUsers() {
  if (await useSeedData()) return seedData.users;
  return prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" } });
}

// ---------- Scope ----------

export async function upsertProjectScope(projectId: string, data: Record<string, unknown>) {
  if (await useSeedData()) {
    return { id: `scope-${Date.now()}`, projectId, ...data };
  }

  return prisma.projectScope.upsert({
    where: { projectId },
    create: { projectId, ...data } as any,
    update: data as any,
  });
}

// ---------- Communication Log ----------

export async function createCommunicationLog(data: {
  projectId: string;
  channel: string;
  direction: string;
  recipient?: string;
  subject?: string;
  body: string;
  sentById?: string;
  status?: string;
  externalId?: string;
}) {
  if (await useSeedData()) {
    return {
      id: `comm-${Date.now()}`,
      ...data,
      recipient: data.recipient || null,
      subject: data.subject || null,
      sentById: data.sentById || null,
      status: data.status || null,
      externalId: data.externalId || null,
      createdAt: new Date().toISOString(),
    };
  }

  return prisma.communicationLog.create({
    data: {
      projectId: data.projectId,
      channel: data.channel as any,
      direction: data.direction as any,
      recipient: data.recipient,
      subject: data.subject,
      body: data.body,
      sentById: data.sentById || undefined,
      status: data.status,
      externalId: data.externalId,
    },
  });
}
