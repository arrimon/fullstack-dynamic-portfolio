from sqlalchemy import func, select

from app.core.database import SessionLocal
from app.data.tech_catalog import TECH_CATALOG
from app.models.site_setting import SiteSetting
from app.models.technology import Technology
from app.services.auth_service import ensure_admin_exists

# Default Tech Stack display settings (only inserted when missing so existing
# admin-configured values are preserved).
DEFAULT_TECH_SETTINGS: dict[str, str] = {
    "tech_stack_section_enabled": "true",
    "tech_stack_animation_enabled": "true",
    "tech_stack_animation_direction": "left",
    "tech_stack_animation_speed": "normal",
    "tech_stack_pause_on_hover": "true",
    "tech_stack_show_category": "true",
    "tech_stack_show_name": "true",
}


def seed_technologies(db) -> None:
    existing = {
        t.name: t
        for t in db.scalars(select(Technology)).all()
    }
    max_order = db.scalar(select(func.max(Technology.display_order))) or 0
    next_order = max_order

    for item in TECH_CATALOG:
        current = existing.get(item["name"])
        if current is not None:
            # Preserve admin-controlled values (is_active / display_order).
            # Only backfill the icon when it is missing.
            if not current.icon_url:
                current.icon_url = item["icon_url"]
            continue
        next_order += 1
        db.add(
            Technology(
                name=item["name"],
                category=item["category"],
                icon_url=item["icon_url"],
                display_order=next_order,
                is_active=True,
            )
        )
    db.commit()
    print("Technology catalog seed complete.")


def seed_settings(db) -> None:
    existing_keys = {
        s.key for s in db.scalars(select(SiteSetting)).all()
    }
    added = 0
    for key, value in DEFAULT_TECH_SETTINGS.items():
        if key not in existing_keys:
            db.add(SiteSetting(key=key, value=value))
            added += 1
    if added:
        db.commit()
        print(f"Seeded {added} default Tech Stack setting(s).")
    else:
        print("Tech Stack settings already present.")


def main() -> None:
    db = SessionLocal()
    try:
        ensure_admin_exists(db)
        seed_technologies(db)
        seed_settings(db)
        print("Seed complete.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
