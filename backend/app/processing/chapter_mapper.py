"""
Aptora - Chapter Mapper
=============================

Processing stage: DocumentProcessor -> ChapterMapper

Maps document chunks into logical chapter structures using a 3-tier fallback rule:
1. Primary: Use explicit headings (from MetadataExtractor)
2. Secondary: Use detected topics (from TopicDetector)
3. Tertiary: Fallback to chunk-range based chapter partitioning (Chapter 1, Chapter 2, ...)

Design principles
-----------------
- Pure-function interface (ChapterMapper.map is stateless)
- Complete coverage: Every chunk from 0 to len(chunks)-1 is mapped to a chapter
- Output format: List of dicts with keys: chapter, start_chunk, end_chunk, chunk_count
"""

from __future__ import annotations

import math
import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# Default number of chunks per chapter when using fallback rule
DEFAULT_CHAPTER_CHUNK_SIZE: int = 5


class ChapterMapper:
    """
    Production-ready chapter mapping service for chunked document text.
    """

    @staticmethod
    def map(
        chunks: List[str],
        headings: Optional[List[str]] = None,
        topics: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Map a list of text chunks into logical chapters.

        Parameters
        ----------
        chunks : List[str]
            List of document text chunks.
        headings : List[str], optional
            Headings extracted from MetadataExtractor.
        topics : List[str], optional
            Topics detected by TopicDetector.

        Returns
        -------
        List[Dict[str, Any]]
            List of chapter mapping dictionaries. Each dictionary contains:
            - 'chapter': str
            - 'start_chunk': int
            - 'end_chunk': int
            - 'chunk_count': int
        """
        if not chunks:
            logger.warning("[ChapterMapper] Empty chunks passed to ChapterMapper.")
            return []

        total_chunks = len(chunks)

        # Rule 1: Use Headings if available
        if headings and len(headings) > 0:
            logger.info("[ChapterMapper] Mapping chapters using %d headings...", len(headings))
            chapter_map = ChapterMapper._map_by_headings(chunks, headings)
            if chapter_map:
                return chapter_map

        # Rule 2: Use Topics if headings unavailable
        if topics and len(topics) > 0:
            logger.info("[ChapterMapper] Mapping chapters using %d topics...", len(topics))
            return ChapterMapper._map_by_topics(total_chunks, topics)

        # Rule 3: Fallback to fixed chunk range partitioning
        logger.info("[ChapterMapper] Mapping chapters using default chunk range partitioning...")
        return ChapterMapper._map_by_chunk_ranges(total_chunks)

    # -----------------------------------------------------------------------
    # Private Helpers for Rule Implementations
    # -----------------------------------------------------------------------

    @staticmethod
    def _map_by_headings(chunks: List[str], headings: List[str]) -> List[Dict[str, Any]]:
        """
        Map chunks based on occurrences of headings inside chunks.
        """
        total_chunks = len(chunks)
        heading_matches: List[tuple[str, int]] = []

        # Find first matching chunk index for each heading
        for heading in headings:
            clean_h = heading.strip()
            if not clean_h:
                continue

            for idx, chunk in enumerate(chunks):
                if clean_h.lower() in chunk.lower():
                    heading_matches.append((clean_h, idx))
                    break

        if not heading_matches:
            return []

        # Sort matches by chunk index and remove duplicate indices
        heading_matches.sort(key=lambda x: x[1])

        unique_matches: List[tuple[str, int]] = []
        seen_indices: set[int] = set()

        for title, idx in heading_matches:
            if idx not in seen_indices:
                seen_indices.add(idx)
                unique_matches.append((title, idx))

        result: List[Dict[str, Any]] = []

        # If the first heading starts after chunk 0, label prefix chunks as "Introduction"
        if unique_matches[0][1] > 0:
            start = 0
            end = unique_matches[0][1] - 1
            result.append(
                ChapterMapper._build_chapter_dict(
                    name="Introduction",
                    start_chunk=start,
                    end_chunk=end,
                )
            )

        # Build ranges between consecutive heading matches
        for i in range(len(unique_matches)):
            title, start_idx = unique_matches[i]
            if i + 1 < len(unique_matches):
                end_idx = unique_matches[i + 1][1] - 1
            else:
                end_idx = total_chunks - 1

            if end_idx >= start_idx:
                result.append(
                    ChapterMapper._build_chapter_dict(
                        name=title,
                        start_chunk=start_idx,
                        end_chunk=end_idx,
                    )
                )

        return result

    @staticmethod
    def _map_by_topics(total_chunks: int, topics: List[str]) -> List[Dict[str, Any]]:
        """
        Partition total_chunks evenly among available topics.
        """
        num_topics = len(topics)
        chunks_per_topic = max(1, math.ceil(total_chunks / num_topics))

        result: List[Dict[str, Any]] = []
        start_chunk = 0

        for i, topic in enumerate(topics):
            if start_chunk >= total_chunks:
                break

            end_chunk = min(start_chunk + chunks_per_topic - 1, total_chunks - 1)

            # For the last topic, absorb any small trailing remainder
            if i == num_topics - 1 or end_chunk >= total_chunks - 1:
                end_chunk = total_chunks - 1

            result.append(
                ChapterMapper._build_chapter_dict(
                    name=topic,
                    start_chunk=start_chunk,
                    end_chunk=end_chunk,
                )
            )

            start_chunk = end_chunk + 1

        return result

    @staticmethod
    def _map_by_chunk_ranges(total_chunks: int) -> List[Dict[str, Any]]:
        """
        Partition total_chunks into default numbered chapters (Chapter 1, Chapter 2, ...).
        """
        chunk_size = DEFAULT_CHAPTER_CHUNK_SIZE
        num_chapters = math.ceil(total_chunks / chunk_size)

        result: List[Dict[str, Any]] = []

        for i in range(num_chapters):
            start_chunk = i * chunk_size
            end_chunk = min(start_chunk + chunk_size - 1, total_chunks - 1)

            result.append(
                ChapterMapper._build_chapter_dict(
                    name=f"Chapter {i + 1}",
                    start_chunk=start_chunk,
                    end_chunk=end_chunk,
                )
            )

        return result

    @staticmethod
    def _build_chapter_dict(name: str, start_chunk: int, end_chunk: int) -> Dict[str, Any]:
        """
        Helper method to construct a standard chapter mapping dictionary.
        """
        count = end_chunk - start_chunk + 1
        return {
            "chapter": name,
            "start_chunk": start_chunk,
            "end_chunk": end_chunk,
            "chunk_count": count,
        }


# ---------------------------------------------------------------------------
# Smoke Test
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import json
    from app.processing.topic_detector import TopicDetector

    logging.basicConfig(level=logging.INFO)

    sample_chunks = [
        "Introduction to Computer Science and Programming Fundamentals. Scope and Overview.",
        "Variables and Data Types in Python. Integer, Float, String, and Boolean representations.",
        "Conditional Logic. If-else branching and boolean expressions.",
        "Loops and Iteration. For loops, while loops, and range generators.",
        "Functions and Scope. Modular programming, parameters, and return values.",
        "Data Structures Overview. Lists, Tuples, Dictionaries, and Sets in Python.",
        "Object-Oriented Programming. Classes, Objects, Attributes, and Methods.",
        "Advanced OOP Concepts. Inheritance, Encapsulation, and Polymorphism.",
        "Algorithm Analysis. Measuring space and time complexity using Big-O Notation.",
        "Sorting Algorithms. Bubble Sort, Merge Sort, Quick Sort implementations.",
        "Search Algorithms. Linear Search vs Binary Search comparison.",
        "File I/O and Exception Handling. Reading, writing files, try-except blocks.",
    ]

    sample_text = "\n\n".join(sample_chunks)

    print("=" * 60)
    print("ChapterMapper & TopicDetector - Integration Test")
    print("=" * 60)

    # 1. Run TopicDetector
    print("\n[1] Running TopicDetector...")
    detected_topics = TopicDetector.detect(sample_text)
    print(f"Detected Topics ({len(detected_topics)}):")
    print(json.dumps(detected_topics, indent=2))

    # 2. Run ChapterMapper with Headings
    sample_headings = ["Variables and Data Types", "Object-Oriented Programming", "Algorithm Analysis"]
    print("\n[2] Running ChapterMapper with explicit headings...")
    chapters_by_headings = ChapterMapper.map(sample_chunks, headings=sample_headings)
    print(f"Detected Chapters by Headings ({len(chapters_by_headings)}):")
    print(json.dumps(chapters_by_headings, indent=2))

    # 3. Run ChapterMapper with Topics fallback
    print("\n[3] Running ChapterMapper with detected topics fallback...")
    chapters_by_topics = ChapterMapper.map(sample_chunks, topics=detected_topics)
    print(f"Detected Chapters by Topics ({len(chapters_by_topics)}):")
    print(json.dumps(chapters_by_topics, indent=2))

    # 4. Run ChapterMapper with chunk range fallback
    print("\n[4] Running ChapterMapper with chunk range fallback...")
    chapters_by_ranges = ChapterMapper.map(sample_chunks)
    print(f"Detected Chapters by Default Chunk Ranges ({len(chapters_by_ranges)}):")
    print(json.dumps(chapters_by_ranges, indent=2))
