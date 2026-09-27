// "use client";

// import React, { useState, useEffect, useRef, useMemo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import * as Lucide from "lucide-react";
// import { useSearchParams } from "next/navigation";

// // ==========================================
// // ARCHITECTURE & REPOSITORY INTERFACES
// // ==========================================

// export interface ImageEnhancements {
//   brightness: number;
//   contrast: number;
//   sharpness: number;
//   noise: number;
//   rotation: number;
//   skew: number;
// }

// export interface Annotation {
//   id: string;
//   page: number;
//   type: "sticky" | "draw" | "highlight";
//   content: string;
//   x: number;
//   y: number;
// }

// export interface Flashcard {
//   id: string;
//   question: string;
//   answer: string;
//   level: "easy" | "good" | "hard" | "unrated";
// }

// export interface MCQ {
//   id: string;
//   question: string;
//   options: string[];
//   answerIndex: number;
//   selectedAnswer?: number;
//   explanation?: string;
// }

// export interface Formula {
//   id: string;
//   title: string;
//   equation: string;
//   description: string;
// }

// export interface Chapter {
//   id: string;
//   title: string;
//   topics: string[];
//   notes: string;
// }

// export interface BookAsset {
//   id: string;
//   title: string;
//   author: string;
//   publisher: string;
//   edition: string;
//   language: string;
//   category: string;
//   examType: string;
//   year: string;
//   subjects: string[];
//   chapters: Chapter[];
//   tags: string[];
//   pageCount: number;
//   sizeBytes: number;
//   isFavorite: boolean;
//   isPinned: boolean;
//   isArchived: boolean;
//   status: "ready" | "processing" | "failed";
//   progressStep: number;
//   qualityScore: number;
//   ocrConfidence: number;
//   imageEnhancements: ImageEnhancements;
//   annotations: Annotation[];
//   flashcards: Flashcard[];
//   mcqs: MCQ[];
//   formulas: Formula[];
//   folder: string;
//   updatedAt?: string;
// }

// export interface HistoryLog {
//   id: string;
//   timestamp: string;
//   action: string;
//   detail: string;
//   bookId?: string;
//   bookTitle?: string;
// }

// // ==========================================
// // MOCK DATA GENERATION TEMPLATES
// // ==========================================

// const EXAM_CATEGORIES = [
//   { id: "all", label: "All Exams" },
//   { id: "civil", label: "Civil Services" },
//   { id: "engineering", label: "Engineering" },
//   { id: "medical", label: "Medical" },
//   { id: "management", label: "Management" },
//   { id: "finance", label: "Finance & Banking" }
// ];

// const EXAMS_DATA = [
//   { id: "gate", name: "GATE", category: "engineering", description: "Graduate Aptitude Test in Engineering", trending: true, favorite: true },
//   { id: "upsc", name: "UPSC", category: "civil", description: "Union Public Service Commission", trending: true, favorite: true },
//   { id: "neet", name: "NEET", category: "medical", description: "National Eligibility cum Entrance Test", trending: true, favorite: false },
//   { id: "jee", name: "JEE", category: "engineering", description: "Joint Entrance Examination", trending: false, favorite: true },
//   { id: "cat", name: "CAT", category: "management", description: "Common Admission Test", trending: false, favorite: false },
//   { id: "ssc", name: "SSC CGL", category: "civil", description: "Staff Selection Commission", trending: false, favorite: false },
//   { id: "banking", name: "IBPS PO", category: "finance", description: "Institute of Banking Personnel Selection", trending: false, favorite: false },
//   { id: "mpsc", name: "MPSC", category: "civil", description: "Maharashtra Public Service Commission", trending: false, favorite: false }
// ];

// const MOCK_CHAPTERS_DEFAULT: Chapter[] = [
//   {
//     id: "ch_1",
//     title: "Chapter 1: Quantum Telemetry & Calibration",
//     topics: ["Calibration Frameworks", "Matrix Optimizers", "Transduction Paths"],
//     notes: `# Chapter 1 Notes: Quantum Telemetry\nThis notes sheet outlines modern transduction models and calibration variables.\n\n## Core Calibration Model\n- **Weight Coefficient**: \\beta_0 + \\beta_1 X_{hours} - \\beta_2 E_{error}\n- **Denoising Thresholds**: Maximize standard error prevention metrics below 2% variance.`
//   },
//   {
//     id: "ch_2",
//     title: "Chapter 2: Signal Despeckle & Binarization",
//     topics: ["Contrast Multipliers", "Blur Mitigation", "OCR Vectorization"],
//     notes: `# Chapter 2 Notes: Signal Despeckle\nDetailed structural guides on image denoising algorithms.\n\n- **Thresholding**: Adaptive binary matrix multipliers.\n- **Resolution Calibration**: Target min 300 DPI for high confidence text captures.`
//   }
// ];

// const MOCK_FLASHCARDS_DEFAULT: Flashcard[] = [
//   { id: "fc_1", question: "What is the optimal DPI resolution for standard document OCR?", answer: "300 DPI is the recommended threshold for accurate character detection.", level: "unrated" },
//   { id: "fc_2", question: "Define binarization in the image processing pipeline.", answer: "The process of converting a color/grayscale image into a black-and-white binary image.", level: "unrated" }
// ];

// const MOCK_MCQS_DEFAULT: MCQ[] = [
//   {
//     id: "mcq_1",
//     question: "Which pre-processing stage is primarily responsible for straightening skewed pages?",
//     options: ["Binarization", "Deskewing", "Denoising", "Layout Parsing"],
//     answerIndex: 1,
//     explanation: "Deskewing detects skew angles and rotates the document image back to absolute horizontal alignment."
//   },
//   {
//     id: "mcq_2",
//     question: "What metric evaluates the readability accuracy of generated OCR text?",
//     options: ["Confidence Score", "Contrast Ratio", "DPI Density", "Page Count"],
//     answerIndex: 0,
//     explanation: "OCR Confidence Score represents the system probability margin of character identification correctness."
//   }
// ];

// const MOCK_FORMULAS_DEFAULT: Formula[] = [
//   { id: "f_1", title: "Standard Telemetry Sync", equation: "T_s = \\sum_{i=1}^n \\frac{\\alpha_i \\cdot C_i}{\\Delta t_i}", description: "Calculates the total knowledge synchronization factor." },
//   { id: "f_2", title: "Syllabus Status Predictor", equation: "P_{success} = \\Phi(\\beta_0 + \\beta_1 X - \\beta_2 E)", description: "Predicts success probability metrics based on hours and errors." }
// ];

// // ==========================================
// // MAIN COMPONENT DEFINITION
// // ==========================================

// export function KnowledgeEngine() {
//   // --- Persistent Workspace Database ---
//   const [library, setLibrary] = useState<BookAsset[]>([]);
//   const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);
//   const [activeBookId, setActiveBookId] = useState<string | null>(null);
  
//   // --- Step & Navigation States ---
//   const searchParams = useSearchParams();
//   const subParam = searchParams.get("sub");
//   const [activeTab, setActiveTab] = useState<"exams" | "upload" | "pipeline" | "library" | "notes" | "flashcards" | "analytics">("exams");

//   useEffect(() => {
//     if (subParam && ["exams", "upload", "pipeline", "library", "notes", "flashcards", "analytics"].includes(subParam)) {
//       setActiveTab(subParam as any);
//     }
//   }, [subParam]);

//   const [selectedExam, setSelectedExam] = useState<string>("GATE");
//   const [examSearch, setExamSearch] = useState("");
//   const [examCategory, setExamCategory] = useState("all");

//   // --- Folder & Directory States ---
//   const [folders, setFolders] = useState<string[]>(["All", "Syllabuses", "Drafts", "Solved Papers", "Archive"]);
//   const [activeFolder, setActiveFolder] = useState<string>("All");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
//   const [sortBy, setSortBy] = useState<"title" | "date" | "score">("title");

//   // --- Compare Mode States ---
//   const [compareMode, setCompareMode] = useState(false);
//   const [compareBookIds, setCompareBookIds] = useState<string[]>([]);

//   // --- Upload States & Validators ---
//   const [uploadQueue, setUploadQueue] = useState<any[]>([]);
//   const [isDragging, setIsDragging] = useState(false);
//   const [cameraActive, setCameraActive] = useState(false);
//   const [cameraCountdown, setCameraCountdown] = useState<number | null>(null);
//   const [cameraPreview, setCameraPreview] = useState<string | null>(null);

//   // --- QELED Image Quality Engine States ---
//   const [activeQualityFile, setActiveQualityFile] = useState<any>(null);
//   const [qeBrightness, setQeBrightness] = useState(100);
//   const [qeContrast, setQeContrast] = useState(100);
//   const [qeNoise, setQeNoise] = useState(5);
//   const [qeSkew, setQeSkew] = useState(0);
//   const [qeBlur, setQeBlur] = useState(1);
//   const [qeRotation, setQeRotation] = useState(0);

//   // --- OCR Pipeline Stepper States ---
//   const [pipelineProgress, setPipelineProgress] = useState(0);
//   const [activePipelineBookId, setActivePipelineBookId] = useState<string | null>(null);
//   const [pipelineLogs, setPipelineLogs] = useState<string[]>([]);

//   // --- Notes Editor Workspace States ---
//   const [activeChapterIndex, setActiveChapterIndex] = useState(0);
//   const [showRoughSheet, setShowRoughSheet] = useState(false);
//   const [roughNotes, setRoughNotes] = useState("");
//   const [selectedNoteTemplate, setSelectedNoteTemplate] = useState("Detailed Notes");
//   const [editMetaMode, setEditMetaMode] = useState(false);
//   const [editorMode, setEditorMode] = useState<"edit" | "preview" | "split">("split");

//   // --- Q&A / MCQ Panel States ---
//   const [qaSubTab, setQaSubTab] = useState<"flashcards" | "mcqs">("flashcards");
//   const [mcqCalibrationScore, setMcqCalibrationScore] = useState<number | null>(null);

//   // --- Modals Toggle States ---
//   const [selectedDiagnosticsBook, setSelectedDiagnosticsBook] = useState<BookAsset | null>(null);
//   const [showChapterModal, setShowChapterModal] = useState(false);
//   const [showQAFormModal, setShowQAFormModal] = useState(false);
//   const [editingChapterIdx, setEditingChapterIdx] = useState<number | null>(null);
//   const [editingQAIdx, setEditingQAIdx] = useState<number | null>(null);
//   const [qaFormType, setQaFormType] = useState<"flashcard" | "mcq">("flashcard");

//   // --- Form Controlled Values ---
//   const [chapterForm, setChapterForm] = useState({ title: "", topics: "", notes: "" });
//   const [flashcardForm, setFlashcardForm] = useState({ question: "", answer: "" });
//   const [mcqForm, setMcqForm] = useState({ question: "", option0: "", option1: "", option2: "", option3: "", answerIndex: 0 });

//   // --- Element References ---
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const notesTextareaRef = useRef<HTMLTextAreaElement>(null);

//   // ==========================================
//   // DB INITIALIZATION & PERSISTENCE
//   // ==========================================

//   useEffect(() => {
//     try {
//       const storedLib = localStorage.getItem("ef_knowledge_library");
//       if (storedLib) {
//         const parsed = JSON.parse(storedLib);
//         if (parsed.length > 0) {
//           setLibrary(parsed);
//           setActiveBookId(parsed[0].id);
//         } else {
//           loadDefaultLibrary();
//         }
//       } else {
//         loadDefaultLibrary();
//       }

//       const storedHistory = localStorage.getItem("ef_knowledge_history");
//       if (storedHistory) {
//         setHistoryLogs(JSON.parse(storedHistory));
//       } else {
//         const initialLogs = [
//           { id: "log_init", timestamp: new Date().toISOString(), action: "System Calibrated", detail: "Knowledge Factory system diagnostics loaded." }
//         ];
//         setHistoryLogs(initialLogs);
//         localStorage.setItem("ef_knowledge_history", JSON.stringify(initialLogs));
//       }

//       const storedRough = localStorage.getItem("ef_knowledge_rough_notes");
//       if (storedRough) {
//         setRoughNotes(storedRough);
//       }
//     } catch {
//       loadDefaultLibrary();
//     }
//   }, []);

//   const loadDefaultLibrary = () => {
//     const defaults: BookAsset[] = [
//       {
//         id: "book_001",
//         title: "Modern Engineering Physics & Mechanics",
//         author: "Dr. A. P. J. Prasad",
//         publisher: "Oxford Academic Press",
//         edition: "8th Edition",
//         language: "English",
//         category: "Physics",
//         examType: "GATE",
//         year: "2025",
//         subjects: ["Engineering Physics", "Solid Mechanics"],
//         chapters: MOCK_CHAPTERS_DEFAULT,
//         tags: ["Physics", "Mechanics", "Formulas"],
//         pageCount: 384,
//         sizeBytes: 15420100,
//         isFavorite: true,
//         isPinned: true,
//         isArchived: false,
//         status: "ready",
//         progressStep: 15,
//         qualityScore: 97,
//         ocrConfidence: 96.5,
//         imageEnhancements: { brightness: 100, contrast: 100, sharpness: 100, noise: 0, rotation: 0, skew: 0 },
//         annotations: [{ id: "an_1", page: 1, type: "highlight", content: "Signal pathways transduction is crucial.", x: 20, y: 30 }],
//         flashcards: MOCK_FLASHCARDS_DEFAULT,
//         mcqs: MOCK_MCQS_DEFAULT,
//         formulas: MOCK_FORMULAS_DEFAULT,
//         folder: "Syllabuses",
//         updatedAt: new Date().toISOString()
//       }
//     ];
//     setLibrary(defaults);
//     setActiveBookId(defaults[0].id);
//     localStorage.setItem("ef_knowledge_library", JSON.stringify(defaults));
//   };

//   const saveToStorage = (updatedLib: BookAsset[]) => {
//     localStorage.setItem("ef_knowledge_library", JSON.stringify(updatedLib));
//   };

//   const logAction = (action: string, detail: string, bookId?: string, bookTitle?: string) => {
//     const newLog: HistoryLog = {
//       id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
//       timestamp: new Date().toISOString(),
//       action,
//       detail,
//       bookId,
//       bookTitle
//     };
//     setHistoryLogs((prev) => {
//       const updated = [newLog, ...prev];
//       localStorage.setItem("ef_knowledge_history", JSON.stringify(updated));
//       return updated;
//     });
//   };

