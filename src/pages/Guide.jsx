import React, { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, Scale, GraduationCap, Globe, Calculator, FileText } from "lucide-react";
import { Badge } from "../components/UI";

function Section({ title, icon: Icon, badge, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden mb-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
      >
        {Icon && <Icon size={17} className="text-brand-500 shrink-0" />}
        <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">{title}</span>
        {badge && <Badge variant="blue">{badge}</Badge>}
        {open ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
          {children}
        </div>
      )}
    </div>
  );
}

function TopicList({ items }) {
  return (
    <ul className="space-y-1 mt-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0 mt-2" />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SubHead({ children }) {
  return <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-4 mb-1.5">{children}</p>;
}

function Table({ headers, rows }) {
  return (
    <div className="overflow-x-auto -mx-1 mt-3">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide py-2 px-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 first:rounded-tl-lg last:rounded-tr-lg">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="py-2 px-3 text-gray-700 dark:text-gray-300 align-top">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Guide() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "marks", label: "Marks" },
    { id: "law", label: "Law" },
    { id: "general", label: "General" },
    { id: "roadmap", label: "Roadmap" },
    { id: "strategy", label: "Strategy" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
            <BookOpen size={16} className="text-white" />
          </div>
          <Badge variant="blue">5-month plan</Badge>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">BJS Preliminary — Study Guide</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Complete preparation guide based on the official BJSC syllabus (bjsc.gov.bd).</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-5 no-scrollbar">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors font-medium ${
              activeTab === id
                ? "bg-brand-600 text-white"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div>
          <Section title="Three-stage selection process" icon={FileText} defaultOpen>
            <Table
              headers={["Stage", "Marks", "Pass bar"]}
              rows={[
                ["Preliminary MCQ", "100", "Min 50/100 (competitive cutoff is higher — target 70+)"],
                ["Written exam", "1000", "Avg >=50% AND >=30% in every single paper"],
                ["Viva Voce", "100", "Min 50% to pass"],
              ]}
            />
            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200 font-medium mb-1">The 30% floor — the most dangerous trap</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">You can score 70% in every other Written paper, but a single score below 30% in any one paper voids your entire Written result. Civil Law and Property Law are the most common failure points.</p>
            </div>
          </Section>

          <Section title="Competition numbers (recent cycles)" icon={GraduationCap}>
            <Table
              headers={["BJS cycle", "Vacancies", "Prelim sitters", "Passed Prelim", "Finally recommended"]}
              rows={[
                ["17th BJS", "~100", "~8,000-9,000", "1,496", "~100"],
                ["18th BJS", "~100", "~6,100-8,500", "1,050", "~100 (pending)"],
              ]}
            />
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900">
              <p className="text-sm text-blue-800 dark:text-blue-200">Roughly 80-90 candidates compete per vacancy. Only 12-18% of those who sit Prelim clear it. Target 70+/100 in practice mocks — not 50.</p>
            </div>
          </Section>

          <Section title="Negative marking — the math" icon={Calculator}>
            <Table
              headers={["Action", "Score", "Note"]}
              rows={[
                ["Correct answer", "+1.00", "Full mark"],
                ["Wrong answer", "-0.25", "Applied in real exam"],
                ["No answer / skip", "0", "Always safe"],
              ]}
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">
              On a 4-option MCQ, blind random guessing is effectively zero expected value. Only attempt if you can eliminate at least 1 wrong option, which raises your odds above the breakeven point.
            </p>
          </Section>
        </div>
      )}

      {/* MARKS */}
      {activeTab === "marks" && (
        <div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Written exam total: <span className="font-semibold text-gray-900 dark:text-gray-100">1000 marks</span> across 9 papers in 3 parts. Prelim: <span className="font-semibold">100 marks</span>, 100 MCQs.</p>
          </div>

          <Section title="Part 1 — Compulsory general (400 marks)" icon={BookOpen} defaultOpen>
            <Table
              headers={["Paper", "Marks", "Key components"]}
              rows={[
                ["General Bangla", "100", "Grammar 30, essay 20, literature 10, letter writing 10, translation 5, precis 5, report 10, expansion 10"],
                ["General English", "100", "Grammar 30, essay 20, letter 10, translation 10, reporting 10, amplification 10, authors 5, precis 5"],
                ["Bangladesh & International Affairs", "100", "Bangladesh affairs 50, International affairs 50"],
                ["General Math & Everyday Science", "100", "Mathematics (SSC level) 50, Everyday science 50"],
              ]}
            />
          </Section>

          <Section title="Part 2 — Compulsory law (500 marks)" icon={Scale} defaultOpen>
            <Table
              headers={["Paper", "Marks", "Acts covered"]}
              rows={[
                ["Civil Law", "100", "CPC 1908, Specific Relief Act 1877, Civil Courts Act 1887, Limitation Act 1908, ADR"],
                ["Criminal Law", "100", "CrPC 1898 (40), Penal Code 1860 (40), Evidence Act 1872 (20)"],
                ["Family Law", "100", "Muslim Law (60), Hindu Law (20), Dissolution Act 1939 / MFLO 1961 / Family Courts Act 2023 (20)"],
                ["Constitutional Law", "100", "Constitution of Bangladesh (80), General Clauses Act 1897, Interpretation of Statutes"],
                ["Property Law", "100", "Contract Act 1872, Transfer of Property Act 1882, Registration Act 1908, SAT Act 1950, Non-Agricultural Tenancy Act 1949"],
              ]}
            />
          </Section>

          <Section title="Part 3 — Optional (100 marks, choose one)" icon={FileText}>
            <SubHead>Optional-1</SubHead>
            <TopicList items={[
              "Children Act 2013",
              "Nari o Shishu Nirjatan Daman Ain 2000 (Women & Children Repression)",
              "Legal Aid Services Act 2000 + Rules",
              "Special Powers Act 1974",
              "Narcotics Control Act 2018",
            ]} />
            <SubHead>Optional-2</SubHead>
            <TopicList items={[
              "Anti-Corruption Commission Act 2004",
              "Speedy Trial Act 2002",
              "Negotiable Instruments Act 1881",
              "Human Trafficking & Migrant Smuggling Prevention Act 2026 (NEW)",
              "Cyber Security Act 2026 (NEW)",
            ]} />
            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200">Both 2026 Acts in Optional-2 are brand new — no secondary material exists yet. Study directly from the bare Act text if you choose Optional-2.</p>
            </div>
          </Section>
        </div>
      )}

      {/* LAW */}
      {activeTab === "law" && (
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">The BJSC syllabus explicitly requires knowing Supreme Court case-law alongside bare-act sections for every law subject.</p>

          <Section title="Constitution of Bangladesh (80 marks)" icon={Scale} badge="Highest priority" defaultOpen>
            <SubHead>Fundamentals</SubHead>
            <TopicList items={[
              "Nature of a constitution — written vs unwritten, rule of law, separation of powers",
              "Supremacy of the constitution, parliamentary government",
              "Ex post facto law, double jeopardy, speedy/fair trial, self-incrimination",
              "Doctrine of classification, features of the 1972 original Constitution",
            ]} />
            <SubHead>The Constitution itself</SubHead>
            <TopicList items={[
              "Framing history, Proclamation of Independence Order",
              "Preamble, Citizenship, Fundamental Principles of State Policy",
              "Fundamental Rights and their enforcement — all articles",
            ]} />
            <SubHead>The Executive</SubHead>
            <TopicList items={[
              "President — election modes, term, powers/functions, legislative powers, prerogative of mercy, immunity, impeachment/removal",
              "Prime Minister and Cabinet — tenure, ministerial responsibility (collective and individual), rule-making, emergency powers",
              "Attorney-General, local government, war powers",
            ]} />
            <SubHead>The Legislature</SubHead>
            <TopicList items={[
              "Composition, duration, membership qualifications/disqualifications, vacation of seat",
              "Legislation and delegated legislation, ordinance-making power",
              "All constitutional amendments — history and substance",
              "Public finance control, Speaker/Deputy Speaker powers",
              "Ombudsman, contempt of Parliament, standing committees",
            ]} />
            <SubHead>The Judiciary (highest-density block — invest most time here)</SubHead>
            <TopicList items={[
              "Supreme Court — establishment, composition, structure, jurisdiction, powers",
              "Appointment and removal of judges",
              "Judicial review — scope and limits",
              "Superintendence and control over subordinate courts",
              "Binding effect of Appellate Division judgments",
              "Administrative tribunals, Supreme Judicial Council",
              "Separation of powers and judicial independence",
              "Leading Supreme Court cases on all of the above",
            ]} />
          </Section>

          <Section title="Code of Civil Procedure 1908" icon={Scale}>
            <TopicList items={[
              "Decree and its classification, order, mesne profits, suits of civil nature",
              "Jurisdiction: res judicata, res subjudice, place of suing",
              "Parties to suit — necessary/proper parties, pro forma defendant, transposition",
              "Pleadings — plaint, written statement, set-off",
              "Appearance, examination of parties, discovery/inspection/interrogatories",
              "Attachment before judgment, temporary injunctions, appointment of receivers",
              "Execution of decrees and orders",
              "Appeal, reference, review, revision",
              "Inherent powers of court",
              "Leading Supreme Court case-law on all of the above",
            ]} />
          </Section>

          <Section title="Code of Criminal Procedure 1898" icon={Scale}>
            <TopicList items={[
              "FIR, complaint, charge-sheet, cognizance",
              "Cognizable vs non-cognizable, bailable vs non-bailable",
              "Arrest with and without warrant, summons",
              "Bail and anticipatory bail — a very high-frequency topic",
              "Trial before Magistrate and Court of Sessions",
              "Summary trials, framing of charges, mode of recording evidence",
              "Appeal, reference, revision",
              "Inherent power of the High Court Division",
              "Leading Supreme Court case-law",
            ]} />
          </Section>

          <Section title="Penal Code 1860" icon={Scale}>
            <TopicList items={[
              "Elements of crime, mens rea, knowledge, actus reus",
              "General exceptions — all categories",
              "Common intention (S.34) vs common object (S.149)",
              "Abetment and criminal conspiracy",
              "Offences against the human body: culpable homicide, murder, hurt/grievous hurt, assault, kidnapping, abduction",
              "Offences against property: theft (5 ingredients), extortion, robbery, dacoity, criminal misappropriation, criminal breach of trust, cheating, forgery",
              "Defamation, criminal intimidation, attempts",
            ]} />
          </Section>

          <Section title="Evidence Act 1872" icon={Scale}>
            <TopicList items={[
              "Relevancy of facts, facts in issue",
              "Admissions and confessions",
              "Statements by persons who cannot be called as witnesses",
              "Oral vs documentary evidence",
              "Burden of proof, estoppel",
              "Examination of witnesses — chief, cross, re-examination",
              "Impeaching credit of a witness",
              "Privileged communications, accomplice evidence",
            ]} />
          </Section>

          <Section title="Muslim Law (60 marks)" icon={Scale}>
            <TopicList items={[
              "Sources: Quran, Hadith, Ijma, Qiyas — and the four Sunni schools",
              "Marriage — essentials, types, registration",
              "Dower (mahr) — types and enforcement",
              "Dissolution of marriage — talaq, khul'a, mubara'at, judicial dissolution",
              "Maintenance — wife, children, parents",
              "Inheritance — Sunni shares, principles of representation",
              "Gift (hiba) — essentials, conditions for completion",
              "Wakf and the Wakfs Ordinance 1962",
              "Will, marz-ul-maut, hiba-bil-ewaz",
              "Right of shufaa (pre-emption), guardianship, legitimacy",
            ]} />
          </Section>

          <Section title="Hindu Law (20 marks)" icon={Scale}>
            <TopicList items={[
              "Dayabhaga vs Mitakshara schools — key distinctions (frequently tested)",
              "Marriage, maintenance, adoption, minority and guardianship",
              "Stridhan and women's property",
              "Succession — exclusion from inheritance",
              "Hindu Marriage Registration Act 2012",
            ]} />
          </Section>

          <Section title="Contract Act 1872" icon={Scale}>
            <TopicList items={[
              "Formation: offer, acceptance, consideration, communication, revocation",
              "Free consent: coercion, undue influence, fraud, misrepresentation, mistake",
              "Capacity of parties, voidable contracts, void agreements",
              "Breach of contract — remedies",
              "Indemnity, guarantee, bailment, pledge, agency",
            ]} />
          </Section>

          <Section title="Transfer of Property Act 1882" icon={Scale}>
            <TopicList items={[
              "What may be transferred, who may transfer, notice",
              "Rule against perpetuity, conditional transfer",
              "Doctrine of lis pendens, doctrine of part performance",
              "Transfer by ostensible owner, priority rules",
              "Sale, mortgage (all types + redemption doctrine)",
              "Lease, exchange, gifts, actionable claims",
            ]} />
          </Section>

          <Section title="General Clauses Act 1897 + Interpretation" icon={Scale}>
            <TopicList items={[
              "General Clauses Act: definitions clause, rules of construction, effect of repeal, computation of time",
              "Literal Rule, Golden Rule, Mischief Rule",
              "Rule of harmonious construction",
              "Internal and external aids to interpretation",
              "Interpretation of penal statutes and constitutional law",
            ]} />
          </Section>

          <Section title="ADR — Alternative Dispute Resolution" icon={Scale}>
            <TopicList items={[
              "Concept and modes: negotiation, mediation, arbitration, conciliation",
              "ADR in CPC 1908, Muslim Family Laws Ordinance 1961, Family Courts Act 2023",
              "Arbitration (Salish) Act 2001, Artha Rin Adalat Act 2003",
              "Village Court Act 2006, Bangladesh Labour Act 2006",
            ]} />
          </Section>
        </div>
      )}

      {/* GENERAL */}
      {activeTab === "general" && (
        <div>
          <Section title="General Bangla grammar — all items" icon={BookOpen} defaultOpen>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Every item below is independently testable as an MCQ.</p>
            <TopicList items={[
              "Dhwoni and dwiruktо shabdo (sounds and reduplicated words)",
              "Upasarga (prefixes) and Pratyay (suffixes)",
              "Dhatu (verb roots)",
              "Shabdo and Pod-prokoron (word classes and parts of speech)",
              "Kriya-pod — tense, person, and correct usage in combination",
              "Somapika, Osomapika, Joogik kriya (finite, non-finite, compound verbs)",
              "Kriya-bibhokti: sadhu vs cholito bhasha — conversion both directions",
              "Karok and Bibhokti (case relations and case endings)",
              "Anusarga (postpositions)",
              "Bakko shuddhikoron — sentence correction (highest-frequency MCQ type)",
              "Sondhi — swaro sondhi, byanjon sondhi, nipatane siddha sondhi",
              "Somas — all 6 types: dvandva, tatpurush, karmadharaya, bahubrihi, dvigu, avyayibhav",
              "Bochon (singular and plural formation rules)",
              "Somarthok and biporit shabdo (synonyms and antonyms)",
              "Bagdhara and probad-probochon (idioms and proverbs in context)",
              "Joti chinho (punctuation rules)",
              "Ek kothay prokash (one-word substitution for a phrase)",
              "Ukti poriborton (direct to indirect speech and reverse)",
              "Bakko rupantor — simple/compound/complex and all reverse conversions",
            ]} />
          </Section>

          <Section title="Bangla literature — authors to know" icon={BookOpen}>
            <TopicList items={[
              "Ishwar Chandra Vidyasagar — prose reform, Bengali prose modernization",
              "Bankim Chandra Chattopadhyay — first major Bengali novelist",
              "Michael Madhusudan Dutt — blank verse pioneer, Meghnadbadh Kavya",
              "Mir Mosharraf Hossain — Bishad Sindhu",
              "Rabindranath Tagore — Nobel 1913, Gitanjali, Gora",
              "Kazi Nazrul Islam — National Poet of Bangladesh",
              "Jibanananda Das — Banalata Sen, modernist poetry",
              "Begum Rokeya — Sultana's Dream, women's rights",
              "Jasimuddin — Nakshi Kanthar Math, rural/folk poetry",
              "Shamsur Rahman, Humayun Ahmed, Syed Shamsul Haq, Syed Waliullah — major modern-era figures",
              "Linguistics: Muhammad Shahidullah, Haraprasad Shastri, Suniti Kumar Chattopadhyay",
            ]} />
          </Section>

          <Section title="General English grammar" icon={BookOpen}>
            <TopicList items={[
              "Sentence correction — identification and fixing grammatical errors (highest frequency)",
              "Fill in the blanks — single word or phrase in context",
              "Idioms and phrases — meaning and correct usage",
              "Sentence transformation — all directions (affirmative/negative, simple/complex/compound)",
              "Phrasal verbs and preposition collocations",
              "Voice — active to passive, including modals, questions, imperatives",
              "Narration — direct to indirect: tense-shift, pronoun changes, reporting verbs",
              "Antonyms and synonyms",
              "Articles — a/an/the and zero article rules",
              "Tense — all 12 forms, especially perfect and perfect continuous",
              "Degrees — irregular forms, comparative structures",
            ]} />
          </Section>

          <Section title="General Math (SSC level)" icon={Calculator}>
            <TopicList items={[
              "Arithmetic: simplification, averages, GCD/LCM, unitary method, percentages, simple interest, profit/loss, work and time, ratio and proportion",
              "Algebra: formulas for squares/cubes, polynomials, remainder theorem, factorization, simultaneous linear equations, graphs",
              "Geometry: theorems on triangles, circles, parallel lines, parallelograms; Pythagoras theorem; area of triangle",
            ]} />
          </Section>

          <Section title="Everyday Science" icon={Globe}>
            <TopicList items={[
              "ICT: computer hardware/software, OS, word processing, spreadsheets, databases, networks, internet, email, multimedia — ICT is the highest marks-per-hour section in General Science",
              "Light: spectrum, wavelengths, X-ray, ultraviolet, laser",
              "Sound: decibel, frequency, household devices",
              "Electricity: current, generators, voltage, hazards",
              "Disease and healthcare: deficiency diseases, stroke, heart attack, hypertension, vaccination, ultrasonography, ECG, MRI, CT scan, endoscopy",
              "Biotechnology: DNA, RNA, genes, genetic disorders, cloning, sex chromosomes",
              "Basic physics: motion, force, work, power, energy, heat, temperature",
              "Chemistry in daily life: soap/detergent, baking powder, vinegar, bleaching powder, urea, food preservatives",
            ]} />
          </Section>

          <Section title="Bangladesh Affairs (50 marks)" icon={Globe}>
            <TopicList items={[
              "Historical background and 1971 Liberation War — Language Movement 1952, Six-Point Programme, Mass Uprising 1969, key figures and events",
              "Topographical and demographic features",
              "Development strategies — Vision 2041, Delta Plan 2100, Five-Year Plans",
              "Government structure — Legislature, Executive, Judiciary",
              "Foreign policy and international relations",
              "Environmental issues, water and energy management",
              "NGOs, women's empowerment, civil society",
              "Role of IMF, ADB, IDB, World Bank in Bangladesh",
              "Current affairs — last 12 months before exam (explicitly named in syllabus)",
            ]} />
          </Section>

          <Section title="International Affairs (50 marks)" icon={Globe}>
            <TopicList items={[
              "Law of the Sea — Bangladesh maritime boundary, territorial waters, EEZ (high-yield: ICJ/ITLOS cases with India and Myanmar)",
              "United Nations — GA, Security Council, ICJ, ECOSOC",
              "Key environmental treaties: Stockholm 1972, Rio 1992, Ramsar 1971, CITES 1973, UNFCCC 1992, Kyoto Protocol",
              "Regionalism: ASEAN, BIMSTEC, SAARC, SAFTA, OIC, EU, GCC, AU, OPEC",
              "Diplomatic and consular law — envoys, functions, immunities",
              "Foreign policies of Bangladesh, India, China, USA, Russia, UK",
              "Financial institutions: IMF, World Bank, ADB, WTO, G-20, G-77",
              "Non-Aligned Movement, Commonwealth, NATO",
            ]} />
          </Section>
        </div>
      )}

      {/* ROADMAP */}
      {activeTab === "roadmap" && (
        <div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900 mb-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">6 study days/week, ~6-7 hrs/day. Daily current affairs reading (30 min) every single day, all 5 months. Keep law-study blocks fixed like client appointments.</p>
          </div>

          {[
            {
              month: "Month 1", subtitle: "Language foundation + Constitution",
              weeks: [
                { week: "Week 1", tasks: "Bangla grammar: all 19 grammar items listed in the General tab. Focus on sondhi, somas, karok/bibhokti, bakko shuddhikoron, sadhu-cholito conversion. Start current affairs reading. Choose Optional-1 or Optional-2." },
                { week: "Week 2", tasks: "Bangla literature: full author list with major works and eras. English grammar: all 11 items — tense, voice, narration, articles, transformation, prepositions/verbs, degrees, correction." },
                { week: "Week 3", tasks: "Constitution: Preamble, Fundamental Principles of State Policy, Citizenship, Fundamental Rights and their enforcement. Begin making 1-page summary sheets per topic (your sole Month 5 revision material)." },
                { week: "Week 4", tasks: "Constitution: The Executive, The Legislature, The Judiciary chapter (highest-density block — invest extra time here), Election Commission, Services of the Republic. Take Diagnostic Mock 1." },
              ]
            },
            {
              month: "Month 2", subtitle: "Criminal law core",
              weeks: [
                { week: "Week 5", tasks: "Penal Code 1860: general principles, elements of crime, mens rea, general exceptions, abetment, criminal conspiracy, offences against the human body." },
                { week: "Week 6", tasks: "Penal Code: offences against property. CrPC 1898: FIR, cognizance, cognizable/non-cognizable and bailable/non-bailable classification, investigation process." },
                { week: "Week 7", tasks: "CrPC: arrest, bail and anticipatory bail, trial before Magistrates and Court of Sessions, framing of charges, appeals, reference, revision, inherent power of the High Court Division." },
                { week: "Week 8", tasks: "Evidence Act 1872: relevancy of facts, admissions, oral vs documentary evidence, burden of proof, estoppel, examination/impeachment of witnesses. Take Mock 2." },
              ]
            },
            {
              month: "Month 3", subtitle: "Civil, family, property law + GK/Science/Math",
              weeks: [
                { week: "Week 9", tasks: "CPC 1908: jurisdiction, res judicata, parties to suits, pleadings, attachment before judgment, temporary injunctions, execution of decrees, appeal/review/revision, inherent powers. Also: Specific Relief Act 1877, Civil Courts Act 1887, Limitation Act 1908." },
                { week: "Week 10", tasks: "Muslim Law: sources, marriage, dower, dissolution, maintenance, inheritance (Sunni shares), gift, wakf, will, guardianship. Family Courts Act 2023. Hindu Law: marriage, Dayabhaga vs Mitakshara distinctions, maintenance, adoption." },
                { week: "Week 11", tasks: "Contract Act: offer/acceptance, free consent doctrines, breach/remedies, agency. Transfer of Property Act: sale, mortgage types, lease, gift, lis pendens doctrine, part performance doctrine." },
                { week: "Week 12", tasks: "Bangladesh Affairs (all sub-topics) + International Affairs + General Math + Everyday Science (ICT first). Registration Act 1908, State Acquisition and Tenancy Act 1950, Non-Agricultural Tenancy Act 1949. Take Mock 3 — identify 3 weakest subjects." },
              ]
            },
            {
              month: "Month 4", subtitle: "Revision round 2 + MCQ volume",
              weeks: [
                { week: "Days 1-20", tasks: "Re-read summary sheets only (not full textbooks) in priority order: Constitution → Penal Code → CPC → CrPC → Muslim Law → Contract/TP Act → Bangla/English grammar → GK/Science/Math → Optional. Solve chapter-wise MCQ books for each." },
                { week: "Days 21-26", tasks: "Dedicated repair block for your 3 weakest subjects identified in Mock 3. Double time allocation for those subjects specifically." },
                { week: "End of month", tasks: "2 full-length 100-question timed mocks. Review every wrong or guessed answer the same day. Build current-affairs summary sheet for the last 6 months." },
              ]
            },
            {
              month: "Month 5", subtitle: "Simulation mode",
              weeks: [
                { week: "Week 13", tasks: "Full rapid syllabus revision using summary sheets only. Take Mock 4. Review error log." },
                { week: "Week 14", tasks: "Mocks 5 and 6. One more precision pass on Constitution, Penal Code, and CPC — your three highest-density topics." },
                { week: "Week 15", tasks: "Mocks 7 and 8. Optional-subject final revision. Last current-affairs update pass." },
                { week: "Week 16 (exam week)", tasks: "Summary sheets, section-number flashcards, error log only. NO new topics. One light mock mid-week, then taper fully. Rest completely in the final 48 hours." },
              ]
            },
          ].map(({ month, subtitle, weeks }) => (
            <Section key={month} title={`${month} — ${subtitle}`} icon={BookOpen}>
              <div className="space-y-3 mt-1">
                {weeks.map(({ week, tasks }) => (
                  <div key={week} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mb-1">{week}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{tasks}</p>
                  </div>
                ))}
              </div>
            </Section>
          ))}
        </div>
      )}

      {/* STRATEGY */}
      {activeTab === "strategy" && (
        <div>
          <Section title="Exam-day strategy" icon={GraduationCap} defaultOpen>
            <Table
              headers={["Action", "Score", "Expected value on 4-option MCQ"]}
              rows={[
                ["Correct answer", "+1.00", "+1.00"],
                ["Wrong answer", "-0.25", "-0.25 (dead loss)"],
                ["Skip / no answer", "0.00", "0 (always safe)"],
                ["Blind guess (4 options)", "variable", "~0 (not worth it)"],
                ["Eliminate 1, guess from 3", "variable", "+0.08 (slightly positive)"],
                ["Eliminate 2, guess from 2", "variable", "+0.38 (worth attempting)"],
              ]}
            />
            <div className="mt-3 space-y-2">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-1">Rule: only attempt if you can eliminate at least 1 wrong option</p>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">Eliminating one option raises your guess odds from 1-in-4 to 1-in-3, making the expected value positive. Eliminating two makes it a coin flip — always attempt.</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Two-pass technique</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">Pass 1: answer only what you are certain about. Mark uncertain questions. Pass 2: revisit marked questions, attempt only with valid elimination. Leave zero-knowledge questions blank.</p>
              </div>
            </div>
          </Section>

          <Section title="Study method that works for BJS" icon={BookOpen}>
            <TopicList items={[
              "1 summary sheet per act/subject, built from Day 1 — this is your sole Month 5 revision material. Never re-read full textbooks in Month 5.",
              "Section-number drilling: make flashcards pairing section numbers to subject matter for Constitution, CPC, CrPC, Penal Code, Contract Act, Transfer of Property Act. This habit can secure 5-10 additional marks.",
              "From Month 2: 40% of study time solving MCQs, not just reading. Reading feels productive but does not train exam speed or the recall pattern needed for MCQ.",
              "Bare Act text + one BJS-specific MCQ guidebook per subject — depth on 2 sources beats shallow coverage of 5.",
              "Error log: every wrong/guessed answer from every mock, with correct reasoning. Review weekly. This becomes gold in Month 5.",
              "Past BJS question papers — prioritize over BCS papers. BJSC leans on precise legal terminology and section numbers more than BCS does.",
              "Current affairs: 30 min daily, all 5 months. Cannot be crammed. Keep a dedicated running notebook.",
              "Target 70+/100 in practice mocks consistently — not 50. The real competitive cutoff is above the official pass mark.",
            ]} />
          </Section>

          <Section title="Priority tiering for time allocation" icon={TrendingUp}>
            <SubHead>Tier 1 — Master completely (highest marks per hour)</SubHead>
            <TopicList items={[
              "Constitution of Bangladesh — single biggest scoring block",
              "Penal Code 1860 — offences, exceptions, definitions",
              "Code of Civil Procedure 1908 — jurisdiction, decree, execution",
              "CrPC 1898 — FIR, bail, trial procedure",
              "Muslim Law — marriage, dower, inheritance",
              "Bangladesh Affairs — Liberation War, current affairs",
              "Bangla and English grammar — high volume, high accuracy possible",
            ]} />
            <SubHead>Tier 2 — Strong working knowledge</SubHead>
            <TopicList items={[
              "Evidence Act 1872",
              "Contract Act 1872 and Transfer of Property Act 1882",
              "Limitation Act 1908",
              "International Affairs",
              "Everyday Science — ICT section first",
              "General Mathematics",
            ]} />
            <SubHead>Tier 3 — Solid familiarity, do not over-invest</SubHead>
            <TopicList items={[
              "Hindu Law",
              "Registration Act, State Acquisition and Tenancy Act, Non-Agricultural Tenancy Act",
              "General Clauses Act and Interpretation of Statutes",
              "Your chosen Optional subject",
              "ADR concepts",
            ]} />
          </Section>
        </div>
      )}
    </div>
  );
}

function TrendingUp(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
