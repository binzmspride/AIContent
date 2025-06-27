import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDbTranslations } from '@/hooks/use-db-translations';

// Import các step components
import { ContentExtractionStep } from './steps/ContentExtractionStep';
import { ContentGenerationStep } from './steps/ContentGenerationStep';
import { ImageManagementStep } from './steps/ImageManagementStep';
import { SocialPreviewStep } from './steps/SocialPreviewStep';
import { SaveAndPublishStep } from './steps/SaveAndPublishStep';

interface WizardData {
  // Step 1: Content Extraction
  contentSource: 'manual' | 'existing-article';
  briefDescription: string;
  selectedArticleId?: number;
  referenceLink?: string;
  platforms: string[];
  extractedContent?: string;
  
  // Step 2: Content Generation
  generatedContent?: {
    [platform: string]: string;
  };
  
  // Step 3: Image Management
  imageOption: 'none' | 'generate' | 'library';
  selectedImageId?: number;
  imagePrompt?: string;
  generatedImageUrl?: string;
  
  // Step 4: Preview (no additional data needed)
  
  // Step 5: Save and Publish
  title?: string;
  saveToLibrary: boolean;
  schedulePost: boolean;
  publishImmediately: boolean;
}

interface SocialContentWizardProps {
  onComplete: (data: WizardData) => void;
  onCancel: () => void;
}

export function SocialContentWizard({ onComplete, onCancel }: SocialContentWizardProps) {
  const { t } = useDbTranslations();
  
  const steps = [
    { id: 1, title: t('social.steps.extract.title', 'Trích xuất'), description: t('social.steps.extract.desc', 'Lấy ý chính từ bài viết') },
    { id: 2, title: t('social.steps.generate.title', 'Tạo nội dung'), description: t('social.steps.generate.desc', 'Tạo post cho từng nền tảng') },
    { id: 3, title: t('social.steps.complete.title', 'Hoàn thành'), description: t('social.steps.complete.desc', 'Chọn hoặc tạo hình ảnh') },
    { id: 4, title: t('social.action.preview', 'Xem trước'), description: t('social.action.previewDesc', 'Preview giao diện social media') },
    { id: 5, title: t('social.action.publish', 'Lưu & Đăng'), description: t('social.action.publishDesc', 'Hoàn tất và xuất bản') }
  ];

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [wizardData, setWizardData] = useState<WizardData>({
    contentSource: 'manual',
    briefDescription: '',
    platforms: [],
    imageOption: 'none',
    saveToLibrary: true,
    schedulePost: false,
    publishImmediately: false
  });

  const updateWizardData = (updates: Partial<WizardData>) => {
    setWizardData(prev => ({ ...prev, ...updates }));
  };

  const markStepCompleted = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
  };

  const canProceedToStep = (stepId: number) => {
    if (stepId === 1) return true;
    if (stepId === 2) return completedSteps.includes(1);
    if (stepId === 3) return completedSteps.includes(2);
    if (stepId === 4) return completedSteps.includes(3);
    if (stepId === 5) return completedSteps.includes(4);
    return false;
  };

  const handleNext = () => {
    if (currentStep < 5) {
      markStepCompleted(currentStep);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    if (canProceedToStep(stepId)) {
      setCurrentStep(stepId);
    }
  };

  const renderCurrentStep = () => {
    const commonProps = {
      data: wizardData,
      onDataChange: updateWizardData,
      onNext: handleNext,
      onPrevious: handlePrevious
    };

    switch (currentStep) {
      case 1:
        return <ContentExtractionStep {...commonProps} />;
      case 2:
        return <ContentGenerationStep {...commonProps} />;
      case 3:
        return <ImageManagementStep {...commonProps} />;
      case 4:
        return <SocialPreviewStep {...commonProps} />;
      case 5:
        return <SaveAndPublishStep {...commonProps} onComplete={onComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Stepper Header */}
      <Card>
        <CardHeader>
          <CardTitle>{t('social.main.title', 'Tạo Nội Dung Mạng Xã Hội')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center space-x-3 cursor-pointer",
                    canProceedToStep(step.id) ? "opacity-100" : "opacity-50"
                  )}
                  onClick={() => handleStepClick(step.id)}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-2">
                    {completedSteps.includes(step.id) ? (
                      <CheckCircle className="w-5 h-5 text-green-600 fill-current" />
                    ) : (
                      <Circle className={cn(
                        "w-5 h-5",
                        currentStep === step.id ? "text-blue-600 fill-current" : "text-gray-400"
                      )} />
                    )}
                  </div>
                  <div className="hidden md:block">
                    <div className={cn(
                      "font-medium",
                      currentStep === step.id ? "text-blue-600" : "text-gray-600"
                    )}>
                      {step.title}
                    </div>
                    <div className="text-sm text-gray-500">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-12 h-px bg-gray-300 mx-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="min-h-[500px]">
        {renderCurrentStep()}
      </div>

      {/* Navigation Footer */}
      <Card>
        <CardContent className="flex justify-between items-center py-4">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onCancel : handlePrevious}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentStep === 1 ? t('social.nav.cancel', 'Hủy') : t('social.nav.back', 'Quay lại')}</span>
          </Button>

          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {t('social.nav.step', 'Bước')} {currentStep} / {steps.length}
            </Badge>
          </div>

          {currentStep < 5 && (
            <Button
              onClick={handleNext}
              disabled={!completedSteps.includes(currentStep)}
              className="flex items-center space-x-2"
            >
              <span>{t('social.nav.next', 'Tiếp theo')}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}