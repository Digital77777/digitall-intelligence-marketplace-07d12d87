import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const requestSchema = z.object({
  userEmail: z.string().email().max(255),
  userName: z.string().min(1).max(100),
  sessionDate: z.string().min(1).max(50),
  sessionTime: z.string().min(1).max(50),
  consultant: z.string().min(1).max(100),
});

interface SessionNotificationRequest {
  userEmail: string;
  userName: string;
  sessionDate: string;
  sessionTime: string;
  consultant: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Session notification function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate request body
    const body = await req.json();
    const validation = requestSchema.safeParse(body);
    
    if (!validation.success) {
      console.error("Validation error:", validation.error.issues);
      return new Response(
        JSON.stringify({ 
          error: "Invalid request data",
          details: validation.error.issues 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const { userEmail, userName, sessionDate, sessionTime, consultant } = validation.data;
    
    console.log("Sending session notifications for:", { userEmail, sessionDate, sessionTime, consultant });

    // Send confirmation email to user
    const userEmailResponse = await resend.emails.send({
      from: "AI Career Hub <onboarding@resend.dev>",
      to: [userEmail],
      subject: "Your Strategy Session is Confirmed!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Strategy Session Confirmed! 🎯</h1>
            </div>
            <div style="padding: 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi ${userName || 'there'},</p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">Great news! Your strategy session has been successfully booked.</p>
              
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px;">Session Details</h3>
                <p style="color: #4b5563; margin: 8px 0;"><strong>📅 Date:</strong> ${sessionDate}</p>
                <p style="color: #4b5563; margin: 8px 0;"><strong>🕐 Time:</strong> ${sessionTime}</p>
                <p style="color: #4b5563; margin: 8px 0;"><strong>👤 Consultant:</strong> ${consultant}</p>
                <p style="color: #4b5563; margin: 8px 0;"><strong>📍 Format:</strong> Video Call</p>
              </div>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">You'll receive a meeting link 24 hours before your session. Come prepared with any questions about your AI career journey!</p>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Best regards,<br>The AI Career Hub Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("User confirmation email sent:", userEmailResponse);

    // Send notification to admin (simulating consultant notification)
    const adminEmail = "admin@aicareerplatform.com"; // This would be the consultant's actual email in production
    const adminEmailResponse = await resend.emails.send({
      from: "AI Career Hub <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `New Strategy Session Booking - ${sessionDate}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Session Booking 📋</h1>
            </div>
            <div style="padding: 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi ${consultant},</p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">A new strategy session has been booked with you.</p>
              
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px;">Booking Details</h3>
                <p style="color: #4b5563; margin: 8px 0;"><strong>👤 Client:</strong> ${userName || userEmail}</p>
                <p style="color: #4b5563; margin: 8px 0;"><strong>📧 Email:</strong> ${userEmail}</p>
                <p style="color: #4b5563; margin: 8px 0;"><strong>📅 Date:</strong> ${sessionDate}</p>
                <p style="color: #4b5563; margin: 8px 0;"><strong>🕐 Time:</strong> ${sessionTime}</p>
              </div>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">Please ensure you're available and send the meeting link to the client 24 hours before the session.</p>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">- AI Career Hub System</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Admin notification email sent:", adminEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        userEmail: userEmailResponse,
        adminEmail: adminEmailResponse 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-session-notification function:", error);
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
