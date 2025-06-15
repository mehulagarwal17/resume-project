
// @deno-types="npm:@types/pdf-lib"
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { PDFDocument, rgb, StandardFonts } from "npm:pdf-lib@1.17.1"; // Pure JS PDF creation
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function getRandomPricing(): { plan: string; price: number }[] {
  // Pick a random set of plans and prices
  const basePrices = [
    { plan: "Basic", price: 49 },
    { plan: "Pro", price: 99 },
    { plan: "Enterprise", price: 199 },
  ];
  // Add randomization for demo purposes
  return basePrices.map(
    ({ plan, price }) => ({
      plan,
      price: price + Math.floor(Math.random() * 40) // 0-39 extra
    })
  );
}

async function generatePricingPDF(pricing: { plan: string; price: number }[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([400, 300]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  page.setFont(font);
  page.setFontSize(20);
  page.drawText("Your Custom Pricing Quote", { x: 60, y: 260, color: rgb(0, 0, 0.8) });

  let y = 220;
  page.setFontSize(14);
  for (const { plan, price } of pricing) {
    page.drawText(`${plan} Plan: $${price}/mo`, { x: 60, y, color: rgb(0, 0.1, 0.2) });
    y -= 32;
  }

  page.drawText("Valid for: 14 days", { x: 60, y: 60, size: 12, color: rgb(0.3, 0.3, 0.3) });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid email." }),
        { status: 400, headers: corsHeaders }
      );
    }

    const pricing = getRandomPricing();
    const pdfBytes = await generatePricingPDF(pricing);

    // Send email with PDF attached
    const emailResponse = await resend.emails.send({
      from: "Lovable Pricing <onboarding@resend.dev>",
      to: [email],
      subject: "Your Custom Pricing Quote",
      html: `<p>Thank you for requesting pricing!<br/>Please find your custom pricing PDF attached.</p>`,
      attachments: [
        {
          filename: "pricing-quote.pdf",
          content: pdfBytes,
          contentType: "application/pdf",
        },
      ],
    });

    if ("error" in emailResponse && emailResponse.error) {
      console.error("Resend error", emailResponse.error);
      return new Response(JSON.stringify({ error: "Failed to send email." }),
        { status: 500, headers: corsHeaders });
    }
    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
  } catch (e: any) {
    console.error("Function error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
