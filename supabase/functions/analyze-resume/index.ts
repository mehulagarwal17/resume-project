
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.6";

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

// Simple text extraction for DOCX files (basic implementation)
function extractTextFromDocx(buffer: Uint8Array): string {
  try {
    // Convert buffer to text and extract readable content
    const text = new TextDecoder().decode(buffer);
    // Basic regex to extract text content from DOCX (this is a simplified approach)
    const matches = text.match(/[\w\s\.\,\;\:\!\?\-\(\)]+/g);
    return matches ? matches.join(' ').replace(/\s+/g, ' ').trim() : '';
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    return '';
  }
}

async function fetchFile(client: any, filePath: string) {
  const { data, error } = await client.storage.from("resumes").download(filePath);
  if (error || !data) throw new Error(`Failed to fetch file: ${error?.message}`);
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

    // Download file and extract text
    const fileBytes = await fetchFile(client, file_url);
    let fileText = "";
    
    if (file_url.endsWith(".pdf")) {
      return errorRes("PDF analysis is temporarily unavailable. Please upload a DOCX file.");
    } else if (file_url.endsWith(".docx")) {
      fileText = extractTextFromDocx(fileBytes);
      if (!fileText) {
        return errorRes("Could not extract text from DOCX file. Please ensure the file is valid.");
      }
    } else {
      return errorRes("Unsupported file type. Only DOCX is currently supported.");
    }

    console.log("Extracted text length:", fileText.length);

    // Analyze with OpenAI
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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
            content: "You are an ATS (Applicant Tracking System) expert. Analyze the resume and provide a score from 1-100 and detailed feedback on how to improve it for ATS compatibility."
          },
          {
            role: "user",
            content: `Please analyze this resume for ATS compatibility and provide a score (1-100) and feedback:\n\n${fileText}`
          }
        ],
        max_tokens: 1000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error("OpenAI API error:", errorText);
      return errorRes("Failed to analyze resume with AI. Please try again.");
    }

    const aiResult = await openAIResponse.json();
    const analysis = aiResult.choices[0].message.content;

    // Extract score from analysis (look for numbers)
    const scoreMatch = analysis.match(/(\d{1,3})/);
    const ats_score = scoreMatch ? parseInt(scoreMatch[1]) : 75; // Default score if not found

    console.log("Analysis complete. Score:", ats_score);

    // Insert result into database
    const { error: insertError } = await client
      .from("resume_scores")
      .insert([
        {
          user_id: user_id,
          file_url: file_url,
          ats_score: ats_score,
          feedback: analysis,
        },
      ]);

    if (insertError) {
      console.error("Database insert error:", insertError);
      return errorRes("Failed to save analysis results.");
    }

    return new Response(
      JSON.stringify({
        ats_score: ats_score,
        feedback: analysis,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("analyze-resume error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