//   const updateLibraryState = (newLib: BookAsset[]) => {
//     const finalLib = newLib.map((b) => {
//       if (b.id === activeBookId) {
//         return { ...b, updatedAt: new Date().toISOString() };
//       }
//       return b;
//     });
//     setLibrary(finalLib);
//     saveToStorage(finalLib);
//   };

//   const activeBook = useMemo(() => {
//     return library.find((b) => b.id === activeBookId) || library[0] || null;
//   }, [library, activeBookId]);

//   // ==========================================
//   // SCREEN & TAB TRANSITIONS
//   // ==========================================

//   const navigateToTab = (tabName: typeof activeTab) => {
//     setActiveTab(tabName);
//     logAction("Navigation Change", `Transited to ${tabName.toUpperCase()} dashboard section.`);
//   };

//   // ==========================================
//   // EXAM DASHBOARD (STEP 1)
//   // ==========================================

//   const filteredExams = useMemo(() => {
//     return EXAMS_DATA.filter((exam) => {
//       const matchesSearch = exam.name.toLowerCase().includes(examSearch.toLowerCase()) || exam.description.toLowerCase().includes(examSearch.toLowerCase());
//       const matchesCategory = examCategory === "all" || exam.category === examCategory;
//       return matchesSearch && matchesCategory;
//     });
//   }, [examSearch, examCategory]);

//   const toggleExamFavorite = (examId: string) => {
//     const exam = EXAMS_DATA.find((e) => e.id === examId);
//     if (exam) {
//       exam.favorite = !exam.favorite;
//       logAction("Exam Filter Set", `Changed favorite settings for exam target: ${exam.name}`);
//       setExamSearch((s) => s + " "); // force refresh
//       setTimeout(() => setExamSearch((s) => s.trim()), 50);
//     }
//   };

//   // ==========================================
//   // UPLOAD WORKSPACE (STEP 2)
//   // ==========================================

//   const handleFilesChosen = (files: FileList | File[]) => {
//     const list = Array.from(files);
//     if (list.length === 0) return;

//     const newUploads = list.map((f) => {
//       const ext = (f.name.split(".").pop() || "").toLowerCase();
//       const sizeMB = f.size / (1024 * 1024);
//       let validations: string[] = [];

//       // Mock structural checks
//       if (sizeMB > 50) validations.push("LARGE_FILE_LIMIT");
//       if (["pdf"].includes(ext) && f.name.includes("encrypted")) validations.push("ENCRYPTED_WARNING");
//       if (["zip"].includes(ext)) validations.push("ZIP_ARCHIVE_VALIDATED");
//       if (!["pdf", "png", "jpg", "jpeg", "webp", "zip", "docx", "txt", "md"].includes(ext)) validations.push("UNSUPPORTED_EXTENSION");

//       return {
//         id: `upl_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
//         name: f.name,
//         ext,
//         sizeMB: parseFloat(sizeMB.toFixed(2)) || 2.5,
//         validations,
//         qualityScore: 92 + Math.floor(Math.random() * 8),
//         pageEstimate: Math.max(1, Math.floor(sizeMB * 12)) || 10
//       };
//     });

//     setUploadQueue((prev) => [...prev, ...newUploads]);
//     logAction("Files Queued", `Brought ${newUploads.length} documents into the pre-processing analyzer.`);
//   };

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(false);
//     if (e.dataTransfer.files) {
//       handleFilesChosen(e.dataTransfer.files);
//     }
//   };

//   const triggerClipboardPaste = async () => {
//     try {
//       logAction("Clipboard Trigger", "Invoked pre-check scanner for clipboard image assets.");
//       alert("Simulating Clipboard Paste: Telemetry detected mock clipboard image: 'Coaching_Physics_Handwritten_Notes.PNG' (3.2MB)");
//       const mockFile = new File([""], "Coaching_Physics_Handwritten_Notes.PNG", { type: "image/png" });
//       handleFilesChosen([mockFile]);
//     } catch {
//       alert("Please grant clipboard reading permissions to Aptora.");
//     }
//   };

//   const startCameraCapture = () => {
//     setCameraActive(true);
//     setCameraCountdown(3);
//     logAction("Webcam Triggered", "Initializing camera capture mode.");
//   };

//   useEffect(() => {
//     if (cameraCountdown === null) return;
//     if (cameraCountdown === 0) {
//       setCameraCountdown(null);
//       // Capture simulated snapshot
//       setCameraPreview("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80");
//       setCameraActive(false);
//       logAction("Snapshot Captured", "Captured page study notes via camera module.");
//       return;
//     }
//     const timer = setTimeout(() => setCameraCountdown((c) => (c ? c - 1 : 0)), 1000);
//     return () => clearTimeout(timer);
//   }, [cameraCountdown]);

//   const acceptCameraSnapshot = () => {
//     if (!cameraPreview) return;
//     const mockFile = new File([""], "Camera_Snapshot_Notes.JPG", { type: "image/jpeg" });
//     handleFilesChosen([mockFile]);
//     setCameraPreview(null);
//   };

//   // ==========================================
//   // QELED QUALITY ANALYZER
//   // ==========================================

//   const loadFileInQELED = (item: any) => {
//     setActiveQualityFile(item);
//     setQeBrightness(100);
//     setQeContrast(100);
//     setQeNoise(item.validations.includes("LARGE_FILE_LIMIT") ? 18 : 3);
//     setQeSkew(0);
//     setQeBlur(1);
//     setQeRotation(0);
//     logAction("QELED Calibration", `Selected "${item.name}" for live image enhancement parameters.`);
//   };

//   const computedQELEDScore = useMemo(() => {
//     if (!activeQualityFile) return 100;
//     // Mock computed value logic depending on slider states
//     const penaltyBrightness = Math.abs(100 - qeBrightness) * 0.2;
//     const penaltyContrast = Math.abs(100 - qeContrast) * 0.15;
//     const penaltySkew = Math.abs(qeSkew) * 3;
//     const penaltyBlur = (qeBlur - 1) * 8;
//     const penaltyNoise = qeNoise * 0.5;

//     return Math.max(10, Math.round(100 - (penaltyBrightness + penaltyContrast + penaltySkew + penaltyBlur + penaltyNoise)));
//   }, [activeQualityFile, qeBrightness, qeContrast, qeSkew, qeBlur, qeNoise]);

//   const computedRecommendations = useMemo(() => {
//     const list: string[] = [];
//     if (qeSkew !== 0) list.push(`Auto-Rotate Deskew target by ${-qeSkew}°`);
//     if (qeBrightness < 80) list.push("Increase brightness parameters (+20%)");
//     if (qeContrast < 80) list.push("Amplify contrast thresholding values");
//     if (qeNoise > 10) list.push("Apply aggressive Adaptive Denoising");
//     if (list.length === 0) list.push("Excellent scan status. Ready for extraction.");
//     return list;
//   }, [qeSkew, qeBrightness, qeContrast, qeNoise]);

//   const submitToOCRPipeline = () => {
//     if (!activeQualityFile) return;

//     // Create a new empty book asset with status: processing
//     const newBook: BookAsset = {
//       id: activeQualityFile.id,
//       title: activeQualityFile.name.replace(/\.[^/.]+$/, ""),
//       author: "OCR Extracted Author",
//       publisher: "Syllabus Telemetry Press",
//       edition: "1st Edition",
//       language: "English",
//       category: "General Study",
//       examType: selectedExam,
//       year: new Date().getFullYear().toString(),
//       subjects: ["General Syllabus"],
//       chapters: [
//         {
//           id: `ch_gen_${Date.now()}`,
//           title: "Chapter 1: AI Extracted Blueprint Outline",
//           topics: ["Syllabus Mapping", "Formula Indices"],
//           notes: "# AI Study notes loading..."
//         }
//       ],
//       tags: ["AI Import", selectedExam],
//       pageCount: activeQualityFile.pageEstimate,
//       sizeBytes: activeQualityFile.sizeMB * 1024 * 1024,
//       isFavorite: false,
//       isPinned: false,
//       isArchived: false,
//       status: "processing",
//       progressStep: 0,
//       qualityScore: computedQELEDScore,
//       ocrConfidence: Math.round(computedQELEDScore * 0.98),
//       imageEnhancements: {
//         brightness: qeBrightness,
//         contrast: qeContrast,
//         sharpness: 100,
//         noise: qeNoise,
//         rotation: qeRotation,
//         skew: qeSkew
//       },
//       annotations: [],
//       flashcards: [],
//       mcqs: [],
//       formulas: [],
//       folder: "All",
//       updatedAt: new Date().toISOString()
//     };

//     const updatedLib = [newBook, ...library];
//     setLibrary(updatedLib);
//     saveToStorage(updatedLib);
//     setActivePipelineBookId(newBook.id);
//     setActiveBookId(newBook.id);

//     // Remove from upload queue
//     setUploadQueue((prev) => prev.filter((item) => item.id !== activeQualityFile.id));
//     setActiveQualityFile(null);

//     // Transition to pipeline tab and run simulation
//     setActiveTab("pipeline");
//     runPipelineSimulation(newBook);
//   };

//   // ==========================================
//   // OCR TELEMETRY PIPELINE STAGES
//   // ==========================================

//   const PIPELINE_STAGES = [
//     "Upload validation completed.",
//     "Began diagnostic image analysis.",
//     "Applying local pixel contrast enhancements.",
//     "Straightening detected skew angles.",
//     "Filtering ambient scan noise textures.",
//     "Scanning characters via AI OCR logic.",
//     "Analyzing document paragraph segments.",
//     "Synchronizing with Main Brain neural matrix framework.",
//     "Re-constructing syllabus tables structures.",
//     "Isolating mathematical LaTeX formula grids.",
//     "Mapping conceptual diagrams & node plots.",
//     "Structuring textual content outlines.",
//     "Assembling concepts into study cards.",
//     "Compiling revision guide Markdown templates.",
//     "Synchronization ready for dashboard."
//   ];

//   const runPipelineSimulation = (target: BookAsset) => {
//     setPipelineProgress(0);
//     setPipelineLogs([]);
    
//     let step = 0;
//     const interval = setInterval(() => {
//       step += 1;
//       setPipelineProgress(step);
//       setPipelineLogs((prev) => [...prev, `[TELEMETRY] ${PIPELINE_STAGES[step - 1]}`]);

//       setLibrary((curr) =>
//          curr.map((b) => {
//           if (b.id === target.id) {
//             return {
//               ...b,
//               progressStep: step,
//               status: step >= 15 ? "ready" : "processing"
//             };
//           }
//           return b;
//         })
//       );

//       if (step >= 15) {
//         clearInterval(interval);
//         logAction("Pipeline Success", `Finished AI document sync for: ${target.title}`, target.id, target.title);
//         // Feed mock questions, flashcards, formulas
//         setLibrary((curr) =>
//           curr.map((b) => {
//             if (b.id === target.id) {
//               return {
//                 ...b,
//                 chapters: [
//                   {
//                     id: "ch_1",
//                     title: "Chapter 1: Foundations & Systems",
//                     topics: ["Syllabus Mapping", "Optimization Matrix"],
//                     notes: `# Chapter 1 Revision Notes\nThis is a standard revision outline produced by the AI Knowledge Engine.\n\n- **Formula target**: \\Delta x \\cdot \\Delta p \\ge \\frac{\\hbar}{2}\n- **Syllabus Sync**: 100% calibration coverage successfully saved.`
//                   }
//                 ],
//                 flashcards: MOCK_FLASHCARDS_DEFAULT,
//                 mcqs: MOCK_MCQS_DEFAULT,
//                 formulas: MOCK_FORMULAS_DEFAULT
//               };
//             }
//             return b;
//           })
//         );

//         setLibrary((currLib) => {
//           saveToStorage(currLib);
//           return currLib;
//         });
//       }
//     }, 1200);
//   };

//   // ==========================================
//   // LIBRARY & COMPUTE FILTERS (CRUD & FOLDERS)
//   // ==========================================

//   const filteredLibrary = useMemo(() => {
//     let list = library.filter((b) => {
//       const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.author.toLowerCase().includes(searchQuery.toLowerCase());
//       const matchesFolder = activeFolder === "All" || b.folder === activeFolder;
//       return matchesSearch && matchesFolder;
//     });

//     if (sortBy === "title") {
//       list.sort((a, b) => a.title.localeCompare(b.title));
//     } else if (sortBy === "date") {
//       list.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
//     } else if (sortBy === "score") {
//       list.sort((a, b) => b.qualityScore - a.qualityScore);
//     }
//     return list;
//   }, [library, searchQuery, activeFolder, sortBy]);

//   const duplicateBook = (bookId: string) => {
//     const book = library.find((b) => b.id === bookId);
//     if (!book) return;

//     const dup: BookAsset = {
//       ...book,
//       id: `book_dup_${Date.now()}`,
//       title: `${book.title} (Copy)`,
//       updatedAt: new Date().toISOString()
//     };

//     const updated = [dup, ...library];
//     setLibrary(updated);
//     saveToStorage(updated);
//     logAction("Asset Duplicated", `Created a backup copy of "${book.title}".`, dup.id, dup.title);
//   };

//   const deleteBook = (bookId: string) => {
//     const book = library.find((b) => b.id === bookId);
//     if (!book) return;
//     if (!confirm(`Are you sure you want to delete the study asset "${book.title}"?`)) return;

//     const updated = library.filter((b) => b.id !== bookId);
//     setLibrary(updated);
//     saveToStorage(updated);
//     logAction("Asset Deleted", `Removed "${book.title}" from library storage.`, bookId, book.title);

//     if (activeBookId === bookId) {
//       setActiveBookId(updated[0]?.id || null);
//     }
//   };

//   const moveBookFolder = (bookId: string, folderName: string) => {
//     const updated = library.map((b) => {
//       if (b.id === bookId) {
//         return { ...b, folder: folderName };
//       }
//       return b;
//     });
//     setLibrary(updated);
//     saveToStorage(updated);
//     logAction("Asset Moved", `Relocated book file path to folder: ${folderName}`);
//   };

//   const togglePinBook = (bookId: string) => {
//     const updated = library.map((b) => {
//       if (b.id === bookId) {
//         return { ...b, isPinned: !b.isPinned };
//       }
//       return b;
//     });
//     setLibrary(updated);
//     saveToStorage(updated);
//   };

//   const toggleFavoriteBook = (bookId: string) => {
//     const updated = library.map((b) => {
//       if (b.id === bookId) {
//         return { ...b, isFavorite: !b.isFavorite };
//       }
//       return b;
//     });
//     setLibrary(updated);
//     saveToStorage(updated);
//   };

