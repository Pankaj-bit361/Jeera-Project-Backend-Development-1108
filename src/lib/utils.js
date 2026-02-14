import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { addDays, format, startOfWeek, differenceInCalendarDays } from 'date-fns';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// Calculate current sprint number based on Org Creation (Monday Start)
export const calculateSprint = (orgCreatedAt) => {
    if (!orgCreatedAt) return 1;
    const orgStart = new Date(orgCreatedAt);
    const now = new Date();
    
    // Normalize to start of week (Monday)
    const orgMonday = startOfWeek(orgStart, { weekStartsOn: 1 });
    const currentMonday = startOfWeek(now, { weekStartsOn: 1 });
    
    const diffDays = differenceInCalendarDays(currentMonday, orgMonday);
    return Math.floor(diffDays / 7) + 1;
};

// Generate list of sprints from Org Creation up to Current Date
export const generateSprintList = (orgCreatedAt) => {
    if (!orgCreatedAt) return [];
    
    const orgStart = new Date(orgCreatedAt);
    const orgMonday = startOfWeek(orgStart, { weekStartsOn: 1 });
    const currentSprint = calculateSprint(orgCreatedAt);
    
    const list = [];
    // Only generate up to the current sprint (no future sprints beyond current active one)
    for (let i = 1; i <= currentSprint; i++) {
        const sprintStart = addDays(orgMonday, (i - 1) * 7);
        const sprintEnd = addDays(sprintStart, 6); // Sunday
        
        list.push({
            index: i,
            label: `Sprint ${i}`,
            dateRange: `${format(sprintStart, 'MMM d')} - ${format(sprintEnd, 'MMM d')}`,
            isActive: i === currentSprint
        });
    }
    // Return reversed so current is at top
    return list.reverse(); 
};

export const getSprintRange = (orgCreatedAt, sprintIndex) => {
    if (!orgCreatedAt || !sprintIndex) return 'Loading...';
    const orgStart = new Date(orgCreatedAt);
    const orgMonday = startOfWeek(orgStart, { weekStartsOn: 1 });
    const start = addDays(orgMonday, (sprintIndex - 1) * 7);
    const end = addDays(start, 6);
    return `${format(start, 'dd MMM yyyy')} - ${format(end, 'dd MMM yyyy')}`;
};