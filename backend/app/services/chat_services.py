from app.services.rag_services import query_rag
from app.services.llm_services import answer_question


async def ask_about_brand(brand_id: int, question: str) -> dict:
    """
    Retrieve relevant report context for a brand from ChromaDB (RAG)
    and use the LLM to answer the user's question.
    """
    chunks = await query_rag(brand_id=brand_id, question=question)
    context = "\n\n".join(chunks) if chunks else ""
    answer = await answer_question(question=question, context=context)
    return {"answer": answer, "sources": chunks}
