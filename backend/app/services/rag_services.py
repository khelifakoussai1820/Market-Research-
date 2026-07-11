import asyncio
import chromadb
from app.core.config import settings

# Persistent ChromaDB client — stores data in ./chroma_db folder
_client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)
_collection = _client.get_or_create_collection(name="market_reports")


async def index_report(brand_id: int, report_id: int, report_text: str) -> None:
    """
    Index a market report into ChromaDB for later retrieval.
    Each chunk is stored with brand_id and report_id metadata.
    """
    loop = asyncio.get_event_loop()

    def _add():
        _collection.upsert(
            documents=[report_text],
            ids=[f"report_{report_id}"],
            metadatas=[{"brand_id": brand_id, "report_id": report_id}],
        )

    await loop.run_in_executor(None, _add)


async def query_rag(brand_id: int, question: str, n_results: int = 3) -> list[str]:
    """
    Retrieve relevant report chunks for a brand based on a natural language question.
    Used by the chat feature.
    """
    loop = asyncio.get_event_loop()

    def _query():
        return _collection.query(
            query_texts=[question],
            n_results=n_results,
            where={"brand_id": brand_id},
        )

    results = await loop.run_in_executor(None, _query)
    return results.get("documents", [[]])[0]
