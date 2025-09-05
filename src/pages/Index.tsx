import { useState } from 'react';
import { BloodReportUpload } from '@/components/BloodReportUpload';
import { AnalysisResults } from '@/components/AnalysisResults';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import heroImage from '@/assets/medical-hero.jpg';

const Index = () => {
  const [analysisResults, setAnalysisResults] = useState(null);

  const handleAnalysisComplete = (results: any) => {
    setAnalysisResults(results);
  };

  const handleReset = () => {
    setAnalysisResults(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-medical-secondary/10 to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-medical-primary/10 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-medical-primary to-medical-primary/80 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <h1 className="text-xl font-semibold text-medical-primary">Vitabae </h1>
            </div>
            {analysisResults && (
              <Button
                variant="outline"
                onClick={handleReset}
                className="border-medical-primary text-medical-primary hover:bg-medical-primary hover:text-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                New Analysis
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!analysisResults ? (
          <>
            {/* Hero Section */}
            <section className="text-center mb-12">
              <div className="relative w-full max-w-4xl mx-auto mb-8 rounded-2xl overflow-hidden">
                <img 
                  src={heroImage} 
                  alt="Medical laboratory with blood test equipment" 
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-medical-primary/80 via-medical-primary/20 to-transparent flex items-end">
                  <div className="p-8 text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">
                      AI-Powered Blood Report Analysis
                    </h2>
                    <p className="text-lg opacity-90">
                      Get personalized health insights and supplement recommendations
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="max-w-3xl mx-auto mb-8">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Upload your blood test results and receive instant AI analysis with personalized 
                  supplement recommendations based on your unique health markers.
                </p>
              </div>
            </section>

            {/* Upload Section */}
            <section>
              <BloodReportUpload onAnalysisComplete={handleAnalysisComplete} />
            </section>

            {/* Features */}
            <section className="mt-16 max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 rounded-lg bg-card/50 border border-medical-primary/10">
                  <div className="w-12 h-12 bg-medical-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-medical-primary font-bold">AI</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">AI Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced AI analyzes your blood markers and identifies key health insights
                  </p>
                </div>
                <div className="text-center p-6 rounded-lg bg-card/50 border border-medical-primary/10">
                  <div className="w-12 h-12 bg-medical-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-medical-success font-bold">Rx</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Personalized Recommendations</h3>
                  <p className="text-sm text-muted-foreground">
                    Get tailored supplement suggestions based on your specific needs
                  </p>
                </div>
                <div className="text-center p-6 rounded-lg bg-card/50 border border-medical-primary/10">
                  <div className="w-12 h-12 bg-medical-warning/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-medical-warning font-bold">⚡</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Instant Results</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive comprehensive analysis and recommendations in minutes
                  </p>
                </div>
              </div>
            </section>
          </>
        ) : (
          <AnalysisResults results={analysisResults} />
        )}
      </main>
    </div>
  );
};

export default Index;
