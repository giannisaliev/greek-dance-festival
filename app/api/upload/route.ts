import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

// Configure route to accept larger payloads (10MB)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

    for (const file of files) {
      if (!file || file.size === 0) {
        console.log("Skipping empty file");
        continue;
      }

      console.log("Processing file:", file.name, "Size:", file.size);

      try {
        // Create unique filename
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        const filename = `hotels/${timestamp}-${random}-${file.name.replace(/\s+/g, "-")}`;
        
        // Upload to Vercel Blob
        const blob = await put(filename, file, {
          access: 'public',
        });

        console.log("File uploaded successfully:", blob.url);
        uploadedUrls.push(blob.url);
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
