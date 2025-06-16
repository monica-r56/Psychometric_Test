/*export interface Question {
  id: number;
  this_option: string;
  that_option: string;
  category: string;
}

import questions from './questions.json';
export const allQuestions: Question[] = questions;

export const getRandomQuestions = (allQuestions: Question[], count: number = 15): Question[] => {
  const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
*/
export interface Question {
  id: number;
  this_option: string;
  that_option: string;
  category: string;
}

import questions from './questions.json';
export const allQuestions: Question[] = questions;

// Return questions sorted by ID, in ascending order
export const getOrderedQuestions = (allQuestions: Question[], count: number = 15): Question[] => {
  const sorted = [...allQuestions].sort((a, b) => a.id - b.id);
  return sorted.slice(0, count);
};
