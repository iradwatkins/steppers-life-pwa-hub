import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle,
  Circle,
  ArrowRight,
  Trophy,
  Target,
  Clock,
  Users,
  Star,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserProgress } from '@/services/userDashboardService';

interface ProgressSectionProps {
  userProgress: UserProgress | null;
}

const ProgressSection: React.FC<ProgressSectionProps> = ({ userProgress }) => {
  if (!userProgress) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
        <p className="text-text-secondary">Loading progress...</p>
      </div>
    );
  }

  const completionPercentage = (userProgress.completedSteps / userProgress.totalSteps) * 100;

  return (
    <div className="space-y-6">
      {/* Overall Progress Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-brand-primary" />
                Your SteppersLife Journey
              </CardTitle>
              <CardDescription>
                Track your progress and unlock new features as you engage with the community
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-brand-primary">
                {Math.round(completionPercentage)}%
              </div>
              <div className="text-sm text-text-secondary">Complete</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Overall Progress</span>
              <span className="text-text-primary font-medium">
                {userProgress.completedSteps} of {userProgress.totalSteps} steps
              </span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-surface-card rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-5 w-5 text-brand-primary" />
                <span className="text-2xl font-bold text-text-primary">
                  {userProgress.profileCompletion}%
                </span>
              </div>
              <p className="text-sm text-text-secondary">Profile Complete</p>
            </div>
            
            <div className="text-center p-4 bg-surface-card rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-5 w-5 text-brand-primary" />
                <span className="text-2xl font-bold text-text-primary">
                  {userProgress.rolesActivated}
                </span>
              </div>
              <p className="text-sm text-text-secondary">Roles Activated</p>
            </div>
            
            <div className="text-center p-4 bg-surface-card rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="h-5 w-5 text-brand-primary" />
                <span className="text-2xl font-bold text-text-primary">
                  {userProgress.nextSteps.length}
                </span>
              </div>
              <p className="text-sm text-text-secondary">Next Steps</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      {userProgress.nextSteps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-primary" />
              Next Steps to Complete
            </CardTitle>
            <CardDescription>
              Continue your journey by completing these recommended actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userProgress.nextSteps.map((step, index) => (
                <div 
                  key={step.id}
                  className="flex items-start gap-4 p-4 border border-border-default rounded-lg hover:bg-surface-card transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-text-secondary" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-text-primary mb-1">
                          {step.title}
                        </h3>
                        <p className="text-sm text-text-secondary mb-3">
                          {step.description}
                        </p>
                        {!step.completed && step.action && (
                          <Link to={step.action.target}>
                            <Button size="sm" className="bg-brand-primary hover:bg-brand-primary-hover">
                              {step.action.label}
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>
                        )}
                      </div>
                      
                      <Badge 
                        variant={step.completed ? "default" : "secondary"}
                        className={step.completed ? "bg-green-100 text-green-800" : ""}
                      >
                        {step.completed ? "Completed" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievement Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand-primary" />
            Achievement Milestones
          </CardTitle>
          <CardDescription>
            Unlock special features and recognition as you reach these milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Profile Completion Milestone */}
            <div className="flex items-center gap-4 p-4 border border-border-default rounded-lg">
              <div className="flex-shrink-0">
                {userProgress.profileCompletion >= 100 ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <Circle className="h-6 w-6 text-text-secondary" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-text-primary">Profile Master</h3>
                <p className="text-sm text-text-secondary">Complete your profile 100%</p>
                <div className="mt-2">
                  <Progress value={userProgress.profileCompletion} className="h-2" />
                </div>
              </div>
              <div className="text-sm text-text-secondary">
                {userProgress.profileCompletion}/100%
              </div>
            </div>

            {/* Multi-Role Achievement */}
            <div className="flex items-center gap-4 p-4 border border-border-default rounded-lg">
              <div className="flex-shrink-0">
                {userProgress.rolesActivated >= 3 ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <Circle className="h-6 w-6 text-text-secondary" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-text-primary">Multi-Role Explorer</h3>
                <p className="text-sm text-text-secondary">Activate 3 different roles</p>
                <div className="mt-2">
                  <Progress value={(userProgress.rolesActivated / 3) * 100} className="h-2" />
                </div>
              </div>
              <div className="text-sm text-text-secondary">
                {userProgress.rolesActivated}/3 roles
              </div>
            </div>

            {/* Community Engagement */}
            <div className="flex items-center gap-4 p-4 border border-border-default rounded-lg">
              <div className="flex-shrink-0">
                <Circle className="h-6 w-6 text-text-secondary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-text-primary">Community Champion</h3>
                <p className="text-sm text-text-secondary">Attend 5 events and write 3 reviews</p>
                <div className="mt-2">
                  <Progress value={30} className="h-2" />
                </div>
              </div>
              <div className="text-sm text-text-secondary">
                2/5 events
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions to Boost Progress</CardTitle>
          <CardDescription>
            These actions will help you complete more milestones quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/account/profile">
              <div className="p-4 border border-border-default rounded-lg hover:bg-surface-card transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-brand-primary" />
                  <div>
                    <h3 className="font-medium text-text-primary">Complete Profile</h3>
                    <p className="text-sm text-text-secondary">Add photo and bio</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/events">
              <div className="p-4 border border-border-default rounded-lg hover:bg-surface-card transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-brand-primary" />
                  <div>
                    <h3 className="font-medium text-text-primary">Attend an Event</h3>
                    <p className="text-sm text-text-secondary">Join the community</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressSection; 