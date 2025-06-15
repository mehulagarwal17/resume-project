
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import React from "react";
import WatchDemoModal from "./WatchDemoModal";

const Hero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isDemoOpen, setIsDemoOpen] = React.useState(false);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <section className="pt-20 pb-16 px-4">
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="ml-2 text-gray-600">Trusted by 50,000+ job seekers</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-tight">
            Optimize Your Resume for Success
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            AI-powered resume optimization that beats ATS systems, provides tailored suggestions, 
            and compares your resume against job descriptions. Land your dream job faster.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4 mb-12">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4" onClick={handleGetStarted}>
              {user ? 'Go to Dashboard' : 'Start Free Analysis'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-blue-300 text-blue-600 hover:bg-blue-50 text-lg px-8 py-4"
              onClick={() => setIsDemoOpen(true)}
            >
              Watch Demo
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>ATS-Optimized</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>Instant Results</span>
            </div>
          </div>
        </div>
      </div>
      {/* Watch Demo Modal */}
      <WatchDemoModal open={isDemoOpen} onOpenChange={setIsDemoOpen} />
    </section>
  );
};

export default Hero;
