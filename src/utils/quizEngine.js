/**
 * Parses the correct_answer string from JSON to extract the option key (a/b/c/d)
 * Handles formats like "a) text", "a", "(a) text", etc.
 */
export function parseCorrectKey(correctAnswer) {
  if (!correctAnswer) return null;
  const str = String(correctAnswer).trim().toLowerCase();
  // Match leading letter followed by ) or . or space or end
  const m = str.match(/^([a-d])[).:\s]/);
  if (m) return m[1];
  // fallback: just the first character if it's a-d
  if (/^[a-d]$/.test(str[0])) return str[0];
  return null;
}

/**
 * Fisher-Yates shuffle
 */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build a quiz session from a list of questions and options.
 * @param {Object[]} questions - raw question objects from JSON
 * @param {number} count - number of questions to include
 * @param {boolean} randomOrder - whether to shuffle questions
 * @param {boolean} negativeMarking - apply -0.25 per wrong
 */
export function buildSession(questions, count, randomOrder = true, negativeMarking = true) {
  const pool = randomOrder ? shuffle(questions) : [...questions];
  const selected = pool.slice(0, Math.min(count, pool.length));
  return {
    questions: selected,
    negativeMarking,
    startedAt: Date.now(),
  };
}

/**
 * Calculate score from answers map { questionId -> selectedKey }
 */
export function calcScore(questions, answers, negativeMarking) {
  let correct = 0;
  let wrong = 0;
  let skipped = 0;

  questions.forEach((q) => {
    const correctKey = parseCorrectKey(q.correct_answer);
    const selected = answers[q.id];
    if (!selected) {
      skipped++;
    } else if (selected === correctKey) {
      correct++;
    } else {
      wrong++;
    }
  });

  const raw = correct - (negativeMarking ? wrong * 0.25 : 0);
  const score = Math.max(0, raw);
  const total = questions.length;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  return { correct, wrong, skipped, score: parseFloat(score.toFixed(2)), total, pct };
}

/**
 * Format elapsed seconds as mm:ss
 */
export function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/**
 * Load JSON from the /data folder.
 * Returns the parsed object or null on error.
 */
export async function loadExamData(filename) {
  try {
    const res = await fetch(`${process.env.PUBLIC_URL}/data/${filename}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error("Failed to load", filename, e);
    return null;
  }
}

/**
 * Known exam files — update this list to match your data/ folder.
 * Each entry: { file, label, year }
 */
export const EXAM_FILES = [
  { file: "3rd-bjsc-preli.json",  label: "3rd BJS",  year: 2008 },
  { file: "4th-bjsc-preli.json",  label: "4th BJS",  year: 2009 },
  { file: "5th-bjsc-preli.json",  label: "5th BJS",  year: 2010 },
  { file: "6th-bjsc-preli.json",  label: "6th BJS",  year: 2011 },
  { file: "7th-bjsc-preli.json",  label: "7th BJS",  year: 2012 },
  { file: "8th-bjsc-preli.json",  label: "8th BJS",  year: 2013 },
  { file: "9th-bjsc-preli.json",  label: "9th BJS",  year: 2014 },
  { file: "10th-bjsc-preli.json", label: "10th BJS", year: 2015 },
  { file: "11th-bjsc-preli.json", label: "11th BJS", year: 2016 },
];
