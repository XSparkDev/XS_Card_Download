## Enterprise Quote – Public Payment Entry URL Flow

This document updates the Option C plan to describe a more robust payment flow using a **public payment entry URL per quote**, instead of embedding the raw Paystack `paymentUrl` directly in the frontend.

---

### 1. Problem this solves

The previous approach assumed:

- Frontend calls `POST /api/enterprise/payment/initialize` to get a `paymentUrl`.
- QR code and PDF link point directly to that Paystack `paymentUrl`.
- “Proceed to Payment” button both initialized and immediately opened Paystack.

This caused a few UX problems:

1. **Download before QR**  
   - The user could click “Download Quote” before a `paymentUrl` existed.  
   - The resulting PDF had **no QR / clickable payment link**.

2. **Jumpy flow and race conditions**  
   - Clicking “Proceed to Payment” opened Paystack in a new tab immediately **while** the app was still updating the quote and QR.
   - When the user returned to the app tab, they sometimes saw an inconsistent UI (e.g. empty sections, only QR).

3. **Offline / delayed payment story is fragile**  
   - The QR hard-coded a Paystack URL that is tightly coupled to the specific initialization call.
   - It is harder to change or extend behaviour without updating already-issued PDFs.

We want a design where:

- The **PDF can always contain a stable QR + link** that works days later.
- The backend, not the PDF, owns the logic of:
  - “Does this quote exist?”
  - “Is it still valid?”
  - “Has payment already been initialized or completed?”

---

### 2. New approach: public payment entry URL per quote

Instead of embedding the raw Paystack `paymentUrl`, we introduce a *public, user-facing* URL that is stable for the life of the quote:

- **Pattern (example):**
  - `GET {API_BASE_URL}/pay/quote/:quoteId`
  - e.g. `https://localhost:8383/pay/quote/quote_1769585842554_5lkq2lvby`

#### 2.1. Backend behaviour for `GET /pay/quote/:quoteId`

When a browser hits this URL (either by scanning a QR or clicking a link in the PDF):

1. **Lookup the quote** by `quoteId`.
2. **Validate**:
   - If quote does not exist → show a friendly “Quote not found” page.
   - If quote is expired → show a friendly “This quote has expired” page (optional: guidance to request a new quote).
3. **Payment initialization / reuse:**
   - If the quote is **already linked to a Paystack session** (has a stored `paymentUrl` and is in an appropriate status, e.g. `"accepted"` or `"paid"`):
     - Option A: Redirect directly to that `paymentUrl` (if appropriate for the status).
     - Option B: For `"paid"`, show a “Payment already completed” page instead of redirecting.
   - If the quote is **pending and not yet initialized**:
     - Server-side call the existing `POST /api/enterprise/payment/initialize` internally (or equivalent internal logic) to:
       - Change the quote status to `"accepted"`.
       - Create a Paystack checkout session.
       - Save `paymentUrl` on the quote.
     - Then redirect the user to that `paymentUrl`.

4. **Final action**:
   - **HTTP 302/303 redirect** to the Paystack `paymentUrl` for valid, payable quotes.
   - Or a small informative HTML page for invalid/expired/paid quotes.

The key idea: **QR → /pay/quote/:quoteId → backend decides what to do → redirect to Paystack or show message.**

---

### 3. Frontend expectations

The frontend does **not** call `POST /api/enterprise/payment/initialize` anymore for the QR / PDF use-case.  
Instead, it builds and uses the *public payment entry URL* everywhere:

#### 3.1. URL construction

- The frontend already has `API_BASE_URL` (backend host).
- It derives the payment entry URL as:

```ts
const getQuotePaymentEntryUrl = (quoteId: string): string => {
  return `${API_BASE_URL}/pay/quote/${encodeURIComponent(quoteId)}`
}
```

This:
- Works in development: `http://localhost:8383/pay/quote/:quoteId`
- Works in production: `https://baseUrl.xscard.co.za/pay/quote/:quoteId` (or whatever `API_BASE_URL` resolves to).

#### 3.2. Where the frontend uses this URL

1. **QR code in the quote preview & PDF**
   - After a quote is generated (`POST /api/enterprise/quote` success), the frontend:
     - Sets `enterpriseQuote = response.quote`.
     - Builds `entryUrl = getQuotePaymentEntryUrl(quote.quoteId)`.
     - Generates a QR code from `entryUrl`.
   - The same QR is:
     - Shown in the on-screen PDF-style preview.
     - Included in the HTML that `html2canvas` captures for the downloadable PDF.

2. **Clickable link under the QR**
   - The text link beneath the QR in the “Proceed to Payment” section is also `entryUrl`.
   - When generating the PDF with `jspdf`, we overlay a clickable region whose `url` is `entryUrl`.

3. **“Proceed to Payment” button in the quote modal footer**
   - In the modal footer (where “Download Quote” and “Close” live), the “Proceed to Payment” button simply:

   ```ts
   const entryUrl = getQuotePaymentEntryUrl(enterpriseQuote.quoteId)
   window.open(entryUrl, "_blank", "noopener,noreferrer")
   ```

   - It no longer calls `POST /api/enterprise/payment/initialize` directly.  
     The backend `GET /pay/quote/:quoteId` handler owns initialization & redirect.

4. **Existing quote re-open (by email)**
   - When a user re-opens an existing quote (via the “You already have an active quote” banner), the frontend:
     - Uses `quote.quoteId` to compute `entryUrl`.
     - Generates a QR from `entryUrl`.
     - Shows the same QR + link section and footer button behaviour as above.

---

### 4. Backend / Frontend contract summary

#### 4.1. Backend guarantees

- `GET /pay/quote/:quoteId`:
  - Exists on the same host as `API_BASE_URL`.
  - Handles:
    - Quote lookup by `quoteId`.
    - Expiry and status checks.
    - Initializing Paystack payment (if not initialized yet) or reusing existing session.
  - Redirects the browser to the appropriate Paystack `paymentUrl` for valid quotes.
  - Shows human-readable pages for invalid/expired/already-paid quotes.

- `POST /api/enterprise/payment/initialize`:
  - May still be used internally or by other clients, but the public browser flow does not rely on it anymore.

#### 4.2. Frontend behaviour

- For any given quote, it:
  - Derives `entryUrl = {API_BASE_URL}/pay/quote/:quoteId`.
  - Uses `entryUrl` for:
    - QR generation.
    - Visible URL under the QR.
    - Clickable overlay in the PDF.
    - “Proceed to Payment” button in the modal footer.
- It does **not** need to know or store the raw Paystack `paymentUrl`.
- It no longer calls `POST /api/enterprise/payment/initialize` as part of the user-facing flow.

---

### 5. What this enables

- **User can generate a quote, download the PDF, close everything, and later:**
  - Scan the QR from paper or screen.
  - Or click the link inside the PDF.
  - The backend will:
    - Initialize payment if needed,
    - Redirect them to Paystack,
    - Or show a clear message if the quote is no longer payable.

- **Frontend stays simple and stable:**
  - It only ever needs `quoteId` to restore the “path to payment”.
  - All lifecycle/validity logic lives in one place: the backend pay-entry handler.


