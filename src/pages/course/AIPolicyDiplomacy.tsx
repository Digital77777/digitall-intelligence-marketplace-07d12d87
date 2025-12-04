import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Clock, Users, Star, Play, CheckCircle, ArrowRight,
  GraduationCap, Target, Trophy, Download, Video, Landmark
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AIPolicyDiplomacy = () => {
  const { toast } = useToast();

  const courseModules = [
    {
      id: 1,
      title: "AI Policy & Governance",
      description: "Understand the foundations of AI policy and governance frameworks",
      duration: "3 weeks",
      lessons: 10,
      topics: [
        "Introduction to AI Policy",
        "History of Technology Governance",
        "AI Governance Frameworks",
        "National AI Strategies",
        "Regulatory Approaches Compared",
        "Risk-Based Regulation",
        "Self-Regulation vs Legislation",
        "Policy Development Process",
        "Stakeholder Engagement",
        "Project: Policy Analysis"
      ]
    },
    {
      id: 2,
      title: "Digital Rights & Civil Liberties",
      description: "Protect fundamental rights in the age of AI",
      duration: "3 weeks",
      lessons: 10,
      topics: [
        "Digital Rights Framework",
        "Privacy in the AI Era",
        "Surveillance and AI",
        "Freedom of Expression Online",
        "Algorithmic Discrimination",
        "Due Process and AI Decisions",
        "Biometric Data Rights",
        "Worker Rights and AI",
        "Consumer Protection",
        "Project: Rights Impact Assessment"
      ]
    },
    {
      id: 3,
      title: "Global AI Diplomacy",
      description: "Navigate international AI governance and cooperation",
      duration: "4 weeks",
      lessons: 12,
      topics: [
        "International AI Landscape",
        "Multilateral AI Initiatives",
        "OECD AI Principles",
        "UNESCO AI Recommendations",
        "G7/G20 AI Agendas",
        "Bilateral AI Agreements",
        "AI in Trade Negotiations",
        "Tech Transfer Policies",
        "AI Standards Diplomacy",
        "Cross-Border Data Flows",
        "AI Arms Control Discussions",
        "Project: Diplomatic Brief"
      ]
    },
    {
      id: 4,
      title: "AI Geopolitics",
      description: "Analyze the geopolitical implications of AI development",
      duration: "3 weeks",
      lessons: 10,
      topics: [
        "AI as Geopolitical Force",
        "US-China AI Competition",
        "European AI Sovereignty",
        "AI and National Security",
        "Military AI Applications",
        "AI Supply Chain Politics",
        "Semiconductor Geopolitics",
        "AI Talent Competition",
        "Technology Alliances",
        "Project: Geopolitical Analysis"
      ]
    },
    {
      id: 5,
      title: "Building Policy Frameworks",
      description: "Create effective and implementable AI policy",
      duration: "3 weeks",
      lessons: 10,
      topics: [
        "Policy Design Principles",
        "Evidence-Based Policy",
        "Impact Assessment Methods",
        "Implementation Strategies",
        "Monitoring and Evaluation",
        "Adaptive Governance",
        "Multi-stakeholder Processes",
        "Communication Strategies",
        "Building Coalitions",
        "Capstone: Complete Policy Framework"
      ]
    }
  ];

  const learningOutcomes = [
    "Develop comprehensive AI policy frameworks",
    "Protect digital rights in AI systems",
    "Navigate international AI diplomacy",
    "Analyze AI geopolitical implications",
    "Engage effectively with stakeholders",
    "Implement evidence-based AI governance",
    "Build coalitions for AI policy change",
    "Lead AI policy initiatives at scale"
  ];

  const handleStartCourse = () => {
    toast({
      title: "Course started!",
      description: "Welcome to Shaping the AI Future. Let's build responsible AI policy!"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 pt-20 pb-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">Expert Level</Badge>
                  <Badge variant="outline">Free Course</Badge>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold">
                  <span className="bg-gradient-learning bg-clip-text text-transparent">
                    Shaping the AI Future
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Become an AI policymaker, global advisor, or tech diplomat.
                  Master AI governance, digital rights, and international cooperation.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">14-18 weeks</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">52 lessons</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Total Lessons</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">823</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium">4.9</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="h-9 px-4 text-sm md:h-11 md:px-8 md:text-base" onClick={handleStartCourse}>
                  <Play className="h-4 w-4 mr-1.5 md:h-5 md:w-5 md:mr-2" />
                  Start Learning Free
                </Button>
                <Button className="h-9 px-4 text-sm md:h-11 md:px-8 md:text-base" variant="outline" onClick={handleStartCourse}>
                  <GraduationCap className="h-4 w-4 mr-1.5 md:h-5 md:w-5 md:mr-2" />
                  Enroll Now
                </Button>
              </div>
            </div>

            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Course Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Landmark className="h-12 w-12 text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">AI Policy Preview</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">What you'll learn:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      AI policy frameworks
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Digital rights protection
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Global AI diplomacy
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      AI geopolitics
                    </li>
                  </ul>
                </div>
                <Button className="w-full" onClick={handleStartCourse}>
                  Enroll for Free
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          <Tabs defaultValue="curriculum" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="curriculum">
                <BookOpen className="h-4 w-4 md:hidden" />
                <span className="hidden md:inline">Curriculum</span>
              </TabsTrigger>
              <TabsTrigger value="outcomes">
                <Target className="h-4 w-4 md:hidden" />
                <span className="hidden md:inline">Learning Outcomes</span>
              </TabsTrigger>
              <TabsTrigger value="instructor">
                <GraduationCap className="h-4 w-4 md:hidden" />
                <span className="hidden md:inline">Instructor</span>
              </TabsTrigger>
              <TabsTrigger value="reviews">
                <Star className="h-4 w-4 md:hidden" />
                <span className="hidden md:inline">Reviews</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="curriculum" className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Course Curriculum</h2>
                <p className="text-muted-foreground">
                  Comprehensive training in AI policy, governance, and international diplomacy.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {courseModules.map((module, index) => (
                  <Card key={module.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{module.title}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {module.duration}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            {module.lessons} lessons
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {module.topics.map((topic, topicIndex) => (
                          <div key={topicIndex} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            {topic}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="outcomes" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {learningOutcomes.map((outcome, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                        <Target className="h-3 w-3 text-primary" />
                      </div>
                      <p className="text-sm">{outcome}</p>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  AI Policy Certificate
                </h3>
                <p className="text-muted-foreground mb-4">
                  Earn certification recognized by governments and international organizations.
                </p>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Preview Certificate
                  </Button>
                  <Badge variant="secondary">Policy Expert</Badge>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="instructor" className="space-y-6">
              <Card className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-learning flex items-center justify-center text-white text-2xl font-bold">
                    GP
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xl font-semibold">Global Policy Team</h3>
                      <p className="text-muted-foreground">Former Government Officials & Diplomats</p>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Our instructors include former tech policy advisors, UN representatives,
                      and diplomats who have shaped AI governance at the highest levels.
                    </p>
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-lg font-semibold">100+</div>
                        <div className="text-sm text-muted-foreground">Policies Shaped</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">30+</div>
                        <div className="text-sm text-muted-foreground">Countries</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">4.9/5</div>
                        <div className="text-sm text-muted-foreground">Avg Rating</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <div className="grid gap-4">
                {[
                  { name: "Ambassador Julia Reyes", rating: 5, comment: "This course gave me the technical understanding needed to negotiate AI agreements effectively." },
                  { name: "Dr. Michael Foster", rating: 5, comment: "The geopolitics module is essential reading for anyone in tech policy." },
                  { name: "Sarah Kim", rating: 5, comment: "From a tech background, this course taught me how to engage with policy processes." }
                ].map((review, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-medium">
                        {review.name.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.name}</span>
                          <div className="flex">
                            {[1,2,3,4,5].map((star) => (
                              <Star key={star} className={`h-3 w-3 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default AIPolicyDiplomacy;
