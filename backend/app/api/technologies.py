from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.data.tech_catalog import TECH_CATALOG
from app.models.technology import Technology
from app.schemas.technology import TechnologyCatalogItem, TechnologyRead

router = APIRouter(prefix="/technologies", tags=["Technologies"])


@router.get(
    "/catalog",
    response_model=list[TechnologyCatalogItem],
    summary="List the predefined technology catalog",
    description=(
        "Returns the centralized catalog of supported technologies with their "
        "Devicon SVG URLs. Used by the admin panel to auto-fill icons and categories."
    ),
)
def list_catalog():
    return TECH_CATALOG


@router.get(
    "",
    response_model=list[TechnologyRead],
    summary="List active technologies",
)
def list_technologies(db: Session = Depends(get_db)):
    return db.scalars(
        select(Technology)
        .where(Technology.is_active.is_(True))
        .order_by(Technology.display_order, Technology.name)
    ).all()