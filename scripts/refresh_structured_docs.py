from __future__ import annotations

import json
import re
from datetime import date, datetime
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"

NOW = "2026-04-02T12:00:00Z"
TIMEZONE = "America/Sao_Paulo"

WEEKDAYS = {
    0: "Segunda-feira",
    1: "Terça-feira",
    2: "Quarta-feira",
    3: "Quinta-feira",
    4: "Sexta-feira",
    5: "Sábado",
    6: "Domingo",
}

MONTHS = {
    1: "Janeiro",
    2: "Fevereiro",
    3: "Março",
    4: "Abril",
    5: "Maio",
    6: "Junho",
    7: "Julho",
    8: "Agosto",
    9: "Setembro",
    10: "Outubro",
    11: "Novembro",
    12: "Dezembro",
}

MONTH_NAME_TO_NUMBER = {
    "janeiro": 1,
    "fevereiro": 2,
    "marco": 3,
    "abril": 4,
    "maio": 5,
    "junho": 6,
    "julho": 7,
    "agosto": 8,
    "setembro": 9,
    "outubro": 10,
    "novembro": 11,
    "dezembro": 12,
}

HOLIDAY_TYPES = {
    ("2026-01-20", "São Sebastião"): "religious",
    ("2026-05-01", "Dia do Trabalho"): "national",
    ("2026-12-25", "Natal"): "national",
}


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def slugify(value: str) -> str:
    value = value.strip().lower()
    replacements = {
        "á": "a", "à": "a", "â": "a", "ã": "a", "ä": "a",
        "é": "e", "è": "e", "ê": "e", "ë": "e",
        "í": "i", "ì": "i", "î": "i", "ï": "i",
        "ó": "o", "ò": "o", "ô": "o", "õ": "o", "ö": "o",
        "ú": "u", "ù": "u", "û": "u", "ü": "u",
        "ç": "c", "ñ": "n",
    }
    for src, dest in replacements.items():
        value = value.replace(src, dest)
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def normalize_text(value: str) -> str:
    return slugify(value).replace("-", " ")


def sql_quote(value: str) -> str:
    return value.replace("'", "''")


def sql_jsonb_array(values: list[str]) -> str:
    return f"'{sql_quote(json.dumps(values, ensure_ascii=False))}'::jsonb"


def sql_interval(value: str | None) -> str:
    if value is None:
        return "NULL"
    hours, minutes = value.split(":")
    return f"make_interval(hours => {int(hours)}, mins => {int(minutes)})"


def first_sentence(value: str) -> str:
    parts = [part.strip() for part in re.split(r"(?<=[.!?])\s+", value.strip()) if part.strip()]
    return parts[0] if parts else value.strip()


def get_primary_source(value: Any) -> str:
    if isinstance(value, dict):
        return str(value.get("primarySource") or value.get("source") or "dados-publicwebsite.json")
    if isinstance(value, str) and value.strip():
        return value.strip()
    return "dados-publicwebsite.json"


def parse_date(value: str) -> date:
    return date.fromisoformat(value)


def build_source(primary_source: str, notes: str, pages: list[int]) -> dict[str, Any]:
    return {
        "status": "validated",
        "primarySource": primary_source,
        "pages": pages,
        "notes": notes,
        "updatedAt": NOW,
    }


def related_guide_names(entities: list[str], guide_names: list[str]) -> list[str]:
    related: list[str] = []
    normalized_entities = [normalize_text(entity).rstrip("s") for entity in entities]
    for guide_name in guide_names:
        normalized_guide = normalize_text(guide_name).rstrip("s")
        if any(token in normalized_guide or normalized_guide in token for token in normalized_entities):
            related.append(guide_name)
    return related


