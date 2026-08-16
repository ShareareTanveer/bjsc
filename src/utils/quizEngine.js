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
 * Load the full question bank from the /data folder.
 * Returns the parsed object or null on error.
 */
export async function loadFullQuestionBank() {
  try {
    const response = await fetch('/data/full-question-bank.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data;
  } catch (e) {
    console.error("Failed to load full question bank", e);
    return null;
  }
}

/**
 * Get exam info from the question bank data
 * Extracts unique exam names/years from the data
 */
export function getExamInfoFromData(data) {
  if (!data || !Array.isArray(data)) return [];
  
  // Create a map of unique exams
  const examMap = new Map();
  data.forEach((examData) => {
    if (examData.exam && examData.year) {
      // Create a key from exam and year
      const key = `${examData.exam}-${examData.year}`;
      if (!examMap.has(key)) {
        // Parse label to get short form (e.g., "3rd BJS" from "3rd BJS (Bangladesh Judicial Service) Preliminary Examination")
        let label = examData.exam;
        // Extract the short form like "3rd BJS"
        const shortMatch = examData.exam.match(/^(\d+(?:st|nd|rd|th)) BJS/);
        if (shortMatch) {
          label = shortMatch[1] + " BJS";
        }
        examMap.set(key, {
          file: key, // Using key as identifier
          label: label,
          year: examData.year,
          fullExam: examData.exam,
          questions: examData.questions || []
        });
      }
    }
  });
  
  // Sort by year
  return Array.from(examMap.values()).sort((a, b) => a.year - b.year);
}

/**
 * Get questions for a specific exam
 */
export function getQuestionsForExam(data, examKey) {
  if (!data || !Array.isArray(data)) return [];
  
  // Find the exam data that matches
  const examData = data.find((exam) => {
    const key = `${exam.exam}-${exam.year}`;
    return key === examKey;
  });
  
  return examData ? examData.questions : [];
}

/**
 * Get questions for multiple exams with exam info attached
 */
export function getQuestionsForExams(data, examKeys) {
  if (!data || !Array.isArray(data) || !examKeys || examKeys.length === 0) return [];
  
  let allQuestions = [];
  examKeys.forEach((examKey) => {
    const examData = data.find((exam) => {
      const key = `${exam.exam}-${exam.year}`;
      return key === examKey;
    });
    
    if (examData && examData.questions) {
      // Add exam info to each question
      const label = getExamLabel(data, examKey);
      examData.questions.forEach((q) => {
        allQuestions.push({
          ...q,
          _examKey: examKey,
          _examLabel: label,
          _year: examData.year
        });
      });
    }
  });
  
  return allQuestions;
}

/**
 * Get exam label from exam key
 */
export function getExamLabel(data, examKey) {
  if (!data || !Array.isArray(data)) return examKey;
  
  const examData = data.find((exam) => {
    const key = `${exam.exam}-${exam.year}`;
    return key === examKey;
  });
  
  if (!examData) return examKey;
  
  // Extract short label
  const shortMatch = examData.exam.match(/^(\d+(?:st|nd|rd|th)) BJS/);
  return shortMatch ? shortMatch[1] + " BJS" : examData.exam;
}

/**
 * Get all available exam keys
 */
export function getExamKeys(data) {
  if (!data || !Array.isArray(data)) return [];
  return data.map((exam) => `${exam.exam}-${exam.year}`);
}

/**
 * Get total number of questions across all exams
 */
export function getTotalQuestions(data) {
  if (!data || !Array.isArray(data)) return 0;
  let total = 0;
  data.forEach((exam) => {
    if (exam.questions) {
      total += exam.questions.length;
    }
  });
  return total;
}