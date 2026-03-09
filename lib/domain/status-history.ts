export type StatusEvent = {
  recordType: string;
  recordId: string;
  fromStatus?: string;
  toStatus: string;
  actorName?: string;
  note?: string;
  createdAt: string;
};

export function createStatusEvent(input: Omit<StatusEvent, "createdAt">): StatusEvent {
  return {
    ...input,
    createdAt: new Date().toISOString()
  };
}
