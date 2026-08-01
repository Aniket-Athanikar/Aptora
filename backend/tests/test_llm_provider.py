from types import SimpleNamespace
from unittest import TestCase
from unittest.mock import patch

from app.ai.services import llm_service
from app.core.config import settings


class LLMProviderTests(TestCase):
    def test_openrouter_generation_uses_openai_compatible_client(self):
        captured = {}

        def create(**kwargs):
            captured.update(kwargs)
            return SimpleNamespace(
                choices=[SimpleNamespace(message=SimpleNamespace(content=" OpenRouter answer "))]
            )

        fake_client = SimpleNamespace(
            chat=SimpleNamespace(completions=SimpleNamespace(create=create))
        )
        with (
            patch.object(settings, "LLM_PROVIDER", "openrouter"),
            patch.object(settings, "OPENROUTER_MODEL", "openrouter/free"),
            patch.object(llm_service, "get_openrouter_client", return_value=fake_client),
            patch.object(llm_service.LLMService, "_generate_ollama") as ollama,
        ):
            self.assertEqual(llm_service.LLMService.generate("What is RAG?"), "OpenRouter answer")
            ollama.assert_not_called()

        self.assertEqual(captured["model"], "openrouter/free")
        self.assertEqual(captured["temperature"], 0.2)
        self.assertEqual(captured["messages"][1]["content"], "What is RAG?")

    def test_openrouter_stream_keeps_string_chunk_contract(self):
        chunks = [
            SimpleNamespace(choices=[SimpleNamespace(delta=SimpleNamespace(content="Hello"))]),
            SimpleNamespace(choices=[SimpleNamespace(delta=SimpleNamespace(content=None))]),
            SimpleNamespace(choices=[SimpleNamespace(delta=SimpleNamespace(content=" world"))]),
        ]
        fake_client = SimpleNamespace(
            chat=SimpleNamespace(completions=SimpleNamespace(create=lambda **_: iter(chunks)))
        )
        with (
            patch.object(settings, "LLM_PROVIDER", "openrouter"),
            patch.object(llm_service, "get_openrouter_client", return_value=fake_client),
        ):
            self.assertEqual(list(llm_service.LLMService.stream("Greeting")), ["Hello", " world"])

    def test_ollama_remains_the_default_generation_path(self):
        with (
            patch.object(settings, "LLM_PROVIDER", "ollama"),
            patch.object(llm_service.LLMService, "_generate_ollama", return_value="Ollama answer") as ollama,
            patch.object(llm_service.LLMService, "_generate_openrouter") as openrouter,
        ):
            self.assertEqual(llm_service.LLMService.generate("What is RAG?"), "Ollama answer")
            ollama.assert_called_once()
            openrouter.assert_not_called()
