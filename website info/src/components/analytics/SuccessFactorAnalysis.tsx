import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SuccessFactorAnalysis as SuccessFactorAnalysisType } from '@/services/comparativeAnalyticsService';
import {
  Target,
  Lightbulb,
  BarChart3,
  TrendingUp,
  HelpCircle,
  Sigma,
  Puzzle,
  Zap,
  ListChecks,
  Info
} from 'lucide-react';

interface SuccessFactorAnalysisProps {
  successFactorsData: SuccessFactorAnalysisType | null;
  // onGenerateRecommendations?: () => void; // This might be re-evaluated based on new data structure
}

const SectionTitle: React.FC<{ icon: React.ElementType; title: string; description?: string }> = ({ icon: Icon, title, description }) => (
  <div className="mb-4">
    <div className="flex items-center gap-2 mb-1">
      <Icon className="h-5 w-5 text-brand-primary" />
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
    </div>
    {description && <p className="text-sm text-muted-foreground">{description}</p>}
  </div>
);

const SuccessFactorAnalysis: React.FC<SuccessFactorAnalysisProps> = ({
  successFactorsData
}) => {

  if (!successFactorsData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium">No Success Factor Data</h3>
          <p className="text-sm text-muted-foreground">
            Success factor analysis will be displayed here once generated for the selected events.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { primaryFactors, correlations, patterns, insights, eventId } = successFactorsData;

  const getImpactColor = (impact: string | number) => {
    if (typeof impact === 'number') {
        if (impact >= 0.7) return 'text-green-600';
        if (impact >= 0.4) return 'text-yellow-600';
        return 'text-red-600';
    }
    // For string impacts like 'high', 'medium', 'low'
    switch (impact?.toLowerCase()) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-700';
      case 'low': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getSignificanceBadge = (significance: string) => {
    switch (significance?.toLowerCase()) {
      case 'high': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      <CardDescription className="text-sm text-muted-foreground mb-6">
        Analysis for Event ID: <Badge variant="outline">{eventId || 'N/A'}</Badge>
      </CardDescription>

      {/* Primary Success Factors */}
      {primaryFactors && primaryFactors.length > 0 && (
        <Card>
          <CardHeader>
            <SectionTitle icon={Zap} title="Primary Success Drivers" description="Key elements that most significantly contributed to event outcomes." />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {primaryFactors.map((factor, index) => (
                <Card key={index} className="p-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-md text-foreground mb-1">{factor.factor}</h4>
                      <p className="text-xs text-muted-foreground">{factor.description}</p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className={`text-lg font-bold ${getImpactColor(factor.impact)}`}>
                        Impact: {typeof factor.impact === 'number' ? (factor.impact * 100).toFixed(0) + '%' : factor.impact}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Confidence: {(factor.confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Correlations */}
      {correlations && correlations.length > 0 && (
        <Card>
          <CardHeader>
            <SectionTitle icon={Sigma} title="Performance Correlations" description="How different performance metrics relate to each other." />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric 1</TableHead>
                  <TableHead>Metric 2</TableHead>
                  <TableHead className="text-right">Correlation</TableHead>
                  <TableHead className="text-right">Significance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {correlations.map((corr, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{corr.metric1}</TableCell>
                    <TableCell className="font-medium">{corr.metric2}</TableCell>
                    <TableCell className={`text-right font-semibold ${getImpactColor(corr.correlation)}`}>
                      {(corr.correlation * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className={`${getSignificanceBadge(corr.significance)} px-2 py-0.5 text-xs`}>{corr.significance}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Success Pattern Recognition */}
      {patterns && patterns.length > 0 && (
        <Card>
          <CardHeader>
            <SectionTitle icon={Puzzle} title="Recognized Success Patterns" description="Common patterns observed in successful events." />
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {patterns.map((pattern, index) => (
                <AccordionItem value={`pattern-${index}`} key={index}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex justify-between w-full pr-2">
                      <span className="font-medium text-left">{pattern.pattern}</span>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">Frequency: {(pattern.frequency * 100).toFixed(0)}%</Badge>
                        <Badge variant="default" className={getImpactColor(pattern.successRate)}>
                          Success Rate: {(pattern.successRate * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pt-1 pb-3">
                    {pattern.description}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Actionable Insights & Recommendations */}
      {insights && insights.length > 0 && (
        <Card>
          <CardHeader>
            <SectionTitle icon={Lightbulb} title="Actionable Insights & Recommendations" description="Strategic advice based on the analysis to improve future events." />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <Card key={index} className="p-4 shadow-sm bg-background hover:bg-muted/50 transition-colors">
                  <div className="flex items-start">
                     <div className="flex-shrink-0 mr-3 pt-1">
                       <Badge variant={insight.priority === 'high' ? 'destructive' : insight.priority === 'medium' ? 'warning' : 'default'}
                              className="text-xs px-1.5 py-0.5"
                       >
                         {insight.priority.toUpperCase()} PRIORITY
                       </Badge>
                     </div>
                    <div className="flex-grow">
                      <h4 className="font-semibold text-md text-foreground mb-1">{insight.insight}</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        <strong>Expected Impact:</strong> {insight.expectedImpact}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <strong>Implementation Difficulty:</strong> <span className={`font-medium ${insight.implementationDifficulty === 'hard' ? 'text-red-500' : insight.implementationDifficulty === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>{insight.implementationDifficulty.toUpperCase()}</span>
                      </p>
                    </div>
                   
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!primaryFactors?.length && !correlations?.length && !patterns?.length && !insights?.length && (
         <Card>
           <CardContent className="p-6 text-center">
             <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
             <h3 className="text-lg font-medium">Analysis Data Not Fully Available</h3>
             <p className="text-sm text-muted-foreground">
               Some components of the success factor analysis might not have sufficient data to display.
             </p>
           </CardContent>
         </Card>
      )}
    </div>
  );
};

export default SuccessFactorAnalysis; 