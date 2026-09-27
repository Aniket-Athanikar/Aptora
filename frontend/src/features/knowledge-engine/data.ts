
import type {
  BookMetadata,
  BookVersion,
  Chapter,
  Formula,
  Flashcard,
  MCQQuestion,
  TrueFalseQuestion,
  FillBlankQuestion,
  ShortQuestion,
  PYQQuestion,
  PipelineStage,
  PipelineStageKey,
  ProcessingJob,
  MindMap,
  BookAnalytics,
  AnyQuestion,
} from "./types";

// ---------------------------------------------------------------------------
// EXAM CATALOG
// ---------------------------------------------------------------------------

export const EXAM_CATEGORIES = [
  { id: "all", label: "All Streams", tone: "from-slate-500 to-slate-700" },
  { id: "engineering", label: "Engineering", tone: "from-indigo-500 to-violet-600" },
  { id: "medical", label: "Medical", tone: "from-rose-500 to-pink-600" },
  { id: "civil", label: "Civil Services", tone: "from-amber-500 to-orange-600" },
  { id: "management", label: "Management", tone: "from-sky-500 to-cyan-600" },
  { id: "finance", label: "Finance & Banking", tone: "from-emerald-500 to-teal-600" },
  { id: "defence", label: "Defence", tone: "from-red-500 to-rose-600" },
  { id: "academic", label: "Academic", tone: "from-violet-500 to-fuchsia-600" },
] as const;

export const EXAMS_CATALOG = [
  { id: "gate", name: "GATE", code: "GATE-2026", category: "engineering", description: "Graduate Aptitude Test in Engineering", trending: true, featured: true, subjects: ["Engineering Mathematics", "Aptitude", "Core Discipline"] },
  { id: "upsc", name: "UPSC CSE", code: "UPSC-2026", category: "civil", description: "Union Public Service Commission — Civil Services Examination", trending: true, featured: true, subjects: ["General Studies", "Optional", "Essay"] },
  { id: "neet", name: "NEET UG", code: "NEET-2026", category: "medical", description: "National Eligibility cum Entrance Test", trending: true, featured: true, subjects: ["Physics", "Chemistry", "Biology"] },
  { id: "jee", name: "JEE Advanced", code: "JEE-2026", category: "engineering", description: "Joint Entrance Examination — Advanced", trending: true, featured: true, subjects: ["Physics", "Chemistry", "Mathematics"] },
  { id: "cat", name: "CAT", code: "CAT-2026", category: "management", description: "Common Admission Test — IIMs", trending: false, featured: true, subjects: ["Quant", "VARC", "DILR"] },
  { id: "ssc", name: "SSC CGL", code: "SSC-2026", category: "civil", description: "Staff Selection Commission Combined Graduate Level", trending: false, featured: false, subjects: ["Quant", "Reasoning", "English", "GK"] },
  { id: "banking", name: "IBPS PO", code: "IBPS-2026", category: "finance", description: "Institute of Banking Personnel Selection — Probationary Officer", trending: false, featured: false, subjects: ["Quant", "Reasoning", "English", "Banking Awareness"] },
  { id: "mpsc", name: "MPSC", code: "MPSC-2026", category: "civil", description: "Maharashtra Public Service Commission", trending: false, featured: false, subjects: ["Marathi", "English", "GK", "Optional"] },
  { id: "nda", name: "NDA", code: "NDA-2026", category: "defence", description: "National Defence Academy & Naval Academy", trending: false, featured: false, subjects: ["Mathematics", "GAT", "English"] },
  { id: "cds", name: "CDS", code: "CDS-2026", category: "defence", description: "Combined Defence Services", trending: false, featured: false, subjects: ["English", "GK", "Mathematics"] },
  { id: "net", name: "UGC NET", code: "NET-2026", category: "academic", description: "National Eligibility Test", trending: false, featured: false, subjects: ["Paper 1", "Paper 2"] },
  { id: "ca", name: "CA Final", code: "CA-2026", category: "finance", description: "Chartered Accountant — Final", trending: false, featured: false, subjects: ["Financial Reporting", "Audit", "Taxation", "Laws"] },
] as const;

// ---------------------------------------------------------------------------
// PIPELINE STAGES
// ---------------------------------------------------------------------------

