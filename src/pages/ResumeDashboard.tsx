
import ResumeUpload from "@/components/ResumeUpload";
import ResumeScoreTable from "@/components/ResumeScoreTable";

const ResumeDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-10">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Resume Analysis & ATS Checker</h1>
        <ResumeUpload />
        <div className="mt-10">
          <ResumeScoreTable />
        </div>
      </div>
    </div>
  );
};
export default ResumeDashboard;
