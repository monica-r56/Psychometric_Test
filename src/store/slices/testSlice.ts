
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Question {
  id: number;
  this_option: string;
  that_option: string;
  category: string;
}

interface Answer {
  questionId: number;
  value: number; // -5 to 5, where 0 is neutral
  category: string;
}

interface TestState {
  questions: Question[];
  currentQuestionIndex: number;
  answers: Answer[];
  isCompleted: boolean;
  isLoading: boolean;
  analysis: string | null;
}

const initialState: TestState = {
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  isCompleted: false,
  isLoading: false,
  analysis: null,
};

const testSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    setQuestions: (state, action: PayloadAction<Question[]>) => {
      state.questions = action.payload;
    },
    addAnswer: (state, action: PayloadAction<Answer>) => {
      const existingIndex = state.answers.findIndex(
        answer => answer.questionId === action.payload.questionId
      );
      if (existingIndex >= 0) {
        state.answers[existingIndex] = action.payload;
      } else {
        state.answers.push(action.payload);
      }
    },
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        state.currentQuestionIndex++;
      }
    },
    previousQuestion: (state) => {
      if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex--;
      }
    },
    completeTest: (state) => {
      state.isCompleted = true;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAnalysis: (state, action: PayloadAction<string>) => {
      state.analysis = action.payload;
    },
    resetTest: (state) => {
      return initialState;
    },
  },
});

export const {
  setQuestions,
  addAnswer,
  nextQuestion,
  previousQuestion,
  completeTest,
  setLoading,
  setAnalysis,
  resetTest,
} = testSlice.actions;

export default testSlice.reducer;
