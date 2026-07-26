export type MetricsPeriod = "7 días" | "30 días" | "90 días";
export type MetricsSubject = "Todas" | "Anatomía" | "Biología" | "Histología";

export type MetricRecord = {
  subject: Exclude<MetricsSubject, "Todas">;
  day: number;
  processed: number;
  failed: number;
  pending: number;
  pagesServed: number;
  sessions: number;
  storageMb: number;
};

export const metricRecords: MetricRecord[] = [
  { subject: "Anatomía", day: 5, processed: 8, failed: 1, pending: 2, pagesServed: 1840, sessions: 92, storageMb: 420 },
  { subject: "Biología", day: 12, processed: 6, failed: 0, pending: 1, pagesServed: 1380, sessions: 71, storageMb: 315 },
  { subject: "Histología", day: 19, processed: 5, failed: 1, pending: 3, pagesServed: 990, sessions: 54, storageMb: 280 },
  { subject: "Anatomía", day: 27, processed: 7, failed: 0, pending: 1, pagesServed: 2100, sessions: 108, storageMb: 455 },
  { subject: "Biología", day: 45, processed: 9, failed: 1, pending: 2, pagesServed: 2460, sessions: 126, storageMb: 510 },
  { subject: "Histología", day: 72, processed: 4, failed: 0, pending: 1, pagesServed: 810, sessions: 48, storageMb: 205 }
];

export function filterMetricRecords(records: MetricRecord[], period: MetricsPeriod, subject: MetricsSubject) {
  const maximumDay = Number(period.split(" ")[0]);
  return records.filter(record => record.day <= maximumDay && (subject === "Todas" || record.subject === subject));
}

export function summarizeMetrics(records: MetricRecord[]) {
  return records.reduce((summary, record) => ({
    processed: summary.processed + record.processed,
    failed: summary.failed + record.failed,
    pending: summary.pending + record.pending,
    pagesServed: summary.pagesServed + record.pagesServed,
    sessions: summary.sessions + record.sessions,
    storageMb: summary.storageMb + record.storageMb
  }), { processed: 0, failed: 0, pending: 0, pagesServed: 0, sessions: 0, storageMb: 0 });
}
