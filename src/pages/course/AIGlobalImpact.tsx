import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Clock, Users, Star, Play, CheckCircle, ArrowRight,
  GraduationCap, Target, Trophy, Download, Video, Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AIGlobalImpact = () => {
  const { toast } = useToast();

  const courseModules = [
    {
      id: 1,
      title: "AI for Sustainability",
      description: "Leverage AI to address environmental and resource challenges",
      duration: "4 weeks",
      lessons: 12,
      topics: [
        "AI and the Climate Crisis",
        "Energy Optimization with AI",
        "Smart Grid Technologies",
        "Carbon Footprint Reduction",
        "Sustainable Agriculture AI",
        "Precision Farming",
        "Water Resource Management",
        "Waste Reduction Systems",
        "Biodiversity Monitoring",
        "Circular Economy AI",
        "Green AI Practices",
        "Project: Sustainability Solution"
      ]
    },
    {
      id: 2,
      title: "Climate Modeling & Prediction",
      description: "Apply AI to understand and predict climate patterns",
      duration: "4 weeks",
      lessons: 12,
      topics: [
        "Climate Science Foundations",
        "Weather Prediction Models",
        "Long-term Climate Modeling",
        "Extreme Weather Detection",
        "Sea Level Rise Prediction",
        "Wildfire Risk Assessment",
        "Air Quality Forecasting",
        "Satellite Data Analysis",
        "Climate Data Sources",
        "Model Uncertainty",
        "Policy Communication",
        "Project: Climate Model"
      ]
    },
    {
      id: 3,
      title: "AI for Social Good",
      description: "Apply AI to reduce poverty, inequality, and social challenges",
      duration: "4 weeks",
      lessons: 12,
      topics: [
        "Poverty Mapping with AI",
        "Financial Inclusion",
        "Disaster Response AI",
        "Humanitarian Aid Optimization",
        "Refugee Crisis Support",
        "Food Security Systems",
        "Access to Education",
        "Gender Equality Initiatives",
        "Digital Divide Solutions",
        "Accessibility Technologies",
        "Community Development AI",
        "Project: Social Impact Solution"
      ]
    },
    {
      id: 4,
      title: "Public Health AI",
      description: "Combat disease and improve healthcare access globally",
      duration: "4 weeks",
      lessons: 12,
      topics: [
        "Epidemic Prediction Models",
        "Disease Surveillance Systems",
        "Vaccine Distribution Optimization",
        "Remote Diagnostics",
        "Mental Health AI Tools",
        "Maternal Health Technologies",
        "Nutrition Analysis",
        "Healthcare Access Mapping",
        "Drug Discovery for Neglected Diseases",
        "Health Misinformation Detection",
        "Telemedicine Innovations",
        "Project: Public Health Solution"
      ]
    },
    {
      id: 5,
      title: "Sustainable Development Goals",
      description: "Align AI initiatives with UN Sustainable Development Goals",
      duration: "2 weeks",
      lessons: 8,
      topics: [
        "Understanding the 17 SDGs",
        "AI Applications per SDG",
        "Measuring SDG Progress",
        "Partnership Building",
        "Funding Global AI Projects",
        "Working with NGOs",
        "Government Collaboration",
        "Capstone: SDG-Aligned Project"
      ]
    }
  ];

  const learningOutcomes = [
    "Apply AI to address climate change challenges",
    "Build climate prediction and modeling systems",
    "Create AI solutions for poverty and inequality",
    "Develop public health AI applications",
    "Align projects with UN Sustainable Development Goals",
    "Partner with NGOs and governments",
    "Secure funding for global impact projects",
    "Lead AI initiatives for social change"
  ];

  const handleStartCourse = () => {
    toast({
      title: "Course started!",
      description: "Welcome to Solving the World's Biggest Problems. Let's make an impact!"
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
                  <span className="bg-gradient-ai bg-clip-text text-transparent">
                    Solving the World's Biggest Problems
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Apply AI to global challenges including climate change, poverty,
                  healthcare access, and sustainable development.
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
                    <span className="text-sm font-medium">56 lessons</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Total Lessons</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">892</span>
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
                    <Globe className="h-12 w-12 text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Global Impact Preview</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">What you'll learn:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      AI for sustainability
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Climate modeling
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Social good applications
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Public health AI
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
                  Comprehensive training in AI for global impact and sustainable development.
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
                  Global Impact Certificate
                </h3>
                <p className="text-muted-foreground mb-4">
                  Earn certification recognized by UN partner organizations and NGOs.
                </p>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Preview Certificate
                  </Button>
                  <Badge variant="secondary">SDG Aligned</Badge>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="instructor" className="space-y-6">
              <Card className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-ai flex items-center justify-center text-white text-2xl font-bold">
                    GI
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xl font-semibold">Global Impact Team</h3>
                      <p className="text-muted-foreground">UN Advisors & Climate Scientists</p>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Our instructors have worked with the UN, World Bank, and leading NGOs
                      to deploy AI solutions that impact millions of lives worldwide.
                    </p>
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-lg font-semibold">50+</div>
                        <div className="text-sm text-muted-foreground">Countries Reached</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">10M+</div>
                        <div className="text-sm text-muted-foreground">Lives Impacted</div>
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
                  { name: "Maria Santos", rating: 5, comment: "This course connected me with NGOs working on climate change. Now I lead AI projects in sustainable agriculture." },
                  { name: "Dr. Ahmed Hassan", rating: 5, comment: "The public health module helped me develop epidemic prediction models for developing countries." },
                  { name: "Jennifer Chen", rating: 5, comment: "Inspiring and practical. I've launched two social impact startups since completing this course." }
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

export default AIGlobalImpact;
