import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];

    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), "public", "uploads", "hotels");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      console.log("Directory creation skipped or already exists");
    }

    for (const file of files) {
      if (!file || file.size === 0) {
        console.log("Skipping empty file");
        continue;
      }

      console.log("Processing file:", file.name, "Size:", file.size);

      try {
        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        const filename = `${timestamp}-${random}-${file.name.replace(/\s+/g, "-")}`;
        
        // Save file
        const filepath = join(uploadsDir, filename);
        await writeFile(filepath, buffer);
        console.log("File saved successfully:", filepath);

        // Return the public URL path
        const publicPath = `/uploads/hotels/${filename}`;
        uploadedUrls.push(publicPath);
      } catch (fileError) {
        console.error("Error uploading individual file:", fileError);
        // Continue processing other files
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { error: "Failed to upload any files" },
        { status: 500 }
      );
    }

    return NextResponse.json({ urls: uploadedUrls }, { status: 200 });
  } catch (error) {
    console.error("Error uploading files:", error);
    return NextResponse.json(
      { error: `Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
