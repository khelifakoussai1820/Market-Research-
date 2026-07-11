from sqlalchemy.orm import Session
from app.models.brand import Brand
from app.models.competitor import Competitor
from app.schemas.brand import BrandConfirmRequest
from app.services.llm_services import generate_brand_understanding, web_search


async def analyze_brand_description(description: str) -> dict:
    """
    Step 1 of user flow: take a raw company description and return
    AI-generated brand intelligence suggestions, grounded in a real web
    search so competitors are relevant to the described local market.
    """
    search_query = f"{description} concurrents et marques similaires prix abordables"
    search_context = web_search(search_query)
    result = await generate_brand_understanding(description, search_context)
    return result


def confirm_brand(db: Session, user_id: int, data: BrandConfirmRequest) -> Brand:
    """
    Step 2: Save the user-confirmed (possibly edited) brand data to the DB,
    including creating competitor entries.
    """
    brand = Brand(
        user_id=user_id,
        name=data.name,
        description=data.description,
        mission=data.mission,
        industry=data.industry,
        target_audience=data.target_audience,
        brand_tone=data.brand_tone,
    )
    db.add(brand)
    db.flush()  # get brand.id before committing

    for comp_name in data.competitors:
        competitor = Competitor(brand_id=brand.id, name=comp_name)
        db.add(competitor)

    db.commit()
    db.refresh(brand)
    return brand


def get_brand(db: Session, brand_id: int) -> Brand | None:
    return db.query(Brand).filter(Brand.id == brand_id).first()