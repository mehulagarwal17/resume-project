
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Users, BarChart, Shield, ArrowRight } from "lucide-react";
import React from "react";
import ScheduleDemoModal from "./ScheduleDemoModal";

const B2BSection = () => {
  const [isScheduleDemoOpen, setIsScheduleDemoOpen] = React.useState(false);

  const benefits = [
    {
      icon: Users,
      title: "Bulk Student Management",
      description: "Manage hundreds of student resumes with individual tracking and progress monitoring."
    },
    {
      icon: BarChart,
      title: "Analytics Dashboard",
      description: "Track placement rates, resume scores, and improvement metrics across your institution."
    },
    {
      icon: Shield,
      title: "White-label Solutions",
      description: "Brand the platform with your institution's logo and customize the user experience."
    },
    {
      icon: Building,
      title: "Enterprise Integration",
      description: "Seamlessly integrate with your existing systems and student management platforms."
    }
  ];

  return (
    <section id="b2b" className="py-20 px-4 bg-gradient-to-br from-slate-900 to-blue-900 text-white">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <Badge className="mb-6 bg-blue-600 hover:bg-blue-700">
              Enterprise Solution
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Empower Your Placement Team
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Comprehensive B2B dashboard designed for placement coordinators, career centers, 
              and educational institutions to manage student success at scale.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-blue-100">Manage 1000+ student profiles</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-blue-100">Real-time analytics and reporting</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-blue-100">Custom branding and white-labeling</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-blue-100">Priority support and training</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                size="lg"
                className="bg-white text-blue-900 hover:bg-blue-50"
                onClick={() => setIsScheduleDemoOpen(true)}
              >
                Schedule Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900">
                Request Pricing
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-600 p-3 rounded-lg">
                      <benefit.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-blue-100 text-base">
                    {benefit.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        {/* Schedule Demo Modal */}
        <ScheduleDemoModal open={isScheduleDemoOpen} onOpenChange={setIsScheduleDemoOpen} />
      </div>
    </section>
  );
};

export default B2BSection;