//   // --- Compare Mode Selector ---
//   const toggleCompareSelect = (bookId: string) => {
//     setCompareBookIds((prev) => {
//       if (prev.includes(bookId)) return prev.filter((id) => id !== bookId);
//       if (prev.length >= 2) return [prev[1], bookId];
//       return [...prev, bookId];
//     });
//   };

//   // ==========================================
//   // NOTES WORKSPACE EDITORS
//   // ==========================================

//   const handleRoughNotesChange = (text: string) => {
//     setRoughNotes(text);
//     localStorage.setItem("ef_knowledge_rough_notes", text);
//   };

//   const handleSaveMetadata = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!activeBook) return;
//     const formEl = e.currentTarget as HTMLFormElement;
//     const formData = new FormData(formEl);
//     const titleVal = formData.get("title") as string;
//     const authorVal = formData.get("author") as string;

//     const updated = library.map((b) => {
//       if (b.id === activeBook.id) {
//         return { ...b, title: titleVal, author: authorVal };
//       }
//       return b;
//     });

//     updateLibraryState(updated);
//     setEditMetaMode(false);
//     logAction("Metadata Updated", `Renamed asset metadata to "${titleVal}".`);
//   };

//   const handleNotesChange = (text: string) => {
//     if (!activeBook) return;
//     const updatedChapters = [...activeBook.chapters];
//     if (updatedChapters[activeChapterIndex]) {
//       updatedChapters[activeChapterIndex] = {
//         ...updatedChapters[activeChapterIndex],
//         notes: text
//       };
//     }
//     const updated = library.map((b) => {
//       if (b.id === activeBook.id) {
//         return { ...b, chapters: updatedChapters };
//       }
//       return b;
//     });
//     updateLibraryState(updated);
//   };

//   const insertMarkdown = (prefix: string, suffix: string = "") => {
//     const el = notesTextareaRef.current;
//     if (!el) return;
//     const start = el.selectionStart;
//     const end = el.selectionEnd;
//     const text = el.value;
//     const selected = text.substring(start, end);
//     const before = text.substring(0, start);
//     const after = text.substring(end, text.length);
//     const newVal = before + prefix + selected + suffix + after;
//     handleNotesChange(newVal);
    
//     // Reset focus & cursor selection
//     setTimeout(() => {
//       el.focus();
//       el.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
//     }, 50);
//   };

//   const renderMarkdownToHTML = (md: string) => {
//     if (!md) return <p className="text-slate-400 italic">Start writing to see the preview layout...</p>;
//     const lines = md.split("\n");
//     let inCode = false;
    
//     return lines.map((line, i) => {
//       if (line.trim().startsWith("```")) {
//         inCode = !inCode;
//         return null;
//       }
//       if (inCode) {
//         return (
//           <pre key={i} className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[10px] my-2 overflow-x-auto">
//             <code>{line}</code>
//           </pre>
//         );
//       }
//       if (line.startsWith("# ")) {
//         return <h1 key={i} className="text-lg font-black text-slate-800 mt-4 mb-2 uppercase tracking-wide border-b pb-1">{line.replace("# ", "")}</h1>;
//       }
//       if (line.startsWith("## ")) {
//         return <h2 key={i} className="text-xs font-extrabold text-indigo-700 mt-3 mb-1 uppercase tracking-wider">{line.replace("## ", "")}</h2>;
//       }
//       if (line.startsWith("- ")) {
//         return (
//           <ul key={i} className="list-disc pl-5 my-1 text-[11px] text-slate-600 font-bold">
//             <li>{line.replace("- ", "")}</li>
//           </ul>
//         );
//       }
//       if (!line.trim()) return <div key={i} className="h-2" />;
//       return (
//         <p key={i} className="text-[11px] text-slate-650 leading-relaxed font-semibold my-1.5">
//           {line}
//         </p>
//       );
//     });
//   };

//   const triggerNoteTemplateChange = (templateType: string) => {
//     setSelectedNoteTemplate(templateType);
//     if (!activeBook) return;
//     let text = "";
//     if (templateType === "Exam Notes") {
//       text = `# Exam Notes: ${activeBook.title}\n\n## Quick Calibration Rules\n- **Formula Sync**: High priority equation maps.\n- **Weightage**: Critical syllabus vectors.`;
//     } else if (templateType === "Cheat Sheet") {
//       text = `# Cheat Sheet: ${activeBook.title}\n\n- E = m c^2\n- F = m a\n- Matrix Calibration parameters active.`;
//     } else {
//       text = `# Detailed Study Guide\n\nOutline summaries and chapter notes...`;
//     }
//     handleNotesChange(text);
//     logAction("Notes Layout Updated", `Switched note format template to: ${templateType}`);
//   };

//   const handleSaveChapter = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!activeBook) return;
//     if (!chapterForm.title.trim()) return;

//     const newChapter: Chapter = {
//       id: `ch_${Date.now()}`,
//       title: chapterForm.title,
//       topics: chapterForm.topics ? chapterForm.topics.split(",").map((t) => t.trim()) : [],
//       notes: chapterForm.notes || `# ${chapterForm.title}\nStart notes here...`
//     };

//     let updatedChapters = [...activeBook.chapters];
//     if (editingChapterIdx !== null) {
//       updatedChapters[editingChapterIdx] = newChapter;
//       logAction("Chapter Updated", `Edited details for chapter "${newChapter.title}"`);
//     } else {
//       updatedChapters.push(newChapter);
//       logAction("Chapter Added", `Created chapter "${newChapter.title}" in syllabus framework.`);
//     }

//     const updated = library.map((b) => {
//       if (b.id === activeBook.id) {
//         return { ...b, chapters: updatedChapters };
//       }
//       return b;
//     });
//     setLibrary(updated);
//     saveToStorage(updated);
//     setShowChapterModal(false);
//     setEditingChapterIdx(null);
//     setChapterForm({ title: "", topics: "", notes: "" });
//   };

//   const deleteChapter = (idx: number) => {
//     if (!activeBook) return;
//     if (!confirm("Remove this chapter outline?")) return;

//     const updatedChapters = activeBook.chapters.filter((_, i) => i !== idx);
//     const updated = library.map((b) => {
//       if (b.id === activeBook.id) {
//         return { ...b, chapters: updatedChapters };
//       }
//       return b;
//     });
//     setLibrary(updated);
//     saveToStorage(updated);
//     logAction("Chapter Removed", "Deleted chapter partition nodes.");
//     setActiveChapterIndex(Math.max(0, updatedChapters.length - 1));
//   };

//   // ==========================================
//   // ACTIVE RECALL FLASHCARDS & QUIZ HANDLERS
//   // ==========================================

//   const handleSaveQA = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!activeBook) return;

//     const updated = library.map((b) => {
//       if (b.id === activeBook.id) {
//         if (qaFormType === "flashcard") {
//           if (!flashcardForm.question.trim()) return b;
//           let list = [...b.flashcards];
//           const newCard: Flashcard = {
//             id: `fc_${Date.now()}`,
//             question: flashcardForm.question,
//             answer: flashcardForm.answer,
//             level: "unrated"
//           };
//           if (editingQAIdx !== null) {
//             list[editingQAIdx] = newCard;
//           } else {
//             list.push(newCard);
//           }
//           logAction("Flashcard Saved", "Updated flashcard active recall questions bank.");
//           return { ...b, flashcards: list };
//         } else {
//           if (!mcqForm.question.trim()) return b;
//           let list = [...b.mcqs];
//           const newMCQ: MCQ = {
//             id: `mcq_${Date.now()}`,
//             question: mcqForm.question,
//             options: [mcqForm.option0, mcqForm.option1, mcqForm.option2, mcqForm.option3].filter(Boolean),
//             answerIndex: mcqForm.answerIndex
//           };
//           if (editingQAIdx !== null) {
//             list[editingQAIdx] = newMCQ;
//           } else {
//             list.push(newMCQ);
//           }
//           logAction("Quiz Saved", "Created a new test option question for examination sync.");
//           return { ...b, mcqs: list };
//         }
//       }
//       return b;
//     });

//     setLibrary(updated);
//     saveToStorage(updated);
//     setShowQAFormModal(false);
//     setEditingQAIdx(null);
//     setFlashcardForm({ question: "", answer: "" });
//     setMcqForm({ question: "", option0: "", option1: "", option2: "", option3: "", answerIndex: 0 });
//   };

//   const handleSelectMCQAnswer = (mcqIdx: number, optIdx: number) => {
//     if (!activeBook) return;
//     const updatedMCQs = activeBook.mcqs.map((q, idx) => {
//       if (idx === mcqIdx) {
//         return { ...q, selectedAnswer: optIdx };
//       }
//       return q;
//     });

//     const answered = updatedMCQs.filter((q) => q.selectedAnswer !== undefined);
//     const correct = answered.filter((q) => q.selectedAnswer === q.answerIndex);
//     const accuracy = answered.length > 0 ? Math.round((correct.length / answered.length) * 100) : activeBook.qualityScore;

//     const updated = library.map((b) => {
//       if (b.id === activeBook.id) {
//         return {
//           ...b,
//           mcqs: updatedMCQs,
//           qualityScore: accuracy
//         };
//       }
//       return b;
//     });

//     setLibrary(updated);
//     saveToStorage(updated);
//     setMcqCalibrationScore(accuracy);
//     logAction("Calibration Attempt", `Calibration score evaluated at ${accuracy}% accuracy.`, activeBook.id, activeBook.title);
//   };

//   const deleteQA = (type: "flashcard" | "mcq", idx: number) => {
//     if (!activeBook) return;
//     if (!confirm("Are you sure you want to remove this QA item?")) return;

//     const updated = library.map((b) => {
//       if (b.id === activeBook.id) {
//         if (type === "flashcard") {
//           return { ...b, flashcards: b.flashcards.filter((_, i) => i !== idx) };
//         } else {
//           return { ...b, mcqs: b.mcqs.filter((_, i) => i !== idx) };
//         }
//       }
//       return b;
//     });

//     setLibrary(updated);
//     saveToStorage(updated);
//     logAction("QA Removed", "Deleted active study items from QA structures.");
//   };

//   // ==========================================
//   // MOCK SVG INTERACTIVE MINDMAP GRAPH
//   // ==========================================

//   const [selectedMindNode, setSelectedMindNode] = useState<string | null>("core");

//   // ==========================================
//   // EXPORTS INTEGRATOR
//   // ==========================================

//   const handleDownloadNotes = (format: string) => {
//     if (!activeBook) return;
//     alert(`Compiling document: Initializing ${format.toUpperCase()} assembly pipeline for "${activeBook.title}".`);
//     logAction("Download Notes", `Exported study guide notes to local disk as .${format.toLowerCase()}`);
//   };

//   // ==========================================
//   // PIPELINE PAGINATION
//   // ==========================================

//   const [libPage, setLibPage] = useState(1);
//   const libItemsPerPage = 6;
//   const totalLibPages = Math.ceil(filteredLibrary.length / libItemsPerPage);

//   const paginatedLibrary = useMemo(() => {
//     const start = (libPage - 1) * libItemsPerPage;
//     return filteredLibrary.slice(start, start + libItemsPerPage);
//   }, [filteredLibrary, libPage]);

//   // QA Paginated
//   const [qaPage, setQaPage] = useState(1);
//   const qaItemsPerPage = 4;
  
//   const paginatedFlashcards = useMemo(() => {
//     if (!activeBook) return [];
//     const start = (qaPage - 1) * qaItemsPerPage;
//     return activeBook.flashcards.slice(start, start + qaItemsPerPage);
//   }, [activeBook, qaPage]);

//   const paginatedMCQs = useMemo(() => {
//     if (!activeBook) return [];
//     const start = (qaPage - 1) * qaItemsPerPage;
//     return activeBook.mcqs.slice(start, start + qaItemsPerPage);
//   }, [activeBook, qaPage]);

//   const totalFlashcardPages = activeBook ? Math.ceil(activeBook.flashcards.length / qaItemsPerPage) : 0;
//   const totalMCQPages = activeBook ? Math.ceil(activeBook.mcqs.length / qaItemsPerPage) : 0;

//   useEffect(() => {
//     setLibPage(1);
//   }, [searchQuery, activeFolder, sortBy]);

//   useEffect(() => {
//     setQaPage(1);
//   }, [qaSubTab, activeBookId]);

//   return (
//     <div className="space-y-6">
//       {/* ==========================================
//           HEADER PORTAL
//           ========================================== */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white/70 border border-white/60 backdrop-blur-md rounded-[24px] shadow-sm">
//         <div className="space-y-1">
//           <div className="flex items-center gap-2">
//             <span className="p-1 bg-amber-500/10 border border-amber-500/25 rounded-lg text-amber-600">
//               <Lucide.BrainCircuit className="w-5 h-5 animate-pulse" />
//             </span>
//             <h1 className="text-xl font-black text-slate-800 tracking-tight">AI Knowledge Engine</h1>
//           </div>
//           <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
//             Transform textbooks, papers, and notes into customized structured brains
//           </p>
//         </div>

//         {/* Global Nav shortcuts */}
//         <div className="flex items-center gap-2 flex-wrap">
//           {([
//             { id: "exams", label: "1. Exam target", icon: Lucide.Compass },
//             { id: "upload", label: "2. Studio Upload", icon: Lucide.UploadCloud },
//             { id: "library", label: "3. Library", icon: Lucide.FolderOpen },
//             { id: "notes", label: "4. Notes Workspace", icon: Lucide.FileText },
//             { id: "flashcards", label: "5. Active Recall", icon: Lucide.BrainCircuit },
//             { id: "analytics", label: "6. Analytics", icon: Lucide.TrendingUp }
//           ] as const).map((tab) => {
//             const Icon = tab.icon;
//             const isSel = activeTab === tab.id;
//             return (
//               <button
//                 key={tab.id}
//                 onClick={() => navigateToTab(tab.id)}
//                 className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
//                   isSel
//                     ? "bg-slate-800 text-white font-extrabold shadow-sm"
//                     : "bg-slate-50 hover:bg-slate-100 text-slate-550 border border-slate-200/50"
//                 }`}
//               >
//                 <Icon className="w-3.5 h-3.5" />
//                 {tab.label}
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {/* ==========================================
//           DASHBOARD PANEL ROUTER
//           ========================================== */}
//       <div className="min-h-[520px]">
//         {/* --- EXAMS TARGET SELECTOR (STEP 1) --- */}
//         {activeTab === "exams" && (
//           <div className="space-y-6">
//             <div className="max-w-2xl mx-auto text-center space-y-2">
//               <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider">Choose Target Examination</h2>
//               <p className="text-xs text-slate-400 max-w-md mx-auto">
//                 Calibrate study guides, question weightage guidelines, and telemetry parameters to match your target exam specifications.
//               </p>
//             </div>

