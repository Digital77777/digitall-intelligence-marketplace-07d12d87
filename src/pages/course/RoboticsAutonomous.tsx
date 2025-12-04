import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Clock, Users, Star, Play, CheckCircle, ArrowRight,
  GraduationCap, Target, Trophy, Download, Video, Bot
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const RoboticsAutonomous = () => {
  const { toast } = useToast();

  const courseModules = [
    {
      id: 1,
      title: "Robotics Foundations",
      description: "Master the fundamentals of robotic systems and AI integration",
      duration: "4 weeks",
      lessons: 14,
      topics: [
        "Introduction to Robotics",
        "Robot Anatomy and Components",
        "Kinematics and Dynamics",
        "Sensors and Perception",
        "Actuators and Control",
        "Robot Programming Basics",
        "Coordinate Systems",
        "Forward and Inverse Kinematics",
        "Motion Planning Fundamentals",
        "Grasping and Manipulation",
        "Human-Robot Interaction",
        "Safety in Robotics",
        "Simulation Environments",
        "Project: Basic Robot Control"
      ]
    },
    {
      id: 2,
      title: "Autonomous Systems",
      description: "Build systems that perceive, decide, and act independently",
      duration: "4 weeks",
      lessons: 14,
      topics: [
        "Autonomy Levels and Definitions",
        "Sensor Fusion Techniques",
        "SLAM (Simultaneous Localization and Mapping)",
        "Path Planning Algorithms",
        "A* and Dijkstra",
        "RRT and PRM",
        "Behavior Trees",
        "State Machines for Autonomy",
        "Decision Making Under Uncertainty",
        "Multi-Robot Coordination",
        "Swarm Robotics",
        "Real-time Systems",
        "Edge Computing for Robots",
        "Project: Autonomous Navigation"
      ]
    },
    {
      id: 3,
      title: "Self-Driving AI",
      description: "Deep dive into autonomous vehicle technology",
      duration: "4 weeks",
      lessons: 12,
      topics: [
        "Autonomous Vehicle Architecture",
        "Perception for Driving",
        "LiDAR and Camera Fusion",
        "Object Detection and Tracking",
        "Lane Detection",
        "Traffic Sign Recognition",
        "Prediction and Planning",
        "Vehicle Control Systems",
        "Simulation for AV Development",
        "Testing and Validation",
        "Regulatory Landscape",
        "Project: Self-Driving Pipeline"
      ]
    },
    {
      id: 4,
      title: "Drones & Aerial Robotics",
      description: "Master UAV systems from design to deployment",
      duration: "4 weeks",
      lessons: 12,
      topics: [
        "Drone Fundamentals",
        "Aerodynamics Basics",
        "Flight Controller Design",
        "GPS and Navigation",
        "Computer Vision for Drones",
        "Obstacle Avoidance",
        "Autonomous Flight Planning",
        "Multi-drone Coordination",
        "Delivery Drone Systems",
        "Agricultural Drones",
        "Inspection and Mapping",
        "Project: Autonomous Drone Mission"
      ]
    },
    {
      id: 5,
      title: "ROS & Production Systems",
      description: "Build production-ready robotic systems with ROS",
      duration: "4 weeks",
      lessons: 12,
      topics: [
        "ROS Architecture",
        "ROS2 Fundamentals",
        "Nodes and Topics",
        "Services and Actions",
        "TF Transforms",
        "URDF Robot Description",
        "MoveIt Motion Planning",
        "Navigation Stack",
        "Gazebo Simulation",
        "Hardware Integration",
        "Deployment Best Practices",
        "Capstone: Complete Robotic System"
      ]
    }
  ];

  const learningOutcomes = [
    "Design and build robotic systems from scratch",
    "Implement autonomous navigation and perception",
    "Develop self-driving vehicle AI components",
    "Create drone systems for various applications",
    "Master ROS and ROS2 for production systems",
    "Build multi-robot coordination systems",
    "Navigate safety and regulatory requirements",
    "Lead robotics and autonomous systems projects"
  ];

  const handleStartCourse = () => {
    toast({
      title: "Course started!",
      description: "Welcome to The Future of Machines. Let's build autonomous systems!"
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
                  <span className="bg-gradient-earn bg-clip-text text-transparent">
                    The Future of Machines
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Combine AI with robotics, IoT, and autonomous technology.
                  Build self-driving cars, drones, and intelligent robotic systems.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">20-24 weeks</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">64 lessons</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Total Lessons</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">743</span>
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
                    <Bot className="h-12 w-12 text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Robotics Preview</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">What you'll learn:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Robotics fundamentals
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Autonomous systems
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Self-driving AI
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      ROS development
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
                  Complete robotics and autonomous systems training from fundamentals to production.
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
                  Robotics Engineer Certificate
                </h3>
                <p className="text-muted-foreground mb-4">
                  Earn certification recognized by leading robotics companies.
                </p>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Preview Certificate
                  </Button>
                  <Badge variant="secondary">Industry Standard</Badge>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="instructor" className="space-y-6">
              <Card className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-earn flex items-center justify-center text-white text-2xl font-bold">
                    RT
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xl font-semibold">Robotics Team</h3>
                      <p className="text-muted-foreground">Engineers from Tesla, Boston Dynamics & DJI</p>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Learn from engineers who have built autonomous vehicles, humanoid robots,
                      and drone fleets that are deployed in the real world.
                    </p>
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-lg font-semibold">1000+</div>
                        <div className="text-sm text-muted-foreground">Robots Built</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">20+</div>
                        <div className="text-sm text-muted-foreground">Patents</div>
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
                  { name: "Kevin Liu", rating: 5, comment: "The ROS modules are incredibly practical. I'm now working on autonomous delivery robots." },
                  { name: "Sarah Thompson", rating: 5, comment: "Best robotics course I've taken. The self-driving section prepared me for my job at Waymo." },
                  { name: "Carlos Mendez", rating: 5, comment: "Comprehensive and hands-on. I built my first autonomous drone after completing this course." }
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

export default RoboticsAutonomous;
