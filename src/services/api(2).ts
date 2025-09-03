/**
 * api.ts
 * ---------------------------------------------------------
 * Backend API client helpers:
 * - uploadFileStub/createParsingJobStub/getJobStatusStub (legacy stubs)
 * - createConvertJob/getJobStatus (real endpoints)
 * Types: UploadResponse, CreateJobResponse, JobResult
 */

import { apiUrl } from '@/services/config'

export interface UploadResponse {
  id: string
  url: string
}

export type JobStatus = 'queued' | 'processing' | 'succeeded' | 'failed'
export interface CreateJobResponse {
  jobId: string
}
export interface JobResult {
  jobId: string
  status: JobStatus
  progress: number
  // URLs of produced files and normalized text
  normalizedTextUrl?: string
  docxUrl?: string
  pdfUrl?: string
  error?: string
}

/** Placeholder upload (replace with backend call) */
export async function uploadFileStub(_f: File): Promise<UploadResponse> {
  // In production: POST /uploads -> { id, url }
  return { id: String(Date.now()), url: 'about:blank' }
}

/** Placeholder: create a parsing job for uploaded files */
export async function createParsingJobStub(_payload: Record<string, unknown>): Promise<CreateJobResponse> {
  // In production: POST /jobs -> returns job id
  return { jobId: String(Date.now()) }
}

/** Placeholder: poll job status */
export async function getJobStatusStub(_jobId: string): Promise<JobResult> {
  // In production: GET /jobs/:id -> status/progress
  return { jobId: _jobId, status: 'queued', progress: 0 }
}

/**
 * createConvertJob
 * Calls backend /api/jobs/convert to create a DOCX/PDF conversion job.
 */
export async function createConvertJob(payload: { contentText: string; mapping?: Record<string, unknown>; templateUrl?: string }): Promise<CreateJobResponse> {
  const res = await fetch(apiUrl('/api/jobs/convert'), {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    let msg = 'failed_to_create_job'
    try {
      const t = await res.text()
      msg = t || msg
    } catch {}
    throw new Error(msg)
  }
  return res.json()
}

/**
 * getJobStatus
 * Polls backend /api/jobs/status/:id to read job progress and result URLs.
 */
export async function getJobStatus(jobId: string): Promise<JobResult> {
  const res = await fetch(apiUrl(`/api/jobs/status/${encodeURIComponent(jobId)}`), {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    return { jobId, status: 'failed', progress: 0, error: 'not_found' }
  }
  return res.json()
}
