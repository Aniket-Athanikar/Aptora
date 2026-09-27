"""
Aptora - Context Builder

Responsible for:
1. Convert retrieved chunks into LLM context
2. Format document metadata
3. Produce a readable context block
"""

from typing import Any


class ContextBuilder:

    @classmethod
    def build(
        cls,
        chunks: list[dict[str, Any]],
    ) -> str:
        """
        Build the context supplied to the LLM.
        """

        if not chunks:
            return ""

        documents = []

        for index, chunk in enumerate(chunks, start=1):

            documents.append(
                f"""
==============================
Document {index}
==============================

Subject : {chunk.get("subject") or "Unknown"}
Chapter : {chunk.get("chapter") or "Unknown"}
Topic   : {chunk.get("topic") or "Unknown"}
Page    : {chunk.get("page_number") or "-"}

Content:
{chunk.get("content", "").strip()}
""".strip()
            )

        return "\n\n".join(documents)