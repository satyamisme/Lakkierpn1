export type RepairStatus = 'pending' | 'in-progress' | 'qc' | 'ready' | 'delivered' | 'cancelled';

export const STATUS_FLOW: Record<RepairStatus, RepairStatus[]> = {
  'pending': ['in-progress', 'cancelled'],
  'in-progress': ['qc', 'cancelled'],
  'qc': ['ready', 'in-progress'],
  'ready': ['delivered'],
  'delivered': [],
  'cancelled': ['pending']
};

export const getNextStatus = (current: RepairStatus): RepairStatus[] => {
  return STATUS_FLOW[current] || [];
};

export const canTransition = (from: RepairStatus, to: RepairStatus): boolean => {
  return STATUS_FLOW[from]?.includes(to) || false;
};

export const STATUS_LABELS: Record<RepairStatus, string> = {
  'pending': 'Pending Intake',
  'in-progress': 'On Bench',
  'qc': 'Quality Control',
  'ready': 'Ready for Pickup',
  'delivered': 'Delivered',
  'cancelled': 'Cancelled'
};
