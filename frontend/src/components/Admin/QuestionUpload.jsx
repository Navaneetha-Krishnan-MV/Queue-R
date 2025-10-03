import React, { useState } from 'react';
import { adminAPI } from '../../utils/api';

const QuestionUpload = ({ onUpdate }) => {
  const [questions, setQuestions] = useState([
    { 
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
  const [message, setMessage] = useState('');

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { 
        questionText: '', 
        optionA: '', 
        optionB: '', 
        optionC: '', 
        optionD: '', 
        correctOption: 'A',
        basePoints: 20 
      }
    ]);
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
    setLoading(true);
    setMessage('');

    try {
      const response = await adminAPI.uploadQuestions(questions);
      setMessage(`✅ ${response.data.message}`);
      if (onUpdate) onUpdate();
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.message || 'Failed to upload questions'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignQuestions = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await adminAPI.assignQuestions();
      setMessage(`✅ ${response.data.message}`);
      if (onUpdate) onUpdate();
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.message || 'Failed to assign questions'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Upload Questions</h2>
      <p className="text-gray-600 mb-4">
        Upload 20 multiple-choice questions. These will be assigned to all venues.
      </p>

      {message && (
        <div className={`p-4 rounded-md mb-4 ${
          message.includes('✅') 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleUploadQuestions}>
        <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
          {questions.map((question, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Question {index + 1}</h3>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Text
                  </label>
                  <textarea
                    value={question.questionText}
                    onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
                    required
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter the question..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Option A
                    </label>
                    <input
                      type="text"
                      value={question.optionA}
                      onChange={(e) => updateQuestion(index, 'optionA', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Option B
                    </label>
                    <input
                      type="text"
                      value={question.optionB}
                      onChange={(e) => updateQuestion(index, 'optionB', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Option C
                    </label>
                    <input
                      type="text"
                      value={question.optionC}
                      onChange={(e) => updateQuestion(index, 'optionC', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Option D
                    </label>
                    <input
                      type="text"
                      value={question.optionD}
                      onChange={(e) => updateQuestion(index, 'optionD', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Correct Option
                    </label>
                    <select
                      value={question.correctOption}
                      onChange={(e) => updateQuestion(index, 'correctOption', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base Points
                    </label>
                    <input
                      type="number"
                      value={question.basePoints}
                      onChange={(e) => updateQuestion(index, 'basePoints', parseInt(e.target.value))}
                      required
                      min="1"
                      max="50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <button
            type="button"
            onClick={addQuestion}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Add Another Question
          </button>

          <div className="space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload Questions'}
            </button>
            <button
              type="button"
              onClick={handleAssignQuestions}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Assigning...' : 'Assign to Venues'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default QuestionUpload;