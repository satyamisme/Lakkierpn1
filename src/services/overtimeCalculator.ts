export function calculateOvertime(clockIn: Date, clockOut: Date): number {
  const diffMs = clockOut.getTime() - clockIn.getTime();
  const diffHrs = diffMs / (1000 * 60 * 60);
  
  // Standard shift is 8 hours
  const standardShift = 8;
  if (diffHrs > standardShift) {
    return parseFloat((diffHrs - standardShift).toFixed(2));
  }
  
  return 0;
}
