import React, { useState } from 'react';
import { adminAPI } from '../../utils/api';

const QuestionUpload = () => {
  const [questions, setQuestions] = useState([
    { questionId: 1, questionText: '', correctAnswer: '', points: 10 }
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { 
        questionId: questions.length + 1, 
        questionText: '', 
        correctAnswer: '', 
        points: 10 
      }
    ]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    // Reorder question IDs
    updated.forEach((q, i) => {
      q.questionId = i + 1;
    });
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await adminAPI.uploadQuestions({ questions });
      setMessage('Questions uploaded successfully!');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to upload questions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Upload Questions</h2>
      
      {message && (
        <div className={`p-4 rounded-md mb-4 ${
          message.includes('success') 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Question {question.questionId}
                </h3>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Text
                  </label>
                  <textarea
                    value={question.questionText}
                    onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter the question..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correct Answer
                  </label>
                  <input
                    type="text"
                    value={question.correctAnswer}
                    onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Correct answer..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points
                  </label>
                  <input
                    type="number"
                    value={question.points}
                    onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value))}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={addQuestion}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Add Another Question
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Upload Questions'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionUpload;