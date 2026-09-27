"""
Aptora - Chunk Service
"""

from langchain_text_splitters import RecursiveCharacterTextSplitter


class ChunkService:

    DEFAULT_CHUNK_SIZE = 1000
    DEFAULT_OVERLAP = 200

    @classmethod
    def split(
        cls,
        text: str,
    ) -> list[str]:

        if not text.strip():
            return []

        splitter = RecursiveCharacterTextSplitter(

            chunk_size=cls.DEFAULT_CHUNK_SIZE,

            chunk_overlap=cls.DEFAULT_OVERLAP,

            separators=[
                "\n\n",
                "\n",
                ". ",
                "? ",
                "! ",
                ";",
                ",",
                " ",
                "",
            ],
        )

        chunks = splitter.split_text(text)

        return chunks