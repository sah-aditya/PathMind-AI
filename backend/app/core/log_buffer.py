import logging
from collections import deque
from datetime import datetime
from typing import List, Dict, Optional
import re
import threading

_ANSI_ESCAPE = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')


def _strip_ansi(text: str) -> str:
    """Remove ANSI terminal color escape codes from log lines."""
    return _ANSI_ESCAPE.sub('', text)


class InMemoryLogBufferHandler(logging.Handler):
    """
    High-performance, thread-safe in-memory ring buffer that captures
    application logs, uvicorn access events, exceptions, and AI synthesis calls.
    """
    def __init__(self, capacity: int = 1500):
        super().__init__()
        self.capacity = capacity
        self.buffer = deque(maxlen=capacity)
        self.lock = threading.Lock()
        self._seq = 0

    def emit(self, record: logging.LogRecord):
        try:
            msg = self.format(record)
            clean_msg = _strip_ansi(msg)
            
            level_name = record.levelname.upper()
            if "gemini" in record.name.lower() or "dynamic_goal" in record.name.lower():
                category = "GEMINI"
            elif "uvicorn.access" in record.name.lower() or "http" in record.name.lower():
                category = "HTTP"
            else:
                category = level_name

            with self.lock:
                self._seq += 1
                entry = {
                    "id": self._seq,
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                    "level": level_name,
                    "category": category,
                    "module": record.name,
                    "message": clean_msg,
                    "func_name": record.funcName,
                    "line_no": record.lineno,
                }
                self.buffer.append(entry)
        except Exception:
            self.handleError(record)

    def add_custom_log(self, level: str, category: str, module: str, message: str) -> dict:
        with self.lock:
            self._seq += 1
            entry = {
                "id": self._seq,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "level": level.upper(),
                "category": category.upper(),
                "module": module,
                "message": _strip_ansi(message),
                "func_name": "manual",
                "line_no": 0,
            }
            self.buffer.append(entry)
            return entry

    def get_logs(
        self,
        limit: int = 250,
        level: Optional[str] = None,
        search: Optional[str] = None,
        min_id: Optional[int] = None,
    ) -> List[Dict]:
        with self.lock:
            logs = list(self.buffer)

        if min_id is not None:
            logs = [l for l in logs if l["id"] > min_id]

        if level and level != "ALL":
            target_level = level.upper()
            logs = [l for l in logs if l["level"] == target_level or l["category"] == target_level]

        if search:
            q = search.lower()
            logs = [l for l in logs if q in l["message"].lower() or q in l["module"].lower()]

        # Return latest logs up to limit
        return logs[-limit:]

    def clear(self):
        with self.lock:
            self.buffer.clear()


# Global Singleton Log Buffer
log_buffer = InMemoryLogBufferHandler(capacity=1500)
formatter = logging.Formatter("[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s", datefmt="%H:%M:%S")
log_buffer.setFormatter(formatter)
