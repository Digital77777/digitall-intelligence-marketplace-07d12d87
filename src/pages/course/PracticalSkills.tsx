import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Play, 
  CheckCircle,
  ArrowRight,
  GraduationCap,
  Target,
  Trophy,
  Download,
  Video,
  Wrench,
  Zap,
  Award,
  Globe,
  Smartphone,
  MessageCircle,
  Shield,
  Sparkles,
  Lock,
  Calendar,
  Laptop
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useCourseEnrollment, useCourseEnrollmentCount } from '@/hooks/useCourseEnrollment';
import { useAuth } from '@/hooks/useAuth';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CourseFAQ } from '@/components/course/CourseFAQ';
import { RelatedPaths } from '@/components/course/RelatedPaths';

const COURSE_ID = 'practical-skills';

const PracticalSkills = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    enrollment, 
    isEnrolled, 
    isLoading, 
    isEnrolling, 
    enroll,
    moduleProgress 
  } = useCourseEnrollment(COURSE_ID);
  const { data: enrollmentCount } = useCourseEnrollmentCount(COURSE_ID);

  const courseModules = [
    {
      id: 1,
      title: "Master Prompt Engineering",
      description: "Learn to write effective prompts that get you better AI results every time",
      duration: "3 weeks",
      lessons: 10,
      topics: [
        "Anatomy of a Great Prompt",
        "Prompt Frameworks & Templates",
        "Context Setting Techniques",
        "Chain of Thought Prompting",
        "Role-based Prompting",
        "Advanced Prompt Strategies",
        "Prompt Optimization & Testing",
        "Common Prompting Mistakes",
        "Industry-Specific Prompts",
        "Building Your Prompt Library"
      ]
    },
    {
      id: 2,
      title: "AI Tools Mastery",
      description: "Hands-on training with the most powerful AI tools for productivity and creativity",
      duration: "4 weeks",
      lessons: 12,
      topics: [
        "ChatGPT Advanced Techniques",
        "Claude for Research & Analysis",
        "Midjourney & AI Art Generation",
        "AI Writing & Content Tools",
        "AI Video & Audio Creation",
        "AI Code Generation Tools",
        "AI Presentation & Design Tools",
        "AI Data Analysis Platforms",
        "Workflow Automation with AI",
        "Tool Selection & Comparison",
        "Building AI Tool Stacks",
        "ROI Measurement & Optimization"
      ]
    },
    {
      id: 3,
      title: "No-Code AI Building",
      description: "Build AI applications without coding using visual platforms and drag-drop tools",
      duration: "4 weeks",
      lessons: 14,
      topics: [
        "Introduction to No-Code AI",
        "Zapier AI Automation",
        "Bubble AI App Development",
        "Airtable AI Workflows",
        "Notion AI Databases",
        "Make (Integromat) AI Scenarios",
        "AI Chatbot Builders",
        "Voice AI Applications",
        "AI Form & Survey Builders",
        "AI E-commerce Solutions",
        "Custom AI Dashboards",
        "AI Mobile App Creation",
        "Deployment & Scaling",
        "Project: Complete AI App"
      ]
    },
    {
      id: 4,
      title: "Data Handling & Analysis",
      description: "Work with data effectively for AI projects - collection, cleaning, and analysis",
      duration: "3 weeks",
      lessons: 8,
      topics: [
        "Data Types & Sources",
        "Web Scraping Basics",
        "API Data Collection",
        "Data Cleaning Techniques",
        "Excel & Google Sheets AI",
        "Basic Data Visualization",
        "AI-Powered Data Analysis",
        "Building Data Pipelines"
      ]
    }
  ];

  const learningOutcomes = [
    "Write prompts that consistently generate high-quality AI outputs",
    "Use 15+ professional AI tools effectively for work and projects",
    "Build complete AI applications without writing code",
    "Collect, clean, and analyze data for AI projects",
    "Create automated workflows that save hours of manual work",
    "Design AI-powered solutions for real business problems",
    "Launch your own AI-based service or product",
    "Generate income through AI consulting and freelancing"
  ];

  const prerequisites = [
    { icon: Laptop, text: "Basic computer skills - ability to browse the web and use common apps" },
    { icon: Globe, text: "Stable internet connection for accessing online tools and platforms" },
    { icon: Clock, text: "5-8 hours per week dedicated learning time" },
    { icon: Target, text: "A project idea or goal you want to build with AI (we'll help you define it)" }
  ];

  const whatsIncluded = [
    { icon: Video, text: "44 video lessons with step-by-step tutorials" },
    { icon: Wrench, text: "Hands-on projects for each module" },
    { icon: Download, text: "Downloadable templates and prompt libraries" },
    { icon: Award, text: "Certificate of completion" },
    { icon: MessageCircle, text: "Community forum access" },
    { icon: Smartphone, text: "Mobile-friendly learning experience" }
  ];

  const handleEnroll = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    enroll();
  };

  const handleContinueLearning = () => {
    // Navigate to current module
    console.log('Continue to module:', enrollment?.current_module);
  };

  const totalLessons = courseModules.reduce((acc, m) => acc + m.lessons, 0);
  const displayEnrollmentCount = (enrollmentCount || 0) + 2847; // Base count + real enrollments

  const isModuleCompleted = (moduleId: number) => {
    return moduleProgress.some(p => p.module_id === moduleId && p.completed_at);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 pt-24 pb-12 md:pt-28 md:pb-16">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-xs">Beginner Level</Badge>
                <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Free Course
                </Badge>
                <Badge className="bg-gradient-ai text-white text-xs">Most Popular</Badge>
              </div>

              {/* Title */}
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  <span className="bg-gradient-ai bg-clip-text text-transparent">
                    From Zero to Builder
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                  Master practical AI skills that matter: prompt engineering, AI tools mastery, no-code building, 
                  and data handling. Go from complete beginner to building AI solutions in 10-14 weeks.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 py-4">
                <div className="text-center p-3 rounded-lg bg-card/50 border">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-semibold">10-14 weeks</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-card/50 border">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{totalLessons} lessons</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Total Lessons</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-card/50 border">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{displayEnrollmentCount.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Students Enrolled</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-card/50 border">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">4.8</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Course Rating</p>
                </div>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg border border-success/20 w-fit">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-ai border-2 border-background flex items-center justify-center text-white text-xs font-medium">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-sm font-medium text-success">
                  Join {displayEnrollmentCount.toLocaleString()}+ learners building with AI
                </span>
              </div>

              {/* CTA Buttons - Desktop */}
              <div className="hidden md:flex gap-4">
                {isEnrolled ? (
                  <Button size="lg" onClick={handleContinueLearning} className="bg-gradient-ai hover:opacity-90">
                    <Play className="h-5 w-5 mr-2" />
                    Continue Learning
                  </Button>
                ) : (
                  <Button size="lg" onClick={handleEnroll} disabled={isEnrolling} className="bg-gradient-ai hover:opacity-90">
                    <Wrench className="h-5 w-5 mr-2" />
                    {isEnrolling ? 'Enrolling...' : 'Enroll Now - It\'s Free'}
                  </Button>
                )}
                <Button size="lg" variant="outline">
                  <Video className="h-5 w-5 mr-2" />
                  Watch Preview
                </Button>
              </div>
            </div>

            {/* Right - Enrollment Card (Desktop) */}
            <div className="hidden lg:block">
              <Card className="sticky top-24 shadow-xl border-2">
                <CardHeader className="pb-4">
                  <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-ai/10" />
                    <div className="text-center space-y-2 relative z-10">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto backdrop-blur-sm">
                        <Play className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">See What You'll Build</p>
                    </div>
                  </div>
                  
                  {isEnrolled && enrollment && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Your Progress</span>
                        <span className="font-medium">{enrollment.progress_percent}%</span>
                      </div>
                      <Progress value={enrollment.progress_percent} className="h-2" />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEnrolled ? (
                    <Button className="w-full bg-gradient-ai hover:opacity-90" size="lg" onClick={handleContinueLearning}>
                      Continue Learning
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button className="w-full bg-gradient-ai hover:opacity-90" size="lg" onClick={handleEnroll} disabled={isEnrolling}>
                      {isEnrolling ? 'Enrolling...' : 'Enroll Now - It\'s Free'}
                    </Button>
                  )}

                  <div className="space-y-3 pt-2">
                    <h4 className="font-semibold text-sm">What you'll build:</h4>
                    <ul className="space-y-2">
                      {[
                        'AI-powered chatbots',
                        'Automated workflows',
                        'Data analysis tools',
                        'Complete web applications'
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Earning Potential</div>
                    <div className="text-lg font-bold">$1,000 - $2,500/month</div>
                    <div className="text-xs text-muted-foreground">From AI freelancing & consulting</div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Lifetime access</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Portfolio-ready projects</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-6 border-y bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {[
              { icon: Zap, text: 'Hands-On Projects' },
              { icon: Clock, text: 'Self-Paced Learning' },
              { icon: Award, text: 'Certificate Included' },
              { icon: Shield, text: 'Beginner Friendly' },
              { icon: Smartphone, text: 'Mobile Access' }
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <badge.icon className="h-4 w-4 text-primary" />
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <Tabs defaultValue="curriculum" className="w-full">
            <TabsList className="w-full max-w-2xl mx-auto grid grid-cols-3 md:grid-cols-5 mb-8">
              <TabsTrigger value="curriculum" className="text-xs md:text-sm">Curriculum</TabsTrigger>
              <TabsTrigger value="outcomes" className="text-xs md:text-sm">Outcomes</TabsTrigger>
              <TabsTrigger value="prerequisites" className="text-xs md:text-sm">Prerequisites</TabsTrigger>
              <TabsTrigger value="instructor" className="text-xs md:text-sm hidden md:flex">Instructor</TabsTrigger>
              <TabsTrigger value="reviews" className="text-xs md:text-sm hidden md:flex">Reviews</TabsTrigger>
            </TabsList>

            {/* Curriculum Tab */}
            <TabsContent value="curriculum" className="space-y-8">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">Hands-On Curriculum</h2>
                <p className="text-muted-foreground">
                  {totalLessons} practical lessons focused on building real AI solutions. Every module includes hands-on projects you can add to your portfolio.
                </p>
              </div>

              <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto space-y-4">
                {courseModules.map((module, index) => {
                  const completed = isModuleCompleted(module.id);
                  return (
                    <AccordionItem 
                      key={module.id} 
                      value={`module-${module.id}`}
                      className="border rounded-xl px-4 md:px-6 bg-card/50 hover:bg-card/80 transition-colors"
                    >
                      <AccordionTrigger className="hover:no-underline py-4 md:py-6">
                        <div className="flex items-center gap-3 md:gap-4 text-left w-full pr-4">
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                            completed 
                              ? 'bg-success text-white' 
                              : 'bg-gradient-ai text-white'
                          }`}>
                            {completed ? (
                              <CheckCircle className="h-5 w-5 md:h-6 md:w-6" />
                            ) : isEnrolled ? (
                              <span className="text-sm md:text-base font-bold">{index + 1}</span>
                            ) : (
                              <Lock className="h-4 w-4 md:h-5 md:w-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base md:text-lg">{module.title}</h3>
                            <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">{module.description}</p>
                          </div>
                          <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground flex-shrink-0">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {module.duration}
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              {module.lessons} lessons
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-6">
                        <div className="md:hidden flex items-center gap-4 text-sm text-muted-foreground mb-4 pl-14">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {module.duration}
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {module.lessons} lessons
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-0 md:pl-16">
                          {module.topics.map((topic, topicIndex) => (
                            <div key={topicIndex} className="flex items-center gap-2 text-sm py-1">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                              <span>{topic}</span>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </TabsContent>

            {/* Outcomes Tab */}
            <TabsContent value="outcomes" className="space-y-8">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">What You'll Achieve</h2>
                <p className="text-muted-foreground">
                  By the end of this course, you'll have practical skills to build AI solutions and start earning.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {learningOutcomes.map((outcome, index) => (
                  <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-ai flex items-center justify-center flex-shrink-0">
                        <Target className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-sm leading-relaxed">{outcome}</p>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Career Outcomes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-8">
                <Card className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="font-semibold mb-2">Job Placement</h3>
                  <div className="text-2xl font-bold text-success mb-2">78%</div>
                  <p className="text-xs text-muted-foreground">of graduates find AI-related work within 3 months</p>
                </Card>
                <Card className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Freelance Success</h3>
                  <div className="text-2xl font-bold text-primary mb-2">$1,500</div>
                  <p className="text-xs text-muted-foreground">Average monthly earnings for successful freelancers</p>
                </Card>
                <Card className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Wrench className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">Projects Built</h3>
                  <div className="text-2xl font-bold mb-2">4+</div>
                  <p className="text-xs text-muted-foreground">Portfolio projects completed during the course</p>
                </Card>
              </div>
            </TabsContent>

            {/* Prerequisites Tab */}
            <TabsContent value="prerequisites" className="space-y-8">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">What You Need to Start</h2>
                <p className="text-muted-foreground">
                  This course is designed for complete beginners. No prior AI or coding experience required.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {prerequisites.map((prereq, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <prereq.icon className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-sm leading-relaxed pt-2">{prereq.text}</p>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="max-w-3xl mx-auto p-6 bg-muted/50">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  What's Included
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {whatsIncluded.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <item.icon className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Instructor Tab */}
            <TabsContent value="instructor" className="space-y-8">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">Meet Your Instructor</h2>
                <p className="text-muted-foreground">
                  Learn from experienced AI practitioners who've built real-world solutions.
                </p>
              </div>

                <Card className="max-w-2xl mx-auto p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-ai flex items-center justify-center text-primary-foreground text-2xl font-bold flex-shrink-0 mx-auto md:mx-0">
                    DI
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold mb-1">DIM Team</h3>
                    <p className="text-primary font-medium mb-3">AI Education Specialists</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Our team of AI practitioners brings years of experience building AI solutions 
                      for businesses across Africa. We've distilled our knowledge into practical, 
                      hands-on lessons that focus on real results.
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>5,000+ Students</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>10+ Courses</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span>4.8 Rating</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-8">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">What Builders Say</h2>
                <p className="text-muted-foreground">
                  Hear from students who've transformed their skills with this course.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {[
                  {
                    name: "Tunde O.",
                    role: "Freelance AI Consultant",
                    rating: 5,
                    text: "This course changed everything for me. I went from knowing nothing about AI to building chatbots for clients in just 8 weeks. Now I earn $2,000/month freelancing!"
                  },
                  {
                    name: "Sarah M.",
                    role: "Marketing Manager",
                    rating: 5,
                    text: "The prompt engineering section alone was worth it. I've automated half my content creation workflow and saved 15+ hours every week."
                  },
                  {
                    name: "James K.",
                    role: "Entrepreneur",
                    rating: 5,
                    text: "Built my first AI product during this course - a customer service bot for my e-commerce store. It handles 70% of inquiries automatically now."
                  }
                ].map((review, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 italic">"{review.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-ai flex items-center justify-center text-primary-foreground text-sm font-bold">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{review.name}</p>
                        <p className="text-xs text-muted-foreground">{review.role}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <CourseFAQ />
        </div>
      </section>

      {/* Related Paths */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <RelatedPaths currentPathId={COURSE_ID} />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Building?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of learners who've transformed their careers with practical AI skills.
          </p>
          {isEnrolled ? (
            <Button size="lg" onClick={handleContinueLearning} className="bg-gradient-ai hover:opacity-90">
              <Play className="h-5 w-5 mr-2" />
              Continue Your Journey
            </Button>
          ) : (
            <Button size="lg" onClick={handleEnroll} disabled={isEnrolling} className="bg-gradient-ai hover:opacity-90">
              <Wrench className="h-5 w-5 mr-2" />
              {isEnrolling ? 'Enrolling...' : 'Start Building Today - Free'}
            </Button>
          )}
        </div>
      </section>

      {/* Mobile Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t md:hidden z-50">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">From Zero to Builder</p>
            {isEnrolled && enrollment ? (
              <div className="flex items-center gap-2">
                <Progress value={enrollment.progress_percent} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground">{enrollment.progress_percent}%</span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Free • {totalLessons} lessons</p>
            )}
          </div>
          {isEnrolled ? (
            <Button onClick={handleContinueLearning} className="bg-gradient-ai hover:opacity-90">
              Continue
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleEnroll} disabled={isEnrolling} className="bg-gradient-ai hover:opacity-90">
              {isEnrolling ? 'Enrolling...' : 'Enroll Free'}
            </Button>
          )}
        </div>
      </div>

      {/* Spacer for mobile sticky footer */}
      <div className="h-20 md:hidden" />

      <Footer />
    </div>
  );
};

export default PracticalSkills;
