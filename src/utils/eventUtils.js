export function getEventStatus(event, nowObject) {
  const now = nowObject || new Date();

  // Legacy fallback for non-repeating events
  if (!event.isRepeating) {
    const targetDate = new Date(event.date);
    const difference = +targetDate - +now;
    if (difference > 0) {
      return {
        expired: false,
        isActive: false, 
        target: targetDate,
        difference,
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        ms: Math.floor(difference % 1000)
      };
    } else {
      return { expired: true, isActive: false, target: targetDate, difference, days: 0, hours: 0, minutes: 0, seconds: 0, ms: 0 };
    }
  }

  const { timeRanges = [], recurrence = { type: 'daily' }, endDate } = event;
  
  if (endDate) {
    const deadline = new Date(endDate);
    deadline.setHours(23, 59, 59, 999);
    // Note: Event expires ONLY if deadline is passed AND it is not currently active
    // We'll calculate this at the end
  }

  const checkDay = (dateToCheck) => {
    if (recurrence.type === 'weekly' || recurrence.type === 'custom_days') {
      const dayOfWeek = dateToCheck.getDay();
      return recurrence.daysOfWeek && recurrence.daysOfWeek.includes(dayOfWeek);
    } else if (recurrence.type === 'monthly') {
      return dateToCheck.getDate() === recurrence.dayOfMonth;
    }
    return true; // daily or fallback
  };

  // Generate all occurrences from yesterday to next 35 days
  let occurrences = [];
  const checkOffsets = [-1]; // yesterday
  for (let i = 0; i <= 35; i++) checkOffsets.push(i);

  for (const offset of checkOffsets) {
    const d = new Date(now.getTime() + offset * 86400000);
    if (!checkDay(d)) continue;

    for (const range of timeRanges) {
      // timeRanges is [{ startTime: '23:00', endTime: '07:00' }]
      const [startHs, startMs] = range.startTime.split(':').map(Number);
      const [endHs, endMs] = range.endTime.split(':').map(Number);
      
      const start = new Date(d);
      start.setHours(startHs, startMs, 0, 0);

      const end = new Date(d);
      end.setHours(endHs, endMs, 0, 0);
      
      if (end <= start) {
        end.setDate(end.getDate() + 1); // Spans midnight
      }

      occurrences.push({ start, end });
    }
  }

  // Sort occurrences by start time
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
      currentOrNext = occ.start; // counting down to next start
      break;
    }
  }

  if (endDate) {
    const deadline = new Date(endDate);
    deadline.setHours(23, 59, 59, 999);
    if (now > deadline && !isActive) {
      return { expired: true, isActive: false, target: null, difference: 0, days: 0, hours: 0, minutes: 0, seconds: 0, ms: 0 };
    }
    if (currentOrNext && currentOrNext > deadline) {
      currentOrNext = null;
    }
  }

  if (!currentOrNext) {
    return { expired: true, isActive: false, target: null, difference: 0, days: 0, hours: 0, minutes: 0, seconds: 0, ms: 0 };
  }

  const targetDate = currentOrNext;
  const difference = +targetDate - +now;

  return {
    expired: false,
    isActive,
    target: targetDate,
    difference,
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    ms: Math.floor(difference % 1000)
  };
}

export function isEventActiveForDashboard(event, now) {
  if (!event.isRepeating) {
    return +new Date(event.date) >= +now;
  }
  
  const status = getEventStatus(event, now);
  
  if (status.isActive) return true;
  
  if (status.target && !status.expired) {
    const preShow = 30 * 60000;
    if (status.target.getTime() - now.getTime() <= preShow) {
      return true;
    }
  }
  
  
  return false;
}

export function formatRecurrence(event) {
  if (!event.isRepeating) return '';
  const { recurrence = { type: 'daily' }, timeRanges = [] } = event;
  
  const rangesStr = timeRanges.map(r => `${r.startTime}-${r.endTime}`).join(', ');
  
  if (recurrence.type === 'daily') {
    return `Daily: ${rangesStr}`;
  } else if (recurrence.type === 'weekly' || recurrence.type === 'custom_days') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const activeDays = (recurrence.daysOfWeek || []).map(d => days[d]).join(', ');
    return `Weekly on ${activeDays}: ${rangesStr}`;
  } else if (recurrence.type === 'monthly') {
    return `Monthly on the ${recurrence.dayOfMonth}: ${rangesStr}`;
  }
  return rangesStr;
}