//             {/* Exam search & category tabs */}
//             <div className="max-w-4xl mx-auto space-y-4">
//               <div className="flex flex-col md:flex-row gap-3">
//                 <div className="relative flex-1">
//                   <Lucide.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
//                   <input
//                     type="text"
//                     value={examSearch}
//                     onChange={(e) => setExamSearch(e.target.value)}
//                     placeholder="Search engineering, medical, civil exams..."
//                     className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-[20px] text-xs outline-none focus:border-amber-400 shadow-sm"
//                   />
//                 </div>
//                 <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 md:pb-0">
//                   {EXAM_CATEGORIES.map((cat) => (
//                     <button
//                       key={cat.id}
//                       onClick={() => setExamCategory(cat.id)}
//                       className={`px-3 py-2 rounded-xl text-xs font-black uppercase transition cursor-pointer whitespace-nowrap ${
//                         examCategory === cat.id ? "bg-amber-500 text-white" : "bg-white border border-slate-200 text-slate-500"
//                       }`}
//                     >
//                       {cat.label}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Exams Grid */}
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                 {filteredExams.map((exam) => {
//                   const isActive = selectedExam === exam.name;
//                   return (
//                     <div
//                       key={exam.id}
//                       onClick={() => setSelectedExam(exam.name)}
//                       className={`p-5 rounded-[22px] border transition relative cursor-pointer flex flex-col justify-between min-h-[140px] bg-white ${
//                         isActive ? "border-amber-500 ring-1 ring-amber-400/50 shadow-md" : "border-slate-200/80 hover:border-slate-300"
//                       }`}
//                     >
//                       <div className="space-y-1.5">
//                         <div className="flex justify-between items-start">
//                           <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
//                             exam.trending ? "bg-indigo-50 text-indigo-650" : "bg-slate-50 text-slate-400"
//                           }`}>
//                             {exam.trending ? "Trending" : "Exam"}
//                           </span>
//                           <button
//                             onClick={(e) => { e.stopPropagation(); toggleExamFavorite(exam.id); }}
//                             className={`p-1 rounded-md transition ${exam.favorite ? "text-amber-500 hover:text-amber-600" : "text-slate-350 hover:text-slate-500"}`}
//                           >
//                             <Lucide.Star className="w-3.5 h-3.5 fill-current" />
//                           </button>
//                         </div>
//                         <h4 className="font-extrabold text-sm text-slate-800">{exam.name}</h4>
//                         <p className="text-[10px] text-slate-450 font-medium line-clamp-2 leading-relaxed">{exam.description}</p>
//                       </div>

//                       <div className="pt-2 flex justify-between items-center border-t border-slate-100">
//                         <span className="text-[9px] font-black uppercase text-slate-400">{exam.category}</span>
//                         {isActive && <span className="text-[10px] font-black text-amber-600 flex items-center gap-0.5">Active Target <Lucide.Check className="w-3 h-3" /></span>}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               {filteredExams.length === 0 && (
//                 <div className="py-12 text-center bg-white border border-slate-200 rounded-[24px]">
//                   <Lucide.HelpCircle className="w-10 h-10 text-slate-200 mx-auto mb-2" />
//                   <p className="text-xs text-slate-400">No exams matches found in database.</p>
//                 </div>
//               )}
//             </div>

//             <div className="flex justify-center pt-4">
//               <button
//                 onClick={() => navigateToTab("upload")}
//                 className="btn-primary py-3 px-6 text-xs font-black uppercase flex items-center gap-1.5 shadow-md rounded-2xl cursor-pointer"
//               >
//                 Go to Upload Studio <Lucide.ArrowRight className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         )}

//         {/* --- STUDIO UPLOAD WORKSPACE (STEP 2 + QELED ANALYZER) --- */}
//         {activeTab === "upload" && (
//           <div className="space-y-6">
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               {/* Left Column: Dropzone & Upload Queue */}
//               <div className="lg:col-span-2 space-y-6">
//                 {/* Drag-Drop Zone */}
//                 <div
//                   onDragOver={handleDragOver}
//                   onDragLeave={() => setIsDragging(false)}
//                   onDrop={handleDrop}
//                   className={`border-2 border-dashed rounded-[24px] p-8 text-center bg-white transition-all cursor-pointer flex flex-col justify-center items-center space-y-4 ${
//                     isDragging ? "border-amber-500 bg-amber-50/10" : "border-slate-200 hover:border-slate-350"
//                   }`}
//                   onClick={() => fileInputRef.current?.click()}
//                 >
//                   <input
//                     type="file"
//                     ref={fileInputRef}
//                     multiple
//                     onChange={(e) => e.target.files && handleFilesChosen(e.target.files)}
//                     className="hidden"
//                     accept=".pdf,.png,.jpg,.jpeg,.webp,.tiff,.docx,.pptx,.txt,.md,.zip"
//                   />
//                   <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 shadow-xs">
//                     <Lucide.UploadCloud className="w-6 h-6 text-indigo-550" />
//                   </div>
//                   <div>
//                     <h4 className="font-extrabold text-sm text-slate-800">Drag and drop syllabus study logs here</h4>
//                     <p className="text-[10px] text-slate-455 mt-1 uppercase font-bold tracking-wider">
//                       Supports PDF, DOCX, ZIP, PPTX, or Images up to 50MB
//                     </p>
//                   </div>

//                   {/* Utilities Action Shortcut links */}
//                   <div className="flex items-center gap-2 pt-2 text-xs flex-wrap justify-center border-t border-slate-100 w-full">
//                     <button
//                       onClick={(e) => { e.stopPropagation(); triggerClipboardPaste(); }}
//                       className="px-3 py-1.5 hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase text-slate-500 flex items-center gap-1 border border-slate-150 transition cursor-pointer"
//                     >
//                       <Lucide.Copy className="w-3.5 h-3.5" /> Paste File
//                     </button>
//                     <button
//                       onClick={(e) => { e.stopPropagation(); startCameraCapture(); }}
//                       className="px-3 py-1.5 hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase text-slate-500 flex items-center gap-1 border border-slate-150 transition cursor-pointer"
//                     >
//                       <Lucide.Camera className="w-3.5 h-3.5" /> Camera Capture
//                     </button>
//                   </div>
//                 </div>

//                 {/* Webcam capture interface */}
//                 {cameraActive && (
//                   <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
//                     <div className="bg-white rounded-3xl p-6 max-w-md w-full text-center space-y-4">
//                       <h3 className="font-black text-slate-800 text-sm uppercase">Align Document to Camera</h3>
//                       <div className="aspect-video bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl relative overflow-hidden">
//                         {cameraCountdown !== null ? `Capturing in ${cameraCountdown}...` : "Live Feed"}
//                       </div>
//                       <div className="flex gap-2">
//                         <button onClick={() => setCameraActive(false)} className="flex-1 bg-slate-100 py-2.5 rounded-xl text-xs font-bold text-slate-650 cursor-pointer">Cancel</button>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {cameraPreview && (
//                   <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
//                     <div className="bg-white rounded-3xl p-6 max-w-md w-full text-center space-y-4">
//                       <h3 className="font-black text-slate-800 text-sm uppercase">Preview Capture</h3>
//                       <img src={cameraPreview} alt="Webcam notes preview" className="rounded-2xl max-h-[300px] w-full object-cover" />
//                       <div className="flex gap-2">
//                         <button onClick={() => setCameraPreview(null)} className="flex-1 bg-slate-100 py-2.5 rounded-xl text-xs font-bold text-slate-655 cursor-pointer">Retake</button>
//                         <button onClick={acceptCameraSnapshot} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer">Add to Queue</button>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Pre-process Upload Queue */}
//                 {uploadQueue.length > 0 && (
//                   <div className="space-y-3 bg-white border border-slate-200 rounded-[24px] p-5">
//                     <h3 className="text-xs font-black uppercase text-slate-455 tracking-wider">Telemetry Upload Queue ({uploadQueue.length})</h3>
//                     <div className="space-y-2">
//                       {uploadQueue.map((item) => {
//                         const isSelected = activeQualityFile?.id === item.id;
//                         return (
//                           <div
//                             key={item.id}
//                             onClick={() => loadFileInQELED(item)}
//                             className={`p-3.5 rounded-2xl border transition cursor-pointer flex justify-between items-center ${
//                               isSelected ? "border-amber-500 bg-amber-50/10" : "border-slate-100 hover:bg-slate-55"
//                             }`}
//                           >
//                             <div className="space-y-1">
//                               <h4 className="font-extrabold text-xs text-slate-800 line-clamp-1">{item.name}</h4>
//                               <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase">
//                                 <span>{item.ext.toUpperCase()}</span>
//                                 <span>{item.sizeMB} MB</span>
//                                 <span className="text-indigo-600">~{item.pageEstimate} pages</span>
//                               </div>
//                               {/* Validation Warnings */}
//                               {item.validations.map((w: string) => (
//                                 <span key={w} className="inline-block mt-1 mr-1 text-[8px] bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
//                                   {w.replace(/_/g, " ")}
//                                 </span>
//                               ))}
//                             </div>
//                             <button className="px-3 py-1.5 bg-slate-55 hover:bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded-xl border border-slate-200/50 transition">
//                               Calibrate
//                             </button>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Right Column: QELED Quality Optimizer */}
//               <div className="space-y-6">
//                 <div className="bg-white border border-slate-200 rounded-[24px] p-5 space-y-4">
//                   <div className="border-b pb-3">
//                     <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
//                       <Lucide.SlidersHorizontal className="w-4 h-4 text-amber-500" /> QELED Quality Engine
//                     </h3>
//                     <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider mt-0.5">Live image pre-processing optimizer</p>
//                   </div>

//                   {activeQualityFile ? (
//                     <div className="space-y-4 text-xs">
//                       {/* Quality Score display */}
//                       <div className="flex justify-between items-center bg-slate-55 border border-slate-150 p-3 rounded-2xl">
//                         <span className="font-bold text-slate-500 uppercase text-[10px]">Computed Score</span>
//                         <span className={`text-sm font-black ${
//                           computedQELEDScore > 85 ? "text-emerald-600" : computedQELEDScore > 65 ? "text-amber-500" : "text-red-500"
//                         }`}>
//                           {computedQELEDScore}% Readability
//                         </span>
//                       </div>

//                       {/* Sliders */}
//                       <div className="space-y-3">
//                         <div>
//                           <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 mb-1">
//                             <span>Brightness</span>
//                             <span>{qeBrightness}%</span>
//                           </div>
//                           <input
//                             type="range"
//                             min="50"
//                             max="150"
//                             value={qeBrightness}
//                             onChange={(e) => setQeBrightness(parseInt(e.target.value))}
//                             className="w-full accent-amber-500 cursor-pointer"
//                           />
//                         </div>

//                         <div>
//                           <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 mb-1">
//                             <span>Contrast</span>
//                             <span>{qeContrast}%</span>
//                           </div>
//                           <input
//                             type="range"
//                             min="50"
//                             max="150"
//                             value={qeContrast}
//                             onChange={(e) => setQeContrast(parseInt(e.target.value))}
//                             className="w-full accent-amber-500 cursor-pointer"
//                           />
//                         </div>

//                         <div>
//                           <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 mb-1">
//                             <span>Deskew Angle</span>
//                             <span>{qeSkew}°</span>
//                           </div>
//                           <input
//                             type="range"
//                             min="-15"
//                             max="15"
//                             value={qeSkew}
//                             onChange={(e) => setQeSkew(parseInt(e.target.value))}
//                             className="w-full accent-amber-500 cursor-pointer"
//                           />
//                         </div>

//                         <div>
//                           <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 mb-1">
//                             <span>Adaptive Denoise</span>
//                             <span>{qeNoise}px</span>
//                           </div>
//                           <input
//                             type="range"
//                             min="0"
//                             max="20"
//                             value={qeNoise}
//                             onChange={(e) => setQeNoise(parseInt(e.target.value))}
//                             className="w-full accent-amber-500 cursor-pointer"
//                           />
//                         </div>
//                       </div>

//                       {/* Recommendations list */}
//                       <div className="bg-slate-55 border border-slate-150 p-3 rounded-2xl space-y-1.5">
//                         <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">System Recommendations</span>
//                         <div className="space-y-1">
//                           {computedRecommendations.map((rec, index) => (
//                             <span key={index} className="text-[10px] text-slate-500 font-bold block flex items-center gap-1">
//                               <Lucide.CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> {rec}
//                             </span>
//                           ))}
//                         </div>
//                       </div>

//                       <button
//                         onClick={submitToOCRPipeline}
//                         className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-2xl font-black uppercase text-xs shadow-md transition cursor-pointer"
//                       >
//                         Extract Knowledge
//                       </button>
//                     </div>
//                   ) : (
//                     <div className="py-12 text-center text-slate-400">
//                       <Lucide.SlidersHorizontal className="w-8 h-8 mx-auto mb-2 text-slate-200" />
//                       <p className="text-[10px] uppercase font-bold tracking-wider">Select a file from upload queue to optimize scanner attributes.</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* --- ANIMATED OCR TELEMETRY PIPELINE (STEP 3) --- */}
//         {activeTab === "pipeline" && (
//           <div className="max-w-6xl mx-auto space-y-6">
//             <div className="text-center space-y-1 bg-white border border-slate-200 p-5 rounded-[24px] shadow-sm">
//               <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">AI Pipeline Telemetry Node</h3>
//               <p className="text-[10px] text-slate-450 font-bold uppercase">Calibrating textual frameworks and structural indices</p>
              
//               {/* Progress bar */}
//               <div className="w-full bg-slate-100 h-2.5 rounded-full mt-4 overflow-hidden border border-slate-200/50">
//                 <div className="bg-gradient-to-r from-amber-500 to-indigo-655 h-full transition-all duration-300" style={{ width: `${(pipelineProgress / 15) * 100}%` }} />
//               </div>
//               <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase mt-1">
//                 <span>Stage {pipelineProgress} of 15</span>
//                 <span>{Math.round((pipelineProgress / 15) * 100)}%</span>
//               </div>
//             </div>

//             {/* Stepper display, Live Logs, and Live Scan Bounding Boxes */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//               {/* Steps timeline list */}
//               <div className="bg-white border border-slate-200 p-5 rounded-[24px] max-h-[360px] overflow-y-auto pr-2 scrollbar-thin">
//                 <div className="space-y-3.5">
//                   {PIPELINE_STAGES.map((s, idx) => {
//                     const isCompleted = pipelineProgress > idx;
//                     const isActive = pipelineProgress === idx + 1;
//                     return (
//                       <div key={idx} className={`p-2.5 rounded-2xl border transition flex items-start gap-2.5 ${
//                         isCompleted ? "bg-emerald-50/20 border-emerald-100 text-slate-600" :
//                         isActive ? "bg-indigo-50/40 border-indigo-200 text-slate-800 ring-1 ring-indigo-300/40" :
//                         "bg-white border-slate-100 text-slate-400"
//                       }`}>
//                         <div className="mt-0.5">
//                           {isCompleted ? <Lucide.CheckCircle2 className="w-4 h-4 text-emerald-500" /> :
//                            isActive ? <Lucide.Loader className="w-4 h-4 text-indigo-600 animate-spin" /> :
//                            <Lucide.Circle className="w-4 h-4 text-slate-200" />}
//                         </div>
//                         <div className="space-y-0.5 text-xs">
//                           <h4 className={`font-black uppercase text-[10px] tracking-wider ${isActive ? "text-indigo-655" : ""}`}>Stage #{idx + 1}</h4>
//                           <p className="font-semibold text-slate-500">{s}</p>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>

//               {/* Document Scanner Visual Layout */}
//               <div className="bg-white border border-slate-200 p-5 rounded-[24px] flex flex-col justify-between min-h-[300px]">
//                 <div className="border-b pb-2 flex justify-between items-center">
//                   <h4 className="font-black text-slate-800 text-[10px] uppercase tracking-wider">Live Document Scan</h4>
//                   <span className="text-[8px] font-black uppercase text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded-md">Page #1</span>
//                 </div>

//                 <div className="flex-1 bg-slate-50 border border-slate-150 rounded-2xl p-4.5 relative overflow-hidden flex flex-col justify-between mt-3 font-mono text-[9px] text-slate-400 select-none">
//                   {/* Clean Image / Deskew Stage Simulation */}
//                   <div 
//                     className="space-y-2 transition-transform duration-500 h-full flex flex-col justify-between"
//                     style={{ 
//                       transform: `rotate(${pipelineProgress < 4 ? 4 : 0}deg) scale(${pipelineProgress < 3 ? 0.95 : 1})`,
//                       filter: pipelineProgress < 5 ? "blur(1.5px)" : "none"
//                     }}
//                   >
//                     {/* Bounding box overlays */}
//                     <div className="space-y-2">
//                       <div className={`p-2 border rounded-lg transition-all duration-300 ${
//                         pipelineProgress >= 7 ? "border-emerald-400 bg-emerald-500/10 text-emerald-800" : "border-slate-200 bg-white"
//                       }`}>
//                         <span className="font-extrabold text-[8px] uppercase tracking-wider block">Text Block #1</span>
//                         {pipelineProgress >= 11 ? "Quantum mechanics describes particles behavior..." : "|||||||||||| |||||||| ||||||||||"}
//                       </div>

//                       <div className={`p-2 border rounded-lg transition-all duration-300 ${
//                         pipelineProgress >= 8 ? "border-indigo-400 bg-indigo-500/10 text-indigo-850" : "border-slate-200 bg-white"
//                       }`}>
//                         <span className="font-extrabold text-[8px] uppercase tracking-wider block">Syllabus Table Grid</span>
//                         {pipelineProgress >= 8 ? "Table 1.1: Calibration Matrix synced." : "------ ------ ------ ------"}
//                       </div>

//                       <div className={`p-2 border rounded-lg transition-all duration-300 ${
//                         pipelineProgress >= 9 ? "border-amber-400 bg-amber-500/10 text-amber-800 font-bold" : "border-slate-200 bg-white"
//                       }`}>
//                         <span className="font-extrabold text-[8px] uppercase tracking-wider block">LaTeX Equation Formula</span>
//                         {pipelineProgress >= 9 ? "T_s = \\sum_{i=1}^n \\frac{\\alpha_i \\cdot C_i}{\\Delta t_i}" : "============= ========"}
//                       </div>
//                     </div>

//                     {/* Stats feedback */}
//                     <div className="border-t border-slate-200/80 pt-2 grid grid-cols-2 gap-1.5 text-[8px] font-black uppercase text-slate-500">
//                       <div>Words: <span className="text-indigo-650 font-bold">{pipelineProgress >= 11 ? "1,250" : "0"}</span></div>
//                       <div>DPI Density: <span className="text-indigo-650 font-bold">300 DPI</span></div>
//                       <div>Confidence: <span className="text-indigo-650 font-bold">{pipelineProgress >= 6 ? "98.2%" : "0%"}</span></div>
//                       <div>Formulas: <span className="text-indigo-650 font-bold">{pipelineProgress >= 9 ? "1" : "0"}</span></div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Live console logging */}
//               <div className="md:col-span-2 bg-slate-900 text-slate-350 p-5 rounded-[24px] font-mono text-[9px] leading-relaxed max-h-[360px] overflow-y-auto space-y-1">
//                 <span className="text-[10px] text-amber-500 font-extrabold uppercase block mb-2 border-b border-slate-800 pb-1 flex items-center gap-1.5"><Lucide.Activity className="w-3.5 h-3.5" /> Pipeline Streams</span>
//                 {pipelineLogs.map((log, index) => (
//                   <p key={index} className="line-clamp-2">{log}</p>
//                 ))}
//                 {pipelineProgress < 15 && (
//                   <div className="flex items-center gap-1 text-slate-500 mt-2 font-bold animate-pulse">
//                     <span>&gt;_ Calibrating matrix arrays...</span>
//                   </div>
//                 )}
//                 {pipelineProgress >= 15 && (
//                   <span className="text-emerald-500 font-bold block mt-3">SYSTEM SYNC STABLE. TRANSITING TO LIBRARY.</span>
//                 )}
//               </div>
//             </div>

//             {pipelineProgress >= 15 && (
//               <div className="flex justify-center pt-2">
//                 <button
//                   onClick={() => navigateToTab("library")}
//                   className="btn-primary py-3 px-6 text-xs font-black uppercase flex items-center gap-1.5 shadow-md rounded-2xl cursor-pointer"
//                 >
//                   Open Study Library <Lucide.ArrowRight className="w-4 h-4" />
//                 </button>
//               </div>
//             )}
//           </div>
//         )}

//         {/* --- BOOK LIBRARY DASHBOARD (STEP 4) --- */}
//         {activeTab === "library" && (
//           <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//             {/* Sidebar Folder System Directory */}
//             <div className="space-y-4">
//               <div className="p-5 bg-white border border-slate-200 rounded-[24px] space-y-4">
//                 <div className="flex justify-between items-center border-b pb-2">
//                   <h3 className="text-xs font-black uppercase text-slate-455 tracking-wider">Directory Folders</h3>
//                   <button
//                     onClick={() => {
//                       const newFolder = prompt("Enter folder name:");
//                       if (newFolder && !folders.includes(newFolder)) setFolders((f) => [...f, newFolder]);
//                     }}
//                     className="p-1 text-indigo-650 hover:bg-slate-100 rounded-lg transition"
//                     title="Create new folder"
//                   >
//                     <Lucide.PlusCircle className="w-4 h-4" />
//                   </button>
//                 </div>
//                 <div className="space-y-1">
//                   {folders.map((folder) => {
//                     const isSel = activeFolder === folder;
//                     return (
//                       <div
//                         key={folder}
//                         onClick={() => setActiveFolder(folder)}
//                         className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
//                           isSel ? "bg-amber-500 text-white font-black" : "text-slate-500 hover:bg-slate-50 border border-transparent"
//                         }`}
//                       >
//                         <span className="flex items-center gap-2">
//                           <Lucide.FolderOpen className="w-3.5 h-3.5" /> {folder}
//                         </span>
//                         {folder !== "All" && (
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               if (confirm(`Remove folder "${folder}"?`)) setFolders((f) => f.filter((item) => item !== folder));
//                             }}
//                             className={`p-0.5 hover:text-red-500 ${isSel ? "text-white" : "text-slate-350"}`}
//                           >
//                             <Lucide.X className="w-3.5 h-3.5" />
//                           </button>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>

//               {/* Compare Mode Tool */}
//               <div className="p-5 bg-white border border-slate-200 rounded-[24px] space-y-3">
//                 <div className="flex justify-between items-center">
//                   <h3 className="text-xs font-black uppercase text-slate-455 tracking-wider">Compare Node</h3>
//                   <button
//                     onClick={() => { setCompareMode(!compareMode); setCompareBookIds([]); }}
//                     className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition ${
//                       compareMode ? "bg-amber-100 text-amber-705" : "bg-slate-100 text-slate-500"
//                     }`}
//                   >
//                     {compareMode ? "Active" : "Toggle"}
//                   </button>
//                 </div>
//                 {compareMode && (
//                   <div className="space-y-2 text-xs">
//                     <p className="text-[10px] text-slate-450 leading-relaxed font-bold uppercase">Select up to 2 books to cross-reference equations and summaries.</p>
//                     <div className="flex gap-1.5 flex-wrap">
//                       {compareBookIds.map((id) => {
//                         const b = library.find((item) => item.id === id);
//                         return (
//                           <span key={id} className="inline-block px-2.5 py-1 bg-indigo-50 border border-indigo-150 text-[10px] font-bold rounded-lg text-indigo-750">
//                             {b?.title.substring(0, 10)}...
//                           </span>
//                         );
//                       })}
//                     </div>
//                     {compareBookIds.length === 2 && (
//                       <button
//                         onClick={() => alert(`Simulating Syllabus Compare: Cross-Referencing topics between "${library.find(i=>i.id===compareBookIds[0])?.title}" and "${library.find(i=>i.id===compareBookIds[1])?.title}". Found 4 matching formula models.`)}
//                         className="w-full bg-slate-800 text-white text-[10px] font-black uppercase py-2 rounded-xl transition cursor-pointer"
//                       >
//                         Start Comparison
//                       </button>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Books Grid & Search Bar */}
//             <div className="lg:col-span-3 space-y-4">
//               <div className="flex flex-col md:flex-row items-center justify-between gap-4">
//                 <div className="relative flex-1 w-full">
//                   <Lucide.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
//                   <input
//                     type="text"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     placeholder="Search textbooks, coaching notes, solved papers..."
//                     className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs outline-none focus:border-amber-400 shadow-sm"
//                   />
//                 </div>
//                 <div className="flex items-center gap-2 flex-wrap">
//                   {/* Sort by */}
//                   <select
//                     value={sortBy}
//                     onChange={(e: any) => setSortBy(e.target.value)}
//                     className="text-xs font-black text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-xl outline-none cursor-pointer"
//                   >
//                     <option value="title">Sort by Title</option>
//                     <option value="date">Sort by Updated</option>
//                     <option value="score">Sort by Readability</option>
//                   </select>

//                   <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl shadow-xs">
//                     <button
//                       onClick={() => setViewMode("grid")}
//                       className={`p-1.5 rounded-lg cursor-pointer transition ${viewMode === "grid" ? "bg-slate-50 text-indigo-650" : "text-slate-400"}`}
//                     >
//                       <Lucide.Grid className="w-4 h-4" />
//                     </button>
//                     <button
//                       onClick={() => setViewMode("list")}
//                       className={`p-1.5 rounded-lg cursor-pointer transition ${viewMode === "list" ? "bg-slate-50 text-indigo-650" : "text-slate-400"}`}
//                     >
//                       <Lucide.List className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {filteredLibrary.length === 0 ? (
//                 <div className="py-20 text-center bg-white border border-slate-200 rounded-[24px]">
//                   <Lucide.FolderOpen className="w-12 h-12 text-slate-200 mx-auto mb-2" />
//                   <p className="text-xs text-slate-400">No study assets found in this directory.</p>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-3"}>
//                     {paginatedLibrary.map((book) => {
//                       const isSelected = activeBookId === book.id;
//                       const isComparing = compareBookIds.includes(book.id);
//                       return (
//                         <motion.div
//                           key={book.id}
//                           whileHover={{ y: -2 }}
//                           className={`premium-card rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between bg-white border ${
//                             isSelected ? "border-amber-500 shadow-md" : "border-slate-200"
//                           }`}
//                         >
//                           {/* Folder tag & Meta controls */}
//                           <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/85 backdrop-blur border border-slate-100 p-1 rounded-lg">
//                             <button
//                               onClick={(e) => { e.stopPropagation(); togglePinBook(book.id); }}
//                               className={`p-1 transition cursor-pointer ${book.isPinned ? "text-indigo-600" : "text-slate-400 hover:text-slate-655"}`}
//                             >
//                               <Lucide.Pin className="w-3.5 h-3.5" />
//                             </button>
//                             <button
//                               onClick={(e) => { e.stopPropagation(); toggleFavoriteBook(book.id); }}
//                               className={`p-1 transition cursor-pointer ${book.isFavorite ? "text-amber-500" : "text-slate-400 hover:text-slate-655"}`}
//                             >
//                               <Lucide.Star className="w-3.5 h-3.5 fill-current" />
//                             </button>
//                             <button
//                               onClick={(e) => { e.stopPropagation(); duplicateBook(book.id); }}
//                               className="p-1 text-slate-400 hover:text-indigo-650 cursor-pointer"
//                               title="Duplicate Asset"
//                             >
//                               <Lucide.Layers className="w-3.5 h-3.5" />
//                             </button>
//                             <button
//                               onClick={(e) => { e.stopPropagation(); deleteBook(book.id); }}
//                               className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
//                             >
//                               <Lucide.Trash2 className="w-3.5 h-3.5" />
//                             </button>
//                           </div>

//                           <div className="space-y-3 cursor-pointer" onClick={() => setActiveBookId(book.id)}>
//                             <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100/50">
//                               {book.examType}
//                             </span>
//                             <div>
//                               <h4 className="font-extrabold text-xs text-slate-800 line-clamp-2 leading-snug">{book.title}</h4>
//                               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">By {book.author}</p>
//                             </div>

//                             <div className="flex flex-col gap-1 border-t border-slate-100 pt-3">
//                               <div className="flex items-center gap-3 text-[10px] text-slate-500">
//                                 <span className="flex items-center gap-1"><Lucide.File className="w-3.5 h-3.5" /> {book.pageCount} Pages</span>
//                                 <span className="flex items-center gap-1 text-emerald-600 font-bold">
//                                   <Lucide.ShieldCheck className="w-3.5 h-3.5" /> {book.qualityScore}% Quality
//                                 </span>
//                               </div>
//                               {book.updatedAt && (
//                                 <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
//                                   <Lucide.Clock className="w-3.5 h-3.5" /> Updated {new Date(book.updatedAt).toLocaleDateString()}
//                                 </span>
//                               )}
//                             </div>
//                           </div>

//                           {/* Compare toggler & Folder Select */}
//                           <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 flex-wrap gap-2">
//                             {compareMode ? (
//                               <button
//                                 onClick={() => toggleCompareSelect(book.id)}
//                                 className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border transition ${
//                                   isComparing ? "bg-amber-500 border-amber-500 text-white" : "bg-slate-50 border-slate-200 text-slate-500"
//                                 }`}
//                               >
//                                 {isComparing ? "Selected" : "Select Compare"}
//                               </button>
//                             ) : (
//                               <select
//                                 value={book.folder}
//                                 onChange={(e) => moveBookFolder(book.id, e.target.value)}
//                                 className="text-[9px] font-black uppercase text-slate-500 bg-slate-50 border border-slate-150 rounded-lg p-1.5 cursor-pointer outline-none"
//                               >
//                                 {folders.filter(f=>f!=="All").map((f) => (
//                                   <option key={f} value={f}>Dir: {f}</option>
//                                 ))}
//                               </select>
//                             )}

//                             <div className="flex items-center gap-2">
//                               <button
//                                 onClick={(e) => { e.stopPropagation(); setSelectedDiagnosticsBook(book); }}
//                                 className="text-[10px] font-black text-slate-500 hover:text-indigo-650 flex items-center gap-0.5 cursor-pointer"
//                                 title="Processing Diagnostics"
//                               >
//                                 <Lucide.BarChart2 className="w-3.5 h-3.5" /> Stats Specs
//                               </button>
//                               <button
//                                 onClick={() => { setActiveBookId(book.id); navigateToTab("notes"); }}
//                                 className="text-[10px] font-black text-indigo-650 hover:underline flex items-center gap-0.5 cursor-pointer"
//                               >
//                                 Open Studio <Lucide.ArrowRight className="w-3.5 h-3.5" />
//                               </button>
//                             </div>
//                           </div>
//                         </motion.div>
//                       );
//                     })}
//                   </div>

//                   {totalLibPages > 1 && (
//                     <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-2xl shadow-xs">
//                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
//                         Page {libPage} of {totalLibPages} ({filteredLibrary.length} items)
//                       </span>
//                       <div className="flex items-center gap-1.5">
//                         <button
//                           onClick={() => setLibPage((p) => Math.max(1, p - 1))}
//                           disabled={libPage === 1}
//                           className="px-3.5 py-2 hover:bg-slate-55 border border-slate-150 rounded-xl text-[10px] font-black text-slate-550 uppercase disabled:opacity-40 cursor-pointer transition"
//                         >
//                           Prev
//                         </button>
//                         <button
//                           onClick={() => setLibPage((p) => Math.min(totalLibPages, p + 1))}
//                           disabled={libPage === totalLibPages}
//                           className="px-3.5 py-2 hover:bg-slate-55 border border-slate-150 rounded-xl text-[10px] font-black text-slate-550 uppercase disabled:opacity-40 cursor-pointer transition"
//                         >
//                           Next
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* --- AI STUDY NOTES GENERATOR WORKSPACE (STEP 5) --- */}
//         {activeTab === "notes" && (
//           <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//             {/* Outline & Meta Settings Sidebar */}
//             <div className="space-y-4">
//               {/* Chapters Outline */}
//               <div className="p-5 bg-white border border-slate-200 rounded-[24px] space-y-4">
//                 <div className="flex justify-between items-center">
//                   <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Chapters Outline</h3>
//                   <button
//                     onClick={() => {
//                       setEditingChapterIdx(null);
//                       setChapterForm({ title: "", topics: "", notes: "" });
//                       setShowChapterModal(true);
//                     }}
//                     className="p-1 hover:bg-slate-100 rounded-lg text-indigo-650 transition cursor-pointer"
//                     title="Add new chapter"
//                   >
//                     <Lucide.PlusCircle className="w-4 h-4" />
//                   </button>
//                 </div>
//                 <div className="space-y-1">
//                   {activeBook?.chapters.map((ch, idx) => (
//                     <div
//                       key={ch.id || idx}
//                       className={`group flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition cursor-pointer ${
//                         activeChapterIndex === idx ? "bg-amber-500 text-white font-bold" : "text-slate-500 hover:bg-slate-55"
//                       }`}
//                       onClick={() => setActiveChapterIndex(idx)}
//                     >
//                       <span className="line-clamp-1 flex-1">{ch.title}</span>
//                       <div className="hidden group-hover:flex items-center gap-1">
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             setEditingChapterIdx(idx);
//                             setChapterForm({ title: ch.title, topics: ch.topics.join(", "), notes: ch.notes });
//                             setShowChapterModal(true);
//                           }}
//                           className={`p-0.5 ${activeChapterIndex === idx ? "text-white" : "text-slate-400 hover:text-indigo-600"}`}
//                         >
//                           <Lucide.Edit2 className="w-3 h-3" />
//                         </button>
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             deleteChapter(idx);
//                           }}
//                           className={`p-0.5 ${activeChapterIndex === idx ? "text-white" : "text-slate-400 hover:text-red-500"}`}
//                         >
//                           <Lucide.Trash2 className="w-3 h-3" />
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Book Metadata details */}
//               <div className="p-5 bg-white border border-slate-200 rounded-[24px] space-y-3 text-xs">
//                 <div className="flex justify-between items-center border-b pb-2">
//                   <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Book Metadata</h3>
//                   <button
//                     onClick={() => setEditMetaMode(!editMetaMode)}
//                     className="text-[10px] font-black text-indigo-650 hover:underline cursor-pointer"
//                   >
//                     {editMetaMode ? "Cancel" : "Edit"}
//                   </button>
//                 </div>
//                 {editMetaMode ? (
//                   <form onSubmit={handleSaveMetadata} className="space-y-3">
//                     <input
//                       type="text"
//                       name="title"
//                       defaultValue={activeBook?.title}
//                       className="w-full p-2 border border-slate-200 rounded-xl"
//                       placeholder="Title"
//                     />
//                     <input
//                       type="text"
//                       name="author"
//                       defaultValue={activeBook?.author}
//                       className="w-full p-2 border border-slate-200 rounded-xl"
//                       placeholder="Author"
//                     />
//                     <button type="submit" className="w-full btn-primary py-2 text-[10px] font-black uppercase rounded-xl">Save Changes</button>
//                   </form>
//                 ) : (
//                   <div className="space-y-2 text-slate-650 font-semibold">
//                     <div className="flex justify-between"><span>Author</span><span className="font-extrabold">{activeBook?.author}</span></div>
//                     <div className="flex justify-between"><span>Publisher</span><span className="font-extrabold">{activeBook?.publisher}</span></div>
//                     <div className="flex justify-between"><span>Exam</span><span className="font-extrabold">{activeBook?.examType}</span></div>
//                     <div className="flex justify-between"><span>Readability</span><span className="font-extrabold text-emerald-600">{activeBook?.qualityScore}%</span></div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Note Canvas rich editor workspace */}
//             <div className="lg:col-span-3 space-y-4">
//               <div className="p-6 bg-white border border-slate-200 rounded-[24px] space-y-4">
//                 <div className="flex items-center justify-between border-b pb-3 flex-wrap gap-2">
//                   <div>
//                     <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">AI Generated Revision Notes</h3>
//                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Editable study canvas powered by GPT analysis</p>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className="text-[10px] font-black text-indigo-650 bg-indigo-50 border border-indigo-150/40 px-3 py-1 rounded-full uppercase tracking-wider">
//                       Chapter {activeChapterIndex + 1}
//                     </span>
//                     {!showRoughSheet && (
//                       <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-205">
//                         {(["edit", "preview", "split"] as const).map((mode) => (
//                           <button
//                             key={mode}
//                             onClick={() => setEditorMode(mode)}
//                             className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase transition cursor-pointer ${
//                               editorMode === mode ? "bg-white text-indigo-650 shadow-xs border border-slate-200/50" : "text-slate-500 hover:text-slate-700"
//                             }`}
//                           >
//                             {mode}
//                           </button>
//                         ))}
//                       </div>
//                     )}
//                     <button
//                       onClick={() => setShowRoughSheet(!showRoughSheet)}
//                       className={`px-3 py-1.5 border rounded-full text-[10px] font-black uppercase transition cursor-pointer flex items-center gap-1 ${
//                         showRoughSheet
//                           ? "bg-amber-100 border-amber-350 text-amber-750"
//                           : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
//                       }`}
//                     >
//                       <Lucide.FileEdit className="w-3 h-3" /> Rough Sheet
//                     </button>
//                   </div>
//                 </div>

//                 {/* Editor Action Utilities toolbar */}
//                 <div className="flex flex-wrap gap-2 bg-slate-50 border border-slate-150 p-2 rounded-2xl items-center">
//                   {["Detailed Notes", "Exam Notes", "Cheat Sheet"].map((template) => (
//                     <button
//                       key={template}
//                       onClick={() => triggerNoteTemplateChange(template)}
//                       className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition cursor-pointer ${
//                         selectedNoteTemplate === template ? "bg-white text-indigo-650 border border-indigo-150 shadow-xs" : "text-slate-500 hover:bg-slate-100"
//                       }`}
//                     >
//                       {template}
//                     </button>
//                   ))}
//                   <div className="w-px h-5 bg-slate-200 mx-1" />
                  
//                   {/* Markdown Quick formatting buttons */}
//                   <div className="flex items-center gap-1 bg-white border border-slate-150 p-1 rounded-xl shadow-xs">
//                     <button onClick={() => insertMarkdown("**", "**")} className="p-1 hover:bg-slate-50 rounded text-slate-550 font-black text-xs min-w-[20px] text-center cursor-pointer" title="Bold">B</button>
//                     <button onClick={() => insertMarkdown("*", "*")} className="p-1 hover:bg-slate-50 rounded text-slate-550 italic text-xs min-w-[20px] text-center cursor-pointer" title="Italic">I</button>
//                     <button onClick={() => insertMarkdown("## ", "")} className="p-1 hover:bg-slate-50 rounded text-slate-550 font-bold text-[10px] min-w-[20px] text-center cursor-pointer" title="Heading">H</button>
//                     <button onClick={() => insertMarkdown("\n```\n", "\n```\n")} className="p-1 hover:bg-slate-50 rounded text-slate-550 font-mono text-[9px] min-w-[20px] text-center cursor-pointer" title="Code Block">&lt;/&gt;</button>
//                     <button onClick={() => insertMarkdown("$$", "$$")} className="p-1 hover:bg-slate-50 rounded text-slate-550 font-bold text-[9px] min-w-[20px] text-center cursor-pointer" title="LaTeX Equation">$$</button>
//                     <button onClick={() => insertMarkdown("\n- ", "")} className="p-1 hover:bg-slate-50 rounded text-slate-550 font-bold text-xs min-w-[20px] text-center cursor-pointer" title="Bullet List">•</button>
//                   </div>

//                   <div className="w-px h-5 bg-slate-200 mx-1" />
//                   <button
//                     onClick={() => {
//                       const noteText = activeBook?.chapters[activeChapterIndex]?.notes || "";
//                       navigator.clipboard.writeText(noteText);
//                       alert("Notes copied to clipboard!");
//                       logAction("Notes Copied", `Copied Chapter ${activeChapterIndex + 1} notes to clipboard.`);
//                     }}
//                     className="px-3 py-1.5 hover:bg-white border border-slate-150 rounded-xl text-[10px] font-black uppercase text-slate-550 flex items-center gap-1 transition cursor-pointer"
//                   >
//                     <Lucide.Copy className="w-3.5 h-3.5" /> Copy Notes
//                   </button>
//                   <button
//                     onClick={() => {
//                       if (!activeBook) return;
//                       const formatted = (activeBook.chapters[activeChapterIndex]?.notes || "")
//                         .replace(/\s+/g, " ")
//                         .trim();
//                       handleNotesChange(formatted);
//                       logAction("Notes Formatted", `Cleaned note formatting for Chapter ${activeChapterIndex + 1}.`);
//                     }}
//                     className="px-3 py-1.5 hover:bg-white border border-slate-150 rounded-xl text-[10px] font-black uppercase text-slate-550 flex items-center gap-1 transition cursor-pointer"
//                   >
//                     <Lucide.SlidersHorizontal className="w-3.5 h-3.5" /> Format
//                   </button>
//                   <button
//                     onClick={() => {
//                       if (confirm("Are you sure you want to clear this note?")) {
//                         handleNotesChange("");
//                         logAction("Notes Cleared", `Cleared revision notes canvas for Chapter ${activeChapterIndex + 1}.`);
//                       }
//                     }}
//                     className="px-3 py-1.5 hover:bg-white hover:text-red-500 border border-slate-150 rounded-xl text-[10px] font-black uppercase text-slate-550 flex items-center gap-1 transition cursor-pointer"
//                   >
//                     <Lucide.Trash2 className="w-3.5 h-3.5" /> Clear
//                   </button>
//                   <div className="w-px h-5 bg-slate-200 mx-1" />
//                   {/* Download Options */}
//                   {["pdf", "md", "json"].map((fmt) => (
//                     <button
//                       key={fmt}
//                       onClick={() => handleDownloadNotes(fmt)}
//                       className="px-2.5 py-1.5 hover:bg-white border border-slate-150 rounded-xl text-[10px] font-black uppercase text-slate-505 flex items-center gap-0.5 transition cursor-pointer"
//                     >
//                       <Lucide.Download className="w-3 h-3 text-slate-400" /> .{fmt}
//                     </button>
//                   ))}
//                 </div>

//                 {/* Main Textarea + Rough Sheet Split Grid */}
//                 <div className={`grid grid-cols-1 ${
//                   showRoughSheet || editorMode === "split" ? "md:grid-cols-2" : "md:grid-cols-1"
//                 } gap-6`}>
//                   {/* Left Column: Editor */}
//                   {(editorMode === "edit" || editorMode === "split" || showRoughSheet) && (
//                     <div className="space-y-1">
//                       {showRoughSheet && <span className="text-[10px] font-black uppercase tracking-wider text-slate-450">Main Study Notes</span>}
//                       <textarea
//                         ref={notesTextareaRef}
//                         value={activeBook?.chapters[activeChapterIndex]?.notes || ""}
//                         onChange={(e) => handleNotesChange(e.target.value)}
//                         className="w-full min-h-[380px] p-5 bg-slate-55/50 border border-slate-200 rounded-2xl outline-none font-mono text-xs text-slate-700 leading-relaxed focus:border-amber-400"
//                       />
//                     </div>
//                   )}

//                   {/* Right Column: Either Rough Sheet or Live HTML Preview */}
//                   {showRoughSheet ? (
//                     <div className="space-y-1 flex flex-col">
//                       <div className="flex justify-between items-center">
//                         <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">Rough Sheet / Scribble Pad</span>
//                         <button
//                           onClick={() => {
//                             setRoughNotes("");
//                             localStorage.setItem("ef_knowledge_rough_notes", "");
//                             logAction("Rough Sheet Cleared", "Cleared scribble pad notes.");
//                           }}
//                           className="text-[9px] font-black uppercase text-slate-400 hover:text-red-550 cursor-pointer"
//                         >
//                           Clear Scribbles
//                         </button>
//                       </div>
//                       <textarea
//                         value={roughNotes}
//                         onChange={(e) => handleRoughNotesChange(e.target.value)}
//                         placeholder="Scratchpad for equations, raw copy-paste content, active thoughts, and workspace calibrations..."
//                         className="w-full flex-1 min-h-[380px] p-5 bg-amber-50/10 border border-amber-200 rounded-2xl outline-none font-mono text-xs text-slate-700 leading-relaxed focus:border-amber-400"
//                       />
//                     </div>
//                   ) : (
//                     (editorMode === "preview" || editorMode === "split") && (
//                       <div className="space-y-1 flex flex-col">
//                         <span className="text-[10px] font-black uppercase tracking-wider text-indigo-650">Optimized Page Preview</span>
//                         <div className="w-full flex-1 min-h-[380px] p-5 bg-slate-50 border border-slate-150 rounded-2xl overflow-y-auto max-h-[460px] pr-2 scrollbar-thin">
//                           <div className="prose prose-slate max-w-none">
//                             {renderMarkdownToHTML(activeBook?.chapters[activeChapterIndex]?.notes || "")}
//                           </div>
//                         </div>
//                       </div>
//                     )
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* --- AI ACTIVE RECALL STUDY ENGINE (STEP 5) --- */}
//         {activeTab === "flashcards" && (
//           <div className="space-y-6 max-w-4xl mx-auto">
//             {/* Header Controls */}
//             <div className="flex flex-col sm:flex-row justify-between items-center bg-white border border-slate-205 p-5 rounded-[24px] gap-4">
//               <div>
//                 <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
//                   <Lucide.BrainCircuit className="w-5 h-5 text-indigo-650" /> Active Recall Trainer
//                 </h3>
//                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Calibrate conceptual retention with simulated test models</p>
//               </div>

