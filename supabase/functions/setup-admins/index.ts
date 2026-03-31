import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const admins = [
    { email: "admin1@sidera.app", password: "Sid3ra@2026" },
    { email: "admin2@sidera.app", password: "Dr1ve#Secure" },
    { email: "admin3@sidera.app", password: "St3m!Pass99" },
    { email: "admin4@sidera.app", password: "Upp3r$Lev3l" },
    { email: "admin5@sidera.app", password: "M@nage2026!" },
  ];

  const results = [];

  for (const admin of admins) {
    // Create user
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: admin.email,
      password: admin.password,
      email_confirm: true,
    });

    if (createError) {
      // If user exists, try to get their id
      if (createError.message.includes("already been registered")) {
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existing = listData?.users?.find((u) => u.email === admin.email);
        if (existing) {
          // Update password
          await supabase.auth.admin.updateUserById(existing.id, { password: admin.password });
          // Ensure in admins table
          await supabase.from("admins").upsert({ user_id: existing.id }, { onConflict: "user_id" });
          results.push({ email: admin.email, status: "updated" });
        } else {
          results.push({ email: admin.email, status: "error", message: createError.message });
        }
      } else {
        results.push({ email: admin.email, status: "error", message: createError.message });
      }
    } else if (userData?.user) {
      // Add to admins table
      await supabase.from("admins").upsert({ user_id: userData.user.id }, { onConflict: "user_id" });
      results.push({ email: admin.email, status: "created" });
    }
  }

  return new Response(JSON.stringify({ results }, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
});
