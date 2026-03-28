import { NextRequest, NextResponse } from "next/server";
import { createProjectNote } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    if (!body.content) return NextResponse.json({ error: "content is required" }, { status: 400 });
    const note = await createProjectNote({ projectId: id, content: body.content, authorId: body.authorId, isInternal: body.isInternal });
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