export const PIPELINE_STAGE_DEFS: { key: PipelineStageKey; label: string; description: string; icon: string; baseMs: number }[] = [
  { key: "upload_validation", label: "Upload Validation", description: "File integrity, format and duplicate detection", icon: "ShieldCheck", baseMs: 1200 },
  { key: "image_analysis", label: "Image Analysis", description: "DPI, color profile, page detection", icon: "ScanLine", baseMs: 1500 },
  { key: "deskew", label: "Deskew Correction", description: "Straighten rotated / skewed pages", icon: "RotateCw", baseMs: 1400 },
  { key: "denoise", label: "Adaptive Denoise", description: "Remove scan noise and texture artifacts", icon: "Sparkles", baseMs: 1300 },
  { key: "rotate", label: "Rotation Lock", description: "Lock pages to upright orientation", icon: "Compass", baseMs: 800 },
  { key: "brightness", label: "Brightness Normalization", description: "Adaptive global brightness equalization", icon: "Sun", baseMs: 900 },
  { key: "contrast", label: "Contrast Amplification", description: "Boost text-to-background contrast", icon: "Contrast", baseMs: 1000 },
  { key: "sharpen", label: "Edge Sharpen", description: "Unsharp mask for character edges", icon: "Wand2", baseMs: 900 },
  { key: "qeled_boost", label: "QELED Boost", description: "Quantum-Enhanced Low-noise Detail layer", icon: "Atom", baseMs: 1400 },
  { key: "ocr_extract", label: "OCR Extraction", description: "Character recognition via Tesseract / PaddleOCR", icon: "Type", baseMs: 2400 },
  { key: "layout_parse", label: "Layout Parsing", description: "Detect columns, paragraphs, page regions", icon: "LayoutGrid", baseMs: 1600 },
  { key: "table_extract", label: "Table Extraction", description: "Reconstruct tables, rows, cells", icon: "Table", baseMs: 1800 },
  { key: "formula_detect", label: "Formula Detection", description: "Recognize equations, render LaTeX", icon: "Sigma", baseMs: 1700 },
  { key: "diagram_detect", label: "Diagram Detection", description: "Identify figures, charts, illustrations", icon: "Image", baseMs: 1500 },
  { key: "heading_detect", label: "Heading Hierarchy", description: "Build H1-H6 outline structure", icon: "Heading2", baseMs: 1100 },
  { key: "chapter_segment", label: "Chapter Segmentation", description: "Split book into chapter boundaries", icon: "BookOpen", baseMs: 1500 },
  { key: "topic_cluster", label: "Topic Clustering", description: "Cluster concepts into topics", icon: "Network", baseMs: 1700 },
  { key: "question_detect", label: "Question Detection", description: "Find Q&A blocks, exercises, examples", icon: "HelpCircle", baseMs: 1500 },
  { key: "answer_detect", label: "Answer Detection", description: "Pair questions with answer keys", icon: "CheckCircle2", baseMs: 1100 },
  { key: "summary_gen", label: "Summary Generation", description: "AI generated book & chapter summaries", icon: "BookText", baseMs: 1900 },
  { key: "notes_gen", label: "Notes Generation", description: "Micro / exam / revision notes templating", icon: "FileText", baseMs: 2200 },
  { key: "flashcard_gen", label: "Flashcard Generation", description: "Active-recall Q&A cards", icon: "Layers", baseMs: 1500 },
  { key: "mcq_gen", label: "MCQ Generation", description: "Distractors, options, difficulty tagging", icon: "ListChecks", baseMs: 1800 },
  { key: "mindmap_gen", label: "Mind Map Generation", description: "Concept graph + visual nodes", icon: "GitBranch", baseMs: 1700 },
  { key: "analytics_gen", label: "Analytics Generation", description: "Weightage, difficulty, readiness", icon: "TrendingUp", baseMs: 1400 },
  { key: "done", label: "Pipeline Complete", description: "Asset published to student library", icon: "CheckCheck", baseMs: 600 },
];

export function buildDefaultStages(): PipelineStage[] {
  return PIPELINE_STAGE_DEFS.map((s) => ({
    key: s.key,
    label: s.label,
    description: s.description,
    icon: s.icon,
    status: "pending" as const,
    progress: 0,
  }));
}

// ---------------------------------------------------------------------------
// SAMPLE CHAPTERS
// ---------------------------------------------------------------------------

const CHAPTER_TEMPLATES: { title: string; summary: string; topics: string[]; weightage: number; pages: number }[] = [
  {
    title: "Foundations & System Calibration",
    summary: "Covers the foundational vocabulary, calibration loops, and structural indices of the syllabus. Establishes the mental model used throughout the rest of the book.",
    topics: ["Calibration Frameworks", "Matrix Optimizers", "Transduction Paths", "Index Notation"],
    weightage: 12,
    pages: 32,
  },
  {
    title: "Signal Despeckle & Binarization",
    summary: "Deep dive into image signal processing, thresholding, and binarization techniques critical for clean OCR extraction.",
    topics: ["Contrast Multipliers", "Blur Mitigation", "OCR Vectorization", "Adaptive Thresholding"],
    weightage: 18,
    pages: 48,
  },
  {
    title: "Lagrangian Mechanics & Optimization",
    summary: "Reformulates classical mechanics using the Lagrangian operator. Connects calculus of variations to physics problem-solving.",
    topics: ["Variational Principles", "Constraint Forces", "Euler-Lagrange Equations", "Symmetry"],
    weightage: 22,
    pages: 56,
  },
  {
    title: "Quantum Telemetry & Measurement",
    summary: "Introduces quantum measurement theory, observability and the calibration of quantum instrumentation.",
    topics: ["Hermitian Operators", "Eigenvalues", "Uncertainty Principle", "State Collapse"],
    weightage: 28,
    pages: 64,
  },
  {
    title: "Tensor Algebra for Engineers",
    summary: "Practical tensor methods for stress, strain, and electromagnetic field problems with worked examples.",
    topics: ["Covariance", "Contravariance", "Metric Tensor", "Christoffel Symbols"],
    weightage: 14,
    pages: 38,
  },
  {
    title: "Practice, PYQs & Revision Drills",
    summary: "Curated 25-year PYQ analysis, question frequency mapping, and high-yield revision patterns.",
    topics: ["PYQ Patterns", "High-Yield Topics", "Speed Drills", "Mistake Logs"],
    weightage: 6,
    pages: 24,
  },
];

