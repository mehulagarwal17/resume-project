
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Scan, Edit, Download } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Upload,
      title: "Upload Resume",
      description: "Upload your existing resume or start from scratch with our templates",
      step: "01"
    },
    {
      icon: Scan,
      title: "AI Analysis", 
      description: "Our AI analyzes your resume for ATS compatibility and optimization opportunities",
      step: "02"
    },
    {
      icon: Edit,
      title: "Apply Suggestions",
      description: "Review and apply tailored suggestions based on your target role and industry",
      step: "03"
    },
    {
      icon: Download,
      title: "Export & Apply",
      description: "Download your optimized resume and start applying to jobs with confidence",
      step: "04"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get your resume optimized in just 4 simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="absolute top-4 right-4 text-6xl font-bold text-blue-100">
                  {step.step}
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
