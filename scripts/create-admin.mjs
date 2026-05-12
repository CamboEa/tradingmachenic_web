#!/usr/bin/env node
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function createAdmin(email, password) {
  console.log(`\nProcessing admin: ${email}`);

  // Create user in Auth (skip if no password provided)
  if (password) {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.toLowerCase().includes("already") || authError.message.includes("registered")) {
        console.log(`  User already exists, skipping auth creation.`);
      } else {
        console.error(`  Auth error: ${authError.message}`);
        return;
      }
    } else {
      console.log(`  Auth user created: ${authData.user.id}`);
    }
  }

  // Get the user id (either just created or existing)
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) { console.error(`  List error: ${listError.message}`); return; }

  const user = users.find((u) => u.email === email);
  if (!user) { console.error(`  Could not find user after creation.`); return; }

  // Upsert profile with role = admin
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: user.id, email, role: "admin" }, { onConflict: "id" });

  if (profileError) {
    console.error(`  Profile error: ${profileError.message}`);
  } else {
    console.log(`  Profile set to admin.`);
  }
}

await createAdmin("tradingmachenic.admin@gmail.com", "TM@Admin2026#Secure");

console.log("\nDone.");
