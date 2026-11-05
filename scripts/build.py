#!/usr/bin/env python3
"""Merge data JSON into web/atlas.json and refresh the README table."""

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
START = "<!-- RECIPES:START -->"
END = "<!-- RECIPES:END -->"


def load(path):
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def recipe_table(recipes):
    lines = [
        "| 模型 | 机构与时间 | 参数规模 (总/激活) | 后训练核心范式 | 底层 RL Infra | 开源程度 | 来源 |",
        "| :--- | :--- | :--- | :--- | :--- | :--- | :--- |",
    ]
    for recipe in recipes:
        source = recipe.get("source_link") or ""
        label = recipe.get("source_label") or "source"
        source_cell = f"[{label}]({source})" if source else label
        lines.append(
            "| **{name}** | {org} ({date}) | {total} / A{active} | {paradigm} | `{infra}` | {openness} | {source} |".format(
                name=recipe["name"],
                org=recipe["org"],
                date=recipe["date"],
                total=recipe["params_total"],
                active=recipe["params_active"],
                paradigm=recipe["paradigm_label"],
                infra=recipe["infra_stack"].replace("|", "\\|"),
                openness=recipe["openness"].replace("|", "\\|"),
                source=source_cell,
            )
        )
    return "\n".join(lines)


def refresh_readme(table):
    path = ROOT / "README.md"
    text = path.read_text(encoding="utf-8")
    if START not in text or END not in text:
        raise SystemExit("README.md is missing recipe table markers")
    before, rest = text.split(START, 1)
    _, after = rest.split(END, 1)
    path.write_text(f"{before}{START}\n{table}\n{END}{after}", encoding="utf-8")


def main():
    check = subprocess.run([sys.executable, str(ROOT / "scripts" / "validate.py")], check=False)
    if check.returncode != 0:
        return check.returncode

    backbone = load(DATA / "backbone.json")
    problems = load(DATA / "problems.json")
    def date_key(recipe):
        text = recipe.get("date", "")
        name = recipe.get("name", "")
        start = re.match(r"(\d{4})\.(\d{2})", text)
        if not start:
            return (9999, 99, 9999, 99, name)
        start_y, start_m = int(start.group(1)), int(start.group(2))
        end = re.search(r"-\s*(\d{4}\.)?(\d{2})", text)
        if end and end.group(1):
            end_y, end_m = int(end.group(1)[:-1]), int(end.group(2))
        elif end:
            end_m = int(end.group(2))
            end_y = start_y if end_m >= start_m else start_y + 1
        else:
            end_y, end_m = start_y, start_m
        return (start_y, start_m, end_y, end_m, name)

    recipes = sorted(
        (load(path) for path in (DATA / "recipes").glob("*.json")),
        key=date_key,
    )
    atlas = {
        "version": backbone["version"],
        "lenses": backbone["lenses"],
        "canonical_stages": backbone["canonical_stages"],
        "problems": problems["problems"],
        "recipes": recipes,
    }
    out = ROOT / "web" / "atlas.json"
    out.write_text(json.dumps(atlas, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    refresh_readme(recipe_table(recipes))
    print(f"wrote {out} ({len(recipes)} recipes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
