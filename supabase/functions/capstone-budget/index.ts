import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { project_idea, grade } = await req.json();

    if (!project_idea || typeof project_idea !== "string" || project_idea.trim().length < 10) {
      return new Response(JSON.stringify({ error: "Project idea must be at least 10 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch previous capstone projects for context
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: prevProjects } = await supabase
      .from("capstone_projects")
      .select("title, description, grade")
      .limit(20);

    const prevContext = (prevProjects || [])
      .map((p: any) => `- ${p.title}: ${(p.description || "").substring(0, 100)}`)
      .join("\n");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert STEM project budget and inventory advisor for high school students in Egypt. 
You must help students plan their capstone projects by predicting components, costs, and where to buy them in Egypt.

Context from previous successful projects:
${prevContext || "No previous project data available."}

RULES:
- Predict ALL components the student will need (sensors, microcontrollers, materials, tools, wires, etc.)
- Give realistic prices in Egyptian Pounds (EGP) based on current Egypt market prices
- Suggest specific Egyptian stores/websites: RAM Electronics (ram-e-shop.com), Maker Lab Egypt, Future Electronics Egypt, AliExpress (for international shipping), Amazon.eg, Jumia Egypt
- Include links when possible
- Categorize components: Electronics, Mechanical, Consumables, Tools
- Add a 15% contingency budget
- Give total estimated cost
- Add practical tips and warnings
- Respond in the SAME language as the project idea (Arabic or English)

You MUST respond using the predict_budget tool.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Project idea: ${project_idea.substring(0, 3000)}\nGrade: ${grade || "G12"}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "predict_budget",
              description: "Predict budget and components for a capstone project",
              parameters: {
                type: "object",
                properties: {
                  project_summary: { type: "string", description: "Brief summary of the project" },
                  categories: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category_name: { type: "string", description: "e.g. Electronics, Mechanical, Consumables, Tools" },
                        category_icon: { type: "string", description: "Emoji icon for this category" },
                        items: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: { type: "string" },
                              quantity: { type: "number" },
                              unit_price_egp: { type: "number" },
                              total_price_egp: { type: "number" },
                              where_to_buy: { type: "string", description: "Store name" },
                              buy_url: { type: "string", description: "URL to buy, or empty string" },
                              notes: { type: "string", description: "Any tips about this item" },
                            },
                            required: ["name", "quantity", "unit_price_egp", "total_price_egp", "where_to_buy"],
                            additionalProperties: false,
                          },
                        },
                      },
                      required: ["category_name", "category_icon", "items"],
                      additionalProperties: false,
                    },
                  },
                  subtotal_egp: { type: "number" },
                  contingency_egp: { type: "number", description: "15% buffer" },
                  total_egp: { type: "number" },
                  tips: {
                    type: "array",
                    items: { type: "string" },
                    description: "Practical tips and warnings",
                  },
                  difficulty_level: { type: "string", enum: ["Easy", "Medium", "Hard", "Advanced"] },
                  estimated_build_time: { type: "string", description: "e.g. 2-3 weeks" },
                },
                required: ["project_summary", "categories", "subtotal_egp", "contingency_egp", "total_egp", "tips", "difficulty_level", "estimated_build_time"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "predict_budget" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "rate_limit" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "payment_required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const parsed = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ budget: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Capstone budget error:", error);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
