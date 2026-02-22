export function getEventStatus(event, nowObject) {
  const now = nowObject || new Date();

  // Non-repeating fallback
  if (!event.isRepeating) {
    const start = new Date(event.startDate || event.date);
    const end = event.endDate ? new Date(event.endDate) : start;

    if (now >= start && now <= end) {
      const diff = +end - +now;
      return buildStatus(false, true, end, diff);
    } else if (now < start) {
      const diff = +start - +now;
      return buildStatus(false, false, start, diff);
    } else {
      return buildStatus(true, false, null, 0);
    }
  }

  // Handle Legacy Data vs New Data
  let timeRanges = event.timeRanges;
  if (!timeRanges && event.repeatTimes) {
    const durMins = event.activeDuration || 60;
    timeRanges = event.repeatTimes.map(st => {
      const parts = st.split(':');
      if (parts.length !== 2) return null;
      const h = Number(parts[0]);
      const m = Number(parts[1]);
      
      const eh = Math.floor((h * 60 + m + durMins) / 60) % 24;
      const em = (m + durMins) % 60;
      
      return { 
        startTime: st, 
        endTime: `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}` 
      };
    }).filter(Boolean);
  } else if (!timeRanges) {
    timeRanges = [];
  }

  const { recurrence = { type: 'daily' }, endDate } = event;

  const isValidDay = (dateToCheck) => {
    if (recurrence.type === 'weekly' || recurrence.type === 'custom_days') {
      const allowedDays = recurrence.daysOfWeek || [];
      return allowedDays.includes(dateToCheck.getDay());
    }
    if (recurrence.type === 'monthly') {
      return dateToCheck.getDate() === (recurrence.dayOfMonth || 1);
    }
    return true; // daily
  };

  // Generate occurrences across yesterday, today, and future 35 days using Date methods.
  let occurrences = [];
  for (let offset = -1; offset <= 35; offset++) {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    d.setHours(0, 0, 0, 0); // reset to midnight for clean comparison
    
    if (!isValidDay(d)) continue;

    for (const range of timeRanges) {
      if (!range.startTime || !range.endTime) continue;
      const startParts = range.startTime.split(':');
      const endParts = range.endTime.split(':');
      if (startParts.length !== 2 || endParts.length !== 2) continue;
      
      const sh = Number(startParts[0]), sm = Number(startParts[1]);
      const eh = Number(endParts[0]), em = Number(endParts[1]);

      const start = new Date(d);
      start.setHours(sh, sm, 0, 0);

      const end = new Date(d);
      end.setHours(eh, em, 0, 0);

      if (end <= start) {
        end.setDate(end.getDate() + 1); // Spans midnight logically
      }

      occurrences.push({ start, end });
    }
  }

  occurrences.sort((a, b) => a.start - b.start);

  let isActive = false;
  let currentOrNext = null;

  for (const occ of occurrences) {
    if (now >= occ.start && now <= occ.end) {
      isActive = true;
      currentOrNext = occ.end; // counting down to end of active window
      break;
    }
    if (occ.start > now) {
      currentOrNext = occ.start; // counting down to next occurence
      break;
    }
  }

  if (endDate) {
    const deadline = new Date(endDate);
    deadline.setHours(23, 59, 59, 999);
    if (now > deadline && !isActive) return buildStatus(true, false, null, 0);
    if (currentOrNext && currentOrNext > deadline) currentOrNext = null;
  }

  if (!currentOrNext) return buildStatus(true, false, null, 0);

  const difference = +currentOrNext - +now;
  return buildStatus(false, isActive, currentOrNext, difference);
}

function buildStatus(expired, isActive, target, diff) {
  diff = Math.max(0, diff || 0);
  return {
    expired,
    isActive,
    target,
    difference: diff,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    ms: Math.floor(diff % 1000)
  };
}

export function isEventActiveForDashboard(event, nowObject) {
  const now = nowObject || new Date();
  if (!event.isRepeating) {
    const end = event.endDate ? new Date(event.endDate) : new Date(event.startDate || event.date);
    return +end >= +now;
  }
  
  const status = getEventStatus(event, now);
  if (status.isActive) return true;
  if (status.target && !status.expired && (status.target.getTime() - now.getTime() <= 30 * 60000)) return true;
  return false;
}

export function formatRecurrence(event) {
  if (!event.isRepeating) return '';
  const { recurrence = { type: 'daily' } } = event;
  
  let rangesStr = '';
  if (event.timeRanges && event.timeRanges.length > 0) {
    rangesStr = event.timeRanges.map(r => `${r.startTime || '??:??'}-${r.endTime || '??:??'}`).join(', ');
  } else if (event.repeatTimes) {
    const durMins = event.activeDuration || 60;
    rangesStr = event.repeatTimes.map(t => `${t} (for ${durMins}m)`).join(', ');
  }
  
  if (recurrence.type === 'daily') return `Daily: ${rangesStr}`;
  if (recurrence.type === 'weekly' || recurrence.type === 'custom_days') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const activeDays = (recurrence.daysOfWeek || []).map(d => days[d]).join(', ');
    return `Weekly on ${activeDays}: ${rangesStr}`;
  }
  if (recurrence.type === 'monthly') return `Monthly on the ${recurrence.dayOfMonth || 1}: ${rangesStr}`;
  return rangesStr;
}