export function buildSampleChapters(bookId: string): Chapter[] {
  return CHAPTER_TEMPLATES.map((c, i) => ({
    id: `${bookId}_ch_${i + 1}`,
    index: i + 1,
    title: c.title,
    summary: c.summary,
    topics: c.topics,
    notes: `# ${c.title}\n\n${c.summary}\n\n## Key Concepts\n- ${c.topics.join("\n- ")}\n\n## Worked Examples\n- Derivation of base case for ${c.topics[0]}\n- Pattern recognition exercises for ${c.topics[1]}\n\n## Quick Recap\nThe core takeaway is that ${c.topics[0]} acts as the calibration backbone for everything that follows.`,
    learningObjectives: [
      `Master the fundamentals of ${c.topics[0]}`,
      `Apply ${c.topics[1]} to exam-style problems`,
      `Identify ${c.topics[2]} in mixed problem statements`,
    ],
    weightage: c.weightage,
    pageStart: i * 32 + 1,
    pageEnd: (i + 1) * 32,
    estimatedReadingMinutes: Math.round(c.pages * 2.4),
    difficulty: i < 2 ? "beginner" : i < 4 ? "intermediate" : "advanced",
    keyPoints: [
      `${c.topics[0]} is foundational — it appears in 80% of exam questions.`,
      `Look for ${c.topics[1]} disguised as ${c.topics[2]} in PYQs.`,
      `The relation between ${c.topics[0]} and ${c.topics[1]} is bijective.`,
    ],
    definitions: c.topics.slice(0, 3).map((t) => ({
      term: t,
      meaning: `${t} is a key concept in ${c.title} — see the worked example in section ${i + 2}.`,
    })),
    importantFacts: [
      `${c.topics[0]} was first formally introduced in 1971 by Prasad et al.`,
      `The relationship between ${c.topics[1]} and ${c.topics[2]} is non-trivial.`,
    ],
    memoryTricks: [
      `Mnemonic for ${c.topics[0]}: "Big Cats Prefer Yogurt"`,
      `Visual trick: imagine ${c.topics[1]} as a clock face — second hand = the variable.`,
    ],
  }));
}

// ---------------------------------------------------------------------------
// SAMPLE FORMULAS
// ---------------------------------------------------------------------------

export function buildSampleFormulas(bookId: string, chapterIds: string[]): Formula[] {
  return [
    { id: `${bookId}_f1`, title: "Standard Telemetry Sync", equation: "T_s = \\sum_{i=1}^{n} \\frac{\\alpha_i \\cdot C_i}{\\Delta t_i}", description: "Calculates the total knowledge synchronization factor across all calibration modules.", chapterId: chapterIds[0] || "", tags: ["core", "summation"], difficulty: "intermediate" },
    { id: `${bookId}_f2`, title: "Syllabus Status Predictor", equation: "P_{success} = \\Phi(\\beta_0 + \\beta_1 X - \\beta_2 E)", description: "Predicts success probability based on cumulative hours and error rate.", chapterId: chapterIds[2] || "", tags: ["logistic", "predictor"], difficulty: "advanced" },
    { id: `${bookId}_f3`, title: "Signal-to-Binarize Ratio", equation: "\\mathrm{SBR} = \\frac{\\mu_{fg} - \\mu_{bg}}{\\sigma_{fg} + \\sigma_{bg}}", description: "Estimates optimal binarization threshold given foreground/background statistics.", chapterId: chapterIds[1] || "", tags: ["ocr", "image"], difficulty: "intermediate" },
    { id: `${bookId}_f4`, title: "Quantum Uncertainty Bound", equation: "\\Delta x \\cdot \\Delta p \\ge \\frac{\\hbar}{2}", description: "Heisenberg-Robertson uncertainty bound for conjugate observables.", chapterId: chapterIds[3] || "", tags: ["quantum", "core"], difficulty: "advanced" },
    { id: `${bookId}_f5`, title: "Lagrangian Operator", equation: "\\mathcal{L} = T - V", description: "Difference between kinetic and potential energy defining the path integral.", chapterId: chapterIds[2] || "", tags: ["mechanics"], difficulty: "beginner" },
    { id: `${bookId}_f6`, title: "Stress Tensor Trace", equation: "\\sigma_{ii} = 3K\\varepsilon_{ii}", description: "Relates hydrostatic stress to volumetric strain through bulk modulus K.", chapterId: chapterIds[4] || "", tags: ["tensors", "engineering"], difficulty: "advanced" },
  ];
}

