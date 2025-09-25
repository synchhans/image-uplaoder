// src/app/api/upload/route.ts

import { NextResponse } from "next/server";
import { s3Client } from "@/lib/r2"; // Impor S3 client kita
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    // Baca file menjadi buffer
    const body = await file.arrayBuffer();
    const buffer = Buffer.from(body);

    const uniqueFileName = `${Date.now()}-${file.name}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: uniqueFileName,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${uniqueFileName}`;

    return NextResponse.json({
      message: "File uploaded successfully!",
      url: publicUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Error uploading file.", details: errorMessage },
      { status: 500 }
    );
  }
}
