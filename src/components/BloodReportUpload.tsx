import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeBloodFileWithOpenSourceLLM, analyzeBloodFileWithOpenAI } from '@/services/analyzeWithOpenSourceLLM';

interface BloodReportUploadProps {
  onAnalysisComplete: (results: any) => void;
}

export const BloodReportUpload = ({ onAnalysisComplete }: BloodReportUploadProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadedFile(file);
    setIsAnalyzing(true);

    try {
      // OpenAI LLM
      const results = await analyzeBloodFileWithOpenAI(file);

      // --- To use open source LLM, swap to: ---
      // const results = await analyzeBloodFileWithOpenSourceLLM(file);

      onAnalysisComplete(results);
      toast({
        title: "Analysis Complete",
        description: "Your blood report has been successfully analyzed!",
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      let description = "There was an error analyzing your blood report. Please try again.";
      if (error instanceof Error && error.message.includes('429')) {
        description = "You have reached the OpenAI rate limit. Please wait a minute and try again, or upgrade your OpenAI plan for higher limits.";
      }
      toast({
        title: "Analysis Failed",
        description,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [onAnalysisComplete, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    disabled: isAnalyzing
  });

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-card to-medical-secondary/20 border-medical-primary/20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold text-medical-primary">
          Upload Blood Report
        </CardTitle>
        <CardDescription className="text-base">
          Upload your blood test results for AI-powered analysis and personalized supplement recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
            ${isDragActive 
              ? 'border-medical-primary bg-medical-primary/5 scale-105' 
              : 'border-medical-primary/30 hover:border-medical-primary/50 hover:bg-medical-secondary/30'
            }
            ${isAnalyzing ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {isAnalyzing ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 text-medical-primary animate-spin" />
              <div>
                <p className="text-lg font-medium text-medical-primary">Analyzing Report...</p>
                <p className="text-sm text-muted-foreground">This may take a few moments</p>
              </div>
            </div>
          ) : uploadedFile ? (
            <div className="flex flex-col items-center space-y-4">
              <FileText className="w-12 h-12 text-medical-success" />
              <div>
                <p className="text-lg font-medium text-medical-success">File Uploaded</p>
                <p className="text-sm text-muted-foreground">{uploadedFile.name}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <Upload className="w-12 h-12 text-medical-primary" />
              <div>
                <p className="text-lg font-medium text-foreground">
                  {isDragActive ? 'Drop your file here' : 'Drag & drop your blood report'}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse • PDF supported
                </p>
              </div>
            </div>
          )}
        </div>

        {!isAnalyzing && !uploadedFile && (
          <div className="mt-6 text-center">
            <Button 
              variant="outline" 
              onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
              className="border-medical-primary text-medical-primary hover:bg-medical-primary hover:text-white"
            >
              Select File
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