// ---------------------------------------------------------------------------
// SAMPLE MIND MAP
// ---------------------------------------------------------------------------

export function buildSampleMindMap(bookId: string, chapters: Chapter[]): MindMap {
  const nodes = [
    { id: `${bookId}_mm_root`, label: "Core Syllabus", x: 0, y: 0, level: 0, color: "#6366f1" },
    ...chapters.flatMap((ch, idx) => {
      const angle = (idx / Math.max(1, chapters.length)) * Math.PI * 2;
      const radius = 200;
      const cx = Math.cos(angle) * radius;
      const cy = Math.sin(angle) * radius;
      const chapterNode = {
        id: `${bookId}_mm_ch_${ch.id}`,
        label: ch.title,
        description: ch.summary,
        parentId: `${bookId}_mm_root`,
        x: cx,
        y: cy,
        level: 1,
        color: ["#a855f7", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"][idx % 6],
      };
      const topicNodes = ch.topics.map((t, ti) => {
        const a = angle + ((ti + 1) / (ch.topics.length + 1) - 0.5) * 0.6;
        const r = radius + 130;
        return {
          id: `${bookId}_mm_t_${ch.id}_${ti}`,
          label: t,
          parentId: chapterNode.id,
          x: Math.cos(a) * r,
          y: Math.sin(a) * r,
          level: 2,
          color: "#94a3b8",
        };
      });
      return [chapterNode, ...topicNodes];
    }),
  ];

  return {
    id: `${bookId}_mm`,
    bookId,
    rootLabel: "Core Syllabus",
    nodes,
  };
}

// ---------------------------------------------------------------------------
// SAMPLE QUESTIONS
// ---------------------------------------------------------------------------

export function buildSampleQuestions(bookId: string, chapters: Chapter[]): AnyQuestion[] {
  const ch1 = chapters[0]?.id || "";
  const ch2 = chapters[1]?.id || "";
  const ch3 = chapters[2]?.id || "";
  const ch4 = chapters[3]?.id || "";
  const t = new Date().toISOString();

  const mcqs: MCQQuestion[] = [
    { id: `${bookId}_q1`, type: "mcq", question: "Which pre-processing stage is primarily responsible for straightening skewed pages?", options: ["Binarization", "Deskewing", "Denoising", "Layout Parsing"], answerIndex: 1, explanation: "Deskewing detects skew angles and rotates the document image back to absolute horizontal alignment.", chapterId: ch2, topic: "Deskew", difficulty: "beginner", weightage: 2, tags: ["ocr"], createdAt: t },
    { id: `${bookId}_q2`, type: "mcq", question: "What metric evaluates the readability accuracy of generated OCR text?", options: ["Confidence Score", "Contrast Ratio", "DPI Density", "Page Count"], answerIndex: 0, explanation: "OCR Confidence Score represents the system probability margin of character identification correctness.", chapterId: ch2, topic: "OCR", difficulty: "beginner", weightage: 2, tags: ["ocr", "metrics"], createdAt: t },
    { id: `${bookId}_q3`, type: "mcq", question: "In Lagrangian mechanics, the Euler-Lagrange equation is derived from:", options: ["Newton's second law", "Principle of stationary action", "Conservation of momentum", "Hamilton-Jacobi theory"], answerIndex: 1, explanation: "The principle of stationary action δS = 0 leads directly to the Euler-Lagrange equation.", chapterId: ch3, topic: "Lagrangian", difficulty: "intermediate", weightage: 5, tags: ["mechanics"], createdAt: t },
    { id: `${bookId}_q4`, type: "mcq", question: "The Heisenberg uncertainty principle for position x and momentum p reads:", options: ["Δx·Δp = ℏ/2", "Δx·Δp ≥ ℏ/2", "Δx·Δp ≤ ℏ", "Δx + Δp ≥ ℏ"], answerIndex: 1, explanation: "The Robertson formulation generalizes Heisenberg's inequality to any conjugate pair of observables.", chapterId: ch4, topic: "Uncertainty", difficulty: "intermediate", weightage: 4, tags: ["quantum"], createdAt: t },
    { id: `${bookId}_q5`, type: "mcq", question: "Which of the following is NOT a tensor rank?", options: ["Scalar (rank-0)", "Vector (rank-1)", "Matrix (rank-2)", "Polynomial (rank-3)"], answerIndex: 3, explanation: "Polynomials are not tensor ranks; rank-3 tensors exist as 3D arrays of components.", chapterId: ch3, topic: "Tensors", difficulty: "advanced", weightage: 4, tags: ["tensors"], createdAt: t },
    { id: `${bookId}_q6`, type: "mcq", question: "Adaptive thresholding in OCR is preferred over global thresholding because:", options: ["It is faster", "It adapts to local illumination", "It uses less memory", "It avoids color conversion"], answerIndex: 1, explanation: "Adaptive thresholding computes a local threshold per pixel neighborhood, handling uneven illumination.", chapterId: ch2, topic: "Binarization", difficulty: "intermediate", weightage: 3, tags: ["ocr"], createdAt: t },
  ];

  const tfs: TrueFalseQuestion[] = [
    { id: `${bookId}_tf1`, type: "truefalse", question: "OCR confidence score of 0% means the text was perfectly extracted.", answer: "False. 0% means no characters were identified with any confidence.", correctValue: false, chapterId: ch2, topic: "OCR", difficulty: "beginner", weightage: 1, tags: ["ocr"], createdAt: t },
    { id: `${bookId}_tf2`, type: "truefalse", question: "The Lagrangian is always equal to kinetic energy minus potential energy.", answer: "True for conservative systems in classical mechanics, modulo generalized potentials.", correctValue: true, chapterId: ch3, topic: "Lagrangian", difficulty: "intermediate", weightage: 2, tags: ["mechanics"], createdAt: t },
    { id: `${bookId}_tf3`, type: "truefalse", question: "300 DPI is the recommended threshold for accurate OCR on printed text.", answer: "True. Below 300 DPI, character boundaries become ambiguous.", correctValue: true, chapterId: ch2, topic: "Resolution", difficulty: "beginner", weightage: 1, tags: ["ocr", "scan"], createdAt: t },
  ];

  const fills: FillBlankQuestion[] = [
    { id: `${bookId}_fb1`, type: "fillblank", question: "The principle of stationary action is the foundation of _____ mechanics.", blanks: ["Lagrangian"], chapterId: ch3, topic: "Action", difficulty: "beginner", weightage: 2, tags: ["mechanics"], createdAt: t },
    { id: `${bookId}_fb2`, type: "fillblank", question: "The smallest indivisible unit of an OCR character is called a _____.", blanks: ["glyph"], chapterId: ch2, topic: "OCR", difficulty: "beginner", weightage: 1, tags: ["ocr"], createdAt: t },
    { id: `${bookId}_fb3`, type: "fillblank", question: "Δx · Δp ≥ ℏ/2 is known as the _____ inequality.", blanks: ["Heisenberg", "uncertainty"], chapterId: ch4, topic: "Uncertainty", difficulty: "beginner", weightage: 2, tags: ["quantum"], createdAt: t },
  ];

  const shorts: ShortQuestion[] = [
    { id: `${bookId}_sq1`, type: "short", question: "Explain in 4-5 lines why deskewing is a pre-requisite for OCR.", answer: "Deskewing corrects rotation so characters sit on a horizontal baseline; OCR engines trained on upright text lose accuracy when glyphs are rotated, especially beyond ±2°. Deskewing also enables column detection, line segmentation, and consistent feature extraction.", expectedKeywords: ["rotation", "baseline", "accuracy", "segmentation"], sampleAnswerPoints: ["Rotation breaks OCR", "Baseline alignment", "Better line segmentation", "Improved feature extraction"], chapterId: ch2, topic: "Deskew", difficulty: "intermediate", weightage: 4, tags: ["ocr"], createdAt: t },
    { id: `${bookId}_sq2`, type: "short", question: "State the Heisenberg uncertainty principle in your own words.", answer: "It is impossible to simultaneously measure the position and momentum of a quantum particle to arbitrary precision — the product of uncertainties is bounded below by ℏ/2.", expectedKeywords: ["position", "momentum", "precision", "ℏ"], sampleAnswerPoints: ["Impossibility", "Bounded", "Quantum"], chapterId: ch4, topic: "Uncertainty", difficulty: "intermediate", weightage: 3, tags: ["quantum"], createdAt: t },
  ];

  const pyqs: PYQQuestion[] = [
    { id: `${bookId}_pyq1`, type: "pyq", question: "GATE-2022: For a Lagrangian L = ½mẋ² - ½kx², the equation of motion is: (a) mẍ + kx = 0 (b) mẍ - kx = 0 (c) mẍ = kx² (d) None", answer: "(a) mẍ + kx = 0", explanation: "Applying the Euler-Lagrange equation gives mẍ + kx = 0 — the simple harmonic oscillator equation.", chapterId: ch3, topic: "Lagrangian", difficulty: "intermediate", weightage: 2, year: 2022, source: "GATE", pyqYear: 2022, pyqSource: "GATE", tags: ["pyq", "gate"], createdAt: t, marks: 2, frequency: 1 },
    { id: `${bookId}_pyq2`, type: "pyq", question: "GATE-2023: The minimum DPI recommended for clean OCR on printed text is: (a) 72 (b) 150 (c) 300 (d) 600", answer: "(c) 300", explanation: "Industry standard is 300 DPI for clean OCR.", chapterId: ch2, topic: "OCR", difficulty: "beginner", weightage: 1, year: 2023, source: "GATE", pyqYear: 2023, pyqSource: "GATE", tags: ["pyq"], createdAt: t, marks: 1, frequency: 1 },
  ];

  return [...mcqs, ...tfs, ...fills, ...shorts, ...pyqs];
}

export function buildSampleFlashcards(bookId: string, chapters: Chapter[]): Flashcard[] {
  const ch1 = chapters[0]?.id || "";
  const ch2 = chapters[1]?.id || "";
  const ch3 = chapters[2]?.id || "";
  return [
    { id: `${bookId}_fc1`, front: "What is the optimal DPI for clean OCR?", back: "300 DPI is the recommended threshold for accurate character detection on printed text.", hint: "Higher than 150, lower than 600.", chapterId: ch2, topic: "Resolution", level: "unrated", reviewCount: 0, tags: ["ocr"] },
    { id: `${bookId}_fc2`, front: "Define binarization.", back: "The process of converting a color or grayscale image into a black-and-white binary image using a threshold.", chapterId: ch2, topic: "Image", level: "unrated", reviewCount: 0, tags: ["ocr"] },
    { id: `${bookId}_fc3`, front: "What is the Lagrangian?", back: "L = T - V, the difference between kinetic and potential energy. The action S = ∫L dt is stationary along physical paths.", chapterId: ch3, topic: "Lagrangian", level: "unrated", reviewCount: 0, tags: ["mechanics"] },
    { id: `${bookId}_fc4`, front: "State the Heisenberg uncertainty principle.", back: "Δx · Δp ≥ ℏ/2 — you cannot simultaneously measure position and momentum to arbitrary precision.", chapterId: ch3, topic: "Quantum", level: "unrated", reviewCount: 0, tags: ["quantum"] },
    { id: `${bookId}_fc5`, front: "Why is deskewing important?", back: "Corrects rotation so OCR engines can detect baselines, columns and characters accurately.", chapterId: ch1, topic: "Deskew", level: "unrated", reviewCount: 0, tags: ["ocr"] },
    { id: `${bookId}_fc6`, front: "What is the trace of a stress tensor?", back: "σᵢᵢ = 3Kεᵢᵢ, where K is the bulk modulus — relates hydrostatic stress to volumetric strain.", chapterId: ch3, topic: "Tensors", level: "unrated", reviewCount: 0, tags: ["tensors"] },
  ];
}

// ---------------------------------------------------------------------------
// SAMPLE ANALYTICS
// ---------------------------------------------------------------------------

export function buildSampleAnalytics(bookId: string, chapters: Chapter[], questions: AnyQuestion[]): BookAnalytics {
  const totalPages = chapters.reduce((s, c) => s + (c.pageEnd - c.pageStart + 1), 0) || 264;
  const totalChapters = chapters.length || 6;
  const totalTopics = chapters.reduce((s, c) => s + c.topics.length, 0) || 24;
  return {
    bookId,
    totalPages,
    totalChapters,
    totalTopics,
    totalQuestions: questions.length,
    totalFlashcards: 12,
    totalFormulas: 6,
    estimatedReadingMinutes: totalPages * 3,
    estimatedRevisionMinutes: Math.round(totalPages * 0.6),
    topicDistribution: chapters.flatMap((c) =>
      c.topics.map((t) => ({ topic: t, weightage: Math.round((c.weightage / c.topics.length) * 10) / 10, pages: Math.round((c.pageEnd - c.pageStart + 1) / c.topics.length), questions: Math.round((questions.length / totalTopics) * 10) / 10 }))
    ),
    chapterWeightage: chapters.map((c) => ({
      chapterId: c.id,
      title: c.title,
      weightage: c.weightage,
      questions: questions.filter((q) => q.chapterId === c.id).length,
      pyqFrequency: Math.round(Math.random() * 8 + 2),
    })),
    difficultyScore: 64,
    examReadiness: 78,
    confidencePrediction: 82,
    learningCurve: Array.from({ length: 14 }).map((_, i) => ({
      day: i + 1,
      mastery: Math.min(98, Math.round(15 + i * 5 + Math.random() * 5)),
      retention: Math.min(95, Math.round(40 + i * 3.5 + Math.random() * 4)),
    })),
    pyqFrequency: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025].map((y) => ({ year: y, count: Math.round(Math.random() * 18 + 4) })),
    questionDifficultyBreakdown: { easy: Math.round(questions.length * 0.3), medium: Math.round(questions.length * 0.5), hard: Math.round(questions.length * 0.2) },
    studyTimeRecommendation: { daily: 90, weekly: 600, total: totalPages * 3 },
  };
}

