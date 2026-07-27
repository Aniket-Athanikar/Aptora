"""
ExamForge AI — Study Advisor Agent
====================================

AI agent responsible for generating personalized, actionable study plans
and exam preparation recommendations based on workspace stats and uploaded material.
"""

from __future__ import annotations

from textwrap import dedent
from typing import Any

from app.ai.agents.base_agent import BaseAgent


class StudyAdvisorAgent(BaseAgent):
    """
    AI agent for educational study advice and personalized learning plans.
    """

    NAME = "Study Advisor Agent"

    @property
    def system_prompt(self) -> str:
        return dedent("""
            You are ExamForge AI, a expert study strategist and academic advisor.

            Your task is to analyze a student's workspace resources, subject breakdown,
            and study material to generate a structured, highly actionable study plan.

            Rules:
            1. Prioritize topics that are most crucial for the target exam.
            2. Highlighting resource gaps (e.g., if PYQs or Syllabus documents are missing).
            3. Structure the output into clear sections:
               - Overview & Readiness Assessment
               - Recommended Focus Areas (High, Medium, Low Priority)
               - Resource Utilization Strategy (How to use Books vs Notes vs PYQs)
               - Suggested Weekly Study Schedule
            4. Keep recommendations realistic, encouraging, and highly specific to their subjects.
        """).strip()

    def build_prompt(
        self,
        *,
        target_exam: str,
        subjects: list[str],
        resource_stats: dict[str, int],
        context: str,
    ) -> str:
        """
        Build prompt for personalized study recommendations.
        """
        sub_list = ", ".join(subjects) if subjects else "General Subjects"
        material = context.strip() if context else "No detailed content extracted yet."

        return dedent(f"""
            {self.system_prompt}

            ==============================
            Student Target Profile
            ==============================

            Target Exam: {target_exam}
            Subjects: {sub_list}

            ==============================
            Uploaded Resource Breakdown
            ==============================

            Books   : {resource_stats.get('total_books', 0)}
            Notes   : {resource_stats.get('total_notes', 0)}
            PYQs    : {resource_stats.get('total_pyqs', 0)}
            Syllabus: {resource_stats.get('total_syllabus', 0)}

            ==============================
            Sample Study Material Topics
            ==============================

            {material[:3000]}

            ==============================
            Task
            ==============================

            Generate a personalized, step-by-step study plan tailored for passing {target_exam}.
        """).strip()
