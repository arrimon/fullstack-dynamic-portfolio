import asyncio
import logging
import httpx

from app.core.config import settings

logger = logging.getLogger("portfolio.keep_alive")


async def keep_alive_loop() -> None:
    if not settings.keep_alive_enabled:
        logger.debug("[KeepAlive] Disabled, not starting scheduler")
        return

    logger.info(
        "[KeepAlive] Starting scheduler every %ss against %s",
        settings.keep_alive_interval,
        settings.keep_alive_url,
    )
    # Allow the server a brief startup window before firing the first keep-alive ping
    await asyncio.sleep(5)
    async with httpx.AsyncClient(
        timeout=settings.keep_alive_timeout,
        headers={"User-Agent": "Portfolio-KeepAlive/1.0"},
    ) as client:
        while True:
            try:
                response = await client.get(settings.keep_alive_url)
                logger.info(
                    "[KeepAlive] Ping to %s successful (status=%s)",
                    settings.keep_alive_url,
                    response.status_code,
                )
            except Exception as exc:  # noqa: BLE001 - never crash on failed ping
                logger.warning("[KeepAlive] Ping failed: %s", exc)
            await asyncio.sleep(settings.keep_alive_interval)