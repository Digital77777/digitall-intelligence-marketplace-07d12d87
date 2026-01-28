import { useNavigate } from "react-router-dom";
import { MapPin, DollarSign, Clock, Star, Verified, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FreelancerProfile {
  id: string;
  user_id: string;
  name: string;
  title: string;
  bio: string;
  hourly_rate: number;
  experience: string;
  location: string;
  skills: string[];
  languages: string[];
  availability: string;
  profile_picture: string;
  averageRating?: number;
  totalReviews?: number;
}

interface FreelancerCardProps {
  profile: FreelancerProfile;
}

export const FreelancerCard = ({ profile }: FreelancerCardProps) => {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getExperienceBadgeVariant = (experience: string) => {
    if (experience?.includes('Expert') || experience?.includes('10+')) return 'default';
    if (experience?.includes('Experienced') || experience?.includes('5-10')) return 'secondary';
    return 'outline';
  };

  const getAvailabilityColor = (availability: string) => {
    if (availability?.includes('Full-time')) return 'text-success';
    if (availability?.includes('Part-time')) return 'text-primary';
    return 'text-muted-foreground';
  };

  return (
    <Card 
      className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/30 bg-card/80 backdrop-blur-sm"
      onClick={() => navigate(`/marketplace/freelancer/${profile.id}`)}
    >
      <CardContent className="p-0">
        {/* Header Section with Avatar */}
        <div className="relative p-6 pb-4 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-background shadow-lg ring-2 ring-primary/20">
                <AvatarImage src={profile.profile_picture} alt={profile.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-semibold">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              {(profile.totalReviews || 0) >= 5 && (
                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                  <Verified className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                {profile.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {profile.title}
              </p>
              {/* Rating */}
              {(profile.totalReviews || 0) > 0 && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-sm">{profile.averageRating?.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({profile.totalReviews} reviews)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 pb-6 space-y-4">
          {/* Bio */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {profile.bio}
          </p>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.slice(0, 3).map((skill) => (
              <Badge 
                key={skill} 
                variant="secondary" 
                className="text-xs font-normal bg-secondary/50"
              >
                {skill}
              </Badge>
            ))}
            {profile.skills.length > 3 && (
              <Badge variant="outline" className="text-xs font-normal">
                +{profile.skills.length - 3}
              </Badge>
            )}
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="p-1.5 rounded-md bg-success/10">
                <DollarSign className="h-3.5 w-3.5 text-success" />
              </div>
              <span className="font-semibold">${profile.hourly_rate}/hr</span>
            </div>
            {profile.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="truncate">{profile.location}</span>
              </div>
            )}
            {profile.experience && (
              <div className="col-span-2">
                <Badge variant={getExperienceBadgeVariant(profile.experience)} className="text-xs">
                  {profile.experience}
                </Badge>
              </div>
            )}
          </div>

          {/* Availability Indicator */}
          {profile.availability && (
            <div className={`flex items-center gap-2 text-xs ${getAvailabilityColor(profile.availability)}`}>
              <Clock className="h-3.5 w-3.5" />
              <span>{profile.availability}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/marketplace/freelancer/${profile.id}`);
              }}
            >
              View Profile
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/marketplace/freelancer/${profile.id}#contact`);
              }}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
