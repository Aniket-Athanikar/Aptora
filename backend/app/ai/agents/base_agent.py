"""
ExamForge AI - Base Agent

Base class for all AI agents.

Responsibilities:
1. Build prompts
2. Call the LLM
3. Support streaming responses
4. Provide a common interface for specialized agents
"""

from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from typing import Generator

from app.ai.services.llm_service import LLMService

logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """
    Base class for all AI agents.

    Every agent should implement its own prompt builder
    while sharing the same LLM interaction logic.
    """

    NAME = "BaseAgent"

    @property
    def name(self) -> str:
        """
        Human-readable agent name.
        """

        return self.NAME

    @property
    @abstractmethod
    def system_prompt(self) -> str:
        """
        System instructions for the agent.
        """
        raise NotImplementedError

    @abstractmethod
    def build_prompt(
        self,
        *args,
        **kwargs,
    ) -> str:
        """
        Build the final prompt sent to the LLM.
        """
        raise NotImplementedError

    def generate(
        self,
        *args,
        **kwargs,
    ) -> str:
        """
        Generate a complete response.
        """

        prompt = self.build_prompt(
            *args,
            **kwargs,
        )

        logger.info(
            "%s generating response.",
            self.name,
        )

        response = LLMService.generate(prompt)

        logger.info(
            "%s completed.",
            self.name,
        )

        return response

    def stream(
        self,
        *args,
        **kwargs,
    ) -> Generator[str, None, None]:
        """
        Stream the response from the LLM.
        """

        prompt = self.build_prompt(
            *args,
            **kwargs,
        )

        logger.info(
            "%s streaming response.",
            self.name,
        )

        yield from LLMService.stream(prompt)

        logger.info(
            "%s streaming completed.",
            self.name,
        )