import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Award,
  Smartphone,
  MessageCircle,
  FileText,
  Loader2,
  Laptop,
  Wifi,
  Timer,
  Zap,
  Wrench
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CourseHero } from '@/components/course/CourseHero';
import { EnrollmentCard } from '@/components/course/EnrollmentCard';
import { CurriculumModule } from '@/components/course/CurriculumModule';
import { CourseFAQ } from '@/components/course/CourseFAQ';
import { RelatedPaths } from '@/components/course/RelatedPaths';
import { useCourseEnrollment, useCourseEnrollmentCount } from '@/hooks/useCourseEnrollment';
import { useAuth } from '@/hooks/useAuth';

const COURSE_ID = 'practical-skills';

const PracticalSkills = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('curriculum');
  
  const { 
    enrollment, 
    moduleProgress,
    isEnrolled, 
    isLoading, 
    isEnrolling,
    enroll 
  } = useCourseEnrollment(COURSE_ID);
  
  const { data: enrollmentCount = 0 } = useCourseEnrollmentCount(COURSE_ID);

  const courseModules = [
    {
      id: 1,
      title: "Master Prompt Engineering",
      description: "Learn to write effective prompts that get you better AI results every time",
      duration: "3 weeks",
      lessons: 10,
      externalUrl: "https://www.promptingguide.ai",
      topics: [
        { title: "Anatomy of a Great Prompt" },
        { title: "Prompt Frameworks & Templates" },
        { title: "Context Setting Techniques" },
        { title: "Chain of Thought Prompting" },
        { title: "Role-based Prompting" },
        { title: "Advanced Prompt Strategies" },
        { title: "Prompt Optimization & Testing" },
        { title: "Common Prompting Mistakes" },
        { title: "Industry-Specific Prompts" },
        { title: "Building Your Prompt Library" }
      ]
    },
    {
      id: 2,
      title: "AI Tools Mastery",
      description: "Hands-on training with the most powerful AI tools for productivity and creativity",
      duration: "4 weeks",
      lessons: 12,
      externalUrl: "https://www.futuretools.io",
      topics: [
        { title: "ChatGPT Advanced Techniques" },
        { title: "Claude for Research & Analysis" },
        { title: "Midjourney & AI Art Generation" },
        { title: "AI Writing & Content Tools" },
        { title: "AI Video & Audio Creation" },
        { title: "AI Code Generation Tools" },
        { title: "AI Presentation & Design Tools" },
        { title: "AI Data Analysis Platforms" },
        { title: "Workflow Automation with AI" },
        { title: "Tool Selection & Comparison" },
        { title: "Building AI Tool Stacks" },
        { title: "ROI Measurement & Optimization" }
      ]
    },
    {
      id: 3,
      title: "No-Code AI Building",
      description: "Build AI applications without coding using visual platforms and drag-drop tools",
      duration: "4 weeks",
      lessons: 14,
      externalUrl: "https://www.nocode.tech",
      topics: [
        { title: "Introduction to No-Code AI" },
        { title: "Zapier AI Automation" },
        { title: "Bubble AI App Development" },
        { title: "Airtable AI Workflows" },
        { title: "Notion AI Databases" },
        { title: "Make (Integromat) AI Scenarios" },
        { title: "AI Chatbot Builders" },
        { title: "Voice AI Applications" },
        { title: "AI Form & Survey Builders" },
        { title: "AI E-commerce Solutions" },
        { title: "Custom AI Dashboards" },
        { title: "AI Mobile App Creation" },
        { title: "Deployment & Scaling" },
        { title: "Project: Complete AI App" }
      ]
    },
    {
      id: 4,
      title: "Data Handling & Analysis",
      description: "Work with data effectively for AI projects - collection, cleaning, and analysis",
      duration: "3 weeks",
      lessons: 8,
      externalUrl: "https://www.kaggle.com/learn",
      topics: [
        { title: "Data Types & Sources" },
        { title: "Web Scraping Basics" },
        { title: "API Data Collection" },
        { title: "Data Cleaning Techniques" },
        { title: "Excel & Google Sheets AI" },
        { title: "Basic Data Visualization" },
        { title: "AI-Powered Data Analysis" },
        { title: "Building Data Pipelines" }
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

  const whatsIncluded = [
    { icon: Award, label: "Certificate of Completion" },
    { icon: FileText, label: "Downloadable Resources" },
    { icon: Target, label: "Hands-on Projects" },
    { icon: MessageCircle, label: "Community Access" },
    { icon: Smartphone, label: "Mobile Access" },
    { icon: Clock, label: "Lifetime Access" }
  ];

  const prerequisites = [
    { icon: Laptop, label: "Computer", description: "Any modern laptop or desktop (Windows, Mac, or Linux)" },
    { icon: Wifi, label: "Internet Connection", description: "Stable internet for accessing online tools and platforms" },
    { icon: Timer, label: "Time Commitment", description: "5-8 hours per week recommended" },
    { icon: BookOpen, label: "Prior Knowledge", description: "Basic computer skills - no coding required" }
  ];

  const totalLessons = courseModules.reduce((sum, m) => sum + m.lessons, 0);
  const progressPercent = enrollment?.progress_percent || 0;

  const getModuleProgress = (moduleId: number) => {
    const progress = moduleProgress.find(p => p.module_id === moduleId);
    if (!progress) return 0;
    if (progress.completed_at) return 100;
    return 50; // In progress
  };

  const isModuleCompleted = (moduleId: number) => {
    const progress = moduleProgress.find(p => p.module_id === moduleId);
    return !!progress?.completed_at;
  };

  const handleContinueLearning = () => {
    // Navigate to the first lesson of the current module
    navigate(`/course/practical-skills/lesson/ps-1-1`);
  };

  const handleStartModule = (moduleId: number) => {
    // Navigate to the first lesson of the selected module
    navigate(`/course/practical-skills/lesson/ps-${moduleId}-1`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="pt-16">
        <CourseHero
          title="From Zero to Builder"
          description="Master practical AI skills that matter: prompt engineering, AI tools mastery, no-code building, and data handling. Go from complete beginner to building AI solutions in 10-14 weeks."
          tier="Practical Skills Path"
          totalLessons={totalLessons}
          duration="10-14 weeks"
          enrolledCount={enrollmentCount}
          rating={4.8}
          isEnrolled={isEnrolled}
          isEnrolling={isEnrolling}
          onEnroll={enroll}
          onContinue={handleContinueLearning}
        />
      </div>

      {/* Trust Badges */}
      <div className="border-y bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {['Beginner Friendly', 'Self-Paced', 'Certificate Included', '24/7 Access', 'Portfolio Projects'].map((badge) => (
              <Badge key={badge} variant="secondary" className="whitespace-nowrap flex-shrink-0">
                <CheckCircle className="w-3 h-3 mr-1.5" />
                {badge}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-4 md:grid-cols-6 h-auto p-1">
                <TabsTrigger value="curriculum" className="text-xs md:text-sm">
                  Curriculum
                </TabsTrigger>
                <TabsTrigger value="outcomes" className="text-xs md:text-sm">
                  Outcomes
                </TabsTrigger>
                <TabsTrigger value="included" className="text-xs md:text-sm">
                  Included
                </TabsTrigger>
                <TabsTrigger value="prerequisites" className="text-xs md:text-sm">
                  Prerequisites
                </TabsTrigger>
                <TabsTrigger value="instructor" className="text-xs md:text-sm hidden md:flex">
                  Instructor
                </TabsTrigger>
                <TabsTrigger value="reviews" className="text-xs md:text-sm hidden md:flex">
                  Reviews
                </TabsTrigger>
              </TabsList>

              {/* Curriculum Tab */}
              <TabsContent value="curriculum" className="space-y-6 mt-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Course Curriculum</h2>
                  <p className="text-muted-foreground">
                    {totalLessons} practical lessons focused on building real AI solutions. Every module includes hands-on projects.
                  </p>
                </div>

                <div className="space-y-4">
                  {courseModules.map((module) => (
                    <CurriculumModule
                      key={module.id}
                      moduleNumber={module.id}
                      title={module.title}
                      description={module.description}
                      duration={module.duration}
                      lessonCount={module.lessons}
                      topics={module.topics}
                      externalLink={module.externalUrl}
                      isLocked={!isEnrolled}
                      isCompleted={isModuleCompleted(module.id)}
                      progress={getModuleProgress(module.id)}
                      onStart={() => handleStartModule(module.id)}
                    />
                  ))}
                </div>
              </TabsContent>

              {/* Learning Outcomes Tab */}
              <TabsContent value="outcomes" className="space-y-6 mt-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Learning Outcomes</h2>
                  <p className="text-muted-foreground">
                    What you'll be able to do after completing this course.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {learningOutcomes.map((outcome, index) => (
                    <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Target className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-sm leading-relaxed">{outcome}</p>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Career Outcomes */}
                <div className="grid sm:grid-cols-3 gap-4 pt-4">
                  <Card className="p-5 text-center">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                      <Trophy className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-600 mb-1">78%</div>
                    <p className="text-xs text-muted-foreground">Find AI-related work within 3 months</p>
                  </Card>
                  <Card className="p-5 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-primary mb-1">$1,500</div>
                    <p className="text-xs text-muted-foreground">Avg monthly freelance earnings</p>
                  </Card>
                  <Card className="p-5 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Wrench className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-2xl font-bold mb-1">4+</div>
                    <p className="text-xs text-muted-foreground">Portfolio projects completed</p>
                  </Card>
                </div>

                {/* Certificate Section */}
                <Card className="p-6 border-dashed border-2">
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="w-16 h-16 rounded-xl bg-gradient-learning flex items-center justify-center flex-shrink-0">
                      <Trophy className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">Certificate of Completion</h3>
                      <p className="text-muted-foreground mb-4">
                        Upon successful completion, receive a digital certificate you can share on LinkedIn or add to your resume.
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Preview Certificate
                        </Button>
                        <Badge variant="secondary">Shareable</Badge>
                        <Badge variant="secondary">Verifiable</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* What's Included Tab */}
              <TabsContent value="included" className="space-y-6 mt-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">What's Included</h2>
                  <p className="text-muted-foreground">
                    Everything you get with this free course.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {whatsIncluded.map((item, index) => (
                    <Card key={index} className="p-5 text-center hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <item.icon className="h-6 w-6 text-primary" />
                      </div>
                      <p className="font-medium">{item.label}</p>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Prerequisites Tab */}
              <TabsContent value="prerequisites" className="space-y-6 mt-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Prerequisites</h2>
                  <p className="text-muted-foreground">
                    What you need before starting this course.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {prerequisites.map((item, index) => (
                    <Card key={index} className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <item.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">{item.label}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Card className="p-5 bg-green-500/10 border-green-500/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <p className="text-sm">
                      <span className="font-medium">Good news!</span> No prior AI or coding experience required. Basic computer skills are enough to get started.
                    </p>
                  </div>
                </Card>
              </TabsContent>

              {/* Instructor Tab */}
              <TabsContent value="instructor" className="space-y-6 mt-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Meet Your Instructor</h2>
                </div>

                <Card className="p-6">
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-learning flex items-center justify-center text-primary-foreground text-2xl font-bold flex-shrink-0">
                      DI
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">DIM Team</h3>
                      <p className="text-muted-foreground mb-4">AI Education Specialists & Practitioners</p>
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        Our team of AI practitioners brings years of experience building AI solutions 
                        for businesses across Africa. We've distilled our knowledge into practical, 
                        hands-on lessons that focus on real results and earning potential.
                      </p>
                      <div className="grid grid-cols-3 gap-6 text-center">
                        <div>
                          <div className="text-2xl font-bold">5,000+</div>
                          <div className="text-sm text-muted-foreground">Students Taught</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">10+</div>
                          <div className="text-sm text-muted-foreground">Courses Created</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">4.8/5</div>
                          <div className="text-sm text-muted-foreground">Average Rating</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-6 mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Student Reviews</h2>
                    <p className="text-muted-foreground">What our learners are saying</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      <span className="text-2xl font-bold">4.8</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Based on 632 reviews</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      name: "Tunde O.",
                      rating: 5,
                      date: "2 weeks ago",
                      review: "This course changed everything for me. I went from knowing nothing about AI to building chatbots for clients in just 8 weeks. Now I earn $2,000/month freelancing!"
                    },
                    {
                      name: "Sarah M.",
                      rating: 5,
                      date: "3 weeks ago",
                      review: "The prompt engineering section alone was worth it. I've automated half my content creation workflow and saved 15+ hours every week."
                    },
                    {
                      name: "James K.",
                      rating: 5,
                      date: "1 month ago",
                      review: "Built my first AI product during this course - a customer service bot for my e-commerce store. It handles 70% of inquiries automatically now."
                    }
                  ].map((review, index) => (
                    <Card key={index} className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                          {review.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="font-medium">{review.name}</span>
                              <span className="text-muted-foreground text-sm ml-2">{review.date}</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.review}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Button variant="outline" className="w-full">
                  Load More Reviews
                </Button>
              </TabsContent>
            </Tabs>

            {/* FAQ Section */}
            <CourseFAQ />

            {/* Related Paths */}
            <RelatedPaths currentPathId={COURSE_ID} />
          </div>

          {/* Right Sidebar - Enrollment Card (Desktop) */}
          <div className="hidden lg:block">
            <EnrollmentCard
              courseId={COURSE_ID}
              isEnrolled={isEnrolled}
              isEnrolling={isEnrolling}
              progressPercent={progressPercent}
              onEnroll={enroll}
              onContinue={handleContinueLearning}
              totalLessons={totalLessons}
              duration="10-14 weeks"
            />
          </div>
        </div>
      </div>

      {/* Mobile Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-background border-t p-4 z-50">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">From Zero to Builder</p>
            <p className="text-sm text-muted-foreground">
              {isEnrolled ? `${progressPercent}% complete` : `Free • ${totalLessons} lessons`}
            </p>
          </div>
          {isEnrolled ? (
            <Button variant="ai" onClick={handleContinueLearning}>
              <Play className="w-4 h-4 mr-2" />
              Continue
            </Button>
          ) : (
            <Button 
              variant="ai" 
              onClick={() => user ? enroll() : navigate('/auth')}
              disabled={isEnrolling}
            >
              {isEnrolling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Enroll Free
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Bottom Padding for Mobile Sticky Footer */}
      <div className="h-20 lg:hidden" />
    </div>
  );
};

export default PracticalSkills;
