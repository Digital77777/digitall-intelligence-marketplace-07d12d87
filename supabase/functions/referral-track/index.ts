import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const referral_code = (body?.referral_code ?? "").toString().trim();
    const landing_path = (body?.landing_path ?? "/").toString().slice(0, 500);

    if (!referral_code) {
      return new Response(JSON.stringify({ error: "Missing referral_code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Hash IP for privacy
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const hashBuf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(ip + ":dim-partner")
    );
    const ip_hash = Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 32);

    const user_agent = (req.headers.get("user-agent") ?? "").slice(0, 300);

    // Look up referrer for the code
    const { data: ref } = await supabase
      .from("referrals")
      .select("referrer_id, click_count")
      .eq("referral_code", referral_code)
      .limit(1)
      .maybeSingle();

    await supabase.from("referral_clicks").insert({
      referral_code,
      referrer_user_id: ref?.referrer_id ?? null,
      user_agent,
      ip_hash,
      landing_path,
    });

    if (ref?.referrer_id) {
      await supabase
        .from("referrals")
        .update({
          click_count: (ref.click_count ?? 0) + 1,
          first_clicked_at: new Date().toISOString(),
        })
        .eq("referral_code", referral_code)
        .is("first_clicked_at", null);

      await supabase
        .from("referrals")
        .update({ click_count: (ref.click_count ?? 0) + 1 })
        .eq("referral_code", referral_code);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
