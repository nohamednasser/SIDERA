import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `أنت "SIDERA AI" — مساعد ذكي لطلاب مدارس STEM في مصر. أنت ودود ومفيد.

معلومات عن المنصة:
- SIDERA STEM Drive: منصة تعليمية لرفع وتحميل الملفات والمذكرات لطلاب STEM
- المواد: Mathematics, Physics, Chemistry, Biology, Computer Science, Engineering
- الصفوف: Grade 10, 11, 12
- يمكن رفع ملفات حتى 10GB (PDF, صور, فيديو, ZIP)
- يوجد STEM Calculator على stemcalculator.lovable.app
- يوجد Sider Platform على siderdev.lovable.app

نظام التقييم:
- المشاريع: 40%
- الامتحانات: 30%
- المشاركة: 20%
- الحضور: 10%

نصائح للـ Portfolio:
1. اجمع أفضل مشاريعك
2. ارفعهم على SIDERA
3. اكتب وصف واضح لكل مشروع
4. ممكن تضيف فيديو شرح

نصائح للـ Capstone:
1. اختار مشكلة حقيقية
2. اعمل Research كويس
3. صمم Prototype
4. اعمل عرض تقديمي قوي

أجب بالعربية (عامية مصرية) بشكل مختصر ومفيد. استخدم إيموجي مناسبة. لو السؤال مش متعلق بـ STEM أو التعليم، حاول تساعد بردو بشكل ودي.`;

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

    const response = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 500,
      }),
    });

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
