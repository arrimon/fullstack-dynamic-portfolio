from fastapi import APIRouter

from app.api import (
    auth,
    certifications,
    contact,
    education,
    experience,
    projects,
    resume,
    settings,
    social_links,
    technologies,
    testimonials,
)
from app.api.admin.router import router as admin_router

api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router)
api_router.include_router(projects.router)
api_router.include_router(experience.router)
api_router.include_router(education.router)
api_router.include_router(certifications.router)
api_router.include_router(technologies.router)
api_router.include_router(testimonials.router)
api_router.include_router(resume.router)
api_router.include_router(settings.router)
api_router.include_router(social_links.router)
api_router.include_router(contact.router)
api_router.include_router(admin_router, prefix="/admin")