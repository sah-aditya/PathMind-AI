"""Shared data helpers for loading JSON data files."""
import json
import os
from typing import Optional

_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


def _load_json(filename: str):
    with open(os.path.join(_DATA_DIR, filename), "r", encoding="utf-8") as f:
        return json.load(f)


_ASSESSMENTS: list = _load_json("assessments.json")
_ASSESSMENT_BY_ID = {a["id"]: a for a in _ASSESSMENTS}
_ASSESSMENT_BY_RESOURCE = {a["resource_id"]: a for a in _ASSESSMENTS}


def get_assessment_by_id(assessment_id: str) -> Optional[dict]:
    return _ASSESSMENT_BY_ID.get(assessment_id)


def get_assessment_for_resource(resource_id: str) -> Optional[dict]:
    return _ASSESSMENT_BY_RESOURCE.get(resource_id)
