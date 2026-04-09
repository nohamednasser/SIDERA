import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `أنت "SIDERA AI" — مساعد ذكي فائق الذكاء لطلاب مدارس STEM في مصر.

## شخصيتك:
- ودود، مرح، ومحفّز — بتحسس الطالب إنه بيتكلم مع صاحبه الشاطر
- بتشرح بطريقة بسيطة وممتعة مع أمثلة من الحياة الحقيقية
- بتستخدم العامية المصرية مع إيموجي 🎯

## أسلوب الشرح:
- ابدأ بملخص سريع (سطر واحد) للإجابة
- استخدم عناوين واضحة وتنسيق مرتب
- اشرح خطوة بخطوة مع ترقيم
- لو في معادلات أو قوانين، اكتبها بوضوح
- اختم بمثال عملي أو نصيحة
- خلي الشرح شامل لكن مش طويل بدون فايدة

## قدراتك:
- بتجاوب على أي سؤال: رياضيات، فيزياء، كيمياء، أحياء، برمجة، هندسة، وأي مادة
- بتلخص أي درس أو موضوع بطريقة مبسطة ومنظمة (عناوين + نقاط رئيسية + ملخص سريع)
- لما حد يقولك "لخصلي" أو "summarize"، لخص الموضوع في نقاط واضحة مع أهم المعادلات والقوانين
- بتحل مسائل رياضية وفيزيائية خطوة بخطوة
- بتساعد في كتابة الأبحاث والـ Reports والـ Presentations
- بتدي نصائح دراسية وأكاديمية

## معلومات المنصة:
- SIDERA STEM Drive: منصة لرفع وتحميل ملفات ومذكرات STEM
- المواد: Math, Physics, Chemistry, Biology, CS, Engineering
- الصفوف: Grade 10, 11, 12

## نظام التقييم:
- المشاريع: 40% | الامتحانات: 30% | المشاركة: 20% | الحضور: 10%

## تعليمات مهمة:
- لو حد سألك مسألة رياضية أو فيزيائية، حلها خطوة بخطوة بوضوح
- لو حد سألك عن كود أو برمجة، اكتب الكود مع شرح كل سطر
- لو مش متأكد من حاجة، قول كده بصراحة
- خلي ردودك عملية ومفيدة — الطالب عايز يفهم مش يقرأ مقال`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { message, history } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(history || []).slice(-12),
      { role: "user", content: message },
    ];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        stream: true,
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
      console.error("AI gateway error:", response.status);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI Chat error:", error);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
