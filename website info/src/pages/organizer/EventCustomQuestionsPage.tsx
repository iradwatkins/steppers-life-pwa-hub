import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, PlusCircle, Edit3, MessageSquarePlus, ListChecks, Type } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface QuestionOption {
  id: string;
  value: string;
}

interface CustomQuestion {
  id: string;
  questionText: string;
  questionType: 'text' | 'multiple_choice' | 'checkbox'; // Add more types later like 'dropdown'
  options: QuestionOption[];
  isRequired: boolean;
}

const EventCustomQuestionsPage = () => {
  const eventId = 'mock-event-123'; // Placeholder
  const [questions, setQuestions] = useState<CustomQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<CustomQuestion>>({
    questionText: '',
    questionType: 'text',
    options: [],
    isRequired: false,
  });
  const [currentOptionText, setCurrentOptionText] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setCurrentQuestion(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setCurrentQuestion(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleQuestionTypeChange = (value: 'text' | 'multiple_choice' | 'checkbox') => {
    setCurrentQuestion(prev => ({ ...prev, questionType: value, options: [] })); // Reset options when type changes
  };

  const handleAddOption = () => {
    if (!currentOptionText.trim()) return;
    const newOption: QuestionOption = { id: Date.now().toString(), value: currentOptionText.trim() };
    setCurrentQuestion(prev => ({
      ...prev,
      options: [...(prev.options || []), newOption],
    }));
    setCurrentOptionText('');
  };

  const handleRemoveOption = (optionId: string) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: (prev.options || []).filter(opt => opt.id !== optionId),
    }));
  };

  const handleAddOrUpdateQuestion = () => {
    if (!currentQuestion.questionText?.trim()) return alert('Question text is required.');
    if (currentQuestion.questionType === 'multiple_choice' && (!currentQuestion.options || currentQuestion.options.length < 2)) {
      return alert('Multiple choice questions must have at least two options.');
    }

    if (editingQuestionId) {
      setQuestions(questions.map(q => q.id === editingQuestionId ? { ...currentQuestion, id: editingQuestionId } as CustomQuestion : q));
      setEditingQuestionId(null);
    } else {
      setQuestions([...questions, { ...currentQuestion, id: Date.now().toString() } as CustomQuestion]);
    }
    setCurrentQuestion({ questionText: '', questionType: 'text', options: [], isRequired: false });
    setCurrentOptionText('');
  };

  const handleEditQuestion = (question: CustomQuestion) => {
    setEditingQuestionId(question.id);
    setCurrentQuestion(question);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };
  
  const handleSaveAllQuestions = () => {
    console.log('Saving custom questions:', { eventId, questions });
    // API call to save would go here
    alert('Custom questions saved (mock)!');
  };

  return (
    <div className="min-h-screen bg-background-main py-8 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-surface-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-text-primary flex items-center">
              <MessageSquarePlus className="mr-2 h-6 w-6 text-brand-primary" />
              Custom Attendee Questions for Event: {eventId}
            </CardTitle>
            <CardDescription className="text-text-secondary">
              Add questions to ask attendees during registration (e.g., T-shirt size, dietary needs).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Form for Adding/Editing Question */}
            <div className="border border-border-default p-6 rounded-lg bg-background-main shadow space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">
                {editingQuestionId ? 'Edit Question' : 'Add New Question'}
              </h3>
              <div>
                <Label htmlFor="questionText" className="text-text-primary font-medium">Question Text</Label>
                <Textarea id="questionText" name="questionText" value={currentQuestion.questionText || ''} onChange={handleInputChange} placeholder="e.g., What is your T-shirt size?" className="mt-1" rows={2} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="questionType" className="text-text-primary font-medium">Question Type</Label>
                  <Select onValueChange={handleQuestionTypeChange} value={currentQuestion.questionType || 'text'}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select question type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text"><Type className="inline h-4 w-4 mr-2"/>Text Input</SelectItem>
                      <SelectItem value="multiple_choice"><ListChecks className="inline h-4 w-4 mr-2"/>Multiple Choice (Single Answer)</SelectItem>
                      {/* <SelectItem value="checkbox">Checkboxes (Multiple Answers)</SelectItem> */}
                    </SelectContent>
                  </Select>
                </div>
                 <div className="flex items-end pb-1">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="isRequired" name="isRequired" checked={currentQuestion.isRequired || false} onCheckedChange={(checked) => setCurrentQuestion(prev => ({ ...prev, isRequired: !!checked }))} />
                        <Label htmlFor="isRequired" className="text-text-primary font-medium">Required</Label>
                    </div>
                </div>
              </div>

              {currentQuestion.questionType === 'multiple_choice' && (
                <div className="space-y-3 pt-2">
                  <Label className="text-text-primary font-medium">Options</Label>
                  {(currentQuestion.options || []).map(opt => (
                    <div key={opt.id} className="flex items-center space-x-2">
                      <Input value={opt.value} readOnly className="flex-grow bg-muted" />
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveOption(opt.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2 pt-1">
                    <Input value={currentOptionText} onChange={(e) => setCurrentOptionText(e.target.value)} placeholder="New option text" className="flex-grow" />
                    <Button onClick={handleAddOption} variant="outline" size="sm" className="whitespace-nowrap">
                        <PlusCircle className="h-4 w-4 mr-1"/> Add Option
                    </Button>
                  </div>
                </div>
              )}
              <Button onClick={handleAddOrUpdateQuestion} className="mt-4 bg-brand-primary hover:bg-brand-primary-hover text-text-on-primary">
                <PlusCircle className="mr-2 h-4 w-4" /> {editingQuestionId ? 'Update Question' : 'Add Question'}
              </Button>
              {editingQuestionId && <Button onClick={() => { setEditingQuestionId(null); setCurrentQuestion({ questionText: '', questionType: 'text', options: [], isRequired: false }); setCurrentOptionText(''); }} variant="outline" className="mt-4 ml-2">Cancel Edit</Button>}
            </div>

            <Separator />

            {/* List of Existing Questions */}
            <div>
              <h3 className="text-xl font-semibold text-text-primary mb-4">Current Custom Questions</h3>
              {questions.length === 0 ? (
                <p className="text-text-secondary">No custom questions defined yet. Add one using the form above.</p>
              ) : (
                <div className="space-y-4">
                  {questions.map((q) => (
                    <Card key={q.id} className="bg-background-main border-border-default">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="font-semibold text-text-primary">{q.questionText} {q.isRequired && <span className="text-destructive text-xs"> (Required)</span>}</p>
                                <p className="text-sm text-text-secondary capitalize">Type: {q.questionType.replace('_',' ')}</p>
                            </div>
                            <div className="flex space-x-2 flex-shrink-0">
                                <Button variant="outline" size="icon" onClick={() => handleEditQuestion(q)} className="text-blue-600 border-blue-600 hover:bg-blue-50">
                                    <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="icon" onClick={() => handleDeleteQuestion(q.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        {q.questionType === 'multiple_choice' && q.options.length > 0 && (
                          <div className="pl-4 pt-1">
                            <p className="text-xs text-text-secondary font-medium mb-1">Options:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {q.options.map(opt => <li key={opt.id} className="text-sm text-text-secondary">{opt.value}</li>)}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
             <Button onClick={handleSaveAllQuestions} className="bg-green-600 hover:bg-green-700 text-white">
                Save All Questions
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default EventCustomQuestionsPage; 