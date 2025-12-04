import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Clock, Users, Star, Play, CheckCircle, ArrowRight,
  GraduationCap, Target, Trophy, Download, Video, Rocket
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AIEntrepreneurship = () => {
  const { toast } = useToast();

  const courseModules = [
    {
      id: 1,
      title: "Startup Fundamentals",
      description: "Learn the essentials of launching an AI-driven venture",
      duration: "3 weeks",
      lessons: 12,
      topics: [
        "The AI Startup Landscape",
        "Identifying AI Opportunities",
        "Market Research for AI Products",
        "Competitive Analysis",
        "Value Proposition Design",
        "Customer Discovery",
        "Problem-Solution Fit",
        "Product-Market Fit",
        "Minimum Viable Product (MVP)",
        "Lean Startup Methodology",
        "Pivot or Persevere",
        "Case Studies: Successful AI Startups"
      ]
    },
    {
      id: 2,
      title: "Team Leadership & Building",
      description: "Build and lead high-performing AI teams",
      duration: "3 weeks",
      lessons: 10,
      topics: [
        "Founder Mindset",
        "Co-founder Selection",
        "Building Your First Team",
        "Hiring AI Talent",
        "Remote Team Management",
        "Company Culture",
        "Leadership Styles",
        "Conflict Resolution",
        "Performance Management",
        "Scaling Your Team"
      ]
    },
    {
      id: 3,
      title: "Pitching & Fundraising",
      description: "Master the art of presenting your vision and raising capital",
      duration: "3 weeks",
      lessons: 12,
      topics: [
        "Crafting Your Story",
        "Pitch Deck Essentials",
        "Investor Psychology",
        "Types of Funding",
        "Pre-seed and Seed Rounds",
        "Series A Preparation",
        "Term Sheet Negotiation",
        "Due Diligence Process",
        "Valuation Methods",
        "Investor Relations",
        "Alternative Funding Sources",
        "Project: Create Your Pitch Deck"
      ]
    },
    {
      id: 4,
      title: "Revenue Models & Monetization",
      description: "Design sustainable business models for AI products",
      duration: "3 weeks",
      lessons: 10,
      topics: [
        "AI Business Models Overview",
        "SaaS for AI Products",
        "API-as-a-Service Model",
        "Freemium Strategies",
        "Enterprise Sales",
        "Usage-Based Pricing",
        "Marketplace Models",
        "Data Monetization Ethics",
        "Unit Economics",
        "Project: Design Your Revenue Model"
      ]
    },
    {
      id: 5,
      title: "Business Planning & Execution",
      description: "Turn your vision into a actionable business plan",
      duration: "2 weeks",
      lessons: 8,
      topics: [
        "Business Plan Structure",
        "Financial Projections",
        "Go-to-Market Strategy",
        "Growth Hacking for AI",
        "Legal Considerations",
        "IP Protection for AI",
        "Exit Strategies",
        "Capstone: Complete Business Plan"
      ]
    }
  ];

  const learningOutcomes = [
    "Launch and lead AI-driven ventures from concept to market",
    "Build and manage high-performing startup teams",
    "Create compelling pitches that attract investors",
    "Design sustainable revenue models for AI products",
    "Navigate the fundraising process successfully",
    "Develop comprehensive business plans",
    "Understand legal and IP considerations for AI startups",
    "Scale your AI business effectively"
  ];

  const handleStartCourse = () => {
    toast({
      title: "Course started!",
      description: "Welcome to From Student to Founder. Let's build your AI empire!"
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
                  <span className="bg-gradient-earn bg-clip-text text-transparent">
                    From Student to Founder
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Train to launch and lead AI-driven ventures. Master startup fundamentals,
                  team leadership, pitching, and business planning.
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
                    <span className="text-sm font-medium">987</span>
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
                    <Rocket className="h-12 w-12 text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Startup Journey Preview</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">What you'll learn:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Startup fundamentals & MVP
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Team building & leadership
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Pitching & fundraising
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Revenue model design
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
                  Master the complete journey from idea to funded AI startup.
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
                  Founder Certificate
                </h3>
                <p className="text-muted-foreground mb-4">
                  Earn your AI Entrepreneurship certificate to showcase your founder skills.
                </p>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Preview Certificate
                  </Button>
                  <Badge variant="secondary">Investor Recognized</Badge>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="instructor" className="space-y-6">
              <Card className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-earn flex items-center justify-center text-white text-2xl font-bold">
                    FD
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xl font-semibold">Founder Development Team</h3>
                      <p className="text-muted-foreground">Serial Entrepreneurs & Venture Partners</p>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Learn from founders who have built and exited AI companies, and venture partners
                      who have invested in over 100 startups. Real-world experience, practical advice.
                    </p>
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-lg font-semibold">$500M+</div>
                        <div className="text-sm text-muted-foreground">Raised by Alumni</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">50+</div>
                        <div className="text-sm text-muted-foreground">Companies Founded</div>
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
                  { name: "Alex Kim", rating: 5, comment: "This course gave me the confidence and skills to launch my AI startup. We just closed our seed round!" },
                  { name: "Priya Sharma", rating: 5, comment: "The pitching module alone was worth it. I completely transformed my investor deck." },
                  { name: "Jordan Taylor", rating: 5, comment: "Comprehensive and practical. The business model frameworks are incredibly useful." }
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

export default AIEntrepreneurship;
