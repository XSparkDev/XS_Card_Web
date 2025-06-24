import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../UI/dialog';
import { Button } from '../UI/button';
import { Input } from '../UI/input';
import { Textarea } from '../UI/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../UI/selectRadix';
import { Calendar, Clock, Users, Building, Mail, Phone, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { submitDemoRequest, EnterpriseInquiry } from '../../services/billingService';

interface DemoRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DemoRequestModal: React.FC<DemoRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [demoRequest, setDemoRequest] = useState<EnterpriseInquiry>({
    companyName: '',
    contactPersonName: '',
    email: '',
    phone: '',
    companySize: 'medium',
    industry: '',
    estimatedUsers: 10,
    preferredContactTime: '',
    specificRequirements: '',
    currentSolution: '',
    budget: '',
    timeline: '',
    inquiryType: 'demo',
    submittedAt: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [specificInterests, setSpecificInterests] = useState<string[]>([]);

  const interests = [
    'Digital Business Cards',
    'QR Code Features',
    'Team Management',
    'Analytics & Reporting',
    'Custom Branding',
    'API Integration',
    'Contact Management',
    'Mobile App Features'
  ];

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Real Estate',
    'Professional Services',
    'Consulting',
    'Other'
  ];

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(demoRequest.companyName && demoRequest.contactPersonName && demoRequest.email && demoRequest.phone);
      case 2:
        return !!(demoRequest.industry && demoRequest.estimatedUsers > 0);
      case 3:
        return !!(specificInterests.length > 0 && demoRequest.specificRequirements);
      default:
        return false;
    }
  };

  const handleInterestToggle = (interest: string) => {
    setSpecificInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      setError(null);
    } else {
      setError('Please fill in all required fields to continue.');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      setError('Please complete all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const submissionData: EnterpriseInquiry = {
        ...demoRequest,
        specificRequirements: `Demo Request - Interested in: ${specificInterests.join(', ')}. ${demoRequest.specificRequirements}`,
        inquiryType: 'demo'
      };

      await submitDemoRequest(submissionData);
      
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Demo request submission error:', error);
      setError('Failed to submit demo request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setDemoRequest({
      companyName: '',
      contactPersonName: '',
      email: '',
      phone: '',
      companySize: 'medium',
      industry: '',
      estimatedUsers: 10,
      preferredContactTime: '',
      specificRequirements: '',
      currentSolution: '',
      budget: '',
      timeline: '',
      inquiryType: 'demo',
      submittedAt: ''
    });
    setSpecificInterests([]);
    setCurrentStep(1);
    setError(null);
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Building className="w-4 h-4" />
            Company Name *
          </label>
          <Input
            placeholder="Enter your company name"
            value={demoRequest.companyName}
            onChange={(e) => setDemoRequest(prev => ({ ...prev, companyName: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            Your Name *
          </label>
          <Input
            placeholder="Enter your full name"
            value={demoRequest.contactPersonName}
            onChange={(e) => setDemoRequest(prev => ({ ...prev, contactPersonName: e.target.value }))}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Address *
          </label>
          <Input
            type="email"
            placeholder="your.email@company.com"
            value={demoRequest.email}
            onChange={(e) => setDemoRequest(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Phone Number *
          </label>
          <Input
            type="tel"
            placeholder="+27 11 123 4567"
            value={demoRequest.phone}
            onChange={(e) => setDemoRequest(prev => ({ ...prev, phone: e.target.value }))}
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Industry *</label>
          <Select value={demoRequest.industry} onValueChange={(value) => setDemoRequest(prev => ({ ...prev, industry: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map(industry => (
                <SelectItem key={industry} value={industry}>{industry}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Company Size</label>
          <Select value={demoRequest.companySize} onValueChange={(value: any) => setDemoRequest(prev => ({ ...prev, companySize: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">1-50 employees</SelectItem>
              <SelectItem value="medium">51-200 employees</SelectItem>
              <SelectItem value="large">201-500 employees</SelectItem>
              <SelectItem value="enterprise">500+ employees</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Expected Users *</label>
          <Input
            type="number"
            min="1"
            placeholder="10"
            value={demoRequest.estimatedUsers || ''}
            onChange={(e) => setDemoRequest(prev => ({ ...prev, estimatedUsers: parseInt(e.target.value) || 0 }))}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Preferred Contact Time
          </label>
          <Input
            placeholder="e.g., Weekdays 9-5 SAST"
            value={demoRequest.preferredContactTime}
            onChange={(e) => setDemoRequest(prev => ({ ...prev, preferredContactTime: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="text-sm font-medium">What features are you most interested in? *</label>
        <div className="grid grid-cols-2 gap-2">
          {interests.map(interest => (
            <label key={interest} className="flex items-center space-x-2 p-2 rounded border hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={specificInterests.includes(interest)}
                onChange={() => handleInterestToggle(interest)}
                className="rounded"
              />
              <span className="text-sm">{interest}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          What challenges are you trying to solve? *
        </label>
        <Textarea
          placeholder="Tell us about your current networking challenges and what you hope to achieve with XSCard..."
          value={demoRequest.specificRequirements}
          onChange={(e) => setDemoRequest(prev => ({ ...prev, specificRequirements: e.target.value }))}
          rows={4}
          required
        />
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Request a Demo
          </DialogTitle>
          <DialogDescription>
            Get a personalized demo of XSCard and see how it can transform your business networking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {[1, 2, 3].map(step => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[300px]">
            {currentStep === 1 && (
              <div>
                <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                {renderStep1()}
              </div>
            )}
            
            {currentStep === 2 && (
              <div>
                <h3 className="text-lg font-medium mb-4">Company Details</h3>
                {renderStep2()}
              </div>
            )}
            
            {currentStep === 3 && (
              <div>
                <h3 className="text-lg font-medium mb-4">Demo Preferences</h3>
                {renderStep3()}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <div>
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePrevious}>
                  Previous
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {currentStep < 3 ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Demo Request'}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 