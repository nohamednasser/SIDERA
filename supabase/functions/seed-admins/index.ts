import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller is already an admin or this is first-time setup
    const authHeader = req.headers.get("Authorization");
    
    // Check if any admins exist
    const { data: existingAdmins } = await supabaseAdmin
      .from("admins")
      .select("user_id")
      .limit(1);

    if (existingAdmins && existingAdmins.length > 0) {
      // Admins already exist, verify caller is admin
      if (!authHeader) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: isCallerAdmin } = await supabaseAdmin
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .single();
      if (!isCallerAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const adminAccounts = [
      { email: "admin1@sidera.app", password: "Sid3ra@2026" },
      { email: "admin2@sidera.app", password: "Dr1ve#Secure" },
      { email: "admin3@sidera.app", password: "St3m!Pass99" },
      { email: "admin4@sidera.app", password: "Upp3r$Lev3l" },
      { email: "admin5@sidera.app", password: "M@nage2026!" },
    ];

    const results = [];

    for (const admin of adminAccounts) {
      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existing = existingUsers?.users?.find(u => u.email === admin.email);

      let userId: string;

      if (existing) {
        userId = existing.id;
        results.push({ email: admin.email, status: "already exists" });
      } else {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: admin.email,
          password: admin.password,
          email_confirm: true,
        });

        if (error) {
          results.push({ email: admin.email, status: "error", message: error.message });
          continue;
        }
        userId = data.user.id;
        results.push({ email: admin.email, status: "created" });
      }

      // Add to admins table
      await supabaseAdmin.from("admins").upsert({ user_id: userId });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
