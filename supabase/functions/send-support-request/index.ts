import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const requestSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  message: z.string().min(1, "Message is required").max(5000, "Message must be less than 5000 characters"),
  userEmail: z.string().email("Invalid email").optional(),
  userName: z.string().max(100).optional(),
});

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user info from JWT if available
    let userEmail: string | undefined;
    let userName: string | undefined;

    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const supabase = createClient(
        "https://uegujjkjkoohucpbdjwj.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlZ3Vqamtqa29vaHVjcGJkandqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzkxNzIsImV4cCI6MjA2ODAxNTE3Mn0.tIR1Pldwu-Ncp0W43vIwsjf3RvrDF3PNKOJ4r0x5Nf8",
        {
          global: {
            headers: { Authorization: authHeader },
          },
        }
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userEmail = user.email;
        
        // Try to get user profile for name
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", user.id)
          .single();
        
        userName = profile?.full_name || user.email?.split("@")[0];
      }
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = requestSchema.parse({
      ...body,
      userEmail: body.userEmail || userEmail,
      userName: body.userName || userName,
    });

    const { subject, message } = validatedData;
    const senderEmail = validatedData.userEmail || "anonymous@unknown.com";
    const senderName = validatedData.userName || "Anonymous User";

    // Send email to support
    const supportEmailResponse = await resend.emails.send({
      from: "DIM Support <onboarding@resend.dev>",
      to: ["digitalintelligencemarketplace@gmail.com"],
      subject: `[Priority Support] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            Priority Support Request
          </h1>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #495057;">From:</h3>
            <p style="margin: 0;"><strong>Name:</strong> ${senderName}</p>
            <p style="margin: 5px 0 0 0;"><strong>Email:</strong> ${senderEmail}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #495057;">Subject:</h3>
            <p style="background-color: #e9ecef; padding: 10px; border-radius: 4px;">${subject}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #495057;">Message:</h3>
            <div style="background-color: #fff; border: 1px solid #dee2e6; padding: 15px; border-radius: 4px; white-space: pre-wrap;">${message}</div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 12px; color: #6c757d;">
            <p>This is a priority support request from Digital Intelligence Marketplace.</p>
            <p>Submitted at: ${new Date().toISOString()}</p>
          </div>
        </div>
      `,
    });

    console.log("Support email sent:", supportEmailResponse);

    // Send confirmation email to user if we have their email
    if (validatedData.userEmail) {
      const confirmationResponse = await resend.emails.send({
        from: "DIM Support <onboarding@resend.dev>",
        to: [validatedData.userEmail],
        subject: "We received your support request",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Thank you for contacting us, ${senderName}!</h1>
            
            <p>We have received your priority support request and will respond within 15 minutes during business hours.</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0;">Your Request:</h3>
              <p><strong>Subject:</strong> ${subject}</p>
              <p style="white-space: pre-wrap;"><strong>Message:</strong><br/>${message}</p>
            </div>
            
            <p>If you need immediate assistance, you can also:</p>
            <ul>
              <li>WhatsApp us at <a href="https://wa.me/27671642375">+27 67 164 2375</a></li>
              <li>Call us at <a href="tel:+27671642375">+27 67 164 2375</a></li>
            </ul>
            
            <p style="color: #6c757d; font-size: 12px; margin-top: 30px;">
              Best regards,<br/>
              Digital Intelligence Marketplace Support Team
            </p>
          </div>
        `,
      });

      console.log("Confirmation email sent:", confirmationResponse);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Support request sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-support-request function:", error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Validation error", details: error.errors }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: error.message || "Failed to send support request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
