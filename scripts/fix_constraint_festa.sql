ALTER TABLE batuara."CalendarAttendances" DROP CONSTRAINT IF EXISTS "CK_seed_calendar_Attendances_Type_Valid";
ALTER TABLE batuara."CalendarAttendances" ADD CONSTRAINT "CK_seed_calendar_Attendances_Type_Valid" CHECK ("Type" >= 1 AND "Type" <= 5);
