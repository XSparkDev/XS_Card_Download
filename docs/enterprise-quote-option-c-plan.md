## Enterprise Quote – Option C Implementation Plan

This document describes how the frontend will implement **Option C** for enterprise quotes and what the backend needs to provide to support it.

---

### 1. Backend Requirements

#### 1.1. Existing endpoints (for reference)

- `POST /api/enterprise/quote`
  - Already implemented and integrated in the frontend.
  - Returns an `EnterpriseQuote` with:
    - `quoteId`
    - `companyName`
    - `contactName`
    - `contactEmail`
    - `numberOfEmployees` (number or range string)
    - `currency`
    - `formattedPrice`
    - `priceRange?`
    - `quoteStatus` (`"pending"`, `"accepted"`, etc.)
    - `createdAt`
    - `expiresAt`
    - `paymentUrl?` (optional, used after initialization)

- `POST /api/enterprise/payment/initialize`
  - Already wired in the frontend.
  - Expects: `{ quoteId: string }`
  - Returns:
    - `success: boolean`
    - On success:
      - `paymentUrl: string`
      - `quote: EnterpriseQuote` (with updated `quoteStatus` set to `"accepted"` and `paymentUrl` populated).

#### 1.2. New capability: find active quotes by contact email

**Goal:** When a user enters a business email and clicks **“Get a quote”**, the system should be able to:

- Check if there is at least one **non-expired** quote for the same `contactEmail`.
- Return those quotes so the UI can:
  - Inform the user: “You already have an active quote”.
  - Let the user open an existing quote in the preview modal (with QR + payment button).
  - Still allow generating a **new** quote if they want.

**Proposed endpoint (flexible, backend can adjust the exact shape):**

- `GET /api/enterprise/quotes/by-email?email={contactEmail}`

**Request:**

- Query param:
  - `email: string` – the `contactEmail` used when generating the quote.

**Response (success):**

```json
{
  "success": true,
  "quotes": [
    {
      "quoteId": "quote_1716981234567_abc123xyz",
      "companyName": "259 Moriting",
      "contactName": "Pule Tshetlha",
      "contactEmail": "tshehlap@gmail.com",
      "numberOfEmployees": "201-1000",
      "currency": "ZAR",
      "formattedPrice": "R 6,600.00",
      "priceRange": {
        "minEmployees": 201,
        "maxEmployees": 1000,
        "formattedMinPrice": "R 210.00",
        "formattedMaxPrice": "R 1,000.00"
      },
      "quoteStatus": "pending",
      "createdAt": "2025-01-27T10:30:00.000Z",
      "expiresAt": "2025-02-26T10:30:00.000Z",
      "paymentUrl": "https://paystack.com/pay/example"
    }
  ]
}
```

**Response (no quotes or only expired ones):**

```json
{
  "success": true,
  "quotes": []
}
```

**Response (error):**

```json
{
  "success": false,
  "error": "Validation failed" | "Internal server error",
  "message": "Human readable message",
  "errors": ["Optional array of error strings"]
}
```

**Backend behaviour notes:**

- “Non-expired” should be defined server-side as `now < expiresAt`.
- It’s fine to return **multiple** non-expired quotes for the same email; the frontend can:
  - Show the **most recent** one by default (e.g. highest `createdAt`).
  - Optionally list others later if needed.

---

### 2. Frontend Behaviour Changes (Option C)

#### 2.1. Where the payment button lives

- Keep the **PDF-style quote content** as a pure visual card (watermark, amounts, QR code, text).
- In the **quote preview modal footer** (same area as “Download Quote” and “Close”):
  - Add a **“Proceed to Payment”** button.
  - Behaviour:
    - If `enterpriseQuote.paymentUrl` exists:
      - Immediately `window.open(enterpriseQuote.paymentUrl, "_blank", "noopener,noreferrer")`.
    - If `enterpriseQuote.paymentUrl` does **not** exist:
      - Call `POST /api/enterprise/payment/initialize` with the current `quoteId`.
      - On success:
        - Update `enterpriseQuote` with the returned `quote` (including `paymentUrl` and updated `quoteStatus`).
        - Generate QR code from `paymentUrl`.
        - Open the `paymentUrl` in a new tab.

This keeps the **actionable payment control in the modal**, never inside the PDF content, while the QR + URL still live on the quote itself.

#### 2.2. QR code & payment URL on quote

- The quote preview (and its PDF export) will keep:
  - A **QR code** generated from `enterpriseQuote.paymentUrl` (when available).
  - A **visible payment URL string** under the QR.
- When generating the PDF:
  - The visual URL and QR are part of the captured content.
  - We also overlay a **clickable link** in the PDF using the `paymentUrl` when present.

#### 2.3. Surfacing existing quotes by email (non-blocking)

Flow when the user clicks **“Get a quote”** on the Enterprise Sales Enquiry form:

1. Validate minimal fields for quote (name, email, company name, company size).
2. **Before calling** `POST /api/enterprise/quote`, call the new backend endpoint:
   - `GET /api/enterprise/quotes/by-email?email={enterpriseForm.email}`
3. If the response contains **non-expired quotes**:
   - Pick the most recent one (by `createdAt`) as the primary candidate.
   - Show a small, non-blocking notice inside the Enterprise modal, e.g.:
     - “You already have an active quote for this email.”
     - Buttons:
       - **“View existing quote”** → opens the quote preview modal for that quote (with QR + payment controls in footer).
       - **“Create new quote anyway”** → continues the normal flow to get an exact employee count and call `/quote`.
4. If there are **no active quotes**, proceed with the normal quote creation flow immediately.

Important: **we do not block new quote creation**. Existing quotes are surfaced as a convenience, not a constraint.

---

### 3. Frontend Tasks (High-Level)

- **Move payment initiation UX:**
  - Remove the “Initialize Payment” section from inside the quote card body.
  - Add a **“Proceed to Payment”** button in the quote modal footer alongside “Download Quote”.
  - Wire it to:
    - Use existing `paymentUrl` if present.
    - Otherwise call `initializeEnterprisePayment`, then open the link.

- **Keep QR + URL on the quote:**
  - Continue generating QR codes and showing the payment URL inside the PDF-style card when `paymentUrl` exists.
  - Ensure PDF generation still includes QR + URL and overlays a clickable link when available.

- **Add “find existing quotes by email” integration:**
  - Add a new API helper in `utils/api.ts` for `GET /api/enterprise/quotes/by-email`.
  - In the Enterprise Sales Enquiry flow:
    - On “Get a quote”, call this helper first.
    - If active quotes exist, show the “You already have an active quote” notice with:
      - “View existing quote” → open preview modal for that quote.
      - “Create new quote anyway” → continue to exact employee count modal and `/quote` call.
    - If none, just proceed as before.

This keeps the UX simple:
- The quote **always** looks like a proper PDF (with QR + URL).
- The modal **footer** is the single place for interactive actions: download + proceed to payment.
- Returning users by email can easily re-open an existing active quote without blocking new quotes.


