const KEY_HISTORY = "bjsc-history"; 
const KEY_BOOKMARKS = "bjsc-bookmarks"; 

export function getHistory() { 
  try { 
    return JSON.parse(localStorage.getItem(KEY_HISTORY) || "[]"); 
  } catch { 
    return []; 
  } 
} 

export function saveResult(result) { 
  const history = getHistory(); 
  history.unshift({ ...result, savedAt: Date.now() }); 
  // Keep last 50 
  localStorage.setItem(KEY_HISTORY, JSON.stringify(history.slice(0, 50))); 
} 

export function clearHistory() { 
  localStorage.removeItem(KEY_HISTORY); 
} 

export function getBookmarks() { 
  try { 
    return JSON.parse(localStorage.getItem(KEY_BOOKMARKS) || "[]"); 
  } catch { 
    return []; 
  } 
} 

export function toggleBookmark(questionId, examFile) { 
  const bm = getBookmarks(); 
  const key = `${examFile}::${questionId}`; 
  const idx = bm.findIndex((b) => b.key === key); 
  if (idx >= 0) { 
    bm.splice(idx, 1); 
  } else { 
    bm.push({ key, questionId, examFile, savedAt: Date.now() }); 
  } 
  localStorage.setItem(KEY_BOOKMARKS, JSON.stringify(bm)); 
  return idx < 0; // true = added 
} 

export function isBookmarked(questionId, examFile) { 
  const bm = getBookmarks(); 
  const key = `${examFile}::${questionId}`; 
  return bm.some((b) => b.key === key); 
}