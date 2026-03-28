import { NextRequest, NextResponse } from "next/server";
import { createProjectFile } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string;
    const category = formData.get("category") as string;
    const phase = formData.get("phase") as string | null;

    if (!file || !projectId || !category) {
      return NextResponse.json({ error: "file, projectId, and category are required" }, { status: 400 });
    }

    // Determine file type
    const mimeType = file.type;
    let fileType = "OTHER";
    if (mimeType.startsWith("image/")) fileType = "IMAGE";
    else if (mimeType === "application/pdf") fileType = "PDF";
    else if (mimeType.startsWith("text/") || mimeType.includes("document")) fileType = "DOCUMENT";

    // In production, upload to Supabase Storage:
    // const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    // const bytes = await file.arrayBuffer();
    // const path = `projects/${projectId}/${category}/${Date.now()}-${file.name}`;
    // const { data, error } = await supabase.storage.from('project-files').upload(path, bytes, { contentType: mimeType });
    // const fileUrl = supabase.storage.from('project-files').getPublicUrl(path).data.publicUrl;

    // For now, use a placeholder URL
    const fileUrl = `/uploads/${projectId}/${Date.now()}-${file.name}`;

    const record = await createProjectFile({
      projectId,
      fileName: file.name,
      fileUrl,
      fileType,
      category,
      fileSize: file.size,
      mimeType,
      phase: phase || undefined,
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
