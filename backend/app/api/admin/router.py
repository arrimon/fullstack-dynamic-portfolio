from fastapi import APIRouter

from app.api.admin import (
    account,
    certifications,
    contact_messages,
    education,
    experience,
    project_images,
    projects,
    resume,
    settings,
    social_links,
    technologies,
    testimonials,
)

router = APIRouter()
router.include_router(account.router)
router.include_router(projects.router)
router.include_router(project_images.router)
router.include_router(experience.router)
router.include_router(education.router)
router.include_router(certifications.router)
router.include_router(technologies.router)
router.include_router(testimonials.router)
router.include_router(resume.router)
router.include_router(contact_messages.router)
router.include_router(settings.router)
router.include_router(social_links.router)