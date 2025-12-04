import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Clock, Users, Star, Play, CheckCircle, ArrowRight,
  GraduationCap, Target, Trophy, Download, Video, Building2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AppliedAIIndustry = () => {
  const { toast } = useToast();

  const courseModules = [
    {
      id: 1,
      title: "Healthcare AI Applications",
      description: "Transform healthcare with AI-powered diagnostics, treatment planning, and patient care",
      duration: "4 weeks",
      lessons: 14,
      topics: [
        "Introduction to Healthcare AI",
        "Medical Imaging Analysis",
        "AI-Powered Diagnostics",
        "Drug Discovery with AI",
        "Personalized Medicine",
        "Clinical Decision Support Systems",
        "Electronic Health Records & AI",
        "Telemedicine and Remote Care",
        "Mental Health AI Applications",
        "Regulatory Compliance (HIPAA, FDA)",
        "Healthcare Data Privacy",
        "Case Study: AI in Radiology",
        "Case Study: Predictive Healthcare",
        "Project: Healthcare AI Solution"
      ]
    },
    {
      id: 2,
      title: "Finance AI Applications",
      description: "Master AI applications in banking, trading, risk management, and fintech",
      duration: "4 weeks",
      lessons: 14,
      topics: [
        "AI in Financial Services Overview",
        "Algorithmic Trading Basics",
        "Fraud Detection Systems",
        "Credit Scoring with ML",
        "Risk Assessment Models",
        "Portfolio Optimization",
        "Robo-Advisors",
        "Natural Language Processing in Finance",
        "Sentiment Analysis for Markets",
        "Regulatory Technology (RegTech)",
        "Anti-Money Laundering AI",
        "Case Study: Quantitative Trading",
        "Case Study: Banking AI",
        "Project: Finance AI Application"
      ]
    },
    {
      id: 3,
      title: "Education AI Applications",
      description: "Revolutionize learning with adaptive education, tutoring systems, and educational analytics",
      duration: "4 weeks",
      lessons: 12,
      topics: [
        "AI in Education Landscape",
        "Adaptive Learning Systems",
        "Intelligent Tutoring Systems",
        "Learning Analytics",
        "Personalized Learning Paths",
        "Natural Language in EdTech",
        "Automated Grading Systems",
        "Content Recommendation Engines",
        "Accessibility in Educational AI",
        "Student Engagement Analytics",
        "Case Study: Language Learning AI",
        "Project: Educational AI Tool"
      ]
    },
    {
      id: 4,
      title: "Cross-Industry AI Skills",
      description: "Develop transferable AI skills applicable across all industries",
      duration: "2 weeks",
      lessons: 8,
      topics: [
        "Industry Analysis Framework",
        "Identifying AI Opportunities",
        "Building Industry-Specific Datasets",
        "Domain Expert Collaboration",
        "Deploying AI in Enterprises",
        "Change Management for AI",
        "Measuring AI Impact",
        "Career Paths in Industry AI"
      ]
    },
    {
      id: 5,
      title: "Capstone Projects",
      description: "Apply your knowledge to real-world industry challenges",
      duration: "2 weeks",
      lessons: 6,
      topics: [
        "Project Selection & Scoping",
        "Industry Mentor Matching",
        "Implementation Workshop",
        "Testing & Validation",
        "Presentation Skills",
        "Capstone: Industry AI Solution"
      ]
    }
  ];

  const learningOutcomes = [
    "Apply AI solutions to healthcare challenges",
    "Build financial AI applications for trading and risk",
    "Create educational technology with AI",
    "Analyze any industry for AI opportunities",
    "Deploy enterprise AI solutions",
    "Navigate industry-specific regulations",
    "Collaborate with domain experts effectively",
    "Launch a career as an industry AI specialist"
  ];

  const handleStartCourse = () => {
    toast({
      title: "Course started!",
      description: "Welcome to AI Specialist Tracks. Choose your industry specialization!"
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
                  <Badge variant="secondary">Advanced Level</Badge>
                  <Badge variant="outline">Free Course</Badge>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold">
                  <span className="bg-gradient-learning bg-clip-text text-transparent">
                    AI Specialist Tracks
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Specialize in AI applications for healthcare, finance, or education.
                  Deep dive into industry-specific projects and regulations.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">16-20 weeks</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">54 lessons</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Total Lessons</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">1,432</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium">4.8</span>
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
                    <Building2 className="h-12 w-12 text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Industry AI Preview</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">What you'll learn:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Healthcare AI applications
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Finance & trading AI
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Education technology AI
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Industry regulations
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
                  Comprehensive industry-specific AI training with real-world projects.
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
                  Industry Specialist Certificate
                </h3>
                <p className="text-muted-foreground mb-4">
                  Earn certification in your chosen industry specialization.
                </p>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Preview Certificate
                  </Button>
                  <Badge variant="secondary">Industry Accredited</Badge>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="instructor" className="space-y-6">
              <Card className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-learning flex items-center justify-center text-white text-2xl font-bold">
                    IS
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xl font-semibold">Industry Specialist Team</h3>
                      <p className="text-muted-foreground">Healthcare, Finance & EdTech Experts</p>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Our instructors are industry practitioners who have deployed AI solutions
                      in hospitals, banks, and educational institutions worldwide.
                    </p>
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-lg font-semibold">100+</div>
                        <div className="text-sm text-muted-foreground">Projects Deployed</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">20+</div>
                        <div className="text-sm text-muted-foreground">Years Combined</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">4.8/5</div>
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
                  { name: "Dr. Sarah Lee", rating: 5, comment: "The healthcare module was incredibly comprehensive. I'm now leading AI initiatives at my hospital." },
                  { name: "Michael Chen", rating: 5, comment: "Finance AI section gave me practical skills I use daily in my quantitative trading role." },
                  { name: "Amanda Johnson", rating: 4, comment: "Great coverage of EdTech AI. The adaptive learning project was my favorite." }
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

export default AppliedAIIndustry;
