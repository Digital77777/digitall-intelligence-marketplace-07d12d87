import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FeedbackNotificationRequest {
  category: string;
  message: string;
  userEmail: string;
  userName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, message, userEmail, userName }: FeedbackNotificationRequest = await req.json();

    const adminEmail = "digitalintelligencemarketplace@gmail.com";

    const emailResponse = await resend.emails.send({
      from: "Digitall Intelligence <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `New Platform Feedback: ${category}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Feedback Received</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>From:</strong> ${userName || 'Anonymous'} (${userEmail || 'No email'})</p>
            <p><strong>Message:</strong></p>
            <p style="background: white; padding: 15px; border-radius: 4px;">${message}</p>
          </div>
          <p style="color: #666; font-size: 12px;">This notification was sent from the Digitall Intelligence platform.</p>
        </div>
      `,
    });

    console.log("Feedback notification sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending feedback notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
