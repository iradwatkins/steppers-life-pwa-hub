import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PerformanceScore } from '@/services/comparativeAnalyticsService'; // Assuming type is exported from service
import {
  Award,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Settings2,
  Speaker,
  ThumbsUp,
  Info
} from 'lucide-react';

interface PerformanceScoreCardProps {
  eventId: string;
  scoreData: PerformanceScore;
}

const PerformanceScoreCard: React.FC<PerformanceScoreCardProps> = ({ eventId, scoreData }) => {
  const getRatingColor = (rating: string) => {
    if (rating === 'Exceptional') return 'bg-green-500 text-white';
    if (rating === 'Strong') return 'bg-blue-500 text-white';
    if (rating === 'Good') return 'bg-yellow-400 text-gray-800';
    if (rating === 'Fair') return 'bg-orange-400 text-white';
    if (rating === 'Poor') return 'bg-red-500 text-white';
    return 'bg-gray-300';
  };

  const scoreCategories = [
    { name: 'Financial', score: scoreData.financialScore, weight: scoreData.weights.financial, icon: DollarSign, color: "#34D399" },
    { name: 'Operational', score: scoreData.operationalScore, weight: scoreData.weights.operational, icon: Settings2, color: "#60A5FA" },
    { name: 'Marketing', score: scoreData.marketingScore, weight: scoreData.weights.marketing, icon: Speaker, color: "#FBBF24" },
    { name: 'Quality', score: scoreData.qualityScore, weight: scoreData.weights.quality, icon: ThumbsUp, color: "#F472B6" },
  ];

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-semibold text-foreground">Event ID: {eventId}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">Overall Performance Score</CardDescription>
          </div>
          <Badge className={`text-sm px-3 py-1 ${getRatingColor(scoreData.rating)}`}>{scoreData.rating}</Badge>
        </div>
        <div className="flex items-baseline gap-2 pt-2">
          <span className="text-5xl font-bold text-brand-primary">{scoreData.overallScore}</span>
          <span className="text-muted-foreground">/ 100</span>
        </div>
        <Progress value={scoreData.overallScore} className="w-full h-2 mt-2" />
      </CardHeader>
      <CardContent className="pt-0">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="component-scores">
            <AccordionTrigger className="text-base font-medium hover:no-underline">
              Component Scores & Weights
            </AccordionTrigger>
            <AccordionContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Weight</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scoreCategories.map((cat) => (
                    <TableRow key={cat.name}>
                      <TableCell>
                        <div className="flex items-center">
                          <cat.icon className="h-4 w-4 mr-2" style={{ color: cat.color }} />
                          {cat.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">{cat.score}/100</TableCell>
                      <TableCell className="text-right">{(cat.weight * 100).toFixed(0)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="strengths">
            <AccordionTrigger className="text-base font-medium hover:no-underline">
              Key Strength Areas
            </AccordionTrigger>
            <AccordionContent>
              {scoreData.strengthAreas && scoreData.strengthAreas.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {scoreData.strengthAreas.map((strength, idx) => (
                    <li key={idx} className="flex items-start">
                      <TrendingUp className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">No specific strength areas highlighted.</p>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="recommendations">
            <AccordionTrigger className="text-base font-medium hover:no-underline">
              Improvement Recommendations
            </AccordionTrigger>
            <AccordionContent>
              {scoreData.recommendations && scoreData.recommendations.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {scoreData.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start">
                      <Info className="h-4 w-4 mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">No specific recommendations at this time.</p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

interface PerformanceScoringSectionProps {
  performanceScores: Record<string, PerformanceScore> | null;
}

const PerformanceScoringSection: React.FC<PerformanceScoringSectionProps> = ({ performanceScores }) => {
  if (!performanceScores || Object.keys(performanceScores).length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium">No Performance Scores Available</h3>
          <p className="text-sm text-muted-foreground">
            Performance scores will be displayed here once calculated for the selected events.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(performanceScores).map(([eventId, scoreData]) => (
          <PerformanceScoreCard key={eventId} eventId={eventId} scoreData={scoreData} />
        ))}
      </div>
    </div>
  );
};

export default PerformanceScoringSection; 