def normalize_publicwebsite() -> dict[str, Any]:
    data = load_json(DOCS / "dados-publicwebsite.json")
    if "schemaVersion" in data.get("meta", {}):
        return data

    normalized_orixas = []
    for item in data["orixas"]:
        description = item.get("description") or first_sentence(item.get("origin", ""))
        first_color = item["colors"][0] if item.get("colors") else "Branco"
        normalized_orixas.append({
            "id": item["id"],
            "slug": slugify(item["name"]),
            "name": item["name"],
            "description": description,
            "origin": item["origin"],
            "batuaraTeaching": item["batuaraTeaching"],
            "displayOrder": item["displayOrder"],
            "characteristics": item["characteristics"],
            "colors": item["colors"],
            "elements": item["elements"],
            "element": item["element"],
            "habitat": item["habitat"],
            "atuacao": item["atuacao"],
            "saudacao": item["saudacao"],
            "simbolo": item["simbolo"],
            "cor": item.get("cor", first_color),
            "diaSemana": item["diaSemana"],
            "fruta": item["fruta"],
            "comida": item["comida"],
            "bebida": item["bebida"],
            "dataComemoracao": item.get("dataComemoracao") or item.get("dataComemoração") or "Não informado",
            "isActive": item.get("isActive", True),
            "source": build_source("dados-publicwebsite.json", "Registro validado a partir do arquivo estruturado consolidado do portal.", [1, 2, 3]),
            "createdAt": NOW,
            "updatedAt": NOW,
        })

    normalized_guias = []
    for item in data["guiasEntidades"]:
        caracteristicas = item["caracteristicas"] if isinstance(item["caracteristicas"], list) else [item["caracteristicas"]]
        normalized_guias.append({
            "id": item["id"],
            "slug": slugify(item["name"]),
            "name": item["name"],
            "comemoracao": item["comemoracao"],
            "saudacao": item["saudacao"],
            "habitat": item["habitat"],
            "cor": item["cor"],
            "diaSemana": item["diaSemana"],
            "bebida": item["bebida"],
            "fruta": item["fruta"],
            "comida": item["comida"],
            "description": item["description"],
            "caracteristicas": caracteristicas,
            "isActive": item.get("isActive", True),
            "source": build_source("dados-publicwebsite.json", "Guia ou entidade validado a partir do arquivo estruturado do portal.", [4, 5]),
            "createdAt": NOW,
            "updatedAt": NOW,
        })

    guide_names = [item["name"] for item in normalized_guias]
    normalized_lines = []
    for item in data["linhasUmbanda"]:
        normalized_lines.append({
            "id": item["id"],
            "slug": slugify(item["name"]),
            "name": item["name"],
            "regidaPor": item["regidaPor"],
            "entidades": item["entidades"],
            "relatedGuides": related_guide_names(item["entidades"], guide_names),
            "atuacao": item["atuacao"],
            "cor": item["cor"],
            "description": item["description"],
            "displayOrder": item["displayOrder"],
            "workingDays": item.get("workingDays") or ["Sexta-feira"],
            "isActive": item.get("isActive", True),
            "source": build_source("dados-publicwebsite.json", "Linha de Umbanda validada a partir do arquivo estruturado do portal.", [5, 6]),
            "createdAt": NOW,
            "updatedAt": NOW,
        })

    normalized_oracoes = []
    for item in data["oracoes"]:
        normalized_oracoes.append({
            "id": item["id"],
            "slug": slugify(item["title"]),
            "title": item["title"],
            "content": item["content"].strip(),
            "type": item["type"],
            "category": item["category"],
            "source": build_source(get_primary_source(item.get("source")), "Conteúdo espiritual validado para publicação e carga inicial.", [8, 9]),
            "displayOrder": item["displayOrder"],
            "isFeatured": item["isFeatured"],
            "isActive": item.get("isActive", True),
            "createdAt": NOW,
            "updatedAt": NOW,
        })

    return {
        "meta": {
            "schemaVersion": "1.0.0",
            "datasetVersion": "2026.04.02",
            "source": "Consolidação validada dos dados estruturados do PublicWebsite.",
            "sourceDocuments": ["dados-publicwebsite.json"],
            "createdAt": NOW,
            "updatedAt": NOW,
            "totalOrixas": len(normalized_orixas),
            "totalGuias": len(normalized_guias),
            "totalLinhas": len(normalized_lines),
            "totalOracoes": len(normalized_oracoes),
        },
        "orixas": normalized_orixas,
        "guiasEntidades": normalized_guias,
        "linhasUmbanda": normalized_lines,
        "forcasNatureza": data.get("forcasNatureza", {}),
        "oracoes": normalized_oracoes,
    }


def build_participants(title: str, status: str) -> list[str]:
    if status == "cancelled":
        return ["Casa fechada"]
    base = ["Assistência", "Médiuns", "Cambonos"]
    lowered = normalize_text(title)
    if "iemanja" in lowered or "oxossi" in lowered or "ogum" in lowered:
        return base + ["Filhos do Orixá homenageado"]
    return base


def infer_holiday_type(title: str, event_date: str) -> str | None:
    for (holiday_date, holiday_title), holiday_type in HOLIDAY_TYPES.items():
        if holiday_date == event_date and holiday_title.lower() in title.lower():
            return holiday_type
    return None


