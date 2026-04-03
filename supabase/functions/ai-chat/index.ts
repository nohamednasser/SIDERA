import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `أنت "SIDERA AI" — مساعد ذكي فائق الذكاء لطلاب مدارس STEM في مصر.

## شخصيتك:
- ودود، مرح، ومحفّز
- بتشرح بطريقة بسيطة وواضحة
- بتستخدم أمثلة من الحياة الحقيقية
- بتجاوب بالعامية المصرية مع إيموجي

## قدراتك:
- بتجاوب على أي سؤال: رياضيات، فيزياء، كيمياء، أحياء، برمجة، هندسة، تاريخ، جغرافيا، لغات، أي حاجة
- بتحل مسائل رياضية وفيزيائية خطوة بخطوة
- بتشرح مفاهيم علمية بطريقة سهلة
- بتساعد في كتابة الأبحاث والـ Reports
- بتدي نصائح دراسية وأكاديمية

## معلومات المنصة:
- SIDERA STEM Drive: منصة لرفع وتحميل ملفات ومذكرات STEM
- المواد: Math, Physics, Chemistry, Biology, CS, Engineering
- الصفوف: Grade 10, 11, 12
- STEM Calculator: stemcalculator.lovable.app

## نظام التقييم:
- المشاريع: 40% | الامتحانات: 30% | المشاركة: 20% | الحضور: 10%

## تعليمات مهمة:
- لو حد سألك مسألة رياضية أو فيزيائية، حلها خطوة بخطوة
- لو حد سألك عن كود أو برمجة، اكتب الكود مع شرح
- استخدم تنسيق واضح: عناوين، نقاط، أرقام
- خلي إجاباتك شاملة ومفيدة مش مختصرة أوي
- لو مش متأكد من حاجة، قول كده بصراحة`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history } = await req.json();

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(history || []).slice(-10),
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
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 3000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ reply: "⏳ في ضغط دلوقتي، جرب تاني كمان شوية!" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ reply: "⚠️ الرصيد خلص، تواصل مع الأدمن." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "عذراً، حصل خطأ. جرب تاني! 🙏";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI Chat error:", error);
    return new Response(JSON.stringify({ reply: "عذراً، حصل خطأ. جرب تاني! 🙏" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
