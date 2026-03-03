import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Edit, DollarSign, MapPin, Clock, Briefcase } from 'lucide-react';
import type { SellerFreelancerProfile } from '@/hooks/useSellerDashboard';

interface Props {
  profile: SellerFreelancerProfile | null;
}

export const SellerFreelancerCard = ({ profile }: Props) => {
  const navigate = useNavigate();

  if (!profile) {
    return (
      <Card className="mb-8 border-dashed">
        <CardContent className="py-12 text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Create Your Freelancer Profile</h3>
          <p className="text-muted-foreground mb-4">
            Set up your profile to start offering freelance services and attract clients
          </p>
          <Button onClick={() => navigate('/marketplace/create-freelancer-profile')}>
            <User className="h-4 w-4 mr-2" />
            Create Profile
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 overflow-hidden border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Your Freelancer Profile
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/marketplace/create-freelancer-profile')}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Badge variant={profile.is_active ? "default" : "secondary"}>
              {profile.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <Avatar className="h-24 w-24 border-4 border-primary/10">
              <AvatarImage src={profile.profile_picture} alt={profile.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-2xl font-bold mb-1">{profile.name}</h3>
              <p className="text-lg text-muted-foreground">{profile.title}</p>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">${profile.hourly_rate}/hr</span>
              </div>
              {profile.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.availability && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.availability}</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.slice(0, 6).map((skill) => (
                <Badge key={skill} variant="secondary">{skill}</Badge>
              ))}
              {profile.skills.length > 6 && (
                <Badge variant="outline">+{profile.skills.length - 6} more</Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