// ---------------------------------------------------------------------------
// DEFAULT FOLDERS / TAGS
// ---------------------------------------------------------------------------

export const DEFAULT_FOLDERS = ["All Books", "Syllabus", "Notes", "PYQ Papers", "Reference", "Archive"] as const;

export const DEFAULT_TAGS = ["#physics", "#mechanics", "#quantum", "#ocr", "#ai", "#premium", "#trending", "#featured", "#gate", "#upsc", "#neet"] as const;

// ---------------------------------------------------------------------------
// SAMPLE BOOKS (for first-load demo)
// ---------------------------------------------------------------------------

export function buildSampleBooks(): BookMetadata[] {
  const now = new Date();
  const ts = (offsetDays = 0) => new Date(now.getTime() - offsetDays * 86400000).toISOString();

  return [
    {
      id: "book_demo_1",
      title: "Modern Engineering Physics & Mechanics",
      subtitle: "A complete GATE-grade reference",
      author: "Dr. A. P. J. Prasad",
      publisher: "Oxford Academic Press",
      edition: "8th Edition",
      publicationYear: "2025",
      language: "English",
      isbn: "978-0-19-872492-5",
      description: "Comprehensive engineering physics textbook covering calibration, mechanics, and modern measurement theory. Includes 1,200+ worked examples and 25 years of PYQ analysis.",
      examCategory: "engineering",
      examName: "GATE",
      examCode: "GATE-2026",
      subjects: ["Engineering Physics", "Solid Mechanics", "Mathematical Methods"],
      difficulty: "advanced",
      tags: ["#physics", "#mechanics", "#premium", "#gate"],
      contentType: "textbook",
      status: "ready",
      visibility: "public",
      premium: "premium",
      isFeatured: true,
      isTrending: true,
      isPinned: true,
      isFavorite: true,
      isArchived: false,
      pageCount: 384,
      sizeBytes: 15420100,
      qualityScore: 97,
      ocrConfidence: 96.5,
      readingTimeMinutes: 1152,
      versionId: "v_1",
      versionNumber: 1,
      coverColor: "from-indigo-500 via-violet-500 to-fuchsia-500",
      fileExt: "pdf",
      originalFileName: "Modern_Engineering_Physics_8e.pdf",
      folder: "Syllabus",
      uploadedAt: ts(28),
      updatedAt: ts(2),
      publishedAt: ts(20),
    },
    {
      id: "book_demo_2",
      title: "UPSC General Studies — Paper I",
      subtitle: "Indian Heritage, History & Society",
      author: "R. Sharma & M. Laxmikanth",
      publisher: "Tata McGraw-Hill",
      edition: "12th Edition",
      publicationYear: "2025",
      language: "English",
      description: "Comprehensive GS Paper I manual with timeline maps, art/culture index, and Indian society frameworks.",
      examCategory: "civil",
      examName: "UPSC CSE",
      examCode: "UPSC-2026",
      subjects: ["History", "Geography", "Polity", "Society"],
      difficulty: "intermediate",
      tags: ["#upsc", "#history", "#trending"],
      contentType: "textbook",
      status: "ready",
      visibility: "public",
      premium: "free",
      isFeatured: true,
      isTrending: true,
      isPinned: false,
      isFavorite: true,
      isArchived: false,
      pageCount: 612,
      sizeBytes: 28400000,
      qualityScore: 92,
      ocrConfidence: 94.2,
      readingTimeMinutes: 1836,
      versionId: "v_1",
      versionNumber: 1,
      coverColor: "from-amber-500 via-orange-500 to-rose-500",
      fileExt: "pdf",
      originalFileName: "UPSC_GS_Paper1_12e.pdf",
      folder: "Syllabus",
      uploadedAt: ts(20),
      updatedAt: ts(5),
      publishedAt: ts(15),
    },
    {
      id: "book_demo_3",
      title: "NEET Biology — Volume II",
      subtitle: "Human Physiology & Reproduction",
      author: "Dr. S. Chakravarthy",
      publisher: "Pearson Medical",
      edition: "6th Edition",
      publicationYear: "2024",
      language: "English",
      description: "Detailed physiology & reproductive biology with 4,000+ labeled diagrams and clinical correlations.",
      examCategory: "medical",
      examName: "NEET UG",
      examCode: "NEET-2026",
      subjects: ["Biology", "Human Physiology", "Reproduction"],
      difficulty: "intermediate",
      tags: ["#neet", "#biology", "#premium"],
      contentType: "textbook",
      status: "ready",
      visibility: "public",
      premium: "premium",
      isFeatured: false,
      isTrending: true,
      isPinned: false,
      isFavorite: false,
      isArchived: false,
      pageCount: 480,
      sizeBytes: 22100000,
      qualityScore: 95,
      ocrConfidence: 97.1,
      readingTimeMinutes: 1440,
      versionId: "v_1",
      versionNumber: 1,
      coverColor: "from-rose-500 via-pink-500 to-fuchsia-500",
      fileExt: "pdf",
      originalFileName: "NEET_Bio_Vol2_6e.pdf",
      folder: "Reference",
      uploadedAt: ts(11),
      updatedAt: ts(1),
      publishedAt: ts(8),
    },
    {
      id: "book_demo_4",
      title: "CAT Quant — Algebra & Geometry",
      subtitle: "Last-mile problem solving",
      author: "Arun Sharma",
      publisher: "McGraw-Hill Education",
      edition: "9th Edition",
      publicationYear: "2025",
      language: "English",
      description: "CAT-level quant practice with shortcuts, mental math tricks and 3,000+ practice problems.",
      examCategory: "management",
      examName: "CAT",
      examCode: "CAT-2026",
      subjects: ["Quantitative Aptitude", "Algebra", "Geometry"],
      difficulty: "advanced",
      tags: ["#cat", "#quant", "#premium"],
      contentType: "guide",
      status: "ready",
      visibility: "public",
      premium: "premium",
      isFeatured: true,
      isTrending: false,
      isPinned: true,
      isFavorite: false,
      isArchived: false,
      pageCount: 296,
      sizeBytes: 11200000,
      qualityScore: 94,
      ocrConfidence: 95.8,
      readingTimeMinutes: 888,
      versionId: "v_1",
      versionNumber: 1,
      coverColor: "from-sky-500 via-cyan-500 to-blue-500",
      fileExt: "pdf",
      originalFileName: "CAT_Quant_9e.pdf",
      folder: "Notes",
      uploadedAt: ts(6),
      updatedAt: ts(1),
      publishedAt: ts(4),
    },
    {
      id: "book_demo_5",
      title: "JEE Advanced — Physical Chemistry",
      subtitle: "Mole Concept to Electrochemistry",
      author: "O.P. Tandon",
      publisher: "G.R. Bathla Publications",
      edition: "14th Edition",
      publicationYear: "2025",
      language: "English",
      description: "IIT-JEE physical chemistry reference with PYQ bank and 5,000+ objective problems.",
      examCategory: "engineering",
      examName: "JEE Advanced",
      examCode: "JEE-2026",
      subjects: ["Physical Chemistry", "Mole Concept", "Electrochemistry"],
      difficulty: "advanced",
      tags: ["#jee", "#chemistry", "#premium"],
      contentType: "textbook",
      status: "ready",
      visibility: "public",
      premium: "free",
      isFeatured: true,
      isTrending: true,
      isPinned: false,
      isFavorite: true,
      isArchived: false,
      pageCount: 524,
      sizeBytes: 19800000,
      qualityScore: 96,
      ocrConfidence: 97.4,
      readingTimeMinutes: 1572,
      versionId: "v_1",
      versionNumber: 1,
      coverColor: "from-emerald-500 via-teal-500 to-cyan-500",
      fileExt: "pdf",
      originalFileName: "JEE_PhyChem_14e.pdf",
      folder: "Syllabus",
      uploadedAt: ts(14),
      updatedAt: ts(3),
      publishedAt: ts(10),
    },
    {
      id: "book_demo_6",
      title: "SSC CGL Tier I — 25 Year PYQ Bank",
      subtitle: "Solved papers 2000-2024",
      author: "Kiran Prakashan",
      publisher: "Kiran Prakashan",
      edition: "5th Edition",
      publicationYear: "2024",
      language: "English",
      description: "Complete SSC CGL Tier I solved papers for 25 years with detailed explanations.",
      examCategory: "civil",
      examName: "SSC CGL",
      examCode: "SSC-2026",
      subjects: ["Quant", "Reasoning", "English", "GK"],
      difficulty: "intermediate",
      tags: ["#ssc", "#pyq", "#trending"],
      contentType: "paper",
      status: "ready",
      visibility: "public",
      premium: "free",
      isFeatured: false,
      isTrending: true,
      isPinned: false,
      isFavorite: false,
      isArchived: false,
      pageCount: 720,
      sizeBytes: 32100000,
      qualityScore: 91,
      ocrConfidence: 92.0,
      readingTimeMinutes: 2160,
      versionId: "v_1",
      versionNumber: 1,
      coverColor: "from-violet-500 via-purple-500 to-fuchsia-500",
      fileExt: "pdf",
      originalFileName: "SSC_CGL_PYQ_25yr.pdf",
      folder: "PYQ Papers",
      uploadedAt: ts(8),
      updatedAt: ts(2),
      publishedAt: ts(6),
    },
  ];
}

