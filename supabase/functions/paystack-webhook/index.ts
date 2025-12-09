import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

// Tier mapping based on Paystack payment links
const PAYMENT_LINK_TO_TIER: Record<string, string> = {
  "xlgcwqb3jq": "creator", // Creator tier payment link
  "p8i77ax7q3": "career",  // Career tier payment link
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      console.error("PAYSTACK_SECRET_KEY not configured");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // Verify webhook signature
    if (signature) {
      const encoder = new TextEncoder();
      const key = encoder.encode(paystackSecretKey);
      const data = encoder.encode(body);
      
      const hmac = createHmac("sha512", key);
      hmac.update(data);
      const expectedSignature = hmac.digest("hex");
      
      if (signature !== expectedSignature) {
        console.error("Invalid webhook signature");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const payload = JSON.parse(body);
    console.log("Paystack webhook received:", payload.event);

    // Only process successful charge events
    if (payload.event !== "charge.success") {
      console.log("Ignoring event:", payload.event);
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = payload.data;
    const customerEmail = data.customer?.email;
    const reference = data.reference;
    const metadata = data.metadata || {};

    console.log("Processing payment for:", customerEmail, "Reference:", reference);

    // Determine tier from payment link or metadata
    let tierName: string | null = null;

    // Check if metadata contains tier info
    if (metadata.tier) {
      tierName = metadata.tier;
    } else if (metadata.custom_fields) {
      // Check custom fields for tier info
      const tierField = metadata.custom_fields.find(
        (field: { variable_name: string }) => field.variable_name === "tier"
      );
      if (tierField) {
        tierName = tierField.value;
      }
    }

    // Try to extract tier from reference or authorization URL
    if (!tierName) {
      for (const [linkId, tier] of Object.entries(PAYMENT_LINK_TO_TIER)) {
        if (reference?.includes(linkId) || data.authorization_url?.includes(linkId)) {
          tierName = tier;
          break;
        }
      }
    }

    // Default to checking the amount if we still don't have a tier
    if (!tierName) {
      const amount = data.amount / 100; // Paystack amounts are in kobo/cents
      // You can adjust these thresholds based on your pricing
      if (amount >= 500) {
        tierName = "career";
      } else if (amount >= 100) {
        tierName = "creator";
      }
    }

    if (!tierName) {
      console.error("Could not determine tier from payment");
      return new Response(JSON.stringify({ error: "Could not determine tier" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!customerEmail) {
      console.error("No customer email in payment data");
      return new Response(JSON.stringify({ error: "Missing customer email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find user by email
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) {
      console.error("Error fetching users:", userError);
      return new Response(JSON.stringify({ error: "Failed to fetch users" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user = users.users.find((u) => u.email === customerEmail);
    if (!user) {
      console.error("User not found for email:", customerEmail);
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Found user:", user.id, "Upgrading to tier:", tierName);

    // Get the tier ID
    const { data: tier, error: tierError } = await supabase
      .from("subscription_tiers")
      .select("id")
      .eq("name", tierName)
      .eq("is_active", true)
      .single();

    if (tierError || !tier) {
      console.error("Tier not found:", tierName, tierError);
      return new Response(JSON.stringify({ error: "Tier not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate expiration (1 month from now)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    // Upsert user subscription
    const { error: subscriptionError } = await supabase
      .from("user_subscriptions")
      .upsert(
        {
          user_id: user.id,
          tier_id: tier.id,
          status: "active",
          started_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

    if (subscriptionError) {
      console.error("Failed to update subscription:", subscriptionError);
      return new Response(JSON.stringify({ error: "Failed to update subscription" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Successfully upgraded user", user.id, "to", tierName);

    // Create a notification for the user
    await supabase.from("notifications").insert({
      user_id: user.id,
      type: "subscription_upgrade",
      message: `Your subscription has been upgraded to ${tierName.charAt(0).toUpperCase() + tierName.slice(1)}!`,
      metadata: {
        tier: tierName,
        reference: reference,
      },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `User ${customerEmail} upgraded to ${tierName}` 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
