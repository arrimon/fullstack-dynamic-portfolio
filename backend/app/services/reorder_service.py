from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.common import ReorderRequest


def apply_reorder(db: Session, model, payload: ReorderRequest) -> None:
    """Reusable bulk `display_order` updater for any SQLAlchemy model.

    All items are validated and updated in a single transaction so that a
    failed request does not leave a partially-reordered list behind.
    """
    for item in payload.items:
        obj = db.get(model, item.id)
        if obj is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Item not found (id={item.id})",
            )
        obj.display_order = item.display_order
    db.commit()