// ---------------------------------------------------------------------------
// SAMPLE VERSIONS
// ---------------------------------------------------------------------------

export function buildSampleVersions(bookId: string): BookVersion[] {
  const now = Date.now();
  return [
    { id: `${bookId}_v1`, versionNumber: 1, createdAt: new Date(now - 86400000 * 28).toISOString(), createdBy: "developer@Aptora.ai", changeSummary: "Initial upload + AI processing complete.", sizeBytes: 15420100, pageCount: 384, qualityScore: 94, ocrConfidence: 93, isCurrent: false },
    { id: `${bookId}_v2`, versionNumber: 2, createdAt: new Date(now - 86400000 * 12).toISOString(), createdBy: "developer@Aptora.ai", changeSummary: "Re-OCR with QELED v2. Added 32 missing pages.", sizeBytes: 15820000, pageCount: 384, qualityScore: 96, ocrConfidence: 95, parentVersionId: `${bookId}_v1`, isCurrent: false },
    { id: `${bookId}_v3`, versionNumber: 3, createdAt: new Date(now - 86400000 * 2).toISOString(), createdBy: "developer@Aptora.ai", changeSummary: "Re-generated AI notes. Updated mindmap nodes.", sizeBytes: 15940000, pageCount: 384, qualityScore: 97, ocrConfidence: 96.5, parentVersionId: `${bookId}_v2`, isCurrent: true },
  ];
}
