
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.6";
import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

// Import PDF parsing module for Deno
import * as pdfjs from "https://esm.sh/pdfjs-dist@4.2.67/build/pdf.mjs";

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

async function fetchFile(client: any, filePath: string) {
  const { data, error } = await client.storage.from("resumes").download(filePath);
  if (error || !data) throw new Error(`Failed to fetch file: ${error?.message}`);
  const buf = await new Response(data).arrayBuffer();
  return new Uint8Array(buf);
}

async function extractPdfText(pdfBytes: Uint8Array): Promise<string> {
  try {
    const loadingTask = pdfjs.getDocument({ data: pdfBytes });
    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
      fullText += pageText + "\n";
    }

    return fullText.trim();
  } catch (e) {
    throw new Error("Failed to extract text from PDF: " + e.message);
  }
}

async function analyzeResumeWithAI(resumeText: string) {
  const prompt = `
You are an advanced ATS (Applicant Tracking System) resume evaluator.
Analyze the following resume text and provide:
1. An ATS-match score (0-100, integer) based on layout, keyword, and general job readiness.
2. Actionable feedback (2-4 sentences max) for improvement.

Resume text:
${resumeText}
---
Respond in this JSON format only:
{ "ats_score": <score>, "feedback": "<feedback>" }
`;

  const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openAIApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an AI resume expert." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 400,
      response_format: { type: "json_object" },
    }),
  });

  const data = await aiResponse.json();
  if (data.choices?.length && data.choices[0].message?.content) {
    try {
      // Try to parse OpenAI's response content as JSON
      return JSON.parse(data.choices[0].message.content);
    } catch (err) {
      throw new Error("AI response could not be parsed.");
    }
  } else {
    throw new Error("AI returned no result. " + JSON.stringify(data));
  }
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

    // Download file from storage
    const fileBytes = await fetchFile(client, file_url);

    if (file_url.endsWith(".pdf")) {
      // Extract text and run AI analysis for PDF files
      const pdfText = await extractPdfText(fileBytes);
      if (!pdfText || !pdfText.trim()) {
        return errorRes("Could not extract any text from your PDF. Try a differently formatted PDF.");
      }
      const analysisResult = await analyzeResumeWithAI(pdfText);
      return new Response(JSON.stringify(analysisResult), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else if (file_url.endsWith(".docx")) {
      // This code path is intentionally left "unavailable" since extracting DOCX in Edge Functions is not implemented yet.
      return errorRes("DOCX analysis is temporarily unavailable. Please try again later.");
    } else {
      return errorRes("Unsupported file type. Only PDF and DOCX are supported.");
    }

  } catch (error) {
    console.error("analyze-resume error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
