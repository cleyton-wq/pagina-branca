import { ColorSeason } from './quiz-data';

export interface QuizAnswers {
  [key: number]: string;
}

export function analyzeColorSeason(answers: QuizAnswers): ColorSeason {
  let springScore = 0;
  let summerScore = 0;
  let autumnScore = 0;
  let winterScore = 0;

  // Question 1: Skin tone
  const skinTone = answers[1];
  if (skinTone === 'fair-pink') springScore += 3;
  if (skinTone === 'light-neutral') summerScore += 3;
  if (skinTone === 'warm-tan') autumnScore += 3;
  if (skinTone === 'deep-brown') winterScore += 3;
  if (skinTone === 'medium-olive') autumnScore += 2;

  // Question 2: Hair color
  const hairColor = answers[2];
  if (hairColor === 'blonde') springScore += 3;
  if (hairColor === 'light-brown') summerScore += 2;
  if (hairColor === 'dark-brown') autumnScore += 2;
  if (hairColor === 'black') winterScore += 3;
  if (hairColor === 'red') autumnScore += 3;

  // Question 3: Eye color
  const eyeColor = answers[3];
  if (eyeColor === 'blue') springScore += 2;
  if (eyeColor === 'green') springScore += 2;
  if (eyeColor === 'light-brown') summerScore += 2;
  if (eyeColor === 'dark-brown') autumnScore += 2;
  if (eyeColor === 'black') winterScore += 3;

  // Question 4: Sun reaction
  const sunReaction = answers[4];
  if (sunReaction === 'burns-peels') springScore += 2;
  if (sunReaction === 'tans-slightly') summerScore += 2;
  if (sunReaction === 'tans-easily') autumnScore += 2;
  if (sunReaction === 'very-tanned') winterScore += 1;

  // Question 5: Vein color
  const veinColor = answers[5];
  if (veinColor === 'blue-purple') {
    springScore += 1;
    summerScore += 1;
    winterScore += 1;
  }
  if (veinColor === 'green') autumnScore += 2;

  // Question 6: Clothing colors
  const clothingColors = answers[6];
  if (clothingColors === 'soft-pastels') {
    springScore += 2;
    summerScore += 2;
  }
  if (clothingColors === 'warm-tones') autumnScore += 3;
  if (clothingColors === 'deep-rich') {
    autumnScore += 1;
    winterScore += 2;
  }
  if (clothingColors === 'bright-vivid') {
    springScore += 1;
    winterScore += 2;
  }
  if (clothingColors === 'cool-tones') {
    summerScore += 2;
    winterScore += 2;
  }

  // Question 7: Jewelry
  const jewelry = answers[7];
  if (jewelry === 'gold') {
    springScore += 2;
    autumnScore += 2;
  }
  if (jewelry === 'silver') {
    summerScore += 2;
    winterScore += 2;
  }

  // Question 10: Season preference
  const seasonPref = answers[10];
  if (seasonPref === 'spring') springScore += 2;
  if (seasonPref === 'summer') summerScore += 2;
  if (seasonPref === 'autumn') autumnScore += 2;
  if (seasonPref === 'winter') winterScore += 2;

  // Determine winner
  const scores = {
    spring: springScore,
    summer: summerScore,
    autumn: autumnScore,
    winter: winterScore
  };

  const maxScore = Math.max(...Object.values(scores));
  const winner = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as ColorSeason;

  // Apply specific rules from the brief
  if (skinTone === 'fair-pink' && hairColor === 'blonde' && (eyeColor === 'blue' || eyeColor === 'green')) {
    return 'spring';
  }
  if (skinTone === 'light-neutral' && hairColor === 'light-brown' && eyeColor === 'light-brown') {
    return 'summer';
  }
  if (skinTone === 'warm-tan' && hairColor === 'dark-brown' && clothingColors === 'warm-tones') {
    return 'autumn';
  }
  if (skinTone === 'deep-brown' && (eyeColor === 'black' || hairColor === 'black') && clothingColors === 'cool-tones') {
    return 'winter';
  }

  return winner || 'spring';
}