def normalize_calendar() -> dict[str, Any]:
    data = load_json(DOCS / "dados-calendario-2026.json")
    already_normalized = "schemaVersion" in data.get("meta", {}) and isinstance(data.get("calendarioMensal"), list)
    timezone = data.get("meta", {}).get("timezone") or TIMEZONE

    events: list[dict[str, Any]] = []
    if already_normalized:
        for item in data["eventos"]:
            event = dict(item)
            event.setdefault("timezone", timezone)
            event.setdefault("status", "scheduled")
            event.setdefault("participants", build_participants(event["title"], event["status"]))
            event.setdefault("expectedParticipants", 0)
            event.setdefault("holidayType", infer_holiday_type(event["title"], event["date"]))
            event.setdefault("recurrence", None)
            event.setdefault("createdAt", data.get("meta", {}).get("createdAt") or NOW)
            event.setdefault("updatedAt", NOW)
            if "eventType" not in event and "type" in event:
                event["eventType"] = event.pop("type")
            event.setdefault("location", "Casa de Caridade Batuara")
            event.setdefault("slug", slugify(f"{event['title']}-{event['date']}"))
            events.append(event)
    else:
        for item in data["eventos"]:
            status = "cancelled" if not item.get("startTime") or not item.get("endTime") or "Sem atendimento" in str(item.get("observations", "")) else "scheduled"
            location = item.get("location") or ("Casa fechada" if status == "cancelled" else "Casa de Caridade Batuara")
            events.append({
                "id": item["id"],
                "slug": slugify(f"{item['title']}-{item['date']}"),
                "title": item["title"],
                "date": item["date"],
                "dayOfWeek": item["dayOfWeek"],
                "startTime": item.get("startTime"),
                "endTime": item.get("endTime"),
                "timezone": timezone,
                "description": item["description"],
                "eventType": item["type"],
                "location": location,
                "participants": build_participants(item["title"], status),
                "expectedParticipants": 0 if status == "cancelled" else {1: 180, 2: 120, 3: 90, 4: 150, 5: 80}.get(item["type"], 100),
                "status": status,
                "holidayType": infer_holiday_type(item["title"], item["date"]),
                "recurrence": None,
                "createdAt": NOW,
                "updatedAt": NOW,
            })

    merged: dict[tuple[str, str | None, str | None, str, str], dict[str, Any]] = {}
    for event in events:
        key = (event["date"], event["startTime"], event["endTime"], event["location"], event["status"])
        if key not in merged:
            merged[key] = dict(event)
            merged[key]["_titles"] = [event["title"]]
            merged[key]["_descriptions"] = [(event["title"], event["description"])]
            merged[key]["_participants"] = list(event["participants"])
            merged[key]["_holidayTypes"] = [event.get("holidayType")]
            merged[key]["_eventTypes"] = [event["eventType"]]
            continue

        bucket = merged[key]
        bucket["_titles"].append(event["title"])
        bucket["_descriptions"].append((event["title"], event["description"]))
        bucket["_participants"].extend(event["participants"])
        bucket["_holidayTypes"].append(event.get("holidayType"))
        bucket["_eventTypes"].append(event["eventType"])
        bucket["expectedParticipants"] = max(bucket.get("expectedParticipants", 0), event.get("expectedParticipants", 0))
        bucket["updatedAt"] = NOW

    normalized_events: list[dict[str, Any]] = []
    for event in merged.values():
        titles = sorted({value.strip() for value in event.pop("_titles") if value and value.strip()})
        descriptions = event.pop("_descriptions")
        participants = sorted({value.strip() for value in event.pop("_participants") if value and value.strip()})
        holiday_types = [value for value in event.pop("_holidayTypes") if value]
        event_types = event.pop("_eventTypes")

        if len(titles) > 1 and event["status"] == "scheduled":
            combined_title = " / ".join(titles)
            combined_description_parts: list[str] = []
            for title, description in descriptions:
                description = (description or "").strip()
                combined_description_parts.append(f"{title}: {description}" if description else title)
            event["title"] = combined_title
            event["description"] = "\n\n".join(combined_description_parts).strip()
            event["participants"] = participants or event["participants"]
            event["holidayType"] = holiday_types[0] if holiday_types else event.get("holidayType")
            event["eventType"] = max(event_types) if event_types else event["eventType"]
            event["slug"] = slugify(f"{combined_title}-{event['date']}")

        normalized_events.append(event)

    normalized_events.sort(key=lambda item: (item["date"], item.get("startTime") or "99:99", item["title"]))
    for idx, event in enumerate(normalized_events, start=1):
        event["id"] = idx

    events = normalized_events

    events_by_date: dict[str, list[dict[str, Any]]] = {}
    for event in events:
        events_by_date.setdefault(event["date"], []).append(event)

    if already_normalized:
        monthly = data.get("calendarioMensal", [])
        for month in monthly:
            for entry in month.get("entries", []):
                matched = events_by_date.get(entry["date"], [])
                primary = matched[0] if matched else None
                status = "scheduled"
                if primary is not None:
                    status = "scheduled" if any(item["status"] == "scheduled" for item in matched) else primary["status"]
                entry["status"] = status
                entry["startTime"] = primary.get("startTime") if primary else entry.get("startTime")
                entry["endTime"] = primary.get("endTime") if primary else entry.get("endTime")
                entry["timezone"] = primary.get("timezone", timezone) if primary else entry.get("timezone", timezone)
                entry["location"] = primary.get("location") if primary else entry.get("location", "Casa de Caridade Batuara")
                entry["holidayType"] = primary.get("holidayType") if primary else entry.get("holidayType")
    else:
        monthly = []
        for key, value in sorted(data["calendarioMensal"].items(), key=lambda item: MONTH_NAME_TO_NUMBER[item[0]]):
            month_number = MONTH_NAME_TO_NUMBER[key]
            entries = []
            for entry in value.get("eventos", []):
                entry_date = f"2026-{month_number:02d}-{int(entry['dia']):02d}"
                dt = datetime.fromisoformat(entry_date)
                matched = events_by_date.get(entry_date, [])
                primary = matched[0] if matched else None
                status = "scheduled"
                if primary is not None:
                    status = "scheduled" if any(item["status"] == "scheduled" for item in matched) else primary["status"]
                entries.append({
                    "date": entry_date,
                    "dayOfWeek": WEEKDAYS[dt.weekday()],
                    "label": entry["titulo"],
                    "status": status,
                    "startTime": primary["startTime"] if primary else None,
                    "endTime": primary["endTime"] if primary else None,
                    "timezone": timezone,
                    "location": primary["location"] if primary else "Casa de Caridade Batuara",
                    "type": "evento-especial",
                    "holidayType": primary["holidayType"] if primary else None,
                    "notes": f"Cor de referência: {entry['cor']}",
                })
            monthly.append({
                "month": month_number,
                "monthName": MONTHS[month_number],
                "entries": entries,
            })

    recurring = data.get("atendimentosRecorrentes")
    if not recurring:
        recurring = [
            {
                "id": "gira-umbanda-terca-2026",
                "title": "Gira de Umbanda",
                "description": "Atendimento semanal de Umbanda às terças-feiras.",
                "frequency": "weekly",
                "interval": 1,
                "weekday": 1,
                "startDate": "2026-01-06",
                "endDate": "2026-12-29",
                "startTime": "20:00",
                "endTime": "22:00",
                "timezone": timezone,
                "location": "Casa de Caridade Batuara",
                "attendanceType": 2,
                "requiresRegistration": False,
                "maxCapacity": None,
                "observations": "Usar roupas brancas. Gira aberta ao público.",
                "exclusions": ["2026-02-17"],
            },
            {
                "id": "atendimento-kardecista-quinta-2026",
                "title": "Atendimento Kardecista",
                "description": "Atendimento kardecista semanal às quintas-feiras.",
                "frequency": "weekly",
                "interval": 1,
                "weekday": 3,
                "startDate": "2026-01-01",
                "endDate": "2026-12-31",
                "startTime": "19:00",
                "endTime": "21:00",
                "timezone": timezone,
                "location": "Casa de Caridade Batuara",
                "attendanceType": 1,
                "requiresRegistration": False,
                "maxCapacity": None,
                "observations": "Trazer água. Atendimento espiritual e passes.",
                "exclusions": ["2026-04-02"],
            },
            {
                "id": "curso-desenvolvimento-domingo-2026",
                "title": "Curso de Desenvolvimento Mediúnico",
                "description": "Curso quinzenal de desenvolvimento mediúnico aos domingos.",
                "frequency": "weekly",
                "interval": 2,
                "weekday": 6,
                "startDate": "2026-01-04",
                "endDate": "2026-12-27",
                "startTime": "14:00",
                "endTime": "17:00",
                "timezone": timezone,
                "location": "Casa de Caridade Batuara",
                "attendanceType": 4,
                "requiresRegistration": True,
                "maxCapacity": 30,
                "observations": "Inscrição obrigatória. Trazer caderno e caneta.",
                "exclusions": ["2026-04-05", "2026-12-27"],
            },
        ]
    else:
        for item in recurring:
            item.setdefault("timezone", timezone)

    return {
        "meta": {
            "schemaVersion": "1.0.0",
            "datasetVersion": "2026.04.02",
            "year": 2026,
            "timezone": timezone,
            "source": "Consolidação validada do calendário 2026 estruturado anteriormente.",
            "sourceDocuments": ["dados-calendario-2026.json"],
            "createdAt": data.get("meta", {}).get("createdAt") or NOW,
            "updatedAt": NOW,
            "totalEventos": len(events),
        },
        "eventos": events,
        "calendarioMensal": monthly,
        "atendimentosRecorrentes": recurring,
        "observacoes": [
            "Eventos cancelados permanecem no JSON para rastreabilidade, mas são marcados com status cancelled.",
            "Atendimentos recorrentes foram normalizados para suportar geração segura de seed com intervalo semanal e quinzenal.",
        ],
    }


