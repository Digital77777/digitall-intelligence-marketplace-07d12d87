import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Clock, Users, Star, Play, CheckCircle, ArrowRight,
  GraduationCap, Target, Trophy, Download, Video, Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ResponsibleAI = () => {
  const { toast } = useToast();

  const courseModules = [
    {
      id: 1,
      title: "AI Ethics Foundations",
      description: "Understand the ethical principles that should guide AI development",
      duration: "3 weeks",
      lessons: 10,
      topics: [
        "Introduction to AI Ethics",
        "Historical Context of Tech Ethics",
        "Ethical Frameworks for AI",
        "Stakeholder Analysis",
        "Value Alignment Problems",
        "Human Rights in the AI Age",
        "Autonomy and AI Systems",
        "Informed Consent for AI",
        "Case Studies in AI Ethics",
        "Ethics Impact Assessment"
      ]
    },
    {
      id: 2,
      title: "Fairness & Bias in AI",
      description: "Identify, measure, and mitigate bias in AI systems",
      duration: "3 weeks",
      lessons: 12,
      topics: [
        "Understanding AI Bias",
        "Types of Algorithmic Bias",
        "Bias in Training Data",
        "Measuring Fairness",
        "Fairness Metrics Comparison",
        "Bias Detection Tools",
        "Debiasing Techniques",
        "Fair Machine Learning",
        "Auditing AI for Bias",
        "Intersectionality in AI",
        "Case Study: Hiring AI Bias",
        "Project: Bias Audit"
      ]
    },
    {
      id: 3,
      title: "AI Policy & Regulation",
      description: "Navigate the evolving landscape of AI governance and compliance",
      duration: "3 weeks",
      lessons: 10,
      topics: [
        "Global AI Regulatory Landscape",
        "EU AI Act Deep Dive",
        "US AI Policy Framework",
        "China AI Regulations",
        "Industry Self-Regulation",
        "AI Standards Bodies",
        "Compliance Frameworks",
        "Risk-Based AI Classification",
        "Documentation Requirements",
        "Project: Compliance Assessment"
      ]
    },
    {
      id: 4,
      title: "Responsible Data Practices",
      description: "Handle data ethically throughout the AI lifecycle",
      duration: "2 weeks",
      lessons: 8,
      topics: [
        "Data Ethics Principles",
        "Privacy-Preserving AI",
        "Consent and Data Collection",
        "Data Minimization",
        "Synthetic Data for Privacy",
        "Anonymization Techniques",
        "Data Governance Frameworks",
        "Project: Privacy-First AI Design"
      ]
    },
    {
      id: 5,
      title: "AI Governance & Oversight",
      description: "Implement governance structures for responsible AI deployment",
      duration: "2 weeks",
      lessons: 8,
      topics: [
        "AI Governance Frameworks",
        "Ethics Boards and Committees",
        "Model Documentation (Model Cards)",
        "Algorithmic Impact Assessment",
        "Transparency and Explainability",
        "Accountability Structures",
        "Incident Response for AI",
        "Capstone: AI Governance Plan"
      ]
    }
  ];

  const learningOutcomes = [
    "Apply ethical frameworks to AI development decisions",
    "Identify and mitigate bias in AI systems",
    "Navigate global AI regulations and compliance",
    "Implement privacy-preserving AI techniques",
    "Design AI governance structures",
    "Conduct algorithmic impact assessments",
    "Create transparent and explainable AI systems",
    "Lead responsible AI initiatives in organizations"
  ];

  const handleStartCourse = () => {
    toast({
      title: "Course started!",
      description: "Welcome to Building AI for Good. Let's create ethical AI systems!"
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
                  <span className="bg-gradient-ai bg-clip-text text-transparent">
                    Building AI for Good
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Handle AI bias, safety, and regulation. Master ethics, fairness,
                  and policy frameworks for responsible AI development.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">12-16 weeks</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">48 lessons</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Total Lessons</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">1,156</span>
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
                    <Shield className="h-12 w-12 text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Responsible AI Preview</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">What you'll learn:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      AI ethics frameworks
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Bias detection & mitigation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      AI regulations & compliance
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      AI governance structures
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
                  Comprehensive training in responsible AI development and governance.
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
                  Responsible AI Certificate
                </h3>
                <p className="text-muted-foreground mb-4">
                  Earn certification in AI ethics and governance recognized by industry leaders.
                </p>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Preview Certificate
                  </Button>
                  <Badge variant="secondary">Ethics Certified</Badge>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="instructor" className="space-y-6">
              <Card className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-ai flex items-center justify-center text-white text-2xl font-bold">
                    RA
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xl font-semibold">Responsible AI Council</h3>
                      <p className="text-muted-foreground">Ethics Researchers & Policy Experts</p>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Our team includes AI ethics researchers, policy advisors, and practitioners
                      who have shaped AI governance at major tech companies and governments.
                    </p>
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-lg font-semibold">50+</div>
                        <div className="text-sm text-muted-foreground">Policy Documents</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">15+</div>
                        <div className="text-sm text-muted-foreground">Years Research</div>
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
                  { name: "Dr. James Wilson", rating: 5, comment: "Essential course for anyone working in AI. The bias mitigation techniques are immediately applicable." },
                  { name: "Lisa Thompson", rating: 5, comment: "The regulatory landscape module saved me months of research. Excellent coverage of global AI laws." },
                  { name: "David Park", rating: 5, comment: "I now lead our company's AI ethics committee thanks to this comprehensive training." }
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

export default ResponsibleAI;
