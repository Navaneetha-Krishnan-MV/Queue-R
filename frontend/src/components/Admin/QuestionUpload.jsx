import React, { useState, useRef } from 'react';
import { adminAPI } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Plus, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

const QuestionUpload = ({ onUpdate }) => {
  const [questions, setQuestions] = useState([
    { 
      id: Date.now(),
      questionText: '', 
      optionA: '', 
      optionB: '', 
      optionC: '', 
      optionD: '', 
      correctOption: 'A',
      basePoints: 20 
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const questionsEndRef = useRef(null);

  const scrollToBottom = () => {
    questionsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { 
        id: Date.now() + Math.random(),
        questionText: '', 
        optionA: '', 
        optionB: '', 
        optionC: '', 
        optionD: '', 
        correctOption: 'A',
        basePoints: 20 
      }
    ]);
    
    // Scroll to the bottom of the questions list
    setTimeout(scrollToBottom, 100);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleUploadQuestions = async (e) => {
    e.preventDefault();
    
    // Validate questions
    const invalidQuestions = questions.some(q => 
      !q.questionText.trim() || 
      !q.optionA.trim() || 
      !q.optionB.trim() || 
      !q.correctOption
    );
    
    if (invalidQuestions) {
      toast.error('Please fill in all required fields for each question');
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const response = await adminAPI.uploadQuestions(questions);
      setMessage({ 
        type: 'success', 
        content: response.data.message 
      });
      
      toast.success('Questions uploaded successfully');
      if (onUpdate) onUpdate();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to upload questions';
      setMessage({ 
        type: 'error', 
        content: errorMsg 
      });
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignQuestions = async () => {
    setLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const response = await adminAPI.assignQuestions();
      setMessage({ 
        type: 'success', 
        content: response.data.message 
      });
      
      toast.success('Questions assigned to venues successfully');
      if (onUpdate) onUpdate();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to assign questions';
      setMessage({ 
        type: 'error', 
        content: errorMsg 
      });
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Question Management</h2>
        <p className="text-muted-foreground">
          Upload and manage questions for the event. Questions will be assigned to venues automatically.
        </p>
      </div>

      {message.content && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mb-4">
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.content}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Questions</CardTitle>
            <CardDescription>
              Add multiple-choice questions. Each question requires a question text, 4 options, and the correct answer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUploadQuestions}>
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 pb-4">
                {questions.map((question, index) => (
                  <Card key={question.id} className="relative p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Question {index + 1}</h3>
                      {questions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuestion(index)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove question</span>
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`question-${index}-text`}>Question Text</Label>
                        <Textarea
                          id={`question-${index}-text`}
                          value={question.questionText}
                          onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
                          placeholder="Enter the question..."
                          required
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['A', 'B', 'C', 'D'].map((option) => (
                          <div key={option} className="space-y-2">
                            <Label htmlFor={`question-${index}-option${option}`}>
                              Option {option}
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                id={`question-${index}-option${option}`}
                                type="text"
                                value={question[`option${option}`]}
                                onChange={(e) => updateQuestion(index, `option${option}`, e.target.value)}
                                placeholder={`Option ${option}`}
                                required={['A', 'B'].includes(option)}
                              />
                              <Button
                                type="button"
                                variant={question.correctOption === option ? 'default' : 'outline'}
                                size="sm"
                                className="w-10 flex-shrink-0"
                                onClick={() => updateQuestion(index, 'correctOption', option)}
                              >
                                {option}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`question-${index}-points`}>Base Points</Label>
                          <Input
                            id={`question-${index}-points`}
                            type="number"
                            min="1"
                            value={question.basePoints}
                            onChange={(e) => updateQuestion(index, 'basePoints', parseInt(e.target.value) || 20)}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Correct Answer</Label>
                          <div className="p-2 border rounded-md bg-muted/50">
                            <p className="font-medium">
                              {question.correctOption ? `Option ${question.correctOption}` : 'Not set'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {question[`option${question.correctOption}`] || 'No answer selected'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                <div ref={questionsEndRef} />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addQuestion}
                  className="w-full sm:w-auto"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || questions.length === 0}
                  className="w-full sm:w-auto"
                >
                  {loading ? 'Uploading...' : 'Upload Questions'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAssignQuestions}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  {loading ? 'Assigning...' : 'Assign Questions to Venues'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuestionUpload;