from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

from jsonschema import Draft202012Validator


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
SCHEMAS = DOCS / "schemas"


PT_WEEKDAYS = {
    0: "Segunda-feira",
    1: "Terça-feira",
    2: "Quarta-feira",
    3: "Quinta-feira",
    4: "Sexta-feira",
    5: "Sábado",
    6: "Domingo"
}


@dataclass
class ValidationIssue:
    scope: str
    message: str


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def load_schema(path: Path) -> Draft202012Validator:
    schema = load_json(path)
    return Draft202012Validator(schema)


def parse_date(value: str) -> date:
    return date.fromisoformat(value)


def parse_datetime(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def parse_time_minutes(value: str) -> int:
    hours, minutes = value.split(":")
    return int(hours) * 60 + int(minutes)


def validate_schema(name: str, data: Any, validator: Draft202012Validator) -> list[ValidationIssue]:
    issues: list[ValidationIssue] = []
    for error in sorted(validator.iter_errors(data), key=str):
        path = ".".join(str(part) for part in error.absolute_path) or "$"
        issues.append(ValidationIssue(name, f"{path}: {error.message}"))
    return issues


def validate_publicwebsite(data: dict[str, Any]) -> list[ValidationIssue]:
    issues: list[ValidationIssue] = []
    meta = data["meta"]

    if meta["totalOrixas"] != len(data["orixas"]):
        issues.append(ValidationIssue("dados-publicwebsite.json", "meta.totalOrixas diverge da quantidade real de orixás"))
    if meta["totalGuias"] != len(data["guiasEntidades"]):
        issues.append(ValidationIssue("dados-publicwebsite.json", "meta.totalGuias diverge da quantidade real de guias"))
    if meta["totalLinhas"] != len(data["linhasUmbanda"]):
        issues.append(ValidationIssue("dados-publicwebsite.json", "meta.totalLinhas diverge da quantidade real de linhas"))
    if meta["totalOracoes"] != len(data["oracoes"]):
        issues.append(ValidationIssue("dados-publicwebsite.json", "meta.totalOracoes diverge da quantidade real de orações"))

    orixa_names = {item["name"] for item in data["orixas"]}
    guia_names = {item["name"] for item in data["guiasEntidades"]}

    for collection_name in ("orixas", "guiasEntidades", "linhasUmbanda", "oracoes"):
        slugs = [item["slug"] for item in data[collection_name]]
        ids = [item["id"] for item in data[collection_name]]
        if len(slugs) != len(set(slugs)):
            issues.append(ValidationIssue("dados-publicwebsite.json", f"{collection_name} contém slugs duplicados"))
        if len(ids) != len(set(ids)):
            issues.append(ValidationIssue("dados-publicwebsite.json", f"{collection_name} contém ids duplicados"))

    for item in data["orixas"]:
        if item["name"].strip().lower() != re.sub(r"-+", "-", item["slug"]).replace("-", " ").strip().lower():
            continue
        if item["displayOrder"] <= 0:
            issues.append(ValidationIssue("dados-publicwebsite.json", f"Orixá {item['name']} possui displayOrder inválido"))

    for line in data["linhasUmbanda"]:
        regida_por = line["regidaPor"].split(" e ")[0].split("/")[0].strip()
        if regida_por not in orixa_names:
            issues.append(ValidationIssue("dados-publicwebsite.json", f"Linha {line['name']} referencia Orixá inexistente em regidaPor: {line['regidaPor']}"))
        for guide in line.get("relatedGuides", []):
            if guide not in guia_names:
                issues.append(ValidationIssue("dados-publicwebsite.json", f"Linha {line['name']} referencia guia inexistente: {guide}"))

    for item in data["oracoes"]:
        content = item["content"].strip()
        if len(content.splitlines()) < 2:
            issues.append(ValidationIssue("dados-publicwebsite.json", f"Oração {item['title']} possui conteúdo insuficiente"))

    created_at = parse_datetime(meta["createdAt"])
    updated_at = parse_datetime(meta["updatedAt"])
    if updated_at < created_at:
        issues.append(ValidationIssue("dados-publicwebsite.json", "meta.updatedAt é anterior a meta.createdAt"))

    return issues


def validate_calendar(data: dict[str, Any]) -> list[ValidationIssue]:
    issues: list[ValidationIssue] = []
    meta = data["meta"]

    if meta["totalEventos"] != len(data["eventos"]):
        issues.append(ValidationIssue("dados-calendario-2026.json", "meta.totalEventos diverge da quantidade real de eventos"))

    try:
        ZoneInfo(meta["timezone"])
    except Exception:
        issues.append(ValidationIssue("dados-calendario-2026.json", f"timezone inválido: {meta['timezone']}"))

    event_keys: set[tuple[str, str, str, str]] = set()
    for item in data["eventos"]:
        event_date = parse_date(item["date"])
        if event_date.year != 2026:
            issues.append(ValidationIssue("dados-calendario-2026.json", f"Evento fora de 2026: {item['title']}"))

        weekday = PT_WEEKDAYS[event_date.weekday()]
        if item["dayOfWeek"] != weekday:
            issues.append(ValidationIssue("dados-calendario-2026.json", f"dayOfWeek inconsistente no evento {item['title']}: esperado {weekday}, encontrado {item['dayOfWeek']}"))

        start_time = item.get("startTime")
        end_time = item.get("endTime")
        if start_time is None or end_time is None:
            if not (start_time is None and end_time is None):
                issues.append(ValidationIssue("dados-calendario-2026.json", f"Evento {item['title']} possui apenas um dos horários (startTime/endTime)"))
            if item.get("status") != "cancelled":
                issues.append(ValidationIssue("dados-calendario-2026.json", f"Evento {item['title']} sem horário deve estar com status cancelled"))
        else:
            if parse_time_minutes(end_time) <= parse_time_minutes(start_time):
                issues.append(ValidationIssue("dados-calendario-2026.json", f"Horário inválido no evento {item['title']}"))

        key = (item["date"], item["location"], item["startTime"], item["endTime"])
        if key in event_keys and item["status"] == "scheduled":
            issues.append(ValidationIssue("dados-calendario-2026.json", f"Conflito de agenda entre eventos em {item['date']} {item['startTime']}-{item['endTime']}"))
        event_keys.add(key)

    recurring_conflicts: set[tuple[str, str, str]] = set()
    for recurrence in data.get("atendimentosRecorrentes", []):
        try:
            ZoneInfo(recurrence["timezone"])
        except Exception:
            issues.append(ValidationIssue("dados-calendario-2026.json", f"timezone inválido em recorrência {recurrence['id']}"))
        if parse_time_minutes(recurrence["endTime"]) <= parse_time_minutes(recurrence["startTime"]):
            issues.append(ValidationIssue("dados-calendario-2026.json", f"Horário inválido em recorrência {recurrence['id']}"))
        if parse_date(recurrence["endDate"]) < parse_date(recurrence["startDate"]):
            issues.append(ValidationIssue("dados-calendario-2026.json", f"Período inválido em recorrência {recurrence['id']}"))
        key = (str(recurrence["weekday"]), recurrence["startTime"], recurrence["endTime"])
        if key in recurring_conflicts:
            issues.append(ValidationIssue("dados-calendario-2026.json", f"Recorrência duplicada detectada em {recurrence['id']}"))
        recurring_conflicts.add(key)

    months = {item["month"] for item in data["calendarioMensal"]}
    if months != set(range(1, 13)):
        issues.append(ValidationIssue("dados-calendario-2026.json", "calendarioMensal não cobre exatamente os 12 meses do ano"))

    monthly_dates: set[str] = set()
    for month in data["calendarioMensal"]:
        for entry in month["entries"]:
            entry_date = parse_date(entry["date"])
            weekday = PT_WEEKDAYS[entry_date.weekday()]
            if entry["dayOfWeek"] != weekday:
                issues.append(ValidationIssue("dados-calendario-2026.json", f"dayOfWeek inconsistente na agenda mensal {entry['label']} em {entry['date']}"))
            if entry_date.month != month["month"]:
                issues.append(ValidationIssue("dados-calendario-2026.json", f"Entrada mensal fora do mês declarado: {entry['date']}"))
            start_time = entry.get("startTime")
            end_time = entry.get("endTime")
            if start_time is None or end_time is None:
                if not (start_time is None and end_time is None):
                    issues.append(ValidationIssue("dados-calendario-2026.json", f"Agenda mensal {entry['label']} possui apenas um dos horários (startTime/endTime)"))
            else:
                if parse_time_minutes(end_time) <= parse_time_minutes(start_time):
                    issues.append(ValidationIssue("dados-calendario-2026.json", f"Horário inválido na agenda mensal {entry['label']}"))
            monthly_dates.add(entry["date"])

    return issues


def main() -> int:
    public_path = DOCS / "dados-publicwebsite.json"
    calendar_path = DOCS / "dados-calendario-2026.json"
    public_schema = SCHEMAS / "dados-publicwebsite.schema.json"
    calendar_schema = SCHEMAS / "dados-calendario-2026.schema.json"

    public_data = load_json(public_path)
    calendar_data = load_json(calendar_path)

    issues: list[ValidationIssue] = []
    issues.extend(validate_schema(public_path.name, public_data, load_schema(public_schema)))
    issues.extend(validate_schema(calendar_path.name, calendar_data, load_schema(calendar_schema)))
    issues.extend(validate_publicwebsite(public_data))
    issues.extend(validate_calendar(calendar_data))

    if issues:
        for issue in issues:
            print(f"[ERRO] {issue.scope}: {issue.message}")
        return 1

    print("[OK] dados-publicwebsite.json validado com sucesso")
    print("[OK] dados-calendario-2026.json validado com sucesso")
    return 0


if __name__ == "__main__":
    sys.exit(main())
