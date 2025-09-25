// src/app/page.tsx

"use client";

import { useState, FormEvent, ChangeEvent } from "react";

type UploadStatus = "initial" | "uploading" | "success" | "error";

interface UploadResult {
  message: string;
  url?: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("initial");
  const [result, setResult] = useState<UploadResult | null>(null);

  // Fungsi untuk mengekstrak nama file dari URL R2
  const getFilenameFromUrl = (url: string) => {
    try {
      return new URL(url).pathname.substring(1); // Hapus '/' di awal
    } catch (e) {
      return "";
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setStatus("initial");
      setResult(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setStatus("error");
      setResult({ message: "Please select a file to upload." });
      return;
    }

    setStatus("uploading");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data: UploadResult = await response.json();
      if (response.ok) {
        setStatus("success");
        setResult(data);
      } else {
        setStatus("error");
        setResult(data);
      }
    } catch (_error) {
      // Perbaikan di sini
      setStatus("error");
      setResult({ message: "An unexpected error occurred." });
    }
  };

  return (
    <main
      style={{
        fontFamily: "sans-serif",
        textAlign: "center",
        marginTop: "50px",
        padding: "20px",
      }}
    >
      <h1>Image Proxy dengan Vercel & R2</h1>
      <p style={{ color: "#666" }}>
        URL gambar akan disajikan melalui web ini, bukan dari CDN R2 langsung.
      </p>
      <form onSubmit={handleSubmit}>
        <div>
          <input type="file" onChange={handleFileChange} accept="image/*" />
        </div>
        <button
          type="submit"
          style={{ marginTop: "10px", padding: "8px 16px", cursor: "pointer" }}
          disabled={status === "uploading"}
        >
          {status === "uploading" ? "Uploading..." : "Upload"}
        </button>
      </form>

      {result && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            border: `1px solid ${status === "success" ? "green" : "red"}`,
            borderRadius: "5px",
          }}
        >
          <p>{result.message}</p>

          {status === "success" && result.url && (
            <div>
              {/* Buat URL proxy kita */}
              <p style={{ fontSize: "14px", color: "#555" }}>
                Image URL (Masked):
                <a
                  href={`/cdn/${getFilenameFromUrl(result.url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {`/cdn/${getFilenameFromUrl(result.url)}`}
                </a>
              </p>

              {/* Gunakan URL proxy di tag <img> */}
              <img
                src={`/cdn/${getFilenameFromUrl(result.url)}`}
                alt="Uploaded Preview"
                style={{
                  marginTop: "15px",
                  maxWidth: "100%",
                  maxHeight: "400px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                }}
              />
            </div>
          )}
        </div>
      )}
    </main>
  );
}
