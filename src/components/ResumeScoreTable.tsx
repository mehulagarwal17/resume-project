
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ResumeScoreTable = () => {
  const { user } = useAuth();

  const { data: resumeScores, isLoading, error } = useQuery({
    queryKey: ["resume_scores", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("resume_scores")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
  });

  if (isLoading) return <div className="text-center py-6">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-6">Error: {error.message}</div>;
  if (!resumeScores?.length) return <div className="text-center py-6 text-gray-600">No resume analyses yet.</div>;

  return (
    <div className="bg-white rounded-lg p-6 shadow-md overflow-auto">
      <h2 className="text-xl font-semibold mb-3">Your Resume Analyses</h2>
      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            <th className="p-2 border-b">Date</th>
            <th className="p-2 border-b">ATS Score</th>
            <th className="p-2 border-b">Feedback</th>
            <th className="p-2 border-b">File</th>
          </tr>
        </thead>
        <tbody>
          {resumeScores.map((r: any) => (
            <tr key={r.id}>
              <td className="p-2 border-b">{new Date(r.created_at).toLocaleString()}</td>
              <td className="p-2 border-b font-bold">{r.ats_score ?? "—"}</td>
              <td className="p-2 border-b">{r.feedback ? r.feedback.slice(0, 80) + (r.feedback.length > 80 ? "..." : "") : "—"}</td>
              <td className="p-2 border-b">
                <a
                  href={`https://nghmvumdtbijhhhksfrn.supabase.co/storage/v1/object/public/resumes/${r.file_url}`}
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResumeScoreTable;
