import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Target, 
  TrendingUp, 
  TrendingDown,
  Award,
  AlertCircle,
  Lightbulb,
  Settings,
  BarChart3,
  DollarSign,
  Users,
  Marketing,
  Heart,
  Trophy,
  Medal,
  Zap,
  CheckCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { PerformanceScore } from '@/services/comparativeAnalyticsService';

interface PerformanceScoreCardProps {
  score: PerformanceScore;
  onWeightsChange?: (weights: { financial: number; operational: number; marketing: number; customer_experience: number }) => void;
  showWeightControls?: boolean;
  compact?: boolean;
}

const PerformanceScoreCard: React.FC<PerformanceScoreCardProps> = ({
  score,
  onWeightsChange,
  showWeightControls = false,
  compact = false
}) => {
  const [customWeights, setCustomWeights] = useState({
    financial: 30,
    operational: 25,
    marketing: 25,
    customer_experience: 20
  });
  const [showCustomWeights, setShowCustomWeights] = useState(false);

  const handleWeightChange = (category: keyof typeof customWeights, value: number[]) => {
    const newWeights = { ...customWeights, [category]: value[0] };
    
    // Ensure weights sum to 100
    const total = Object.values(newWeights).reduce((sum, weight) => sum + weight, 0);
    if (total <= 100) {
      setCustomWeights(newWeights);
      
      // Convert to decimal format for the service
      const normalizedWeights = {
        financial: newWeights.financial / 100,
        operational: newWeights.operational / 100,
        marketing: newWeights.marketing / 100,
        customer_experience: newWeights.customer_experience / 100
      };
      
      onWeightsChange?.(normalizedWeights);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'text-green-600 bg-green-50 border-green-200';
      case 'A': return 'text-green-600 bg-green-50 border-green-200';
      case 'B+': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'B': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'C+': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'C': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'D': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'F': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const categoryIcons = {
    financial: DollarSign,
    operational: Users,
    marketing: Marketing,
    customer_experience: Heart
  };

  const categoryLabels = {
    financial: 'Financial',
    operational: 'Operational',
    marketing: 'Marketing',
    customer_experience: 'Customer Experience'
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (rank <= 3) return <Medal className="h-4 w-4 text-gray-400" />;
    return <Target className="h-4 w-4 text-gray-400" />;
  };

  const getTrendIndicator = (percentile: number) => {
    if (percentile >= 90) return { icon: ArrowUp, color: 'text-green-500', label: 'Top Performer' };
    if (percentile >= 75) return { icon: TrendingUp, color: 'text-blue-500', label: 'Above Average' };
    if (percentile >= 50) return { icon: Target, color: 'text-yellow-500', label: 'Average' };
    if (percentile >= 25) return { icon: TrendingDown, color: 'text-orange-500', label: 'Below Average' };
    return { icon: ArrowDown, color: 'text-red-500', label: 'Needs Improvement' };
  };

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`text-3xl font-bold ${getScoreColor(score.overall_score)}`}>
                {score.overall_score}
              </div>
              <div>
                <Badge className={`${getGradeColor(score.grade)} font-semibold`}>
                  {score.grade}
                </Badge>
                <div className="text-sm text-muted-foreground mt-1">
                  Portfolio Rank #{score.ranking.portfolio_rank}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Industry Percentile</div>
              <div className={`text-lg font-semibold ${getScoreColor(score.ranking.industry_percentile)}`}>
                {score.ranking.industry_percentile}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const trendIndicator = getTrendIndicator(score.ranking.industry_percentile);
  const TrendIcon = trendIndicator.icon;

  return (
    <div className="space-y-6">
      {/* Main Score Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-brand-primary" />
              Performance Score
            </CardTitle>
            {showWeightControls && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCustomWeights(!showCustomWeights)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Customize Weights
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Overall Score */}
          <div className="text-center">
            <div className={`text-6xl font-bold ${getScoreColor(score.overall_score)} mb-2`}>
              {score.overall_score}
            </div>
            <Badge className={`${getGradeColor(score.grade)} font-semibold text-lg px-4 py-2`}>
              Grade: {score.grade}
            </Badge>
            <Progress 
              value={score.overall_score} 
              className="mt-4 h-3"
              style={{ 
                background: `linear-gradient(to right, ${getProgressColor(score.overall_score)} ${score.overall_score}%, #e5e7eb ${score.overall_score}%)` 
              }}
            />
          </div>

          <Separator />

          {/* Category Scores */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Category Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(score.category_scores).map(([category, categoryScore]) => {
                const Icon = categoryIcons[category as keyof typeof categoryIcons];
                const label = categoryLabels[category as keyof typeof categoryLabels];
                
                return (
                  <div key={category} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Icon className="h-5 w-5 text-brand-primary" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{label}</span>
                        <span className={`font-bold ${getScoreColor(categoryScore)}`}>
                          {categoryScore}
                        </span>
                      </div>
                      <Progress value={categoryScore} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Weights */}
          {showCustomWeights && showWeightControls && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-foreground mb-4">Customize Category Weights</h4>
                <div className="space-y-4">
                  {Object.entries(customWeights).map(([category, weight]) => {
                    const label = categoryLabels[category as keyof typeof categoryLabels];
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">{label}</label>
                          <span className="text-sm text-muted-foreground">{weight}%</span>
                        </div>
                        <Slider
                          value={[weight]}
                          onValueChange={(value) => handleWeightChange(category as keyof typeof customWeights, value)}
                          max={50}
                          min={10}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    );
                  })}
                  <div className="text-xs text-muted-foreground">
                    Total: {Object.values(customWeights).reduce((sum, weight) => sum + weight, 0)}% (should equal 100%)
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-brand-primary" />
            Performance Rankings
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {getRankIcon(score.ranking.portfolio_rank)}
                <span className="ml-2 text-2xl font-bold text-foreground">
                  #{score.ranking.portfolio_rank}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">Portfolio Rank</div>
            </div>
            
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {getRankIcon(score.ranking.category_rank)}
                <span className="ml-2 text-2xl font-bold text-foreground">
                  #{score.ranking.category_rank}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">Category Rank</div>
            </div>
            
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <TrendIcon className={`h-5 w-5 ${trendIndicator.color}`} />
                <span className={`ml-2 text-2xl font-bold ${trendIndicator.color}`}>
                  {score.ranking.industry_percentile}%
                </span>
              </div>
              <div className="text-sm text-muted-foreground">Industry Percentile</div>
              <Badge variant="outline" className="mt-1 text-xs">
                {trendIndicator.label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Areas for Improvement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {score.strengths.length > 0 ? (
              <div className="space-y-3">
                {score.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-green-800">{strength}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No specific strengths identified yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="h-5 w-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {score.improvement_areas.length > 0 ? (
              <div className="space-y-3">
                {score.improvement_areas.map((area, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-orange-800">{area}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">All areas performing well</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <Lightbulb className="h-5 w-5" />
            Recommendations
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {score.recommendations.length > 0 ? (
            <div className="space-y-3">
              {score.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm text-blue-800 font-medium">{recommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <h4 className="font-medium mb-1">Great Performance!</h4>
              <p className="text-sm">No specific recommendations at this time. Keep up the excellent work!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceScoreCard; 