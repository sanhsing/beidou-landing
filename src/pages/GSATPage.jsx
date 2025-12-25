import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE = 'https://beidou-edu-server-1.onrender.com';

const SUBJECTS = [
  { id: 'chinese', name: '國文', icon: '📖' },
  { id: 'english', name: '英文', icon: '🔤' },
  { id: 'math', name: '數學', icon: '📐' },
  { id: 'physics', name: '物理', icon: '⚡' },
  { id: 'chemistry', name: '化學', icon: '🧪' },
  { id: 'biology', name: '生物', icon: '🧬' },
  { id: 'earth_science', name: '地科', icon: '🌍' },
  { id: 'history', name: '歷史', icon: '📜' },
  { id: 'geography', name: '地理', icon: '🗺️' },
  { id: 'civics', name: '公民', icon: '⚖️' },
];

export default function GSATPage() {
  const { subject } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentSubject = SUBJECTS.find((s) => s.id === subject);

  // 載入題目 - Hooks 必須在條件判斷之前
  useEffect(() => {
    if (subject && currentSubject) {
      loadQuestions();
    }
  }, [subject]);

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/gsat/questions?subject=${currentSubject?.name}&count=10`);
      if (!res.ok) throw new Error('API 錯誤');
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        setQuestions(data.data);
        setCurrentIndex(0);
        setScore({ correct: 0, total: 0 });
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setError('沒有找到題目');
      }
    } catch (err) {
      setError('無法連接後端 API：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);

    const isCorrect = index === questions[currentIndex]?.answer;
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  // 選擇科目頁面
  if (!subject) {
    return (
      <div className="p-4 pb-20">
        <h1 className="text-xl font-bold mb-4">📚 學測練習</h1>
        <div className="grid grid-cols-2 gap-3">
          {SUBJECTS.map((s) => (
            <button
              key={s.id}
              onClick={() => navigate(`/gsat/${s.id}`)}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-blue-300 transition-all active:scale-95"
            >
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="font-medium">{s.name}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="p-4 pb-20">
      <button
        onClick={() => navigate('/gsat')}
        className="text-blue-500 mb-4 flex items-center gap-1"
      >
        ← 返回選擇
      </button>

      <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
        {currentSubject?.icon} {currentSubject?.name}
      </h1>

      {loading && (
        <div className="text-center py-10 text-gray-500">載入中...</div>
      )}

      {error && (
        <div className="text-center py-10">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={loadQuestions}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            重試
          </button>
        </div>
      )}

      {!loading && !error && currentQuestion && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-2">
            第 {currentIndex + 1} / {questions.length} 題
          </div>

          {currentQuestion.context && (
            <div className="bg-gray-50 p-3 rounded-lg mb-3 text-sm text-gray-700">
              {currentQuestion.context}
            </div>
          )}

          <div className="font-medium mb-4">{currentQuestion.question}</div>

          <div className="space-y-2">
            {currentQuestion.options?.map((option, idx) => {
              let btnClass = 'w-full text-left p-3 rounded-lg border transition-all ';
              if (showResult) {
                if (idx === currentQuestion.answer) {
                  btnClass += 'bg-green-100 border-green-500 text-green-700';
                } else if (idx === selectedAnswer) {
                  btnClass += 'bg-red-100 border-red-500 text-red-700';
                } else {
                  btnClass += 'bg-gray-50 border-gray-200 text-gray-500';
                }
              } else {
                btnClass += 'bg-white border-gray-200 hover:border-blue-300';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={btnClass}
                  disabled={showResult}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className="mt-4">
              {currentQuestion.explanation && (
                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700 mb-3">
                  💡 {currentQuestion.explanation}
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  正確率：{score.correct}/{score.total} ({Math.round((score.correct / score.total) * 100)}%)
                </div>

                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={nextQuestion}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                  >
                    下一題 →
                  </button>
                ) : (
                  <button
                    onClick={loadQuestions}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg"
                  >
                    再練習 🔄
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && !error && questions.length === 0 && (
        <div className="text-center py-10 text-gray-500">載入題目中...</div>
      )}
    </div>
  );
}
