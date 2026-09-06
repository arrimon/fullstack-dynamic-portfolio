import asyncio
import logging
import urllib.request

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
    while True:
        try:
            await asyncio.to_thread(_ping, settings.keep_alive_url, settings.keep_alive_timeout)
            logger.info("[KeepAlive] Ping successful")
        except Exception as exc:  # noqa: BLE001 - never crash on failed ping
            logger.warning("[KeepAlive] Ping failed: %s", exc)
        await asyncio.sleep(settings.keep_alive_interval)


def _ping(url: str, timeout: int) -> None:
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        resp.read()