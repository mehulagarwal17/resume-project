import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.6";
import * as pdf from "https://deno.land/x/pdfjs@v4.0.0/mod.ts";
import mammoth from "https://esm.sh/mammoth@1.3.25?target=deno";
import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function errorRes(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 500,
  });
}

async function extractTextFromPDF(uint8array: Uint8Array) {
  try {
    const doc = await pdf.getDocument({ data: uint8array }).promise;
    let text = "";
    for (let i = 1; i <= doc.numPages; ++i) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(" ") + "\n";
    }
    return text;
  } catch (err) {
    throw new Error(`Failed to extract PDF text: ${err.message}`);
  }
}

async function extractTextFromDocx(arrayBuffer: ArrayBuffer) {
  try {
    // mammoth expects ArrayBuffer, Deno returns Uint8Array -> ArrayBuffer
    const { value } = await mammoth.extractRawText({ arrayBuffer });
    return value;
  } catch (err) {
    throw new Error(`Failed to extract DOCX text: ${err.message}`);
  }
}

async function fetchFile(client: any, filePath: string) {
  const { data, error } = await client.storage.from("resumes").download(filePath);
  if (error || !data) throw new Error(`Failed to fetch file: ${error?.message}`);
  // Deno stream to Uint8Array
  const buf = await new Response(data).arrayBuffer();
  return new Uint8Array(buf);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    if (!supabaseUrl || !supabaseServiceRoleKey || !openAIApiKey) {
      return errorRes("Required secrets missing. Check Supabase/OPENAI keys.");
    }
    const client = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { file_url } = await req.json();
    if (!file_url) return errorRes("No file_url provided.");

    // Try to extract user id from file path (format: user_id/timestamp.ext)
    const re = /^([^/]+)\//;
    const match = file_url.match(re);
    if (!match) return errorRes("File path invalid.");
    const user_id = match[1];

    // Download and extract file text
    const fileBytes = await fetchFile(client, file_url);
    let fileText = "";
    if (file_url.endsWith(".pdf")) {
      fileText = await extractTextFromPDF(fileBytes);
    } else if (file_url.endsWith(".docx")) {
      fileText = await extractTextFromDocx(fileBytes.buffer);
    } else {
      return errorRes("Unsupported file type.");
    }

    // Prompt OpenAI for ATS scoring and feedback
    const aiPrompt = `
You are an expert resume reviewer. Analyze the following resume, then provide:
- An ATS score (out of 100) for the resume's likely performance in Applicant Tracking Systems.
- Three actionable suggestions to improve it.
- Highlight major strengths and weaknesses in 1-2 sentences.

Resume:
${fileText}
Return your reply as JSON:
{
  "ats_score": <number>,
  "feedback": "<your feedback>"
}
`;
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that analyzes resumes for ATS performance and gives actionable feedback.",
          },
          {
            role: "user",
            content: aiPrompt,
          },
        ],
        temperature: 0.2,
      }),
    });

    const aiJson = await openaiRes.json();
    let ats_score = null;
    let feedback = null;
    try {
      // Get the JSON response from OpenAI's message
      if (aiJson.choices?.[0]?.message?.content) {
        const match = aiJson.choices[0].message.content.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          ats_score = parsed.ats_score;
          feedback = parsed.feedback;
        }
      }
    } catch (_e) {}

    // Do NOT save to database. Only return to frontend.
    return new Response(
      JSON.stringify({
        ats_score,
        feedback,
        status: "analyzed",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("analyze-resume error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
