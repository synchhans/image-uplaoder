import { s3Client } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest } from "next/server";

interface RouteContext {
  params: Promise<{
    filename: string;
  }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { filename } = await context.params;

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: filename,
    });

    const r2Response = await s3Client.send(command);

    if (!r2Response.Body) {
      throw new Error("File body not found.");
    }

    const bodyStream = r2Response.Body as unknown as ReadableStream;

    const headers = new Headers();
    if (r2Response.ContentType) {
      headers.set("Content-Type", r2Response.ContentType);
    }
    if (r2Response.ContentLength) {
      headers.set("Content-Length", r2Response.ContentLength.toString());
    }
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new Response(bodyStream, {
      status: 200,
      headers: headers,
    });
  } catch (error: unknown) {
    // Perbaikan di sini
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "NoSuchKey"
    ) {
      return new Response("File not found.", { status: 404 });
    }
    console.error("Error fetching from R2:", error);
    return new Response("Internal server error.", { status: 500 });
  }
}
