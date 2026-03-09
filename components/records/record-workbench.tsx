"use client";

import type { ChangeEvent } from "react";
import type { Route } from "next";
import Link from "next/link";
import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import type { StatusEvent } from "@/lib/domain/status-history";
import type { WorkRecord } from "@/lib/types";
import { daysUntil, formatDate } from "@/lib/utils";

type RecordComment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};

type RecordAttachment = {
  id: string;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
  downloadUrl?: string;
};

type RecordMeta = {
  comments: RecordComment[];
  attachments: RecordAttachment[];
  statusHistory: StatusEvent[];
};

function toneForStatus(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("overdue") || normalized.includes("escalated") || normalized.includes("rejected")) {
    return "bg-red-100 text-red-800";
  }
  if (normalized.includes("risk") || normalized.includes("review") || normalized.includes("assigned") || normalized.includes("ready")) {
    return "bg-amber-100 text-amber-800";
  }
  if (normalized.includes("closed") || normalized.includes("approved") || normalized.includes("verified") || normalized.includes("published")) {
    return "bg-emerald-100 text-emerald-800";
  }
  return "bg-slate-100 text-slate-700";
}

function toneForPriority(priority?: string) {
  const normalized = (priority ?? "").toLowerCase();
  if (normalized.includes("critical")) return "bg-red-100 text-red-800";
  if (normalized.includes("high")) return "bg-amber-100 text-amber-800";
  return "bg-slate-100 text-slate-700";
}

function defaultStatusForSection(section: string) {
  if (section === "reports") return "Draft";
  if (section === "meetings") return "Actions Open";
  if (section === "documents") return "Draft";
  if (section === "inspections" || section === "quality") return "Draft";
  return "Open";
}

function requiredMoveForStatus(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("overdue") || normalized.includes("escalated")) return "Recovery action required";
  if (normalized.includes("rejected")) return "Evidence or rework required";
  if (normalized.includes("ready") || normalized.includes("awaiting")) return "Verification required";
  if (normalized.includes("review")) return "Decision or response required";
  if (normalized.includes("assigned")) return "Execution update required";
  if (normalized.includes("closed") || normalized.includes("approved") || normalized.includes("verified")) return "Closed loop complete";
  return "Owner update required";
}

function getMeta(metaById: Record<string, RecordMeta>, recordId: string | null) {
  if (!recordId) {
    return undefined;
  }

  return metaById[recordId] ?? { comments: [], attachments: [], statusHistory: [] };
}

