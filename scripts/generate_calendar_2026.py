"""
Gera SQL de inserção para CalendarAttendances e Events - Calendário 2026
Executar: python generate_calendar_2026.py > calendar_2026.sql
"""

from datetime import date, timedelta

# Datas no banco: midnight BRT = 03:00 UTC
def dt(y, m, d):
    return f"{y}-{m:02d}-{d:02d} 03:00:00+00"

now = "NOW()"

# ===========================================================================
# CALENDAR ATTENDANCES - Calendário 2026 completo
# ===========================================================================

# AttendanceType: Kardecismo=1, Umbanda=2, Palestra=3, Curso=4, Festa=5
# RequiresRegistration: false para todos
# IsActive: false apenas para giras canceladas

calendar_records = []

# ------------------------------------------------------------------
# KARDECISMO - todas as quartas-feiras de 2026 (20:00-22:00)
# ------------------------------------------------------------------
d = date(2026, 1, 1)
while d.year == 2026:
    if d.weekday() == 2:  # Quarta=2
        calendar_records.append({
            "Date": dt(d.year, d.month, d.day),
            "StartTime": "'20:00:00'",
            "EndTime": "'22:00:00'",
            "Type": 1,
            "Description": "'Atendimento Kardecista'",
            "Observations": "NULL",
            "RequiresRegistration": "false",
            "MaxCapacity": "NULL",
            "IsActive": "true",
        })
    d += timedelta(days=1)