//               <div className="flex items-center gap-3 flex-wrap">
//                 <div className="flex items-center gap-0.5 bg-slate-105 p-1 rounded-xl">
//                   {(["flashcards", "mcqs"] as const).map((sub) => (
//                     <button
//                       key={sub}
//                       onClick={() => { setQaSubTab(sub); setQaPage(1); }}
//                       className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition cursor-pointer ${
//                         qaSubTab === sub ? "bg-white text-indigo-650 shadow-xs" : "text-slate-500 hover:text-slate-800"
//                       }`}
//                     >
//                       {sub === "flashcards" ? "Flashcards" : "MCQ calibration"}
//                     </button>
//                   ))}
//                 </div>

//                 <button
//                   onClick={() => {
//                     setQaFormType(qaSubTab === "flashcards" ? "flashcard" : "mcq");
//                     setEditingQAIdx(null);
//                     setFlashcardForm({ question: "", answer: "" });
//                     setMcqForm({ question: "", option0: "", option1: "", option2: "", option3: "", answerIndex: 0 });
//                     setShowQAFormModal(true);
//                   }}
//                   className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white text-[10px] font-black uppercase rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
//                 >
//                   <Lucide.PlusCircle className="w-4 h-4" /> Create QA Node
//                 </button>
//               </div>
//             </div>

