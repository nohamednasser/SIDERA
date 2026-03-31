import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(supabaseUrl, serviceRoleKey, {
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
    // Update password & confirm email
    const { data: listData } = await sb.auth.admin.listUsers();
    const existing = listData?.users?.find((u) => u.email === admin.email);
    if (existing) {
      const { error } = await sb.auth.admin.updateUserById(existing.id, { 
        password: admin.password, 
        email_confirm: true 
      });
      results.push({ email: admin.email, status: error ? 'error: ' + error.message : 'confirmed+updated' });
    } else {
      const { data, error } = await sb.auth.admin.createUser({
        email: admin.email, password: admin.password, email_confirm: true
      });
      if (data?.user) {
        await sb.from("admins").upsert({ user_id: data.user.id }, { onConflict: "user_id" });
      }
      results.push({ email: admin.email, status: error ? 'error: ' + error.message : 'created' });
    }
  }

  return new Response(JSON.stringify({ results }, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
});
