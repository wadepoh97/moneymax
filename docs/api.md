# API

This API exposes endpoints for querying available slots, managing appointments, and reading/updating runtime configuration.

- Base URL: /
- Content-Type: application/json
- Dates: "YYYY-MM-DD", Times: "HH:mm"
- Errors: `{ "error": "message" }`
- Auth: None (add your own if needed)

## Models

- Slot

```json
  { "date": "YYYY-MM-DD", "time": "HH:mm", "available_slots": 0 | 1 }
```

- Appointment

```json
  {
    "id": "string",
    "date": "YYYY-MM-DD",
    "startTime": "HH:mm",
    "endTime": "HH:mm",
    "slotsTaken": 1
  }
```

- Config (see configuration.md for details)

```json
  {
    "slotDurationMinutes": 30,
    "maxSlotsPerAppointment": 5,
    "openTime": "09:00",
    "closeTime": "18:00",
    "workingDays": [1,2,3,4,5],
    "daysOff": [],
    "breaks": [{ "start": "12:30", "end": "13:30" }]
  }
```

---

## GET /api/slots

Returns available time slots for a given date.

Query parameters:

- date (required): YYYY-MM-DD

Example:

```bash
curl -x GET /api/slots?date=2025-08-31
```

Responses:

- 200 OK: Slot[] (empty array if non-working day or day off)
- 400 Bad Request: invalid/missing date
- 405 Method Not Allowed: non-GET

Example 200:

```json
[
  { "date": "2025-08-31", "time": "09:00", "available_slots": 1 },
  { "date": "2025-08-31", "time": "09:30", "available_slots": 0 }
]
```

Logic:

- Uses config (workingDays, daysOff, open/close, slotDurationMinutes, breaks)
- Generates times from openTime to closeTime by slotDurationMinutes
- Excludes times within any break window
- Marks a slot unavailable if it overlaps any existing appointment on that date
  - Overlap check: [startTime, endTime) vs [slot, slot+duration)

---

## POST /api/appointments

Creates an appointment.

Request body:

```json
{
  "date": "YYYY-MM-DD",
  "time": "HH:mm",
  "slots": 1
}
```

- slots must be between 1 and maxSlotsPerAppointment (config)

Responses:

- 201 Created: Appointment
- 400 Bad Request: invalid payload or format
- 409 Conflict: slot not available or overlaps existing appointment
- 405 Method Not Allowed: non-POST

Example:

```bash
curl -X POST /api/appointments \
  -H "Content-Type: application/json" \
  -d '{ "date":"2025-08-31", "time":"09:00", "slots":1 }'
```

---

## GET /api/appointments

Returns the list of appointments.

Responses:

- 200 OK: Appointment[]
- 405 Method Not Allowed: non-GET

Example:

```json
[
  {
    "id": "app_123",
    "date": "2025-08-31",
    "startTime": "09:00",
    "endTime": "09:30",
    "slotsTaken": 1
  }
]
```

---

## DELETE /api/appointments/:id

Deletes an appointment by id.

Responses:

- 204 No Content: deleted
- 404 Not Found: no appointment with that id
- 405 Method Not Allowed: non-DELETE

Example:

```bash
curl -X DELETE /api/appointments/app_123
```

---

## GET /api/config

Returns the current runtime configuration.

Responses:

- 200 OK: Config
- 405 Method Not Allowed: non-GET

Example:

```json
{
  "slotDurationMinutes": 30,
  "maxSlotsPerAppointment": 5,
  "openTime": "09:00",
  "closeTime": "18:00",
  "workingDays": [1,2,3,4,5],
  "daysOff": [],
  "breaks": []
}
```

---

## PUT /api/config

Updates the runtime configuration.

Request body (partial or full):

```json
{
  "slotDurationMinutes": 20,
  "maxSlotsPerAppointment": 5,
  "openTime": "09:00",
  "closeTime": "18:00",
  "workingDays": [1,2,3,4,5],
  "daysOff": ["2025-08-31"],
  "breaks": [{ "start": "12:30", "end": "13:30" }]
}
```

Constraints:

- slotDurationMinutes >= 5
- 1 <= maxSlotsPerAppointment <= 5
- Times are "HH:mm"; dates are "YYYY-MM-DD"

Responses:

- 200 OK: updated Config
- 400 Bad Request: invalid values
- 405 Method Not Allowed: non-PUT

---

## Notes

- workingDays uses 1..7 (Mon..Sun).
- Slots on daysOff or outside open/close are excluded.
- Break windows are half-open intervals [start, end); slots fully or partially inside are excluded.
- Overlap check is half-open [startTime, endTime), preventing double-booking.
- available_slots is currently 0