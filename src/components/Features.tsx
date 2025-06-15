
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Target, GitCompare, Download, Users, Shield } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: BarChart3,
      title: "Resume Scoring & ATS Checker",
      description: "Get instant scores and ATS compatibility analysis with detailed feedback on formatting, keywords, and structure.",
      badge: "Core Feature",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      icon: Target,
      title: "Tailored Job Role Suggestions", 
      description: "Receive personalized recommendations based on your target role, industry trends, and job market analysis.",
      badge: "AI-Powered",
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      icon: GitCompare,
      title: "Resume vs Job Description",
      description: "Compare your resume against specific job postings and get targeted improvement suggestions.",
      badge: "Smart Match",
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      icon: Download,
      title: "Branded PDF Exports",
      description: "Download professional, ATS-friendly PDFs with customizable branding and multiple template options.",
      badge: "Professional",
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      icon: Users,
      title: "B2B Placement Dashboard",
      description: "Comprehensive dashboard for placement coordinators to manage multiple candidates and track progress.",
      badge: "Enterprise",
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Enterprise-grade security with GDPR compliance and encrypted data storage for all your documents.",
      badge: "Secure",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100"
    }
  ];

  return (
    <section id="features" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Powerful Features for Resume Success
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to create, optimize, and track resume performance in one comprehensive platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${feature.bgColor}`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <Badge variant="secondary" className={`${feature.color} bg-white border`}>
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