//             {/* Flashcards View */}
//             {qaSubTab === "flashcards" && (
//               <div className="space-y-6">
//                 {paginatedFlashcards.length === 0 ? (
//                   <div className="py-20 text-center bg-white border border-slate-200 rounded-[24px]">
//                     <Lucide.BrainCircuit className="w-12 h-12 text-slate-200 mx-auto mb-2" />
//                     <p className="text-xs text-slate-400">No active recall flashcards mapped for this syllabus book.</p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {paginatedFlashcards.map((card, idx) => {
//                       const absoluteIdx = (qaPage - 1) * qaItemsPerPage + idx;
//                       return (
//                         <div key={card.id || idx} className="space-y-3">
//                           <div
//                             onClick={(e) => {
//                               // Simple flip simulation by updating local state or target class
//                               const cardEl = e.currentTarget.querySelector(".card-inner");
//                               cardEl?.classList.toggle("[transform:rotateY(180deg)]");
//                             }}
//                             className="w-full h-48 [perspective:1000px] cursor-pointer"
//                           >
//                             <div className="card-inner w-full h-full relative transition-transform duration-500 [transform-style:preserve-3d]">
//                               {/* Front of Card */}
//                               <div className="absolute inset-0 w-full h-full bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between [backface-visibility:hidden]">
//                                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Question Node #{absoluteIdx + 1}</span>
//                                 <p className="font-extrabold text-xs text-slate-800 leading-normal">{card.question}</p>
//                                 <span className="text-[8px] font-black text-indigo-655 uppercase tracking-wider text-right block">Click to Flip</span>
//                               </div>

