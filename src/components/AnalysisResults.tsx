import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertCircle, Heart, Pill } from 'lucide-react';

interface AnalysisResultsProps {
  results: {
    bloodType?: string;
    keyFindings: string[];
    supplements: Array<{
      name: string;
      reason: string;
      dosage?: string;
      priority: 'high' | 'medium' | 'low';
    }>;
    healthStatus: 'good' | 'attention' | 'concern';
    summary: string;
  };
}

export const AnalysisResults = ({ results }: AnalysisResultsProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-5 h-5 text-medical-success" />;
      case 'attention': return <AlertCircle className="w-5 h-5 text-medical-warning" />;
      case 'concern': return <AlertCircle className="w-5 h-5 text-medical-danger" />;
      default: return <CheckCircle className="w-5 h-5 text-medical-success" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-medical-danger text-white';
      case 'medium': return 'bg-medical-warning text-white';
      case 'low': return 'bg-medical-success text-white';
      default: return 'bg-medical-primary text-white';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Overall Status */}
      <Card className="bg-gradient-to-r from-card to-medical-secondary/20 border-medical-primary/20">
        <CardHeader>
          <div className="flex items-center space-x-3">
            {getStatusIcon(results.healthStatus)}
            <div>
              <CardTitle className="text-xl text-medical-primary">Analysis Complete</CardTitle>
              <CardDescription>AI analysis of your blood report</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed">{results.summary}</p>
          {results.bloodType && (
            <div className="mt-4 flex items-center space-x-2">
              <Heart className="w-4 h-4 text-medical-danger" />
              <span className="font-medium">Blood Type: </span>
              <Badge variant="outline" className="border-medical-primary text-medical-primary">
                {results.bloodType}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Findings */}
      <Card className="border-medical-primary/20">
        <CardHeader>
          <CardTitle className="text-lg text-medical-primary">Key Findings</CardTitle>
          <CardDescription>Important observations from your blood work</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {results.keyFindings.map((finding, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-medical-secondary/30">
                <CheckCircle className="w-4 h-4 text-medical-success mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground">{finding}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Supplement Recommendations */}
      <Card className="border-medical-primary/20">
        <CardHeader>
          <CardTitle className="text-lg text-medical-primary flex items-center space-x-2">
            <Pill className="w-5 h-5" />
            <span>Supplement Recommendations</span>
          </CardTitle>
          <CardDescription>Personalized supplements based on your results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.supplements.map((supplement, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gradient-to-r from-card to-medical-secondary/10">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-foreground">{supplement.name}</h4>
                  <Badge className={getPriorityColor(supplement.priority)}>
                    {supplement.priority} priority
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{supplement.reason}</p>
                {supplement.dosage && (
                  <p className="text-xs text-medical-primary font-medium">
                    Suggested dosage: {supplement.dosage}
                  </p>
                )}
                {index < results.supplements.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border-medical-warning/30 bg-medical-warning/5">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-medical-warning mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-medical-warning mb-1">Medical Disclaimer</p>
              <p>
                This analysis is for informational purposes only and should not replace professional medical advice. 
                Always consult with your healthcare provider before starting any new supplements or making changes to your health regimen.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};