import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use("*", logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

// Admin client — service role key, bypasses RLS and email confirmation
const adminClient = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

// Health check
app.get("/make-server-f779d9e5/health", (c) => c.json({ status: "ok" }));

// ── POST /make-server-f779d9e5/seed-demo ────────────────────────────────
// Creates demo user 9876543210 / 11223300 with email_confirm bypassed.
// Called on app load — safe to call multiple times.
app.post("/make-server-f779d9e5/seed-demo", async (c) => {
  const supabase = adminClient();
  const phone = "9876543210";
  const email = `${phone}@medikiosk.local`;
  const password = "11223300";

  // Check if auth user already exists
  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const exists = list?.users?.some((u) => u.email === email);
  if (exists) return c.json({ status: "already_exists" });

  // Create confirmed auth user via admin API
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      patient_id: phone,
      full_name: "Demo Patient",
      phone,
      age: "30",
      gender: "Male",
      department: "General Medicine",
    },
  });

  if (authErr) return c.json({ error: authErr.message }, 400);

  // Save to patients table (ignore if table doesn't exist yet)
  await supabase.from("patients").upsert({
    patient_id: phone,
    full_name: "Demo Patient",
    phone,
    age: 30,
    gender: "Male",
    department: "General Medicine",
    user_id: authData.user?.id ?? null,
  }, { onConflict: "patient_id" }).throwOnError().catch(() => {});

  return c.json({ status: "created", patient_id: phone });
});

// ── POST /make-server-f779d9e5/register ─────────────────────────────────
// Creates a confirmed auth user via admin API (no email confirmation needed).
// Body: { phone, password, full_name, age, gender, department }
app.post("/make-server-f779d9e5/register", async (c) => {
  let body: Record<string, string> | null = null;
  try { body = await c.req.json(); } catch { /* ignore */ }
  if (!body) return c.json({ error: "Invalid request body" }, 400);

  const { phone, password, full_name, age, gender, department } = body;
  if (!phone?.trim() || !password?.trim() || !full_name?.trim() || !age?.trim() || !department?.trim()) {
    return c.json({ error: "Missing required fields" }, 400);
  }
  if (password.length < 6) {
    return c.json({ error: "Password must be at least 6 characters" }, 400);
  }

  const supabase = adminClient();
  const patient_id = phone.trim().replace(/\s/g, "");
  const email = `${patient_id}@medikiosk.local`;

  // Check for duplicate
  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const exists = list?.users?.some((u) => u.email === email);
  if (exists) {
    return c.json({ error: "This phone number is already registered. Please log in instead." }, 409);
  }

  // Create confirmed auth user
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { patient_id, full_name: full_name.trim(), phone: patient_id, age, gender: gender ?? "Other", department: department.trim() },
  });

  if (authErr) return c.json({ error: authErr.message }, 400);

  // Save profile to patients table
  const { error: insertErr } = await supabase.from("patients").upsert({
    patient_id,
    full_name: full_name.trim(),
    phone: patient_id,
    age: parseInt(age),
    gender: gender ?? "Other",
    department: department.trim(),
    user_id: authData.user?.id ?? null,
  }, { onConflict: "patient_id" });

  return c.json({
    patient_id,
    message: "Registration successful",
    ...(insertErr ? { warning: "Profile saved to auth but patients table insert failed: " + insertErr.message } : {}),
  });
});

Deno.serve(app.fetch);
