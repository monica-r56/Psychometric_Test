// pages/index.tsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { RootState } from '../store/store';
import axios from 'axios';
import {
  setQuestions,
  addAnswer,
  nextQuestion,
  previousQuestion,
  completeTest,
  setLoading,
  setAnalysis
} from '../store/slices/testSlice';
import { allQuestions, getOrderedQuestions } from '../data/questions';
import LanguageSelector from '../components/LanguageSelector';
import QuestionSlider from '../components/QuestionSlider';
import Registration, { CandidateData } from './Registration';

const GRAPHQL_ENDPOINT = 'http://localhost:8080/v1/graphql';
const HASURA_ADMIN_SECRET = 'Civ22jHTO5XTnqkzcE4yiF3Bds0BezO2GDEEaGwxHwSGuitkhSZQmKUfROdBqdkX';

const Index = () => {
  const dispatch = useDispatch();
  const [currentScreen, setCurrentScreen] = useState<'registration' | 'instructions' | 'test' | 'results'>('registration');
  const [currentSliderValue, setCurrentSliderValue] = useState(0);
  const [candidateData, setCandidateData] = useState<CandidateData | null>(null);

  const { questions, currentQuestionIndex, answers, isCompleted, isLoading, analysis } = useSelector(
    (state: RootState) => state.test
  );

  useEffect(() => {
    const randomQuestions = getOrderedQuestions(allQuestions, 15);
    dispatch(setQuestions(randomQuestions));
  }, [dispatch]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleRegistrationComplete = (data: CandidateData) => {
    setCandidateData(data);
    setCurrentScreen('instructions');
  };

  const handleStartTest = () => {
    setCurrentScreen('test');
  };

  const handleSliderChange = (value: number) => {
    setCurrentSliderValue(value);
  };

  const handleNextQuestion = () => {
    if (currentQuestion) {
      dispatch(addAnswer({
        questionId: currentQuestion.id,
        value: currentSliderValue,
        category: currentQuestion.category,
      }));

      if (currentQuestionIndex < questions.length - 1) {
        dispatch(nextQuestion());
        setCurrentSliderValue(0);
      } else {
        handleCompleteTest();
      }
    }
  };

  const handlePreviousQuestion = () => {
    dispatch(previousQuestion());
    const previousAnswer = answers.find(a => a.questionId === questions[currentQuestionIndex - 1]?.id);
    setCurrentSliderValue(previousAnswer?.value || 0);
  };

  const handleCompleteTest = async () => {
    dispatch(setLoading(true));
    setCurrentScreen('results');

    console.log("📦 Starting test completion process...");
    console.log("🔍 candidateData:", candidateData);
    console.log("🔍 answers:", answers);
    console.log("🔍 questions:", questions);

    if (!candidateData?.candidate_id) {
      console.error("❌ Candidate ID is missing or invalid.");
      dispatch(setLoading(false));
      dispatch(setAnalysis("Candidate ID is missing."));
      return;
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      console.error("❌ No answers found.");
      dispatch(setLoading(false));
      dispatch(setAnalysis("No answers found."));
      return;
    }

    const started_at = new Date(Date.now() - questions.length * 10000).toISOString();
    const ended_at = new Date().toISOString();

    const responsePayload = {
      candidate_id: Number(candidateData.id), // ✅ mapped from camelCase to snake_case
      responses: answers.map((ans) => ({
        question_id: ans.questionId,
        value: ans.value,
        category: ans.category
      })),

      started_at,
      ended_at
    };

    console.log("✅ Payload being sent:", responsePayload);

    try {
      const postRes = await fetch('http://localhost:5000/submit-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
      candidate_id: responsePayload.candidate_id,
      responses: responsePayload.responses,
      started_at: responsePayload.started_at,
      ended_at: responsePayload.ended_at
    })
      });

      if (!postRes.ok) throw new Error('Failed to submit test');

      const postData = await postRes.json();
      console.log("📥 Backend response:", postData);

      // Fetch analysis
      const gqlRes = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
        },
        body: JSON.stringify({
          query: `
            query GetAnalysis($candidate_id: Int!) {
              get_test_analysis(candidate_id: $candidate_id) {
                summary
              }
            }
          `,
          variables: { candidate_id: Number(candidateData.candidate_id) }, // ✅ still send snake_case in variables
        }),
      });

      const gqlData = await gqlRes.json();
      console.log("📊 Analysis response:", gqlData);

      const summary = gqlData?.data?.get_test_analysis?.summary ?? 'Test completed successfully.';
      dispatch(setAnalysis(summary));
    } catch (err) {
      console.error('🚨 Error submitting test or fetching analysis:', err);
      dispatch(setAnalysis('Test completed. Unable to fetch detailed analysis.'));
    }

    dispatch(setLoading(false));
    dispatch(completeTest());
  };
  //console.log("--");

  const renderScreen = () => {
    switch (currentScreen) {
      case 'registration':
        return <Registration onComplete={handleRegistrationComplete} />;
      case 'instructions':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center p-4"
          >
            <div className="absolute top-4 right-4">
              <LanguageSelector />
            </div>
            <div className="max-w-2xl mx-auto text-center text-white">
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Brain className="w-12 h-12" />
                  <h1 className="text-4xl font-bold">
                    <FormattedMessage id="app.title" />
                  </h1>
                </div>
                <p className="text-lg opacity-90 mb-2">Welcome, {candidateData?.name}!</p>
                <p className="text-lg opacity-90"><FormattedMessage id="app.subtitle" /></p>
              </motion.div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
                <h2 className="text-2xl font-semibold mb-6"><FormattedMessage id="instructions.title" /></h2>
                <p className="text-lg leading-relaxed mb-8 opacity-90">
                  <FormattedMessage id="instructions.description" />
                </p>
                <ul className="text-left space-y-4 mb-8">
                  {[1, 2, 3, 4, 5].map(i => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">{i}</span>
                      <FormattedMessage id={`instructions.point${i}`} />
                    </li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartTest}
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  <FormattedMessage id="instructions.startTest" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        );
      case 'test':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="flex justify-between mb-4">
                  <div className="text-sm text-gray-600">{candidateData?.name}</div>
                  <LanguageSelector />
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>
                      <FormattedMessage id="test.question" values={{ current: currentQuestionIndex + 1, total: questions.length }} />
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>
              {currentQuestion && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                  <span className="text-blue-600 text-sm font-medium">{currentQuestion.category}</span>
                  <QuestionSlider
                    value={currentSliderValue}
                    onChange={handleSliderChange}
                    thisOption={currentQuestion.this_option}
                    thatOption={currentQuestion.that_option}
                  />
                  <div className="flex justify-between mt-6">
                    <button
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                    >
                      <FormattedMessage id="test.previous" />
                    </button>
                    <button
                      onClick={handleNextQuestion}
                      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {currentQuestionIndex === questions.length - 1 ? (
                        <FormattedMessage id="test.submit" />
                      ) : (
                        <FormattedMessage id="test.next" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 'results':
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-300 via-blue-500 to-purple-600 p-6 text-white">
            <div className="max-w-2xl text-center">
              <h1 className="text-4xl font-bold mb-4">Test Results</h1>
              {isLoading ? (
                <p className="text-lg animate-pulse">Analyzing your responses...</p>
              ) : (
                <p className="text-lg whitespace-pre-line leading-relaxed">{analysis}</p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return <>{renderScreen()}</>;
};

export default Index;
