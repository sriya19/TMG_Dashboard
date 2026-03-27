/**
 * Single Project API Route
 *
 * GET    /api/projects/[id] - Get project details
 * PATCH  /api/projects/[id] - Update project
 * DELETE /api/projects/[id] - Delete project
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // TODO: Fetch from database
    // const project = await prisma.project.findUnique({
    //   where: { id },
    //   include: {
    //     customer: true,
    //     contractor: true,
    //     assignedTo: true,
    //     scope: true,
    //     materials: true,
    //     payments: true,
    //     scheduleEvents: { include: { assignedTo: true } },
    //     statusHistory: { include: { changedBy: true }, orderBy: { createdAt: "desc" } },
    //     files: { orderBy: { createdAt: "desc" } },
    //     projectNotes: { include: { author: true }, orderBy: { createdAt: "desc" } },
    //     communications: { orderBy: { createdAt: "desc" } },
    //     milestones: { orderBy: { sortOrder: "asc" } },
    //   },
    // });

    return NextResponse.json({ message: "Project detail endpoint ready", id });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  try {
    // TODO: Update project
    // Handle status change with history logging
    // if (body.status) {
    //   const current = await prisma.project.findUnique({ where: { id } });
    //   await prisma.statusHistory.create({
    //     data: {
    //       projectId: id,
    //       fromStatus: current.status,
    //       toStatus: body.status,
    //       changedById: body.changedById,
    //       note: body.statusNote,
    //     },
    //   });
    //   // Trigger automation
    //   await automationEngine.processTrigger("status_changed", { ... });
    // }
    //
    // const updated = await prisma.project.update({ where: { id }, data: body });

    return NextResponse.json({ message: "Project update endpoint ready", id, body });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // TODO: Delete project (cascade deletes handled by Prisma schema)
    // await prisma.project.delete({ where: { id } });

    return NextResponse.json({ message: "Project delete endpoint ready", id });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
