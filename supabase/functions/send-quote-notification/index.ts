import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const requestSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  company: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  serviceTitle: z.string().min(1).max(200),
  projectDescription: z.string().min(1).max(5000),
  timeline: z.string().max(100).optional(),
  budget: z.string().max(100).optional(),
  requirements: z.string().max(5000).optional(),
});

const handler = async (req: Request): Promise<Response> => {
  console.log("Quote notification function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the JWT token and get user
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Authentication failed" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

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

    const { name, email, company, phone, serviceTitle, projectDescription, timeline, budget, requirements } = validation.data;
    
    // Verify the authenticated user's email matches the requester email
    if (user.email !== email) {
      console.error("User email mismatch - authenticated:", user.email, "provided:", email);
      return new Response(
        JSON.stringify({ error: "You can only submit quote requests from your own email" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Received quote request data:", { ...validation.data, email: email.substring(0, 3) + "***" });

    // Admin email - you should replace this with your actual admin email
    const adminEmail = "admin@digitalintelligence.com";

    // Send notification to admin
    const adminEmailResponse = await resend.emails.send({
      from: "Quote Requests <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `New Quote Request: ${serviceTitle}`,
      html: `
        <h1>New Quote Request Received</h1>
        <h2>Service: ${serviceTitle}</h2>
        
        <h3>Contact Information</h3>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          ${company ? `<li><strong>Company:</strong> ${company}</li>` : ''}
          ${phone ? `<li><strong>Phone:</strong> ${phone}</li>` : ''}
        </ul>
        
        <h3>Project Details</h3>
        <p><strong>Description:</strong></p>
        <p>${projectDescription}</p>
        
        ${timeline ? `<p><strong>Timeline:</strong> ${timeline}</p>` : ''}
        ${budget ? `<p><strong>Budget:</strong> ${budget}</p>` : ''}
        ${requirements ? `<p><strong>Additional Requirements:</strong></p><p>${requirements}</p>` : ''}
        
        <hr>
        <p style="color: #666; font-size: 12px;">
          This is an automated notification from the Digital Intelligence Marketplace.
        </p>
      `,
    });

    console.log("Admin email sent:", adminEmailResponse);

    // Send confirmation to the requester
    const confirmationEmailResponse = await resend.emails.send({
      from: "Digital Intelligence <onboarding@resend.dev>",
      to: [email],
      subject: `Quote Request Received - ${serviceTitle}`,
      html: `
        <h1>Thank You, ${name}!</h1>
        <p>We have received your quote request for <strong>${serviceTitle}</strong>.</p>
        
        <h3>What's Next?</h3>
        <p>Our team will review your requirements and get back to you within 1-2 business days with a detailed proposal.</p>
        
        <h3>Your Request Summary</h3>
        <ul>
          <li><strong>Service:</strong> ${serviceTitle}</li>
          ${timeline ? `<li><strong>Timeline:</strong> ${timeline}</li>` : ''}
          ${budget ? `<li><strong>Budget:</strong> ${budget}</li>` : ''}
        </ul>
        
        <p>If you have any urgent questions, please don't hesitate to reach out.</p>
        
        <p>Best regards,<br>The Digital Intelligence Team</p>
      `,
    });

    console.log("Confirmation email sent:", confirmationEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        adminEmail: adminEmailResponse,
        confirmationEmail: confirmationEmailResponse 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-quote-notification function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