# ------------------------------------------------------------------
# EVENTOS DO CALENDÁRIO 2026 (Giras, Festas, Especiais)
# ------------------------------------------------------------------
# Formato: (dia, mês, tipo, start, end, descricao, observations, is_active)
# Tipo: 2=Gira/Umbanda, 5=Festa
events_2026 = [
    # JANEIRO
    (16, 1,  2, "'20:00:00'", "'22:00:00'", "'Trabalhos de Firmação da Casa'",           "NULL",                             "true"),
    (24, 1,  5, "'20:00:00'", "'23:00:00'", "'Festa de Oxóssi'",                          "NULL",                             "true"),
    (30, 1,  2, "'20:00:00'", "'22:00:00'", "'Gira Normal'",                               "NULL",                             "true"),
    # FEVEREIRO
    ( 7, 2,  5, "'20:00:00'", "'23:00:00'", "'Festa de Iemanjá / Amaci'",                 "NULL",                             "true"),
    (13, 2,  2, "'20:00:00'", "'22:00:00'", "'Gira Cancelada - Carnaval'",                 "'Gira cancelada devido ao Carnaval'", "false"),
    (20, 2,  2, "'20:00:00'", "'22:00:00'", "'Gira Normal'",                               "NULL",                             "true"),
    (27, 2,  2, "'20:00:00'", "'22:00:00'", "'Gira Normal'",                               "NULL",                             "true"),
    (28, 2,  2, "'20:00:00'", "'22:00:00'", "'Gira Normal'",                               "NULL",                             "true"),
    # MARÇO
    ( 6, 3,  2, "'20:00:00'", "'22:00:00'", "'Gira Normal'",                               "NULL",                             "true"),
    (13, 3,  5, "'20:00:00'", "'23:00:00'", "'Festa dos Malandros'",                       "NULL",                             "true"),
    (20, 3,  2, "'20:00:00'", "'22:00:00'", "'Gira Normal'",                               "NULL",                             "true"),
    (27, 3,  2, "'20:00:00'", "'22:00:00'", "'Gira Normal'",                               "NULL",                             "true"),
    # ABRIL
    ( 3, 4,  2, "'15:00:00'", "'17:00:00'", "'Sexta Santa'",                               "'Cerimônia especial - início às 15h00'", "true"),
    (10, 4,  2, "'20:00:00'", "'22:00:00'", "'Gira Normal'",                               "NULL",                             "true"),
    (17, 4,  2, "'20:00:00'", "'22:00:00'", "'Gira Normal'",                               "NULL",                             "true"),
    (25, 4,  5, "'20:00:00'", "'23:00:00'", "'Festa de Ogum / Iao'",                       "NULL",                             "true"),
    # MAIO
    ( 1, 5,  2, "'20:00:00'", "'22:00:00'", "'Gira Cancelada'",                             "'Gira cancelada'",                 "false"),
    ( 8, 5,  2, "'20:00:00'", "'22:00:00'", "'Gira Normal'",                               "NULL",                             "true"),
    (15, 5,  5, "'20:00:00'", "'23:00:00'", "'Festa dos Pretos Velhos'",                   "NULL",                             "true"),
    (22, 5,  2, "'20:00:00'", "'22:00:00'", "'Gira Normal'",                               "NULL",                             "true"),
    (29, 5,  5, "'20:00:00'", "'23:00:00'", "'Festa dos Ciganos'",                         "NULL",                             "true"),
    # JUNHO
    ( 5, 6,  2, "'20:00:00'", "'22:00:00'", "'Gira Normal'",                               "NULL",                             "true"),
    (13, 6,  5, "'20:00:00'", "'23:00:00'", "'Festa de Esquerda'",                         "NULL",                             "true"),
    (19, 6,  2, "'20:00:00'", "'22:00:00'", "'Gira Normal'",                               "NULL",                             "true"),
    (26, 6,  5, "'20:00:00'", "'23:00:00'", "'Festa de Boiadeiro e Saudação a Xangô Menino'", "NULL",                         "true"),
    # JULHO
    ( 3, 7,  2, "'20:00:00'", "'22:00:00'", "'Gira Normal'",                               "NULL",                             "true"),
    (10, 7,  5, "'20:00:00'", "'23:00:00'", "'Festa dos Marinheiros'",                     "NULL",                             "true"),
    (17, 7,  2, "'20:00:00'", "'22:00:00'", "'Gira Normal'",                               "NULL",                             "true"),
    (24, 7,  2, "'20:00:00'", "'22:00:00'", "'Gira Normal'",                               "NULL",                             "true"),
    (31, 7,  5, "'20:00:00'", "'23:00:00'", "'Festa de Nanã'",                             "NULL",                             "true"),
    # AGOSTO
    ( 7, 8,  5, "'20:00:00'", "'23:00:00'", "'Festa dos Baianos'",                         "NULL",                             "true"),
    (14, 8,  2, "'20:00:00'", "'22:00:00'", "'Gira Normal'",                               "NULL",                             "true"),
    (21, 8,  5, "'20:00:00'", "'23:00:00'", "'Festa de Obaluaê'",                          "NULL",                             "true"),
    (28, 8,  2, "'20:00:00'", "'22:00:00'", "'Gira Normal'",                               "NULL",                             "true"),
    # SETEMBRO
    ( 4, 9,  2, "'20:00:00'", "'22:00:00'", "'Gira Normal'",                               "NULL",                             "true"),
    (11, 9,  2, "'20:00:00'", "'22:00:00'", "'Gira Normal'",                               "NULL",                             "true"),
    (18, 9,  2, "'20:00:00'", "'22:00:00'", "'Gira Normal'",                               "NULL",                             "true"),
    (25, 9,  5, "'20:00:00'", "'23:00:00'", "'Festa de Erê - Dia 1'",                      "NULL",                             "true"),
    (26, 9,  5, "'20:00:00'", "'23:00:00'", "'Festa de Erê - Dia 2'",                      "NULL",                             "true"),
    (27, 9,  5, "'20:00:00'", "'23:00:00'", "'Festa de Erê - Dia 3'",                      "NULL",                             "true"),
    # OUTUBRO
    ( 2,10,  5, "'20:00:00'", "'23:00:00'", "'Festa de Xangô'",                            "NULL",                             "true"),
    ( 9,10,  2, "'20:00:00'", "'22:00:00'", "'Gira Normal'",                               "'Feriado na segunda-feira'",       "true"),
    (16,10,  5, "'20:00:00'", "'23:00:00'", "'Festa de Oxum'",                             "NULL",                             "true"),
    (23,10,  2, "'20:00:00'", "'22:00:00'", "'Gira Normal'",                               "NULL",                             "true"),
    (30,10,  2, "'20:00:00'", "'22:00:00'", "'Gira Normal'",                               "NULL",                             "true"),
    # NOVEMBRO
    ( 6,11,  2, "'20:00:00'", "'22:00:00'", "'Gira Normal'",                               "NULL",                             "true"),
    (13,11,  2, "'20:00:00'", "'22:00:00'", "'Gira Normal'",                               "NULL",                             "true"),
    (20,11,  2, "'20:00:00'", "'22:00:00'", "'Gira Cancelada'",                             "'Gira cancelada'",                 "false"),
    (27,11,  2, "'20:00:00'", "'22:00:00'", "'Gira Normal'",                               "NULL",                             "true"),
    # DEZEMBRO
    ( 5,12,  5, "'20:00:00'", "'23:00:00'", "'Festa de Iansã'",                            "NULL",                             "true"),
    (11,12,  5, "'20:00:00'", "'23:00:00'", "'Festa de Oxalá'",                            "NULL",                             "true"),
]

