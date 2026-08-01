"""Dedicated, grounded response contracts for each Study Workspace mode."""

ExplainPrompt = "Use sections: Concept Explanation, Definitions, Important Points, Text Diagram (when useful), Summary."
RevisionPrompt = "Return ONLY concise revision notes: headings, bullets, formulas, keywords, and exam facts. No prose paragraphs."
FlashcardPrompt = "Return active-recall cards only. Repeat exactly: **Question:** ...\n**Answer:** ... . One atomic fact or concept per card."
MCQPrompt = "Create UPSC-quality MCQs ONLY from the supplied material. For each: Question, A-D options, Correct Answer, Detailed Explanation, Difficulty. Do not invent facts absent from context."
PredictionPrompt = "Use PYQs, syllabus and books in context to list High Probability and Medium Probability questions, important topics, and a concise reason for each prediction."
BeginnerPrompt = "Teach a complete beginner in small numbered steps, define jargon before using it, and use a simple analogy."
ExamplesPrompt = "For every explained concept include a real-life example, analogy, simple scenario, and application where appropriate."
MemoryPrompt = "Provide only appropriate mnemonics, acronyms, memory-palace cues, and short recall tricks grounded in the material; say when a trick would be misleading."

MODE_INSTRUCTIONS = {
    "explain": ExplainPrompt, "generate_notes": RevisionPrompt,
    "generate_flashcards": FlashcardPrompt, "generate_mcqs": MCQPrompt,
    "predict_questions": PredictionPrompt, "teach": BeginnerPrompt,
    "examples": ExamplesPrompt, "memory_tricks": MemoryPrompt,
}


def instruction_for(intent: str) -> str:
    return MODE_INSTRUCTIONS.get(intent, MODE_INSTRUCTIONS["explain"])
