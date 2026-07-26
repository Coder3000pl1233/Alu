import { describe, expect, it } from "vitest";
import { filterMetricRecords, metricRecords, summarizeMetrics } from "@/lib/admin-metrics";

describe("métricas administrativas", () => {
  it("filtra por período y materia", () => {
    const result = filterMetricRecords(metricRecords, "30 días", "Anatomía");
    expect(result).toHaveLength(2);
    expect(result.every(record => record.subject === "Anatomía" && record.day <= 30)).toBe(true);
  });

  it("resume procesamiento y consumo", () => {
    const result = summarizeMetrics(filterMetricRecords(metricRecords, "7 días", "Todas"));
    expect(result).toMatchObject({ processed: 8, failed: 1, pagesServed: 1840, sessions: 92 });
  });
});