//                               {/* Back of Card */}
//                               <div className="absolute inset-0 w-full h-full bg-slate-900 text-slate-100 border border-slate-850 rounded-3xl p-5 flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden]">
//                                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Answer Specifications</span>
//                                 <p className="font-medium text-xs text-slate-200 leading-normal">{card.answer}</p>
//                                 <div className="flex justify-between items-center gap-2">
//                                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Recall Quality:</span>
//                                   <div className="flex gap-1.5">
//                                     {["Hard", "Good", "Easy"].map((lvl) => (
//                                       <button
//                                         key={lvl}
//                                         onClick={(ev) => {
//                                           ev.stopPropagation();
//                                           alert(`Calibrated recall level: ${lvl}`);
//                                           logAction("Recall Quality Set", `Marked Flashcard #${absoluteIdx + 1} as ${lvl}.`);
//                                         }}
//                                         className={`px-2 py-0.5 rounded text-[8px] font-black uppercase text-white ${
//                                           lvl === "Hard" ? "bg-red-500" : lvl === "Good" ? "bg-indigo-600" : "bg-emerald-500"
//                                         }`}
//                                       >
//                                         {lvl}
//                                       </button>
//                                     ))}
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>

//                           <div className="flex justify-between items-center px-1">
//                             <span className="text-[9px] font-black uppercase text-slate-400">Score Status: {card.level.toUpperCase()}</span>
//                             <div className="flex gap-2">
//                               <button
//                                 onClick={() => {
//                                   setQaFormType("flashcard");
//                                   setEditingQAIdx(absoluteIdx);
//                                   setFlashcardForm({ question: card.question, answer: card.answer });
//                                   setShowQAFormModal(true);
//                                 }}
//                                 className="text-[9px] font-bold text-slate-500 hover:text-indigo-650 cursor-pointer flex items-center gap-0.5"
//                               >
//                                 <Lucide.Edit2 className="w-3 h-3" /> Edit
//                               </button>
//                               <button
//                                 onClick={() => deleteQA("flashcard", absoluteIdx)}
//                                 className="text-[9px] font-bold text-slate-500 hover:text-red-500 cursor-pointer flex items-center gap-0.5"
//                               >
//                                 <Lucide.Trash2 className="w-3 h-3" /> Delete
//                               </button>
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}

//                 {/* Pagination */}
//                 {totalFlashcardPages > 1 && (
//                   <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-2xl shadow-xs">
//                     <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">
//                       Page {qaPage} of {totalFlashcardPages}
//                     </span>
//                     <div className="flex gap-2">
//                       <button
//                         onClick={() => setQaPage((p) => Math.max(1, p - 1))}
//                         disabled={qaPage === 1}
//                         className="px-3.5 py-1.5 bg-slate-50 border border-slate-150 rounded-xl text-[10px] font-black text-slate-550 uppercase disabled:opacity-40 cursor-pointer transition"
//                       >
//                         Prev
//                       </button>
//                       <button
//                         onClick={() => setQaPage((p) => Math.min(totalFlashcardPages, p + 1))}
//                         disabled={qaPage === totalFlashcardPages}
//                         className="px-3.5 py-1.5 bg-slate-50 border border-slate-150 rounded-xl text-[10px] font-black text-slate-550 uppercase disabled:opacity-40 cursor-pointer transition"
//                       >
//                         Next
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* MCQs View */}
//             {qaSubTab === "mcqs" && (
//               <div className="space-y-6">
//                 {paginatedMCQs.length === 0 ? (
//                   <div className="py-20 text-center bg-white border border-slate-200 rounded-[24px]">
//                     <Lucide.BrainCircuit className="w-12 h-12 text-slate-200 mx-auto mb-2" />
//                     <p className="text-xs text-slate-400">No MCQ calibration nodes mapped for this syllabus book.</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-6">
//                     {/* Real-time stats display */}
//                     {mcqCalibrationScore !== null && (
//                       <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-3xl flex justify-between items-center text-xs text-emerald-800">
//                         <span className="font-extrabold uppercase tracking-wider block">Live retention calibration index</span>
//                         <span className="font-black text-sm">{mcqCalibrationScore}% Accuracy</span>
//                       </div>
//                     )}

//                     <div className="space-y-6">
//                       {paginatedMCQs.map((q, idx) => {
//                         const absoluteIdx = (qaPage - 1) * qaItemsPerPage + idx;
//                         return (
//                           <div key={q.id || idx} className="bg-white border border-slate-200 p-5 rounded-[24px] space-y-4">
//                             <div className="flex justify-between items-start gap-2 border-b pb-2 flex-wrap">
//                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question Node #{absoluteIdx + 1}</span>
//                               <div className="flex gap-2">
//                                 <button
//                                   onClick={() => {
//                                     setQaFormType("mcq");
//                                     setEditingQAIdx(absoluteIdx);
//                                     setMcqForm({
//                                       question: q.question,
//                                       option0: q.options[0] || "",
//                                       option1: q.options[1] || "",
//                                       option2: q.options[2] || "",
//                                       option3: q.options[3] || "",
//                                       answerIndex: q.answerIndex
//                                     });
//                                     setShowQAFormModal(true);
//                                   }}
//                                   className="text-[9px] font-bold text-slate-500 hover:text-indigo-650 cursor-pointer flex items-center gap-0.5"
//                                 >
//                                   <Lucide.Edit2 className="w-3 h-3" /> Edit
//                                 </button>
//                                 <button
//                                   onClick={() => deleteQA("mcq", absoluteIdx)}
//                                   className="text-[9px] font-bold text-slate-500 hover:text-red-500 cursor-pointer flex items-center gap-0.5"
//                                 >
//                                   <Lucide.Trash2 className="w-3 h-3" /> Delete
//                                 </button>
//                               </div>
//                             </div>

//                             <p className="font-extrabold text-xs text-slate-805 leading-normal">{q.question}</p>

//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
//                               {q.options.map((opt, optIdx) => {
//                                 const isSelected = q.selectedAnswer === optIdx;
//                                 const isCorrect = q.answerIndex === optIdx;
//                                 const hasAnswered = q.selectedAnswer !== undefined;

//                                 let btnClass = "border-slate-200 hover:bg-slate-50";
//                                 if (isSelected) {
//                                   btnClass = isCorrect ? "bg-emerald-50 border-emerald-500 text-emerald-805 font-bold" : "bg-red-50 border-red-500 text-red-805 font-bold";
//                                 } else if (hasAnswered && isCorrect) {
//                                   btnClass = "bg-emerald-50/50 border-emerald-300 text-emerald-800";
//                                 }

//                                 return (
//                                   <button
//                                     key={optIdx}
//                                     onClick={() => handleSelectMCQAnswer(absoluteIdx, optIdx)}
//                                     className={`w-full text-left p-3.5 rounded-2xl border transition cursor-pointer flex items-center gap-2 ${btnClass}`}
//                                   >
//                                     <span className="w-5 h-5 rounded-full border bg-slate-100 flex items-center justify-center font-black text-[9px] uppercase tracking-wider text-slate-500 shrink-0">
//                                       {String.fromCharCode(65 + optIdx)}
//                                     </span>
//                                     <span>{opt}</span>
//                                   </button>
//                                 );
//                               })}
//                             </div>

//                             {q.selectedAnswer !== undefined && q.explanation && (
//                               <div className="p-4 bg-slate-55 border border-slate-150 rounded-2xl text-[11px] text-slate-550 leading-relaxed font-semibold">
//                                 <span className="font-extrabold text-[10px] text-indigo-750 block uppercase tracking-wider mb-1">Explanation Diagnostic</span>
//                                 {q.explanation}
//                               </div>
//                             )}
//                           </div>
//                         );
//                       })}
//                     </div>

//                     {/* Pagination */}
//                     {totalMCQPages > 1 && (
//                       <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-2xl shadow-xs">
//                         <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">
//                           Page {qaPage} of {totalMCQPages}
//                         </span>
//                         <div className="flex gap-2">
//                           <button
//                             onClick={() => setQaPage((p) => Math.max(1, p - 1))}
//                             disabled={qaPage === 1}
//                             className="px-3.5 py-1.5 bg-slate-55 border border-slate-150 rounded-xl text-[10px] font-black text-slate-550 uppercase disabled:opacity-40 cursor-pointer transition"
//                           >
//                             Prev
//                           </button>
//                           <button
//                             onClick={() => setQaPage((p) => Math.min(totalMCQPages, p + 1))}
//                             disabled={qaPage === totalMCQPages}
//                             className="px-3.5 py-1.5 bg-slate-55 border border-slate-150 rounded-xl text-[10px] font-black text-slate-550 uppercase disabled:opacity-40 cursor-pointer transition"
//                           >
//                             Next
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         )}

