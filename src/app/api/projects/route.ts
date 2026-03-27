/**
 * Projects API Route
 *
 * GET  /api/projects - List all projects with filters
 * POST /api/projects - Create a new project
 */

import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with Prisma client when database is connected
// import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const jobType = searchParams.get("jobType");
  const priority = searchParams.get("priority");
  const customerId = searchParams.get("customerId");
  const contractorId = searchParams.get("contractorId");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  try {
    // TODO: Replace with actual Prisma query
    // const where: any = {};
    // if (status) where.status = status;
    // if (jobType) where.jobType = jobType;
    // if (priority) where.priority = priority;
    // if (customerId) where.customerId = customerId;
    // if (contractorId) where.contractorId = contractorId;
    // if (search) {
    //   where.OR = [
    //     { name: { contains: search, mode: "insensitive" } },
    //     { projectNumber: { contains: search, mode: "insensitive" } },
    //   ];
    // }
    //
    // const [projects, total] = await Promise.all([
    //   prisma.project.findMany({
    //     where,
    //     include: { customer: true, contractor: true, assignedTo: true },
    //     orderBy: { createdAt: "desc" },
    //     skip: (page - 1) * limit,
    //     take: limit,
    //   }),
    //   prisma.project.count({ where }),
    // ]);

    return NextResponse.json({
      projects: [],
      total: 0,
      page,
      limit,
      filters: { status, jobType, priority, customerId, contractorId, search },
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Validate input
    // TODO: Create project with Prisma
    // const project = await prisma.project.create({
    //   data: {
    //     projectNumber: generateProjectNumber(),
    //     name: body.name,
    //     jobType: body.jobType,
    //     customerId: body.customerId,
    //     contractorId: body.contractorId,
    //     priority: body.priority || "MEDIUM",
    //     jobAddress: body.jobAddress,
    //     jobCity: body.jobCity,
    //     jobState: body.jobState,
    //     jobZip: body.jobZip,
    //   },
    //   include: { customer: true },
    // });
    //
    // // Create initial status history
    // await prisma.statusHistory.create({
    //   data: {
    //     projectId: project.id,
    //     toStatus: "NEW_LEAD",
    //     note: "Project created",
    //   },
    // });
    //
    // // Trigger automation
    // await automationEngine.processTrigger("project_created", { ... });

    return NextResponse.json({ message: "Project creation endpoint ready", body }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
