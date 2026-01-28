import { Users, Star, Award, TrendingUp } from "lucide-react";

interface FreelancersHeroProps {
  totalFreelancers: number;
}

export const FreelancersHero = ({ totalFreelancers }: FreelancersHeroProps) => {
  const stats = [
    { icon: Users, label: "Active Experts", value: totalFreelancers.toString() },
    { icon: Star, label: "Avg Rating", value: "4.8+" },
    { icon: Award, label: "Verified Pros", value: "500+" },
    { icon: TrendingUp, label: "Projects Done", value: "10K+" },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 pt-8 pb-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 rounded-full">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI Talent Marketplace</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
              Find Expert AI Freelancers
            </span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Connect with top-tier AI professionals ready to transform your projects. 
            From ML engineers to prompt specialists, find the perfect match for your needs.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300"
            >
              <div className="p-2 rounded-lg bg-primary/10 mb-2">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-2xl font-bold text-foreground">{stat.value}</span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