for (day, month, typ, start, end, desc, obs, active) in events_2026:
    calendar_records.append({
        "Date": dt(2026, month, day),
        "StartTime": start,
        "EndTime": end,
        "Type": typ,
        "Description": desc,
        "Observations": obs,
        "RequiresRegistration": "false",
        "MaxCapacity": "NULL",
        "IsActive": active,
    })

# ===========================================================================
# EVENTS TABLE - Festas e Eventos 2026 (sem giras)
# ===========================================================================
# EventType: Festa=1, Evento=2, Celebracao=3, Bazar=4, Palestra=5

events_table = [
    # (dia, mês, tipo, titulo, descricao, startTime, endTime)
    (16, 1, 1, "Trabalhos de Firmação da Casa",           "Cerimônia especial de firmação da casa espiritual.",           "NULL", "NULL"),
    (24, 1, 1, "Festa de Oxóssi",                          "Celebração em homenagem ao Orixá Oxóssi, senhor das matas.",   "NULL", "NULL"),
    ( 7, 2, 1, "Festa de Iemanjá / Amaci",                 "Celebração de Iemanjá com ritual de amaci.",                   "NULL", "NULL"),
    (13, 3, 1, "Festa dos Malandros",                      "Celebração em homenagem aos Malandros da Umbanda.",            "NULL", "NULL"),
    ( 3, 4, 3, "Sexta Santa",                              "Cerimônia especial de Sexta Santa. Início às 15h00.",          "'15:00:00'", "'17:00:00'"),
    (25, 4, 1, "Festa de Ogum / Iao",                      "Celebração em homenagem ao Orixá Ogum e seus filhos.",         "NULL", "NULL"),
    (15, 5, 1, "Festa dos Pretos Velhos",                  "Homenagem aos Pretos Velhos, mestres da sabedoria.",           "NULL", "NULL"),
    (29, 5, 1, "Festa dos Ciganos",                        "Celebração em homenagem aos Ciganos da Umbanda.",              "NULL", "NULL"),
    (13, 6, 1, "Festa de Esquerda",                        "Gira de Esquerda com os Exus e Pombas Giras.",                 "NULL", "NULL"),
    (26, 6, 1, "Festa de Boiadeiro e Saudação a Xangô Menino", "Celebração dos Boiadeiros e saudação a Xangô Menino.",     "NULL", "NULL"),
    (10, 7, 1, "Festa dos Marinheiros",                    "Celebração em homenagem aos Marinheiros da Umbanda.",          "NULL", "NULL"),
    (31, 7, 1, "Festa de Nanã",                            "Celebração em homenagem à Orixá Nanã Buruquê.",                "NULL", "NULL"),
    ( 7, 8, 1, "Festa dos Baianos",                        "Celebração em homenagem aos Baianos da Umbanda.",              "NULL", "NULL"),
    (21, 8, 1, "Festa de Obaluaê",                         "Celebração em homenagem ao Orixá Obaluaê, senhor das doenças.","NULL", "NULL"),
    (25, 9, 1, "Festa de Erê - Dia 1",                     "Festa de Erê - primeiro dia de celebração.",                   "NULL", "NULL"),
    (26, 9, 1, "Festa de Erê - Dia 2",                     "Festa de Erê - segundo dia de celebração.",                    "NULL", "NULL"),
    (27, 9, 1, "Festa de Erê - Dia 3",                     "Festa de Erê - terceiro e último dia de celebração.",          "NULL", "NULL"),
    ( 2,10, 1, "Festa de Xangô",                           "Celebração em homenagem ao Orixá Xangô, senhor da justiça.",   "NULL", "NULL"),
    (16,10, 1, "Festa de Oxum",                            "Celebração em homenagem à Orixá Oxum, senhora das águas doces.","NULL", "NULL"),
    ( 5,12, 1, "Festa de Iansã",                           "Celebração em homenagem à Orixá Iansã, senhora dos ventos.",   "NULL", "NULL"),
    (11,12, 1, "Festa de Oxalá",                           "Celebração em homenagem ao Orixá Oxalá, pai da criação.",      "NULL", "NULL"),
]