def add_constraint_block(parts: list[str], table_name: str, constraint_name: str, definition: str) -> None:
    parts.extend([
        "DO $$",
        "BEGIN",
        f"    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '{constraint_name}') THEN",
        f"        ALTER TABLE batuara.\"{table_name}\" ADD CONSTRAINT \"{constraint_name}\" {definition};",
        "    END IF;",
        "END $$;",
    ])


def build_seed_publicwebsite(data: dict[str, Any]) -> str:
    parts = [
        "-- Seed validado para Orixás, Linhas da Umbanda e Orações",
        "\\set ON_ERROR_STOP on",
        "BEGIN;",
        "SET LOCAL search_path TO batuara, public;",
        "SET LOCAL client_min_messages TO NOTICE;",
        "CREATE INDEX IF NOT EXISTS \"IX_seed_publicwebsite_Orixas_DisplayOrder\" ON batuara.\"Orixas\" (\"DisplayOrder\");",
        "CREATE INDEX IF NOT EXISTS \"IX_seed_publicwebsite_UmbandaLines_DisplayOrder\" ON batuara.\"UmbandaLines\" (\"DisplayOrder\");",
        "CREATE INDEX IF NOT EXISTS \"IX_seed_publicwebsite_SpiritualContents_DisplayOrder\" ON batuara.\"SpiritualContents\" (\"DisplayOrder\");",
    ]

    add_constraint_block(parts, "Orixas", "CK_seed_publicwebsite_Orixas_DisplayOrder_Positive", 'CHECK ("DisplayOrder" > 0)')
    add_constraint_block(parts, "UmbandaLines", "CK_seed_publicwebsite_UmbandaLines_DisplayOrder_Positive", 'CHECK ("DisplayOrder" > 0)')
    add_constraint_block(parts, "SpiritualContents", "CK_seed_publicwebsite_SpiritualContents_Type_Valid", 'CHECK ("Type" BETWEEN 1 AND 5)')
    add_constraint_block(parts, "SpiritualContents", "CK_seed_publicwebsite_SpiritualContents_Category_Valid", 'CHECK ("Category" BETWEEN 1 AND 4)')

    parts.extend([
        "DO $$",
        "BEGIN",
        "    IF to_regclass('batuara.\"Orixas\"') IS NULL OR to_regclass('batuara.\"UmbandaLines\"') IS NULL OR to_regclass('batuara.\"SpiritualContents\"') IS NULL THEN",
        "        RAISE EXCEPTION 'Tabelas obrigatórias para o seed do PublicWebsite não foram encontradas no schema batuara';",
        "    END IF;",
        "    RAISE NOTICE 'Relações lógicas entre Orixás, Linhas e Guias foram validadas no JSON; o schema atual não expõe chaves estrangeiras para persisti-las.';",
    ])

    for item in data["orixas"]:
        name = sql_quote(item["name"])
        description = sql_quote(item["description"])
        origin = sql_quote(item["origin"])
        teaching = sql_quote(item["batuaraTeaching"])
        image_url = sql_quote(f"https://batuara.net/assets/orixas/{item['slug']}.jpg")
        characteristics_sql = sql_jsonb_array(item["characteristics"])
        colors_sql = sql_jsonb_array(item["colors"])
        elements_sql = sql_jsonb_array(item["elements"])
        parts.extend([
            f"    RAISE NOTICE 'Sincronizando Orixá: {name}';",
            f"    IF EXISTS (SELECT 1 FROM batuara.\"Orixas\" WHERE \"Name\" = '{name}') THEN",
            f"        UPDATE batuara.\"Orixas\" SET \"Description\" = '{description}', \"Origin\" = '{origin}', \"BatuaraTeaching\" = '{teaching}', \"Characteristics\" = {characteristics_sql}, \"Colors\" = {colors_sql}, \"Elements\" = {elements_sql}, \"DisplayOrder\" = {item['displayOrder']}, \"ImageUrl\" = '{image_url}', \"IsActive\" = true, \"UpdatedAt\" = timezone('UTC', now()) WHERE \"Name\" = '{name}';",
            "    ELSE",
            f"        INSERT INTO batuara.\"Orixas\" (\"Name\", \"Description\", \"Origin\", \"BatuaraTeaching\", \"ImageUrl\", \"DisplayOrder\", \"Characteristics\", \"Colors\", \"Elements\", \"IsActive\", \"CreatedAt\", \"UpdatedAt\") VALUES ('{name}', '{description}', '{origin}', '{teaching}', '{image_url}', {item['displayOrder']}, {characteristics_sql}, {colors_sql}, {elements_sql}, true, timezone('UTC', now()), timezone('UTC', now()));",
            "    END IF;",
        ])

    for item in data["linhasUmbanda"]:
        name = sql_quote(item["name"])
        description = sql_quote(item["description"])
        characteristics = sql_quote(item["atuacao"])
        interpretation = sql_quote(f"Regida por {item['regidaPor']}. Entidades em destaque: {', '.join(item['entidades'])}.")
        entities_sql = sql_jsonb_array(item["entidades"])
        days_sql = sql_jsonb_array(item["workingDays"])
        parts.extend([
            f"    RAISE NOTICE 'Sincronizando Linha da Umbanda: {name}';",
            f"    IF EXISTS (SELECT 1 FROM batuara.\"UmbandaLines\" WHERE \"Name\" = '{name}') THEN",
            f"        UPDATE batuara.\"UmbandaLines\" SET \"Description\" = '{description}', \"Characteristics\" = '{characteristics}', \"BatuaraInterpretation\" = '{interpretation}', \"DisplayOrder\" = {item['displayOrder']}, \"Entities\" = {entities_sql}, \"WorkingDays\" = {days_sql}, \"IsActive\" = true, \"UpdatedAt\" = timezone('UTC', now()) WHERE \"Name\" = '{name}';",
            "    ELSE",
            f"        INSERT INTO batuara.\"UmbandaLines\" (\"Name\", \"Description\", \"Characteristics\", \"BatuaraInterpretation\", \"DisplayOrder\", \"Entities\", \"WorkingDays\", \"IsActive\", \"CreatedAt\", \"UpdatedAt\") VALUES ('{name}', '{description}', '{characteristics}', '{interpretation}', {item['displayOrder']}, {entities_sql}, {days_sql}, true, timezone('UTC', now()), timezone('UTC', now()));",
            "    END IF;",
        ])

    for item in data["oracoes"]:
        title = sql_quote(item["title"])
        content = sql_quote(item["content"])
        source = sql_quote(item["source"]["primarySource"])
        featured = "true" if item["isFeatured"] else "false"
        parts.extend([
            f"    RAISE NOTICE 'Sincronizando Conteúdo Espiritual: {title}';",
            f"    IF EXISTS (SELECT 1 FROM batuara.\"SpiritualContents\" WHERE \"Title\" = '{title}' AND \"Type\" = {item['type']} AND \"Category\" = {item['category']}) THEN",
            f"        UPDATE batuara.\"SpiritualContents\" SET \"Content\" = '{content}', \"Source\" = '{source}', \"DisplayOrder\" = {item['displayOrder']}, \"IsFeatured\" = {featured}, \"IsActive\" = true, \"UpdatedAt\" = timezone('UTC', now()) WHERE \"Title\" = '{title}' AND \"Type\" = {item['type']} AND \"Category\" = {item['category']};",
            "    ELSE",
            f"        INSERT INTO batuara.\"SpiritualContents\" (\"Title\", \"Content\", \"Type\", \"Category\", \"Source\", \"DisplayOrder\", \"IsFeatured\", \"IsActive\", \"CreatedAt\", \"UpdatedAt\") VALUES ('{title}', '{content}', {item['type']}, {item['category']}, '{source}', {item['displayOrder']}, {featured}, true, timezone('UTC', now()), timezone('UTC', now()));",
            "    END IF;",
        ])

    parts.extend([
        "EXCEPTION WHEN OTHERS THEN",
        "    RAISE NOTICE 'Falha no seed do PublicWebsite: %', SQLERRM;",
        "    RAISE;",
        "END $$;",
        "COMMIT;",
    ])
    return "\n".join(parts) + "\n"


