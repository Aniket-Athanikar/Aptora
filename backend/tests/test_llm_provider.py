from types import SimpleNamespace
from unittest import TestCase
from unittest.mock import patch

from app.ai.services import llm_service


class OpenAIProviderTests(TestCase):
    def test_generation_uses_configured_openai_model(self):
        captured = {}

        def create(**kwargs):
            captured.update(kwargs)
            return SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=" OpenAI answer "))])

        fake_client = SimpleNamespace(chat=SimpleNamespace(completions=SimpleNamespace(create=create)))
        with patch.object(llm_service, "get_openai_client", return_value=fake_client):
            self.assertEqual(llm_service.LLMService.generate("What is RAG?"), "OpenAI answer")

        self.assertEqual(captured["model"], llm_service.LLMService.MODEL_NAME)
        self.assertEqual(captured["temperature"], 0.2)
        self.assertEqual(captured["messages"][1]["content"], "What is RAG?")

    def test_json_generation_uses_json_mode_and_validates_response(self):
        captured = {}

        def create(**kwargs):
            captured.update(kwargs)
            return SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content='{"answer":"ok"}'))])

        fake_client = SimpleNamespace(chat=SimpleNamespace(completions=SimpleNamespace(create=create)))
        with patch.object(llm_service, "get_openai_client", return_value=fake_client):
            self.assertEqual(llm_service.LLMService.generate_json("Return JSON."), {"answer": "ok"})

        self.assertEqual(captured["response_format"], {"type": "json_object"})

    def test_json_generation_rejects_invalid_json(self):
        fake_client = SimpleNamespace(
            chat=SimpleNamespace(completions=SimpleNamespace(create=lambda **_: SimpleNamespace(
                choices=[SimpleNamespace(message=SimpleNamespace(content="not json"))]
            )))
        )
        with patch.object(llm_service, "get_openai_client", return_value=fake_client):
            with self.assertRaisesRegex(RuntimeError, "[iI]nvalid JSON"):
                llm_service.LLMService.generate_json("Return JSON.")


    def test_stream_keeps_string_chunk_contract(self):
        chunks = [
            SimpleNamespace(choices=[SimpleNamespace(delta=SimpleNamespace(content="Hello"))]),
            SimpleNamespace(choices=[SimpleNamespace(delta=SimpleNamespace(content=None))]),
            SimpleNamespace(choices=[SimpleNamespace(delta=SimpleNamespace(content=" world"))]),
        ]
        fake_client = SimpleNamespace(chat=SimpleNamespace(completions=SimpleNamespace(create=lambda **_: iter(chunks))))
        with patch.object(llm_service, "get_openai_client", return_value=fake_client):
            self.assertEqual(list(llm_service.LLMService.stream("Greeting")), ["Hello", " world"])
