
import { isBefore, isAfter, addHours } from "date-fns";

export interface Shift {
  id: number;
  employeeName: string;
  position: string;
  start: Date;
  end: Date;
  notes: string;
}

export interface StaffingRequirement {
  position: string;
  minStaff: number;
  maxStaff: number;
}

export interface ConflictAlert {
  id: string;
  type: 'overlap' | 'staffing' | 'break';
  severity: 'warning' | 'error';
  message: string;
  shifts?: Shift[];
}

const BREAK_TIME_REQUIRED = 30; // 30 minutes break required for shifts > 6 hours
const staffingRequirements: StaffingRequirement[] = [
  { position: "Server", minStaff: 2, maxStaff: 4 },
  { position: "Chef", minStaff: 1, maxStaff: 2 },
  { position: "Bartender", minStaff: 1, maxStaff: 2 },
];

export const detectOverlappingShifts = (shifts: Shift[]): ConflictAlert[] => {
  const conflicts: ConflictAlert[] = [];
  
  shifts.forEach((shift1, index) => {
    shifts.slice(index + 1).forEach(shift2 => {
      if (
        shift1.employeeName === shift2.employeeName &&
        ((isAfter(shift1.start, shift2.start) && isBefore(shift1.start, shift2.end)) ||
         (isAfter(shift1.end, shift2.start) && isBefore(shift1.end, shift2.end)) ||
         (isBefore(shift1.start, shift2.start) && isAfter(shift1.end, shift2.end)))
      ) {
        conflicts.push({
          id: `overlap-${shift1.id}-${shift2.id}`,
          type: 'overlap',
          severity: 'error',
          message: `${shift1.employeeName} has overlapping shifts`,
          shifts: [shift1, shift2],
        });
      }
    });
  });

  return conflicts;
};

export const detectStaffingIssues = (shifts: Shift[]): ConflictAlert[] => {
  const conflicts: ConflictAlert[] = [];
  const timeSlots = new Map<string, Set<string>>();

  shifts.forEach(shift => {
    const date = shift.start.toISOString().split('T')[0];
    if (!timeSlots.has(date)) {
      timeSlots.set(date, new Set());
    }
    timeSlots.get(date)?.add(shift.position);
  });

  timeSlots.forEach((positions, date) => {
    staffingRequirements.forEach(req => {
      const staffCount = Array.from(positions).filter(p => p === req.position).length;
      if (staffCount < req.minStaff) {
        conflicts.push({
          id: `understaffed-${date}-${req.position}`,
          type: 'staffing',
          severity: 'error',
          message: `Understaffed: Need at least ${req.minStaff} ${req.position}(s) on ${date}`,
        });
      } else if (staffCount > req.maxStaff) {
        conflicts.push({
          id: `overstaffed-${date}-${req.position}`,
          type: 'staffing',
          severity: 'warning',
          message: `Overstaffed: Maximum ${req.maxStaff} ${req.position}(s) recommended on ${date}`,
        });
      }
    });
  });

  return conflicts;
};

export const detectBreakTimeViolations = (shifts: Shift[]): ConflictAlert[] => {
  const conflicts: ConflictAlert[] = [];

  shifts.forEach(shift => {
    const shiftDuration = (shift.end.getTime() - shift.start.getTime()) / (1000 * 60 * 60);
    if (shiftDuration > 6 && !shift.notes.toLowerCase().includes('break')) {
      conflicts.push({
        id: `break-${shift.id}`,
        type: 'break',
        severity: 'warning',
        message: `${shift.employeeName}'s ${shiftDuration.toFixed(1)}hr shift requires a ${BREAK_TIME_REQUIRED}min break`,
        shifts: [shift],
      });
    }
  });

  return conflicts;
};

export const detectAllConflicts = (shifts: Shift[]): ConflictAlert[] => {
  return [
    ...detectOverlappingShifts(shifts),
    ...detectStaffingIssues(shifts),
    ...detectBreakTimeViolations(shifts),
  ];
};
