const offsetPattern = /(Z|[+-]\d{2}:\d{2})$/;
const businessStartMinutes = 8 * 60;
const businessEndMinutes = 20 * 60;

export function rangesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

export function parseOffsetMinutes(value) {
  const match = value.match(offsetPattern);

  if (!match) {
    return null;
  }

  if (match[1] === "Z") {
    return 0;
  }

  const sign = match[1][0] === "-" ? -1 : 1;
  const [hours, minutes] = match[1].slice(1).split(":").map(Number);
  return sign * (hours * 60 + minutes);
}

export function getLocalDateParts(value) {
  const instant = new Date(value);
  const offsetMinutes = parseOffsetMinutes(value);

  if (Number.isNaN(instant.getTime()) || offsetMinutes === null) {
    return null;
  }

  const shifted = new Date(instant.getTime() + offsetMinutes * 60 * 1000);

  return {
    instant,
    offsetMinutes,
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    date: shifted.getUTCDate(),
    dayOfWeek: shifted.getUTCDay(),
    minutesOfDay: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
  };
}

export function isWithinBusinessHours(startTime, endTime) {
  const start = getLocalDateParts(startTime);
  const end = getLocalDateParts(endTime);

  if (!start || !end || start.offsetMinutes !== end.offsetMinutes) {
    return false;
  }

  const sameLocalDate =
    start.year === end.year &&
    start.month === end.month &&
    start.date === end.date;

  if (!sameLocalDate) {
    return false;
  }

  return (
    start.dayOfWeek >= 1 &&
    start.dayOfWeek <= 5 &&
    end.dayOfWeek >= 1 &&
    end.dayOfWeek <= 5 &&
    start.minutesOfDay >= businessStartMinutes &&
    end.minutesOfDay <= businessEndMinutes
  );
}

export function getDurationMinutes(startTime, endTime) {
  return (new Date(endTime) - new Date(startTime)) / (1000 * 60);
}

export function getOverlapMinutes(startA, endA, startB, endB) {
  const overlapStart = Math.max(startA.getTime(), startB.getTime());
  const overlapEnd = Math.min(endA.getTime(), endB.getTime());
  return Math.max(0, (overlapEnd - overlapStart) / (1000 * 60));
}

export function getBusinessMinutesInRange(fromTime, toTime) {
  const from = getLocalDateParts(fromTime);
  const to = getLocalDateParts(toTime);

  if (!from || !to || from.offsetMinutes !== to.offsetMinutes) {
    return 0;
  }

  const offsetMinutes = from.offsetMinutes;
  const fromInstant = from.instant;
  const toInstant = to.instant;

  let totalMinutes = 0;
  let cursor = new Date(Date.UTC(from.year, from.month, from.date, 0, 0, 0, 0));
  const endCursor = new Date(Date.UTC(to.year, to.month, to.date, 0, 0, 0, 0));

  while (cursor <= endCursor) {
    const dayOfWeek = cursor.getUTCDay();

    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const businessStartUtc = new Date(
        cursor.getTime() - offsetMinutes * 60 * 1000 + businessStartMinutes * 60 * 1000,
      );
      const businessEndUtc = new Date(
        cursor.getTime() - offsetMinutes * 60 * 1000 + businessEndMinutes * 60 * 1000,
      );

      totalMinutes += getOverlapMinutes(
        fromInstant,
        toInstant,
        businessStartUtc,
        businessEndUtc,
      );
    }

    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
  }

  return totalMinutes;
}
