# BJSC Prep

A React app for practicing Bangladesh Judicial Service Commission (BJSC) Preliminary Exam past papers (3rd–11th BJS), with random/mixed practice sessions, negative marking, bookmarks, history tracking, dark mode, and a study guide.

## What was completed

The uploaded files were a set of already-written components without the scaffolding to actually run them:

- Added `src/App.jsx` wiring up `react-router-dom` (`HashRouter`) with routes for Home, Practice setup, Quiz, Result, History, Bookmarks, and Guide, plus the Navbar and theme toggle.
- Reorganized the flat file dump into the folder structure the components' own imports expected: `src/pages`, `src/components`, `src/utils`, `src/hooks`.
- Moved `index.html` into `public/` and the exam JSON files into `public/data/` (the app fetches them at runtime from `${PUBLIC_URL}/data/<file>.json`).
- **Fixed the 10th and 11th BJS data files**, which were in an incompatible schema (Bangla option keys ক/খ/গ/ঘ, a separate `answer`/`answer_text` pair, `no` instead of `id`, no `exam` field). Normalized them to match the other seven exams' schema (`id`, `options: {a,b,c,d}`, `correct_answer: "x) text"`, `exam` title) so they load and score correctly. Two cancelled questions in each (no valid answer per the source) were preserved with `correct_answer: null`.
- Added `package.json` `homepage: "."` so a production build works from any subpath.
- Installed dependencies and ran a production build to confirm everything compiles cleanly with no errors or warnings.

## Run it

```bash
npm install
npm start       # dev server at http://localhost:3000
npm run build   # production build in build/
```

Works with Node 20.x.
