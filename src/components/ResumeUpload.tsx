
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const ALLOWED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

const ResumeUpload = () => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please choose a file to upload.");
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Invalid file type. Please upload PDF or DOCX.");
      return;
    }
    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `${user?.id}/${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from("resumes")
      .upload(filePath, file);
    if (error) {
      toast.error("Upload failed: " + error.message);
      setUploading(false);
      return;
    }
    toast.success("Upload successful! Analyzing resume...");
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("analyze-resume", {
        body: { file_url: data?.path },
      });
      if (fnError) {
        toast.error("AI analysis failed: " + fnError.message);
      } else if (result?.ats_score != null) {
        // Insert into resume_scores client-side
        const { error: insertError } = await supabase
          .from("resume_scores")
          .insert([
            {
              user_id: user?.id,
              file_url: data?.path,
              ats_score: result.ats_score,
              feedback: result.feedback,
            },
          ]);
        if (insertError) {
          toast.error("Saving analysis failed: " + insertError.message);
        } else {
          toast.success("Resume analyzed!");
        }
      } else {
        toast.error("Unexpected analysis result.");
      }
    } catch (e) {
      toast.error("Unexpected error during analysis.");
    }
    setUploading(false);
    setFile(null);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm flex flex-col gap-3">
      <label className="font-medium mb-1">Upload your resume (PDF or DOCX):</label>
      <Input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileChange} disabled={uploading} />
      <Button
        onClick={handleUpload}
        disabled={uploading || !file}
        className="mt-2"
      >
        {uploading ? (
          <>
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
            Uploading & Analyzing...
          </>
        ) : (
          "Upload & Analyze"
        )}
      </Button>
    </div>
  );
};

export default ResumeUpload;
