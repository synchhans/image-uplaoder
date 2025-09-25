// src/app/page.tsx

"use client"; // Ini WAJIB karena kita menggunakan state dan event handler

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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
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
      <h1>Upload File ke Cloudflare R2 (Next.js App Router)</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <input type="file" onChange={handleFileChange} />
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
            padding: "10px",
            border: `1px solid ${status === "success" ? "green" : "red"}`,
            borderRadius: "5px",
          }}
        >
          <p>{result.message}</p>
          {status === "success" && result.url && (
            <p>
              File URL:{" "}
              <a href={result.url} target="_blank" rel="noopener noreferrer">
                {result.url}
              </a>
            </p>
          )}
        </div>
      )}
    </main>
  );
}
