import { NextRequest, NextResponse } from "next/server";
import { getProjects, createProject } from "@/lib/db";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  try {
    const result = await getProjects({
      status: sp.get("status") || undefined,
      jobType: sp.get("jobType") || undefined,
      priority: sp.get("priority") || undefined,
      customerId: sp.get("customerId") || undefined,
      contractorId: sp.get("contractorId") || undefined,
      search: sp.get("search") || undefined,
      page: parseInt(sp.get("page") || "1"),
      limit: parseInt(sp.get("limit") || "50"),
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.customerId) {
      return NextResponse.json({ error: "name and customerId are required" }, { status: 400 });
    }
    const project = await createProject(body);
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
