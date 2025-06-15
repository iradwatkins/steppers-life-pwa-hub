import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical, 
  Eye, 
  Save, 
  ArrowLeft,
  HelpCircle,
  CheckSquare,
  Type,
  List
} from 'lucide-react';

// Question Types
export type QuestionType = 'text' | 'multiple_choice';

export interface CustomQuestion {
  id: string;
  question: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  order: number;
}

const questionFormSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters'),
  type: z.enum(['text', 'multiple_choice']),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional()
});

type QuestionFormData = z.infer<typeof questionFormSchema>;

const EventCustomQuestionsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<CustomQuestion[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<CustomQuestion | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [optionInputs, setOptionInputs] = useState<string[]>(['', '']);

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      question: '',
      type: 'text',
      required: false,
      options: []
    }
  });

  const watchType = form.watch('type');

  const handleAddOption = () => {
    setOptionInputs([...optionInputs, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (optionInputs.length > 2) {
      const newOptions = optionInputs.filter((_, i) => i !== index);
      setOptionInputs(newOptions);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...optionInputs];
    newOptions[index] = value;
    setOptionInputs(newOptions);
  };

  const onSubmitQuestion = (data: QuestionFormData) => {
    const filteredOptions = optionInputs.filter(option => option.trim() !== '');
    
    if (data.type === 'multiple_choice' && filteredOptions.length < 2) {
      toast.error('Multiple choice questions must have at least 2 options');
      return;
    }

    const questionData: CustomQuestion = {
      id: editingQuestion?.id || Date.now().toString(),
      question: data.question,
      type: data.type,
      required: data.required,
      options: data.type === 'multiple_choice' ? filteredOptions : undefined,
      order: editingQuestion?.order || questions.length + 1
    };

    if (editingQuestion) {
      setQuestions(questions.map(q => q.id === editingQuestion.id ? questionData : q));
      toast.success('Question updated successfully');
    } else {
      setQuestions([...questions, questionData]);
      toast.success('Question added successfully');
    }

    handleCloseDialog();
  };

  const handleEditQuestion = (question: CustomQuestion) => {
    setEditingQuestion(question);
    form.reset({
      question: question.question,
      type: question.type,
      required: question.required,
      options: question.options || []
    });
    setOptionInputs(question.options || ['', '']);
    setIsDialogOpen(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
    toast.success('Question deleted successfully');
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingQuestion(null);
    form.reset();
    setOptionInputs(['', '']);
  };

  const handleReorderQuestion = (questionId: string, direction: 'up' | 'down') => {
    const questionIndex = questions.findIndex(q => q.id === questionId);
    if (questionIndex === -1) return;

    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? questionIndex - 1 : questionIndex + 1;

    if (targetIndex < 0 || targetIndex >= questions.length) return;

    [newQuestions[questionIndex], newQuestions[targetIndex]] = 
    [newQuestions[targetIndex], newQuestions[questionIndex]];

    // Update order values
    newQuestions.forEach((q, index) => {
      q.order = index + 1;
    });

    setQuestions(newQuestions);
  };

  const handleSaveQuestions = () => {
    // In a real implementation, this would save to backend
    toast.success('Custom questions saved successfully');
    navigate(`/organizer/events/${eventId}`);
  };

  const getQuestionTypeIcon = (type: QuestionType) => {
    switch (type) {
      case 'text':
        return <Type className="h-4 w-4" />;
      case 'multiple_choice':
        return <List className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case 'text':
        return 'Text Input';
      case 'multiple_choice':
        return 'Multiple Choice';
      default:
        return 'Unknown';
    }
  };

  if (!user) {
    navigate('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/organizer/events/${eventId}`)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Event</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Custom Questions</h1>
              <p className="text-gray-600">Collect additional information from attendees</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>{previewMode ? 'Edit Mode' : 'Preview'}</span>
            </Button>
            <Button onClick={handleSaveQuestions} className="flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>Save Questions</span>
            </Button>
          </div>
        </div>

        {!previewMode ? (
          <>
            {/* Add Question Button */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full flex items-center space-x-2" onClick={() => setIsDialogOpen(true)}>
                      <Plus className="h-4 w-4" />
                      <span>Add Custom Question</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingQuestion ? 'Edit Question' : 'Add Custom Question'}
                      </DialogTitle>
                      <DialogDescription>
                        Create a custom question to collect additional information from attendees.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmitQuestion)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="question"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Question</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="What is your dietary preference?" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Question Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select question type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="text">Text Input</SelectItem>
                                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Multiple Choice Options */}
                        {watchType === 'multiple_choice' && (
                          <div className="space-y-3">
                            <Label>Answer Options</Label>
                            {optionInputs.map((option, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Input
                                  placeholder={`Option ${index + 1}`}
                                  value={option}
                                  onChange={(e) => handleOptionChange(index, e.target.value)}
                                />
                                {optionInputs.length > 2 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveOption(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleAddOption}
                              className="flex items-center space-x-2"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Add Option</span>
                            </Button>
                          </div>
                        )}

                        <FormField
                          control={form.control}
                          name="required"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Required Question</FormLabel>
                                <p className="text-sm text-muted-foreground">
                                  Attendees must answer this question to register
                                </p>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={handleCloseDialog}>
                            Cancel
                          </Button>
                          <Button type="submit">
                            {editingQuestion ? 'Update Question' : 'Add Question'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Questions List */}
            {questions.length > 0 && (
              <div className="space-y-4">
                {questions
                  .sort((a, b) => a.order - b.order)
                  .map((question, index) => (
                    <Card key={question.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="flex items-center space-x-2">
                              <GripVertical className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-500">
                                Q{index + 1}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                {getQuestionTypeIcon(question.type)}
                                <Badge variant="secondary">
                                  {getQuestionTypeLabel(question.type)}
                                </Badge>
                                {question.required && (
                                  <Badge variant="destructive">Required</Badge>
                                )}
                              </div>
                              <p className="font-medium text-gray-900 mb-2">
                                {question.question}
                              </p>
                              {question.options && (
                                <div className="space-y-1">
                                  {question.options.map((option, optIndex) => (
                                    <div key={optIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                                      <div className="w-3 h-3 border border-gray-300 rounded-full"></div>
                                      <span>{option}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReorderQuestion(question.id, 'up')}
                              disabled={index === 0}
                            >
                              ↑
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReorderQuestion(question.id, 'down')}
                              disabled={index === questions.length - 1}
                            >
                              ↓
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditQuestion(question)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteQuestion(question.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}

            {questions.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Custom Questions Yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Add custom questions to collect additional information from your attendees during registration.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          /* Preview Mode */
          <Card>
            <CardHeader>
              <CardTitle>Registration Preview</CardTitle>
              <CardDescription>
                This is how attendees will see the registration form with your custom questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Standard Fields */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Required Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>First Name *</Label>
                    <Input placeholder="John" disabled />
                  </div>
                  <div>
                    <Label>Last Name *</Label>
                    <Input placeholder="Doe" disabled />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Email Address *</Label>
                    <Input placeholder="john.doe@example.com" disabled />
                  </div>
                </div>
              </div>

              {/* Custom Questions */}
              {questions.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Additional Information</h4>
                    {questions
                      .sort((a, b) => a.order - b.order)
                      .map((question, index) => (
                        <div key={question.id}>
                          <Label>
                            {question.question}
                            {question.required && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          {question.type === 'text' ? (
                            <Input placeholder="Type your answer here..." disabled />
                          ) : (
                            <RadioGroup disabled>
                              {question.options?.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center space-x-2">
                                  <RadioGroupItem value={option} />
                                  <Label>{option}</Label>
                                </div>
                              ))}
                            </RadioGroup>
                          )}
                        </div>
                      ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EventCustomQuestionsPage;