# ===========================================================================
# GERAR SQL
# ===========================================================================

print("-- ================================================================")
print("-- CALENDÁRIO 2026 - SQL de substituição")
print("-- CalendarAttendances + Events")
print("-- Gerado por generate_calendar_2026.py")
print("-- ================================================================")
print()
print("BEGIN;")
print()

# Backup de segurança (cria tabelas temporárias)
print("-- Backup das tabelas antes da substituição")
print('CREATE TABLE IF NOT EXISTS batuara."CalendarAttendances_backup_pre2026" AS')
print('  SELECT * FROM batuara."CalendarAttendances";')
print('CREATE TABLE IF NOT EXISTS batuara."Events_backup_pre2026" AS')
print('  SELECT * FROM batuara."Events";')
print()

# CalendarAttendances
print("-- ================================================================")
print("-- PARTE 1: CalendarAttendances")
print(f"-- Total de registros: {len(calendar_records)}")
print("-- ================================================================")
print('TRUNCATE TABLE batuara."CalendarAttendances" RESTART IDENTITY CASCADE;')
print()
print('INSERT INTO batuara."CalendarAttendances"')
print('  ("Date", "StartTime", "EndTime", "Type", "Description", "Observations",')
print('   "RequiresRegistration", "MaxCapacity", "IsActive", "CreatedAt", "UpdatedAt")')
print('VALUES')

rows = []
for r in calendar_records:
    rows.append(
        f"  ('{r['Date']}', {r['StartTime']}, {r['EndTime']}, {r['Type']}, "
        f"{r['Description']}, {r['Observations']}, "
        f"{r['RequiresRegistration']}, {r['MaxCapacity']}, {r['IsActive']}, NOW(), NOW())"
    )
print(",\n".join(rows) + ";")
print()

# Events
print("-- ================================================================")
print("-- PARTE 2: Events (Festas e Eventos - sem giras)")
print(f"-- Total de registros: {len(events_table)}")
print("-- ================================================================")
print('TRUNCATE TABLE batuara."Events" RESTART IDENTITY CASCADE;')
print()
print('INSERT INTO batuara."Events"')
print('  ("Title", "Description", "Date", "StartTime", "EndTime", "Type",')
print('   "ImageUrl", "Location", "IsActive", "CreatedAt", "UpdatedAt")')
print('VALUES')

rows = []
for (day, month, typ, title, desc, start, end) in events_table:
    rows.append(
        f"  ('{title}', '{desc}', '{dt(2026, month, day)}', {start}, {end}, {typ},"
        f" NULL, NULL, true, NOW(), NOW())"
    )
print(",\n".join(rows) + ";")
print()
print("COMMIT;")
print()
print(f"-- Resumo: {len(calendar_records)} registros em CalendarAttendances, {len(events_table)} em Events")