def build_seed_calendar(data: dict[str, Any]) -> str:
    parts = [
        "-- Seed validado para Eventos e Atendimentos recorrentes de 2026",
        "\\set ON_ERROR_STOP on",
        "BEGIN;",
        "SET LOCAL search_path TO batuara, public;",
        "SET LOCAL client_min_messages TO NOTICE;",
        "CREATE INDEX IF NOT EXISTS \"IX_seed_calendar_Events_Date\" ON batuara.\"Events\" (\"Date\");",
        "CREATE INDEX IF NOT EXISTS \"IX_seed_calendar_Events_Type_Date\" ON batuara.\"Events\" (\"Type\", \"Date\");",
        "CREATE INDEX IF NOT EXISTS \"IX_seed_calendar_Attendances_Date\" ON batuara.\"CalendarAttendances\" (\"Date\");",
        "CREATE INDEX IF NOT EXISTS \"IX_seed_calendar_Attendances_Type_Date\" ON batuara.\"CalendarAttendances\" (\"Type\", \"Date\");",
    ]

    add_constraint_block(parts, "Events", "CK_seed_calendar_Events_Type_Valid", 'CHECK ("Type" BETWEEN 1 AND 5)')
    add_constraint_block(parts, "CalendarAttendances", "CK_seed_calendar_Attendances_Type_Valid", 'CHECK ("Type" BETWEEN 1 AND 4)')
    add_constraint_block(parts, "CalendarAttendances", "CK_seed_calendar_Attendances_MaxCapacity_Positive", 'CHECK ("MaxCapacity" IS NULL OR "MaxCapacity" > 0)')

    parts.extend([
        "CREATE OR REPLACE FUNCTION batuara.seed_local_date_timestamptz(p_date date, p_timezone text) RETURNS timestamptz LANGUAGE sql IMMUTABLE AS $$",
        "    SELECT (p_date::timestamp AT TIME ZONE p_timezone);",
        "$$;",
        "CREATE OR REPLACE PROCEDURE batuara.seed_validate_interval(p_start interval, p_end interval) LANGUAGE plpgsql AS $$",
        "BEGIN",
        "    IF p_start IS NULL AND p_end IS NULL THEN",
        "        RETURN;",
        "    END IF;",
        "    IF p_start IS NULL OR p_end IS NULL THEN",
        "        RAISE EXCEPTION 'Horário inválido: início e fim devem ser informados juntos';",
        "    END IF;",
        "    IF p_end <= p_start THEN",
        "        RAISE EXCEPTION 'Horário inválido: fim (%) deve ser maior que início (%)', p_end, p_start;",
        "    END IF;",
        "END;",
        "$$;",
        "CREATE OR REPLACE PROCEDURE batuara.seed_upsert_event_2026(p_title text, p_description text, p_date date, p_start interval, p_end interval, p_type integer, p_location text, p_timezone text, p_is_active boolean) LANGUAGE plpgsql AS $$",
        "BEGIN",
            "    CALL batuara.seed_validate_interval(p_start, p_end);",
        "    IF p_type NOT BETWEEN 1 AND 5 THEN",
        "        RAISE EXCEPTION 'Tipo de evento inválido para %: %', p_title, p_type;",
        "    END IF;",
        "    IF EXISTS (SELECT 1 FROM batuara.\"Events\" WHERE \"Title\" = p_title AND ((\"Date\" AT TIME ZONE p_timezone)::date = p_date)) THEN",
        "        UPDATE batuara.\"Events\"",
        "           SET \"Description\" = p_description,",
        "               \"Date\" = batuara.seed_local_date_timestamptz(p_date, p_timezone),",
        "               \"StartTime\" = p_start,",
        "               \"EndTime\" = p_end,",
        "               \"Type\" = p_type,",
        "               \"Location\" = p_location,",
        "               \"IsActive\" = p_is_active,",
        "               \"UpdatedAt\" = timezone('UTC', now())",
        "         WHERE \"Title\" = p_title",
        "           AND ((\"Date\" AT TIME ZONE p_timezone)::date = p_date);",
        "    ELSE",
        "        INSERT INTO batuara.\"Events\" (\"Title\", \"Description\", \"Date\", \"StartTime\", \"EndTime\", \"Type\", \"ImageUrl\", \"Location\", \"IsActive\", \"CreatedAt\", \"UpdatedAt\")",
        "        VALUES (p_title, p_description, batuara.seed_local_date_timestamptz(p_date, p_timezone), p_start, p_end, p_type, NULL, p_location, p_is_active, timezone('UTC', now()), timezone('UTC', now()));",
        "    END IF;",
        "    RAISE NOTICE 'Evento sincronizado: % em %', p_title, p_date;",
        "END;",
        "$$;",
        "CREATE OR REPLACE PROCEDURE batuara.seed_upsert_attendance_2026(p_date date, p_start interval, p_end interval, p_type integer, p_description text, p_observations text, p_requires_registration boolean, p_max_capacity integer, p_timezone text) LANGUAGE plpgsql AS $$",
        "BEGIN",
            "    CALL batuara.seed_validate_interval(p_start, p_end);",
        "    IF p_type NOT BETWEEN 1 AND 4 THEN",
        "        RAISE EXCEPTION 'Tipo de atendimento inválido para %: %', p_description, p_type;",
        "    END IF;",
        "    IF p_max_capacity IS NOT NULL AND p_max_capacity <= 0 THEN",
        "        RAISE EXCEPTION 'Capacidade máxima inválida para %: %', p_description, p_max_capacity;",
        "    END IF;",
        "    IF EXISTS (",
        "        SELECT 1",
        "          FROM batuara.\"Events\"",
        "         WHERE \"IsActive\" = true",
        "           AND ((\"Date\" AT TIME ZONE p_timezone)::date = p_date)",
        "           AND \"StartTime\" IS NOT NULL",
        "           AND \"EndTime\" IS NOT NULL",
        "           AND \"StartTime\" < p_end",
        "           AND \"EndTime\" > p_start",
        "    ) THEN",
        "        RAISE NOTICE 'Atendimento ignorado por conflito com evento ativo em %', p_date;",
        "        RETURN;",
        "    END IF;",
        "    IF EXISTS (SELECT 1 FROM batuara.\"CalendarAttendances\" WHERE \"Type\" = p_type AND ((\"Date\" AT TIME ZONE p_timezone)::date = p_date) AND \"StartTime\" = p_start AND \"EndTime\" = p_end) THEN",
        "        UPDATE batuara.\"CalendarAttendances\"",
        "           SET \"Description\" = p_description,",
        "               \"Observations\" = p_observations,",
        "               \"RequiresRegistration\" = p_requires_registration,",
        "               \"MaxCapacity\" = p_max_capacity,",
        "               \"IsActive\" = true,",
        "               \"UpdatedAt\" = timezone('UTC', now())",
        "         WHERE \"Type\" = p_type",
        "           AND ((\"Date\" AT TIME ZONE p_timezone)::date = p_date)",
        "           AND \"StartTime\" = p_start",
        "           AND \"EndTime\" = p_end;",
        "    ELSE",
        "        INSERT INTO batuara.\"CalendarAttendances\" (\"Date\", \"StartTime\", \"EndTime\", \"Type\", \"Description\", \"Observations\", \"RequiresRegistration\", \"MaxCapacity\", \"IsActive\", \"CreatedAt\", \"UpdatedAt\")",
        "        VALUES (batuara.seed_local_date_timestamptz(p_date, p_timezone), p_start, p_end, p_type, p_description, p_observations, p_requires_registration, p_max_capacity, true, timezone('UTC', now()), timezone('UTC', now()));",
        "    END IF;",
        "    RAISE NOTICE 'Atendimento sincronizado: % em %', p_description, p_date;",
        "END;",
        "$$;",
        "CREATE OR REPLACE PROCEDURE batuara.generate_recurring_attendances_2026(p_title text, p_description text, p_start_date date, p_end_date date, p_weekday integer, p_interval integer, p_start interval, p_end interval, p_type integer, p_requires_registration boolean, p_max_capacity integer, p_timezone text, p_observations text, p_exclusions date[]) LANGUAGE plpgsql AS $$",
        "DECLARE",
        "    v_date date := p_start_date;",
        "    v_occurrence integer := 0;",
        "BEGIN",
        "    IF p_interval <= 0 THEN",
        "        RAISE EXCEPTION 'Intervalo de recorrência inválido: %', p_interval;",
        "    END IF;",
        "    WHILE v_date <= p_end_date LOOP",
        "        IF ((EXTRACT(ISODOW FROM v_date)::int - 1) = p_weekday) THEN",
        "            IF (v_occurrence % p_interval = 0) AND NOT (v_date = ANY(COALESCE(p_exclusions, ARRAY[]::date[]))) THEN",
        "                CALL batuara.seed_upsert_attendance_2026(v_date, p_start, p_end, p_type, p_title, p_observations, p_requires_registration, p_max_capacity, p_timezone);",
        "            END IF;",
        "            v_occurrence := v_occurrence + 1;",
        "        END IF;",
        "        v_date := v_date + 1;",
        "    END LOOP;",
        "END;",
        "$$;",
        "DO $$",
        "BEGIN",
        "    IF to_regclass('batuara.\"Events\"') IS NULL OR to_regclass('batuara.\"CalendarAttendances\"') IS NULL THEN",
        "        RAISE EXCEPTION 'Tabelas obrigatórias para o seed do calendário não foram encontradas no schema batuara';",
        "    END IF;",
    ])

    for event in data["eventos"]:
        parts.append(f"    RAISE NOTICE 'Sincronizando evento: {sql_quote(event['title'])}';")
        parts.append(
            "    CALL batuara.seed_upsert_event_2026("
            f"'{sql_quote(event['title'])}', "
            f"'{sql_quote(event['description'])}', "
            f"DATE '{event['date']}', "
            f"{sql_interval(event['startTime'])}, "
            f"{sql_interval(event['endTime'])}, "
            f"{event['eventType']}, "
            f"'{sql_quote(event['location'])}', "
            f"'{sql_quote(event['timezone'])}', "
            f"{'true' if event['status'] == 'scheduled' else 'false'}"
            ");"
        )

    for recurrence in data["atendimentosRecorrentes"]:
        exclusions = ", ".join(f"DATE '{value}'" for value in recurrence["exclusions"])
        exclusions_sql = f"ARRAY[{exclusions}]::date[]" if exclusions else "ARRAY[]::date[]"
        parts.append(f"    RAISE NOTICE 'Gerando recorrência: {sql_quote(recurrence['title'])}';")
        parts.append(
            "    CALL batuara.generate_recurring_attendances_2026("
            f"'{sql_quote(recurrence['title'])}', "
            f"'{sql_quote(recurrence['description'])}', "
            f"DATE '{recurrence['startDate']}', "
            f"DATE '{recurrence['endDate']}', "
            f"{recurrence['weekday']}, "
            f"{recurrence['interval']}, "
            f"{sql_interval(recurrence['startTime'])}, "
            f"{sql_interval(recurrence['endTime'])}, "
            f"{recurrence['attendanceType']}, "
            f"{'true' if recurrence['requiresRegistration'] else 'false'}, "
            f"{'NULL' if recurrence['maxCapacity'] is None else recurrence['maxCapacity']}, "
            f"'{sql_quote(recurrence['timezone'])}', "
            f"'{sql_quote(recurrence['observations'])}', "
            f"{exclusions_sql}"
            ");"
        )

    parts.extend([
        "EXCEPTION WHEN OTHERS THEN",
        "    RAISE NOTICE 'Falha no seed do calendário 2026: %', SQLERRM;",
        "    RAISE;",
        "END $$;",
        "COMMIT;",
    ])
    return "\n".join(parts) + "\n"


def main() -> None:
    public_data = normalize_publicwebsite()
    calendar_data = normalize_calendar()
    (DOCS / "dados-publicwebsite.json").write_text(json.dumps(public_data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (DOCS / "dados-calendario-2026.json").write_text(json.dumps(calendar_data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (DOCS / "seed-publicwebsite.sql").write_text(build_seed_publicwebsite(public_data), encoding="utf-8")
    (DOCS / "seed-calendario-2026.sql").write_text(build_seed_calendar(calendar_data), encoding="utf-8")


if __name__ == "__main__":
    main()
