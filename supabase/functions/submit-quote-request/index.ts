import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_BODY_BYTES = 32 * 1024
const MAX_ITEMS = 50

interface QuoteItemPayload {
  product_id: string
  variant_id?: string | null
  quantity: number
}

interface QuoteRequestPayload {
  customer_name: string
  customer_phone: string
  customer_email?: string | null
  customer_location: string
  additional_notes?: string | null
  items: QuoteItemPayload[]
  website?: string // optional honeypot field
}

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405)
  }

  const contentLength = Number(req.headers.get('content-length') || '0')
  if (contentLength > MAX_BODY_BYTES) {
    return jsonResponse({ error: 'Request payload is too large.' }, 413)
  }

  let rawText = ''
  try {
    rawText = await req.text()
    if (rawText.length > MAX_BODY_BYTES) {
      return jsonResponse({ error: 'Request payload is too large.' }, 413)
    }
  } catch {
    return jsonResponse({ error: 'Unable to read request body.' }, 400)
  }

  let payload: QuoteRequestPayload
  try {
    payload = JSON.parse(rawText) as QuoteRequestPayload
  } catch {
    return jsonResponse({ error: 'Malformed JSON payload.' }, 400)
  }

  // Honeypot check
  if (typeof payload.website === 'string' && payload.website.trim().length > 0) {
    return jsonResponse({ error: 'Invalid submission.' }, 400)
  }

  const customerName = typeof payload.customer_name === 'string' ? payload.customer_name.trim() : ''
  const customerPhone = typeof payload.customer_phone === 'string' ? payload.customer_phone.trim() : ''
  const customerEmail = typeof payload.customer_email === 'string' ? payload.customer_email.trim() : ''
  const customerLocation = typeof payload.customer_location === 'string' ? payload.customer_location.trim() : ''
  const additionalNotes = typeof payload.additional_notes === 'string' ? payload.additional_notes.trim() : ''

  if (customerName.length < 2 || customerName.length > 120) {
    return jsonResponse({ error: 'Please enter a valid full name (2–120 characters).' }, 400)
  }

  const digitsOnly = customerPhone.replace(/\D/g, '')
  if (digitsOnly.length < 10 || digitsOnly.length > 15 || !/^\+?[0-9\s\-()]{7,25}$/.test(customerPhone)) {
    return jsonResponse({ error: 'Please enter a valid 10–15 digit phone number.' }, 400)
  }

  if (customerEmail && (!EMAIL_REGEX.test(customerEmail) || customerEmail.length > 160)) {
    return jsonResponse({ error: 'Please enter a valid email address.' }, 400)
  }

  if (customerLocation.length < 2 || customerLocation.length > 160) {
    return jsonResponse({ error: 'Please enter your city or delivery location.' }, 400)
  }

  if (additionalNotes.length > 1000) {
    return jsonResponse({ error: 'Additional notes must be 1000 characters or fewer.' }, 400)
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return jsonResponse({ error: 'Please add at least one product to your quote request.' }, 400)
  }

  if (payload.items.length > MAX_ITEMS) {
    return jsonResponse({ error: `Maximum ${MAX_ITEMS} items allowed per quotation request.` }, 400)
  }

  const normalizedItems: { product_id: string; variant_id: string | null; quantity: number }[] = []
  const seenKeys = new Set<string>()

  for (const item of payload.items) {
    if (!item || typeof item.product_id !== 'string' || !UUID_REGEX.test(item.product_id)) {
      return jsonResponse({ error: 'Invalid product identifier in quote items.' }, 400)
    }

    const variantId =
      item.variant_id && typeof item.variant_id === 'string' && item.variant_id.trim() !== ''
        ? item.variant_id.trim()
        : null

    if (variantId !== null && !UUID_REGEX.test(variantId)) {
      return jsonResponse({ error: 'Invalid variant identifier in quote items.' }, 400)
    }

    const qty = Number(item.quantity)
    if (!Number.isInteger(qty) || qty <= 0 || qty > 999) {
      return jsonResponse({ error: 'Item quantity must be a positive whole number (1–999).' }, 400)
    }

    const dedupeKey = `${item.product_id}:${variantId ?? 'none'}`
    if (seenKeys.has(dedupeKey)) {
      return jsonResponse({ error: 'Duplicate product/variant lines are not permitted.' }, 400)
    }
    seenKeys.add(dedupeKey)

    normalizedItems.push({
      product_id: item.product_id,
      variant_id: variantId,
      quantity: qty,
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: 'Server configuration error.' }, 500)
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // Simple abuse protection: max 5 submissions per phone number within 60 seconds
  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString()
  const { count: recentCount, error: rateErr } = await supabaseAdmin
    .from('quote_requests')
    .select('id', { count: 'exact', head: true })
    .eq('customer_phone', customerPhone)
    .gte('created_at', oneMinuteAgo)

  if (!rateErr && (recentCount ?? 0) >= 5) {
    return jsonResponse(
      { error: 'Too many quotation requests in a short time. Please wait a minute and try again.' },
      429,
    )
  }

  const { data, error } = await supabaseAdmin.rpc('create_quote_request_atomic', {
    p_customer_name: customerName,
    p_customer_phone: customerPhone,
    p_customer_email: customerEmail || null,
    p_customer_location: customerLocation,
    p_additional_notes: additionalNotes || null,
    p_items: normalizedItems,
    p_customer_id: null,
  })

  if (error) {
    const msg = error.message || ''
    if (
      msg.includes('PRODUCT_UNAVAILABLE') ||
      msg.includes('VARIANT_UNAVAILABLE') ||
      msg.includes('VARIANT_REQUIRED') ||
      msg.includes('INVALID_QUANTITY') ||
      msg.includes('EMPTY_ITEMS')
    ) {
      const cleanMsg = msg.split(': ').slice(1).join(': ') || 'One or more items are unavailable.'
      return jsonResponse({ error: cleanMsg }, 400)
    }
    return jsonResponse({ error: 'Unable to submit quotation request. Please try again.' }, 500)
  }

  const created = Array.isArray(data) ? data[0] : data
  if (!created?.reference_number) {
    return jsonResponse({ error: 'Quotation could not be finalized.' }, 500)
  }

  return jsonResponse(
    {
      reference_number: created.reference_number,
      status: created.status,
      created_at: created.created_at,
    },
    201,
  )
})
