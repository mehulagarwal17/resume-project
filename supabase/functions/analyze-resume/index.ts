
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.6";
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

// --- Remove DOCX Extraction Logic ---

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

    // Download file, but do not try to extract text
    const fileBytes = await fetchFile(client, file_url);
    let fileText = "";
    if (file_url.endsWith(".pdf")) {
      return errorRes("PDF analysis is temporarily unavailable. Please upload a DOCX file.");
    } else if (file_url.endsWith(".docx")) {
      return errorRes("DOCX analysis is temporarily unavailable. Please try again later.");
    } else {
      return errorRes("Unsupported file type. Only DOCX is currently supported.");
    }

    // The remainder of the function is skipped, since analysis cannot proceed if no DOCX text extraction.

  } catch (error) {
    console.error("analyze-resume error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
