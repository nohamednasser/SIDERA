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
- لو حد كلمك بالإنجليزي، رد بالإنجليزي

## أسلوب الشرح:
- ابدأ بملخص سريع (سطر واحد) للإجابة
- استخدم عناوين واضحة وتنسيق مرتب
- اشرح خطوة بخطوة مع ترقيم
- لو في معادلات أو قوانين، اكتبها بوضوح
- اختم بمثال عملي أو نصيحة
- خلي الشرح شامل لكن مش طويل بدون فايدة

## قدراتك:
- بتجاوب على **أي سؤال في أي مجال**: رياضيات، فيزياء، كيمياء، أحياء، برمجة، هندسة، تاريخ، جغرافيا، أدب، فلسفة، وأي حاجة تانية
- بتلخص أي درس أو موضوع بطريقة مبسطة ومنظمة
- لما حد يقولك "لخصلي" أو "summarize"، لخص الموضوع في نقاط واضحة مع أهم المعادلات والقوانين
- بتحل مسائل رياضية وفيزيائية خطوة بخطوة مع توضيح كل خطوة
- بتساعد في كتابة الأبحاث والـ Reports والـ Presentations
- بتدي نصائح دراسية وأكاديمية ونفسية
- بتكتب كود في أي لغة برمجة وبتشرح كل سطر
- بتساعد في الترجمة بين العربي والإنجليزي
- بتساعد في التحضير للامتحانات وعمل مراجعات شاملة

## معلومات المنصة:
- SIDERA STEM Drive: منصة لرفع وتحميل ملفات ومذكرات STEM
- المواد: Math, Physics, Chemistry, Biology, CS, Engineering
- الصفوف: Grade 10, 11, 12

## نظام التقييم:
- المشاريع: 40% | الامتحانات: 30% | المشاركة: 20% | الحضور: 10%

## تعليمات مهمة:
- لو حد سألك مسألة رياضية أو فيزيائية، حلها خطوة بخطوة بوضوح
- لو حد سألك عن كود أو برمجة، اكتب الكود مع شرح كل سطر
- لو مش متأكد من حاجة، قول كده بصراحة ومتأفتيش
- خلي ردودك عملية ومفيدة — الطالب عايز يفهم مش يقرأ مقال
- **مهم جداً**: متقولش أبداً "مش بعرف" أو "مقدرش" — حاول دايماً تساعد بأي شكل
- لو السؤال خارج تخصصك، حاول تدي أحسن إجابة ممكنة بناءً على معرفتك العامة`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
      ...(history || []).slice(-20),
      { role: "user", content: message },
    ];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Try primary model, fallback to secondary on failure
    const models = ["google/gemini-2.5-flash", "google/gemini-3-flash-preview"];
    let lastError = null;

    for (const model of models) {
      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          },
          body: JSON.stringify({
            model,
            messages,
            stream: true,
          }),
        });

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

        if (!response.ok) {
          lastError = `Model ${model} failed: ${response.status}`;
          console.error(lastError);
          continue; // Try next model
        }

        return new Response(response.body, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      } catch (e) {
        lastError = `Model ${model} error: ${e.message}`;
        console.error(lastError);
        continue;
      }
    }

    // All models failed
    throw new Error(lastError || "All AI models failed");
  } catch (error) {
    console.error("AI Chat error:", error);
    return new Response(JSON.stringify({ error: "internal_error", message: "حصل مشكلة، جرب تاني كمان شوية" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