//         {/* --- ANALYTICS DASHBOARD --- */}
//         {activeTab === "analytics" && (
//           <div className="space-y-6">
//             {/* Quick dashboard stats */}
//             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//               {[
//                 { label: "Active Books", val: library.length, icon: Lucide.BookOpen, color: "text-indigo-650" },
//                 { label: "Pages Processed", val: library.reduce((s,b)=>s+b.pageCount,0), icon: Lucide.File, color: "text-emerald-500" },
//                 { label: "OCR Accuracy", val: activeBook ? `${activeBook.ocrConfidence}%` : "98%", icon: Lucide.ShieldCheck, color: "text-amber-500" },
//                 { label: "Reading Time Saved", val: activeBook ? `${activeBook.pageCount * 4} Min` : "240 Min", icon: Lucide.Clock, color: "text-indigo-600" }
//               ].map((stat, idx) => {
//                 const Icon = stat.icon;
//                 return (
//                   <div key={idx} className="bg-white border border-slate-200/80 p-4.5 rounded-3xl flex flex-col justify-center shadow-xs">
//                     <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
//                       <Icon className={`w-3.5 h-3.5 ${stat.color}`} /> {stat.label}
//                     </span>
//                     <span className="text-2xl font-black text-slate-800 mt-1">{stat.val}</span>
//                   </div>
//                 );
//               })}
//             </div>

//             {/* Mindmap Graph & GitHub Heatmap Row */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               {/* SVG-based Mindmap node graph */}
//               <div className="lg:col-span-2 p-6 bg-white border border-slate-200 rounded-3xl space-y-4">
//                 <div className="flex justify-between items-center border-b pb-2">
//                   <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5"><Lucide.Network className="w-4 h-4 text-indigo-500" /> Interactive Syllabus Mindmap</h3>
//                   <span className="text-[9px] font-black uppercase text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded-md">Calibration Sync</span>
//                 </div>
//                 <div className="h-[280px] bg-slate-50 border border-slate-150 rounded-2xl relative overflow-hidden flex items-center justify-center">
//                   <svg className="w-full h-full">
//                     {/* Connections */}
//                     <line x1="200" y1="140" x2="80" y2="60" stroke="#cbd5e1" strokeWidth="2" />
//                     <line x1="200" y1="140" x2="320" y2="60" stroke="#cbd5e1" strokeWidth="2" />
//                     <line x1="200" y1="140" x2="80" y2="220" stroke="#cbd5e1" strokeWidth="2" />
//                     <line x1="200" y1="140" x2="320" y2="220" stroke="#cbd5e1" strokeWidth="2" />

//                     {/* Core node */}
//                     <circle
//                       cx="200"
//                       cy="140"
//                       r="30"
//                       fill={selectedMindNode === "core" ? "#f59e0b" : "#6366f1"}
//                       onClick={() => setSelectedMindNode("core")}
//                       className="cursor-pointer transition-all duration-300 hover:scale-105"
//                     />
//                     <text x="200" y="145" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" className="pointer-events-none uppercase">CORE</text>

//                     {/* Nodes */}
//                     <circle cx="80" cy="60" r="22" fill={selectedMindNode === "formulas" ? "#f59e0b" : "#475569"} onClick={() => setSelectedMindNode("formulas")} className="cursor-pointer" />
//                     <text x="80" y="63" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" className="pointer-events-none uppercase">FORMULA</text>

//                     <circle cx="320" cy="60" r="22" fill={selectedMindNode === "chapters" ? "#f59e0b" : "#475569"} onClick={() => setSelectedMindNode("chapters")} className="cursor-pointer" />
//                     <text x="320" y="63" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" className="pointer-events-none uppercase">CHAPTERS</text>

//                     <circle cx="80" cy="220" r="22" fill={selectedMindNode === "mcqs" ? "#f59e0b" : "#475569"} onClick={() => setSelectedMindNode("mcqs")} className="cursor-pointer" />
//                     <text x="80" y="223" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" className="pointer-events-none uppercase">MCQS</text>

//                     <circle cx="320" cy="220" r="22" fill={selectedMindNode === "notes" ? "#f59e0b" : "#475569"} onClick={() => setSelectedMindNode("notes")} className="cursor-pointer" />
//                     <text x="320" y="223" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" className="pointer-events-none uppercase">NOTES</text>
//                   </svg>

//                   {/* Active node detail overlay */}
//                   <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-xs border border-slate-150 p-2.5 rounded-xl text-[10px] text-slate-500 font-bold uppercase">
//                     {selectedMindNode === "core" && "CORE SYLLABUS: Quantum mechanics telemetry indices calibrated."}
//                     {selectedMindNode === "formulas" && `FORMULAS: ${activeBook?.formulas.length || 0} active math nodes mapped.`}
//                     {selectedMindNode === "chapters" && `CHAPTERS: ${activeBook?.chapters.length || 0} chapter nodes detected.`}
//                     {selectedMindNode === "mcqs" && `MCQS: ${activeBook?.mcqs.length || 0} practice questions generated.`}
//                     {selectedMindNode === "notes" && "NOTES: Revision study guides generated successfully."}
//                   </div>
//                 </div>
//               </div>

//               {/* GitHub style heatmap */}
//               <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4">
//                 <div className="flex justify-between items-center border-b pb-2">
//                   <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5"><Lucide.Clock className="w-4 h-4 text-indigo-500" /> Syllabus Heatmap</h3>
//                   <span className="text-[9px] font-black uppercase text-slate-400">Daily processed</span>
//                 </div>
//                 <div className="space-y-3">
//                   <div className="grid grid-cols-7 gap-1.5">
//                     {Array.from({ length: 28 }).map((_, idx) => {
//                       const level = idx % 5;
//                       const bg = level === 4 ? "bg-indigo-650" : level === 3 ? "bg-indigo-500/70" : level === 2 ? "bg-indigo-400/40" : level === 1 ? "bg-indigo-200/20" : "bg-slate-100";
//                       return (
//                         <div key={idx} className={`aspect-square w-full rounded-md ${bg}`} title={`Syllabus telemetry calibrations active.`} />
//                       );
//                     })}
//                   </div>
//                   <div className="flex justify-between text-[8px] text-slate-400 font-extrabold uppercase pt-1 border-t border-slate-100">
//                     <span>Less processing</span>
//                     <span>More processing</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Chronological Action History Timeline */}
//             <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4">
//               <div className="flex justify-between items-center border-b pb-3">
//                 <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
//                   <Lucide.Clock className="w-4 h-4 text-indigo-500" /> Action & Calibrations Timeline
//                 </h3>
//                 <button
//                   onClick={() => {
//                     const initialLogs = [{ id: "log_init", timestamp: new Date().toISOString(), action: "System Reset", detail: "Calibration timeline cleared." }];
//                     setHistoryLogs(initialLogs);
//                     localStorage.setItem("ef_knowledge_history", JSON.stringify(initialLogs));
//                   }}
//                   className="text-[10px] font-black text-red-500 hover:underline transition cursor-pointer"
//                 >
//                   Clear Logs
//                 </button>
//               </div>

//               <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
//                 {historyLogs.map((log) => (
//                   <div key={log.id} className="flex gap-3 text-xs leading-normal">
//                     <div className="flex flex-col items-center">
//                       <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-50 mt-1" />
//                       <div className="w-px flex-1 bg-slate-100 min-h-[20px]" />
//                     </div>
//                     <div className="flex-1 bg-slate-55 border border-slate-100 p-3 rounded-2xl transition">
//                       <div className="flex justify-between items-start">
//                         <span className="font-black text-slate-800 uppercase text-[10px] tracking-wider text-indigo-650">{log.action}</span>
//                         <span className="text-[9px] text-slate-400 font-bold">{new Date(log.timestamp).toLocaleTimeString()}</span>
//                       </div>
//                       <p className="text-slate-500 font-medium text-[11px] mt-1">{log.detail}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ==========================================
//           MODALS & FORM CONDUITS
//           ========================================== */}
//       {/* CHAPTER MODAL */}
//       {showChapterModal && (
//         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <motion.div
//             initial={{ scale: 0.95, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-xl space-y-4"
//           >
//             <div className="flex justify-between items-center border-b pb-3">
//               <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">
//                 {editingChapterIdx !== null ? "Edit Chapter Details" : "Add New Chapter"}
//               </h3>
//               <button onClick={() => setShowChapterModal(false)} className="text-slate-400 hover:text-slate-650 cursor-pointer">
//                 <Lucide.X className="w-5 h-5" />
//               </button>
//             </div>

//             <form onSubmit={handleSaveChapter} className="space-y-3 text-xs">
//               <div className="space-y-1">
//                 <label className="font-bold text-slate-500">Chapter Title *</label>
//                 <input
//                   type="text"
//                   required
//                   placeholder="e.g. Chapter 1: Introduction"
//                   value={chapterForm.title}
//                   onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
//                   className="w-full p-2.5 border border-slate-200 rounded-xl"
//                 />
//               </div>

//               <div className="space-y-1">
//                 <label className="font-bold text-slate-500">Subtopics (comma separated)</label>
//                 <input
//                   type="text"
//                   placeholder="e.g. basic units, vector spaces"
//                   value={chapterForm.topics}
//                   onChange={(e) => setChapterForm({ ...chapterForm, topics: e.target.value })}
//                   className="w-full p-2.5 border border-slate-200 rounded-xl"
//                 />
//               </div>

//               <div className="space-y-1">
//                 <label className="font-bold text-slate-500">Syllabus Revision Notes (Markdown)</label>
//                 <textarea
//                   placeholder="# Notes\nStart typing notes..."
//                   value={chapterForm.notes}
//                   onChange={(e) => setChapterForm({ ...chapterForm, notes: e.target.value })}
//                   className="w-full h-32 p-2.5 border border-slate-200 rounded-xl"
//                 />
//               </div>

//               <button
//                 type="submit"
//                 className="w-full bg-indigo-650 hover:bg-indigo-700 text-white py-3 rounded-2xl font-black uppercase text-xs shadow-md transition cursor-pointer"
//               >
//                 {editingChapterIdx !== null ? "Update Chapter" : "Add Chapter"}
//               </button>
//             </form>
//           </motion.div>
//         </div>
//       )}
//       {/* DIAGNOSTICS STATS MODAL */}
//       {selectedDiagnosticsBook && (
//         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <motion.div
//             initial={{ scale: 0.95, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-100 shadow-xl space-y-4"
//           >
//             <div className="flex justify-between items-center border-b pb-3">
//               <div>
//                 <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1">
//                   <Lucide.BarChart2 className="w-4 h-4 text-indigo-650" /> AI Extraction Diagnostics
//                 </h3>
//                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Telemetry specifications for "{selectedDiagnosticsBook.title}"</p>
//               </div>
//               <button onClick={() => setSelectedDiagnosticsBook(null)} className="text-slate-400 hover:text-slate-650 cursor-pointer">
//                 <Lucide.X className="w-5 h-5" />
//               </button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
//               {/* Document Metrics */}
//               <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-3">
//                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block border-b pb-1">Document Metrics</span>
//                 <div className="space-y-2 font-semibold text-slate-600">
//                   <div className="flex justify-between"><span>Pages:</span><span className="font-extrabold text-slate-800">{selectedDiagnosticsBook.pageCount}</span></div>
//                   <div className="flex justify-between"><span>Words:</span><span className="font-extrabold text-slate-800">{(selectedDiagnosticsBook.pageCount * 320).toLocaleString()}</span></div>
//                   <div className="flex justify-between"><span>Paragraphs:</span><span className="font-extrabold text-slate-800">{(selectedDiagnosticsBook.pageCount * 6.5).toFixed(0)}</span></div>
//                   <div className="flex justify-between"><span>Tables:</span><span className="font-extrabold text-slate-800">{(selectedDiagnosticsBook.pageCount * 0.12).toFixed(0)}</span></div>
//                   <div className="flex justify-between"><span>Images:</span><span className="font-extrabold text-slate-800">{(selectedDiagnosticsBook.pageCount * 0.25).toFixed(0)}</span></div>
//                   <div className="flex justify-between"><span>Diagrams:</span><span className="font-extrabold text-slate-800">{(selectedDiagnosticsBook.pageCount * 0.08).toFixed(0)}</span></div>
//                   <div className="flex justify-between"><span>Charts:</span><span className="font-extrabold text-slate-800">{(selectedDiagnosticsBook.pageCount * 0.05).toFixed(0)}</span></div>
//                   <div className="flex justify-between"><span>Equations:</span><span className="font-extrabold text-slate-800">{(selectedDiagnosticsBook.pageCount * 0.15).toFixed(0)}</span></div>
//                   <div className="flex justify-between"><span>Language:</span><span className="font-extrabold text-slate-800">{selectedDiagnosticsBook.language}</span></div>
//                 </div>
//               </div>

//               {/* AI Intelligence Indicators */}
//               <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-3 flex flex-col justify-between">
//                 <div className="space-y-3">
//                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block border-b pb-1">AI Indicators</span>
//                   <div className="space-y-2 font-semibold text-slate-600">
//                     <div className="flex justify-between"><span>Est. Reading Time:</span><span className="font-extrabold text-slate-800">{Math.round(selectedDiagnosticsBook.pageCount * 2.5)} Min</span></div>
//                     <div className="flex justify-between"><span>Complexity:</span><span className="font-extrabold text-slate-800">High</span></div>
//                     <div className="flex justify-between"><span>Knowledge Density:</span><span className="font-extrabold text-indigo-650">{selectedDiagnosticsBook.qualityScore - 4}%</span></div>
//                     <div className="flex justify-between"><span>Difficulty Level:</span><span className="font-extrabold text-slate-800">Advanced</span></div>
//                   </div>
//                 </div>

//                 <button
//                   onClick={() => { setSelectedDiagnosticsBook(null); setActiveBookId(selectedDiagnosticsBook.id); navigateToTab("notes"); }}
//                   className="w-full bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-black uppercase py-2.5 rounded-xl transition cursor-pointer text-center"
//                 >
//                   Enter Study Workspace
//                 </button>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       )}
//     </div>
//   );
// }