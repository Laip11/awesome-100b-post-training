#!/usr/bin/env python3
"""Check backbone, problems, and recipe JSON before the site is rebuilt."""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
STAGE_IDS = [f"stage_{i}" for i in range(6)]
STATUSES = {"core", "standard", "skipped"}
PARADIGMS = {"serial", "opd", "async_rl"}
ARCHITECTURES = {"moe", "dense"}
RECIPE_FIELDS = [
    "id",
    "name",
    "org",
    "date",
    "params_total",
    "params_active",
    "base_model",
    "architecture",
    "paradigm_type",
    "paradigm_label",
    "openness",
    "source_link",
    "source_label",
    "infra_stack",
    "topology_summary",
    "stages",
]
STAGE_FIELDS = [
    "status",
    "headline",
    "summary",
    "methods",
    "data_And_filtering",
    "infra_notes",
    "problems_solved",
    "gaps",
]


def load(path):
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def main():
    errors = []
    backbone = load(DATA / "backbone.json")
    problems_doc = load(DATA / "problems.json")
    stage_ids = [stage["id"] for stage in backbone.get("canonical_stages", [])]
    if stage_ids != STAGE_IDS:
        errors.append(f"canonical_stages must be {STAGE_IDS}, got {stage_ids}")
    lenses = backbone.get("lenses") or []
    if not lenses:
        errors.append("backbone.json is missing lenses")
    for lens in lenses:
        if "id" not in lens or "title" not in lens or "group" not in lens:
            errors.append(f"lens missing id/title/group: {lens}")
        if not lens.get("track") and not lens.get("stage_ids"):
            errors.append(f"lens {lens.get('id')} needs track or stage_ids")
    problem_ids = {item["id"] for item in problems_doc.get("problems", [])}
    if not problem_ids:
        errors.append("problems.json has no problems")

    recipes = []
    seen = set()
    for path in sorted((DATA / "recipes").glob("*.json")):
        recipe = load(path)
        recipes.append(recipe)
        if recipe.get("id") != path.stem:
            errors.append(f"{path.name}: id {recipe.get('id')!r} does not match filename")
        if recipe.get("id") in seen:
            errors.append(f"duplicate recipe id {recipe.get('id')}")
        seen.add(recipe.get("id"))
        for field in RECIPE_FIELDS:
            if field not in recipe:
                errors.append(f"{path.name}: missing {field}")
        if recipe.get("architecture") not in ARCHITECTURES:
            errors.append(f"{path.name}: bad architecture {recipe.get('architecture')!r}")
        if recipe.get("paradigm_type") not in PARADIGMS:
            errors.append(f"{path.name}: bad paradigm_type {recipe.get('paradigm_type')!r}")
        tracks = recipe.get("tracks") or {}
        for track_id in ("data_synthesis", "pretraining"):
            track = tracks.get(track_id)
            if not isinstance(track, dict):
                errors.append(f"{path.name}: missing tracks.{track_id}")
                continue
            for field in ("status", "headline", "summary", "gaps"):
                if field not in track:
                    errors.append(f"{path.name} tracks.{track_id}: missing {field}")
            if track.get("status") not in STATUSES:
                errors.append(f"{path.name} tracks.{track_id}: bad status")
            if not isinstance(track.get("gaps"), list):
                errors.append(f"{path.name} tracks.{track_id}: gaps must be a list")
        stages = recipe.get("stages") or {}
        for stage_id in STAGE_IDS:
            stage = stages.get(stage_id)
            if not isinstance(stage, dict):
                errors.append(f"{path.name}: missing {stage_id}")
                continue
            for field in STAGE_FIELDS:
                if field not in stage:
                    errors.append(f"{path.name} {stage_id}: missing {field}")
            if stage.get("status") not in STATUSES:
                errors.append(f"{path.name} {stage_id}: bad status {stage.get('status')!r}")
            if not isinstance(stage.get("methods"), list):
                errors.append(f"{path.name} {stage_id}: methods must be a list")
            if not isinstance(stage.get("gaps"), list) or not all(isinstance(item, str) for item in stage.get("gaps", [])):
                errors.append(f"{path.name} {stage_id}: gaps must be a list of strings")
            if "detail" in stage and not isinstance(stage["detail"], str):
                errors.append(f"{path.name} {stage_id}: detail must be a string")
            for problem_id in stage.get("problems_solved") or []:
                if problem_id not in problem_ids:
                    errors.append(f"{path.name} {stage_id}: unknown problem {problem_id}")

    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1
    print(f"ok: {len(recipes)} recipes, {len(problem_ids)} problems")
    return 0


if __name__ == "__main__":
    sys.exit(main())
