import asyncio
import logging
import re
import chromadb
from chromadb.utils.embedding_functions import ONNXMiniLM_L6_V2
from app.core.config import settings

logger = logging.getLogger(__name__)

# Lazy-initialized ChromaDB resources (loaded on first use, not at import time)
_client = None
_collection = None
_ef = None


def _get_collection():
    """Lazily initialize ChromaDB + ONNX embedding model on first use."""
    global _client, _collection, _ef
    if _collection is not None:
        return _collection

    logger.info("Chargement du modèle d'embedding ONNX + ChromaDB...")
    _ef = ONNXMiniLM_L6_V2()
    _client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)
    _collection = _client.get_or_create_collection(
        name="market_reports",
        embedding_function=_ef,
    )
    logger.info("ChromaDB prêt.")
    return _collection


def chunk_report_text(report_text: str) -> list[dict]:
    """Split report into semantic chunks by section headers."""
    chunks = []
    raw_sections = re.split(r'\n(?=\w[\w\s]*:\n)', report_text)
    for i, section in enumerate(raw_sections):
        cleaned = section.strip()
        if cleaned:
            chunks.append({"text": cleaned, "chunk_index": i})
    return chunks


async def index_report(brand_id: int, report_id: int, report_text: str) -> None:
    """Index a market report into ChromaDB for later retrieval."""
    chunks = chunk_report_text(report_text)
    if not chunks:
        return

    collection = _get_collection()
    loop = asyncio.get_event_loop()

    def _add():
        collection.upsert(
            documents=[c["text"] for c in chunks],
            ids=[f"report_{report_id}_chunk_{c['chunk_index']}" for c in chunks],
            metadatas=[
                {"brand_id": brand_id, "report_id": report_id, "chunk_index": c["chunk_index"]}
                for c in chunks
            ],
        )

    await loop.run_in_executor(None, _add)


async def query_rag(brand_id: int, question: str, n_results: int = 5) -> list[str]:
    """Retrieve relevant report chunks for a brand based on a natural language question."""
    collection = _get_collection()
    loop = asyncio.get_event_loop()

    def _query():
        return collection.query(
            query_texts=[question],
            n_results=n_results,
            where={"brand_id": brand_id},
        )

    results = await loop.run_in_executor(None, _query)
    return results.get("documents", [[]])[0]
