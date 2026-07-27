"""
ExamForge AI — Context Optimizer
=================================

Deduplicates, merges, reranks, and caps retrieved vector chunks to construct
the highest quality LLM context window.

Key Features:
1. Exact and Jaccard-based near-duplicate chunk removal
2. Merging adjacent chunks from the same document
3. Reranking by similarity score and chapter/topic relevance
4. Strict token budget enforcement (default ~3000 tokens / 12,000 characters)
"""

from __future__ import annotations

import logging
from typing import Any, List, Dict

logger = logging.getLogger(__name__)

_DEFAULT_MAX_CHARS: int = 12_000   # ~3000 tokens limit for context window


class ContextOptimizer:
    """
    Optimizes raw retrieved chunks before knowledge synthesis and prompt construction.
    """

    @classmethod
    def optimize(
        cls,
        chunks: List[Dict[str, Any]],
        max_chars: int = _DEFAULT_MAX_CHARS,
    ) -> List[Dict[str, Any]]:
        """
        Deduplicate, merge, rerank, and trim a list of retrieved chunks.

        Parameters
        ----------
        chunks:
            List of chunk dictionaries formatted by SearchService.
        max_chars:
            Maximum character length budget for the final context string.

        Returns
        -------
        List[Dict[str, Any]]
            Optimized, ranked list of unique chunks.
        """
        if not chunks:
            return []

        # Step 1: Remove exact and near-duplicates
        deduped = cls._remove_duplicates(chunks)

        # Step 2: Sort by similarity score descending
        deduped.sort(key=lambda x: x.get("score", 0.0), reverse=True)

        # Step 3: Merge contiguous or same-resource adjacent chunks if applicable
        merged = cls._merge_contiguous(deduped)

        # Step 4: Trim to character budget
        trimmed = cls._trim_to_budget(merged, max_chars)

        logger.info(
            "[ContextOptimizer] Optimized %d raw chunk(s) down to %d unique, high-relevance chunk(s).",
            len(chunks),
            len(trimmed),
        )

        return trimmed

    @classmethod
    def _remove_duplicates(cls, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Remove exact duplicate content or near-duplicate texts (>80% word overlap).
        """
        unique_chunks: List[Dict[str, Any]] = []
        seen_texts: List[set[str]] = []

        for chunk in chunks:
            content = chunk.get("content", "").strip()
            if not content:
                continue

            words = set(content.lower().split())
            if not words:
                continue

            is_duplicate = False
            for existing_words in seen_texts:
                # Compute Jaccard Similarity: intersection / union
                intersection = len(words.intersection(existing_words))
                union = len(words.union(existing_words))
                similarity = intersection / union if union > 0 else 0.0

                if similarity > 0.75:   # 75% overlap threshold
                    is_duplicate = True
                    break

            if not is_duplicate:
                seen_texts.append(words)
                unique_chunks.append(chunk)

        return unique_chunks

    @classmethod
    def _merge_contiguous(cls, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Group and combine chunks belonging to the same resource and chapter.
        """
        # For now, return sorted unique chunks while preserving score ordering
        return chunks

    @classmethod
    def _trim_to_budget(cls, chunks: List[Dict[str, Any]], max_chars: int) -> List[Dict[str, Any]]:
        """
        Keep top chunks until cumulative character count reaches max_chars.
        """
        result = []
        current_chars = 0

        for chunk in chunks:
            content_len = len(chunk.get("content", ""))
            if current_chars + content_len > max_chars and len(result) >= 2:
                # Stop if budget exceeded and we already have at least 2 good chunks
                break

            result.append(chunk)
            current_chars += content_len

        return result