export function RecordWorkbench({
  projectId,
  section,
  title,
  records,
  recordMeta,
  apiResource,
  guideHref,
  guideLabel
}: {
  projectId: string;
  section: string;
  title: string;
  records: WorkRecord[];
  recordMeta: Record<string, RecordMeta>;
  apiResource?: string;
  guideHref?: string;
  guideLabel?: string;
}) {
  const [items, setItems] = useState(records);
  const [metaById, setMetaById] = useState<Record<string, RecordMeta>>(recordMeta);
  const [selectedId, setSelectedId] = useState<string | null>(records[0]?.id ?? null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [owner, setOwner] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [commentPending, setCommentPending] = useState(false);
  const [uploadPending, setUploadPending] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraPending, setCameraPending] = useState(false);
  const deferredSearch = useDeferredValue(search);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setItems(records);
    setSelectedId((current) => current ?? records[0]?.id ?? null);
  }, [records]);

  useEffect(() => {
    setMetaById(recordMeta);
  }, [recordMeta]);

  useEffect(() => {
    return () => {
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    };
  }, []);

  const owners = useMemo(() => Array.from(new Set(items.map((item) => item.owner).filter(Boolean))).sort(), [items]);
  const statuses = useMemo(() => Array.from(new Set(items.map((item) => item.status).filter(Boolean))).sort(), [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const haystack = [item.title, item.summary, item.owner, item.company, item.area, item.discipline, item.system]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !deferredSearch || haystack.includes(deferredSearch.toLowerCase());
      const matchesStatus = status === "all" || item.status === status;
      const matchesOwner = owner === "all" || item.owner === owner;
      return matchesSearch && matchesStatus && matchesOwner;
    });
  }, [items, deferredSearch, status, owner]);

  useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null);
      return;
    }

    if (!filtered.some((item) => item.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? null;
  const selectedMeta = getMeta(metaById, selected?.id ?? null);
  const dueThisWeekCount = filtered.filter((item) => {
    const dueInDays = daysUntil(item.dueDate);
    return typeof dueInDays === "number" && dueInDays >= 0 && dueInDays <= 7;
  }).length;
  const needsAttentionCount = filtered.filter((item) => {
    const statusValue = item.status.toLowerCase();
    return statusValue.includes("overdue") || statusValue.includes("escalated") || statusValue.includes("rejected");
  }).length;

  async function handleCreate(formData: FormData) {
    if (!apiResource) return;
    setPending(true);
    setCreateError(null);

    const payload = {
      projectId,
      title: String(formData.get("title") ?? ""),
      owner: String(formData.get("owner") ?? "Unassigned"),
      company: String(formData.get("company") ?? "Halo Technical Solutions Global"),
      dueDate: String(formData.get("dueDate") ?? "") || undefined,
      priority: String(formData.get("priority") ?? "MEDIUM"),
      summary: String(formData.get("summary") ?? "") || undefined,
      status: defaultStatusForSection(section)
    };

    try {
      const response = await fetch(`/api/${apiResource}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Failed to create ${section} record`);
      }

      const json = await response.json();
      startTransition(() => {
        setItems((current) => [json.data, ...current]);
        setSelectedId(json.data.id);
        setMetaById((current) => ({
          ...current,
          [json.data.id]: { comments: [], attachments: [], statusHistory: [] }
        }));
        setShowCreate(false);
      });
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Failed to create record.");
    } finally {
      setPending(false);
    }
  }

  async function handleCommentCreate(formData: FormData) {
    if (!selected || !apiResource) return;

    const body = String(formData.get("comment") ?? "").trim();
    if (!body) {
      setCommentError("Enter a coordination note before saving.");
      return;
    }

    setCommentPending(true);
    setCommentError(null);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          recordType: apiResource,
          recordId: selected.id,
          body
        })
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? "Failed to save comment");
      }

      setMetaById((current) => {
        const existing = getMeta(current, selected.id) ?? { comments: [], attachments: [], statusHistory: [] };
        return {
          ...current,
          [selected.id]: {
            ...existing,
            comments: [json.data, ...existing.comments]
          }
        };
      });
    } catch (error) {
      setCommentError(error instanceof Error ? error.message : "Failed to save comment");
    } finally {
      setCommentPending(false);
    }
  }

  async function uploadEvidenceFile(file: File, uploadedByLabel?: string) {
    if (!selected || !apiResource) {
      return;
    }

    try {
      const metadataResponse = await fetch("/api/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type || "application/octet-stream",
            size: file.size,
            projectId,
            recordType: apiResource,
            recordId: selected.id
        })
      });
      const metadataJson = await metadataResponse.json();
      if (!metadataResponse.ok) {
        throw new Error(metadataJson.error ?? "Failed to start upload");
      }

      const metadata = metadataJson.data;
      let completeJson: {
        data?: { id: string; fileName: string; uploadedBy?: string; uploadedAt?: string };
        error?: string;
      };

      if (metadata.mode !== "mock") {
        const uploadResponse = await fetch(metadata.uploadUrl, {
          method: metadata.method ?? "PUT",
          headers: metadata.headers ?? {},
          body: file
        });

        if (!uploadResponse.ok) {
          throw new Error("Attachment upload did not complete");
        }

        const completeResponse = await fetch("/api/uploads/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attachmentToken: metadata.attachmentToken })
        });
        completeJson = await completeResponse.json();
        if (!completeResponse.ok) {
          throw new Error(completeJson.error ?? "Attachment could not be registered");
        }
      } else {
        const completeResponse = await fetch("/api/attachments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            recordType: apiResource,
            recordId: selected.id,
            fileName: file.name,
            contentType: file.type || "application/octet-stream",
            size: file.size
          })
        });
        completeJson = await completeResponse.json();
        if (!completeResponse.ok) {
          throw new Error(completeJson.error ?? "Attachment could not be registered");
        }
      }

      setMetaById((current) => {
        const existing = getMeta(current, selected.id) ?? { comments: [], attachments: [], statusHistory: [] };
        return {
          ...current,
          [selected.id]: {
            ...existing,
            attachments: [
                {
                  id: completeJson.data?.id ?? `attachment-${Date.now()}`,
                  fileName: completeJson.data?.fileName ?? file.name,
                  uploadedBy: completeJson.data?.uploadedBy ?? uploadedByLabel ?? "Authorized User",
                  uploadedAt: completeJson.data?.uploadedAt ?? new Date().toISOString(),
                  downloadUrl: completeJson.data?.id ? `/api/attachments/${completeJson.data.id}` : undefined
                },
              ...existing.attachments
            ]
          }
        };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Attachment upload failed";

      if (message === "Failed to fetch" && selected) {
        setMetaById((current) => {
          const existing = getMeta(current, selected.id) ?? { comments: [], attachments: [], statusHistory: [] };
          return {
            ...current,
            [selected.id]: {
              ...existing,
              attachments: [
                {
                  id: `attachment-local-${Date.now()}`,
                  fileName: file.name,
                  uploadedBy: uploadedByLabel ?? "Local Preview",
                  uploadedAt: new Date().toISOString(),
                  downloadUrl: undefined
                },
                ...existing.attachments
              ]
            }
          };
        });
        setUploadError(null);
      } else {
        setUploadError(message);
      }
    }
  }

  async function handleAttachmentUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !selected || !apiResource) {
      return;
    }

    setUploadPending(true);
    setUploadError(null);

    try {
      await uploadEvidenceFile(file);
    } finally {
      event.target.value = "";
      setUploadPending(false);
    }
  }

  async function openCameraCapture() {
    setCameraError(null);

    if (!selected || !apiResource) {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      cameraInputRef.current?.click();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" }
        },
        audio: false
      });

      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = stream;
      setCameraOpen(true);
      setCameraReady(false);
    } catch {
      setCameraError("Camera access is not available in this browser. Use the device upload fallback.");
      cameraInputRef.current?.click();
    }
  }

  function closeCameraCapture() {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    setCameraOpen(false);
    setCameraReady(false);
    setCameraPending(false);
  }

  useEffect(() => {
    if (!cameraOpen || !cameraVideoRef.current || !cameraStreamRef.current) {
      return;
    }

    const video = cameraVideoRef.current;
    video.srcObject = cameraStreamRef.current;
    void video.play().then(() => {
      setCameraReady(true);
    }).catch(() => {
      setCameraError("The live camera preview could not start. Use the upload fallback.");
      closeCameraCapture();
    });
  }, [cameraOpen]);

  async function capturePhoto() {
    if (!cameraVideoRef.current || !selected) {
      return;
    }

    const video = cameraVideoRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    if (!context) {
      setCameraError("Photo capture is not available in this browser context.");
      return;
    }

    setCameraPending(true);
    setUploadError(null);

    context.drawImage(video, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.92);
    });

    if (!blob) {
      setCameraPending(false);
      setCameraError("The photo could not be captured.");
      return;
    }

    const safeTitle = selected.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "issue";
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const photoFile = new File([blob], `${safeTitle}-${timestamp}.jpg`, { type: "image/jpeg" });

    try {
      await uploadEvidenceFile(photoFile, "Field Camera Capture");
      closeCameraCapture();
    } finally {
      setCameraPending(false);
    }
  }

  function exportCsv() {
    const headers = ["Title", "Status", "Owner", "Company", "Due Date", "Priority", "Summary"];
    const rows = filtered.map((item) => [item.title, item.status, item.owner, item.company, item.dueDate ?? "", item.priority ?? "", item.summary ?? ""]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${section}-records.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function resetFilters() {
    setSearch("");
    setStatus("all");
    setOwner("all");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Search
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${title.toLowerCase()}`} className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700" />
            </label>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Status
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <option value="all">All statuses</option>
                {statuses.map((itemStatus) => <option key={itemStatus} value={itemStatus}>{itemStatus}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Owner
              <select value={owner} onChange={(event) => setOwner(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <option value="all">All owners</option>
                {owners.map((itemOwner) => <option key={itemOwner} value={itemOwner}>{itemOwner}</option>)}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-3">
            {guideHref ? <Link href={guideHref as Route} className="rounded-xl border border-brand-steel/30 px-4 py-2 text-sm font-medium text-brand-steel">{guideLabel ?? "Open Guide"}</Link> : null}
            <button type="button" onClick={resetFilters} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Reset</button>
            <button type="button" onClick={exportCsv} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Export CSV</button>
            {apiResource ? <button type="button" onClick={() => setShowCreate((current) => !current)} className="rounded-xl bg-brand-clay px-4 py-2 text-sm font-semibold text-white">{showCreate ? "Close" : `New ${section}`}</button> : null}
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Visible Records</p><p className="mt-2 text-2xl font-semibold text-slate-950">{filtered.length}</p></div>
          <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Needs Attention</p><p className="mt-2 text-2xl font-semibold text-slate-950">{needsAttentionCount}</p></div>
          <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Due This Week</p><p className="mt-2 text-2xl font-semibold text-slate-950">{dueThisWeekCount}</p></div>
        </div>
      </section>

      {showCreate && apiResource ? (
        <section className="rounded-2xl border border-brand-clay/20 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">New Record</p>
              <h2 className="text-lg font-semibold text-slate-950">Create a new {section} entry</h2>
              <p className="mt-1 text-sm text-slate-500">Capture the owner, due date, and purpose cleanly so the record can drive follow-through.</p>
            </div>
          </div>
          <form className="mt-5 grid gap-4 md:grid-cols-2" action={handleCreate}>
            <label className="text-sm text-slate-700">Title<input name="title" required className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2" /></label>
            <label className="text-sm text-slate-700">Owner<input name="owner" className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2" /></label>
            <label className="text-sm text-slate-700">Company<input name="company" className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2" /></label>
            <label className="text-sm text-slate-700">Due date<input name="dueDate" type="date" className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2" /></label>
            <label className="text-sm text-slate-700 md:col-span-2">Priority<select name="priority" defaultValue="MEDIUM" className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select></label>
            <label className="text-sm text-slate-700 md:col-span-2">Summary<textarea name="summary" rows={3} className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2" /></label>
            {createError ? <p className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{createError}</p> : null}
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" disabled={pending} className="rounded-xl bg-brand-steel px-4 py-3 text-sm font-semibold text-white disabled:opacity-70">{pending ? "Saving..." : `Create ${section}`}</button>
            </div>
          </form>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_420px]">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
            <p className="text-sm text-slate-500">Filter the queue, pick the live record, and use the detail panel to drive ownership and closure.</p>
          </header>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Owner</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Due</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length ? filtered.map((record) => (
                  <tr key={record.id} className={`cursor-pointer border-t border-slate-100 align-top ${selected?.id === record.id ? "bg-slate-50" : "hover:bg-slate-50"}`} onClick={() => setSelectedId(record.id)}>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">{record.title}</p>
                      {record.summary ? <p className="mt-1 text-xs text-slate-500">{record.summary}</p> : null}
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.15em] text-slate-500">
                        {record.area ? <span>{record.area}</span> : null}
                        {record.discipline ? <span>{record.discipline}</span> : null}
                        {record.system ? <span>{record.system}</span> : null}
                      </div>
                    </td>
                    <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneForStatus(record.status)}`}>{record.status}</span></td>
                    <td className="px-5 py-4">{record.owner}<div className="mt-1 text-xs text-slate-500">{record.company}</div></td>
                    <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneForPriority(record.priority)}`}>{record.priority ?? "Standard"}</span></td>
                    <td className="px-5 py-4">{formatDate(record.dueDate)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">No records match the current filters. Reset the view or create a new record.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">{selected?.title ?? "No record selected"}</h2>
            {selected ? (
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <p><span className="font-semibold text-slate-900">Next Move:</span> {requiredMoveForStatus(selected.status)}</p>
                <p><span className="font-semibold text-slate-900">Owner:</span> {selected.owner}</p>
                <p><span className="font-semibold text-slate-900">Company:</span> {selected.company}</p>
                <p><span className="font-semibold text-slate-900">Due Date:</span> {formatDate(selected.dueDate)}</p>
                <p><span className="font-semibold text-slate-900">Status:</span> {selected.status}</p>
                <p><span className="font-semibold text-slate-900">Area / System:</span> {selected.area ?? "-"} / {selected.system ?? "-"}</p>
                {selected.summary ? <p><span className="font-semibold text-slate-900">Summary:</span> {selected.summary}</p> : null}
                {selected.links?.length ? (
                  <div>
                    <p className="font-semibold text-slate-900">Linked Records</p>
                    <ul className="mt-2 space-y-2">
                      {selected.links.map((link) => <li key={link.id} className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">{link.type}: {link.label}</li>)}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">Select a record to inspect details, comments, and audit history.</p>
            )}
          </section>
          {guideHref ? (
            <section className="rounded-2xl border border-brand-steel/20 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-slate-950">Need process help?</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">Open the in-app guide for this workflow. It explains the exact operating sequence, what good looks like, and how the user is expected to move the record.</p>
              <Link href={guideHref as Route} className="mt-4 inline-flex rounded-xl bg-brand-steel px-4 py-3 text-sm font-semibold text-white">{guideLabel ?? "Open Guide"}</Link>
            </section>
          ) : null}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-950">Evidence and Attachments</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {section === "issues"
                    ? "Capture a field defect photo live from the app or upload photo, PDF, or markup evidence."
                    : "Upload photo, PDF, or markup evidence directly against the live record."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {section === "issues" ? (
                  <button
                    type="button"
                    onClick={openCameraCapture}
                    disabled={!selected || !apiResource || uploadPending || cameraPending}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                      selected && apiResource ? "bg-brand-steel text-white" : "cursor-not-allowed bg-slate-200 text-slate-500"
                    }`}
                  >
                    {cameraPending ? "Saving Photo..." : "Take Photo"}
                  </button>
                ) : null}
                <label className={`inline-flex cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold ${selected && apiResource ? "bg-brand-clay text-white" : "cursor-not-allowed bg-slate-200 text-slate-500"}`}>
                  {uploadPending ? "Uploading..." : "Add Evidence"}
                  <input type="file" accept="image/*,.pdf,.doc,.docx,.xlsx,.csv" className="hidden" disabled={!selected || !apiResource || uploadPending} onChange={handleAttachmentUpload} />
                </label>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  disabled={!selected || !apiResource || uploadPending}
                  onChange={handleAttachmentUpload}
                />
              </div>
            </div>
            {uploadError ? <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{uploadError}</p> : null}
            {cameraError ? <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{cameraError}</p> : null}
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              {selectedMeta?.attachments?.length ? selectedMeta.attachments.map((item) => (
                <p key={item.id}>
                  {item.downloadUrl ? <a href={item.downloadUrl} target="_blank" rel="noreferrer" className="font-medium text-brand-steel underline-offset-2 hover:underline">{item.fileName}</a> : item.fileName} - {item.uploadedBy}
                </p>
              )) : <p>No field evidence has been attached yet.</p>}
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-950">Coordination Notes</h3>
            <p className="mt-1 text-sm text-slate-500">Capture the latest direction, blocker, or verification note so the record stays current.</p>
            <div className="mt-3 space-y-3 text-sm text-slate-600">
              {selectedMeta?.comments?.length ? selectedMeta.comments.map((item) => <div key={item.id}><p className="font-semibold text-slate-800">{item.author}</p><p>{item.body}</p></div>) : <p>No coordination notes have been captured yet.</p>}
            </div>
            {selected && apiResource ? (
              <form className="mt-4 space-y-3" action={handleCommentCreate}>
                <textarea name="comment" rows={3} placeholder="Enter the latest field fact, direction, or closure note." className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700" />
                {commentError ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{commentError}</p> : null}
                <div className="flex justify-end">
                  <button type="submit" disabled={commentPending} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-70">{commentPending ? "Saving..." : "Add Note"}</button>
                </div>
              </form>
            ) : null}
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-950">Audit History</h3>
            <div className="mt-3 space-y-3 text-sm text-slate-600">
              {selectedMeta?.statusHistory?.length ? selectedMeta.statusHistory.map((event) => <div key={`${event.recordId}-${event.createdAt}`}><p className="font-semibold text-slate-800">{`${event.fromStatus ?? "None"} -> ${event.toStatus}`}</p><p>{event.note ?? "Status updated."}</p></div>) : <p>No status transitions have been recorded yet.</p>}
            </div>
          </section>
        </aside>
      </div>

      {cameraOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Field Capture</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">Take issue photo</h2>
                <p className="mt-2 text-sm text-slate-600">Capture the defect as seen in the field. The photo will attach directly to the active issue record.</p>
              </div>
              <button type="button" onClick={closeCameraCapture} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">
                Close
              </button>
            </div>
            <div className="mt-5 overflow-hidden rounded-2xl bg-slate-950">
              <video ref={cameraVideoRef} autoPlay playsInline muted className="aspect-video w-full object-cover" />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                {cameraReady ? "Frame the defect and capture the photo." : "Starting camera preview..."}
              </p>
              <div className="flex gap-3">
                <button type="button" onClick={closeCameraCapture} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={capturePhoto}
                  disabled={!cameraReady || cameraPending}
                  className="rounded-xl bg-brand-clay px-4 py-3 text-sm font-semibold text-white disabled:opacity-70"
                >
                  {cameraPending ? "Saving Photo..." : "Capture and Attach"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
