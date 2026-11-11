# NexNes

Study project for an **asynchronous email flow** using a job queue.

Instead of sending the email inside the HTTP request, the API puts a job on a queue and answers right away with `202 Accepted`. A background worker picks the job up and sends the email. The user doesn't wait for the SMTP server, and the request no longer depends on it.

## Stack

- **Backend:** NestJS 11 (TypeScript)
- **Queue:** BullMQ + Redis
- **Email:** Nodemailer, delivering to [MailDev](https://github.com/maildev/maildev) (a local SMTP server with a web inbox)
- **Frontend:** Next.js + shadcn/ui
- **Infra:** Docker Compose (Redis and MailDev)

## Flow

```
Next.js form
   │  POST /session/report  { title, content }
   ▼
AppController (NestJS)
   │  emailQueue.add('send-report-email', ...)
   │  → 202 Accepted + jobId
   ▼
Redis  ──  "email-queue"
   ▼
EmailProcessor (BullMQ worker)
   │  nodemailer → SMTP :1025
   ▼
MailDev inbox (http://localhost:1080)
```

## Running locally

1. Start the infrastructure:

   ```bash
   docker-compose up -d
   ```

2. Create `backend/.env`:

   ```env
   MOCK_USER_ID=1
   MOCK_USER_NAME=Your Name
   MOCK_USER_EMAIL=you@example.com
   MOCK_USER_TIER=free
   ```

3. Start the backend (http://localhost:3002):

   ```bash
   cd backend && npm install && npm run start:dev
   ```

4. Start the frontend (http://localhost:3000):

   ```bash
   cd frontend && npm install && npm run dev
   ```

5. Send a message from the form, then open http://localhost:1080 to see it arrive.

## Technical decisions

- **Why a queue?** Sending email is slow and can fail. The queue decouples it from the HTTP request, so the API stays fast and the work survives while the worker is busy.
- **`202 Accepted` + `jobId`:** the API confirms that the work was *accepted*, not that it was *done*. The `jobId` lets the client trace the job later.
- **Producer and consumer stay separate:** the controller only enqueues jobs, and `EmailProcessor` only processes them. Either side can change or scale without touching the other.
- **Failures are logged and re-thrown:** BullMQ marks the job as failed and keeps it in Redis, so it can be inspected.
- **MailDev instead of a real SMTP provider:** the whole flow runs locally without credentials.

## What I'd do next

- **Retries with backoff** (`attempts` + exponential `backoff` in the job options), then handle jobs that still fail after the last attempt (a dead-letter queue).
- **Idempotency:** use a deterministic `jobId` so a duplicated request doesn't send the same email twice.
- **Input validation** with DTO classes and `class-validator` (the request body is only typed for now, not validated).
- **Escape user content** before inserting it into the HTML email body.
- **Configuration from env:** Redis and SMTP host and port are hardcoded to `localhost` today.
- **Tests:** unit tests for the controller (mocking the queue) and the processor (mocking the transporter).
- **Containerize the backend and frontend** so `docker-compose up` starts everything.
