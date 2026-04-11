import { NotFoundError } from "../../common/errors";
import { eventBus } from "../../common/events/eventBus";
import * as reportsRepo from "./reports.repository";
import type { CreateReportDTO, ResolveReportDTO } from "./reports.dto";

const AUTO_MODERATION_THRESHOLD = 5;

export async function createReport(userId: string, data: CreateReportDTO) {
  const report = await reportsRepo.createReport({
    reporterId: userId,
    entityType: data.entityType,
    entityId: data.entityId,
    reason: data.reason,
    description: data.description,
  });

  const unresolvedCount = await reportsRepo.countUnresolvedReports(data.entityType, data.entityId);

  if (unresolvedCount >= AUTO_MODERATION_THRESHOLD) {
    eventBus.emit("report.thresholdReached", {
      entityType: data.entityType,
      entityId: data.entityId,
      unresolvedCount,
    });
  }

  return report;
}

export async function getAllReports(filters?: { isResolved?: boolean }) {
  return reportsRepo.findAllReports(filters);
}

export async function getReportById(reportId: string) {
  const report = await reportsRepo.findReportById(reportId);
  if (!report) {
    throw new NotFoundError("Report not found", "REPORT_NOT_FOUND");
  }
  return report;
}

export async function resolveReport(reportId: string, data: ResolveReportDTO) {
  const report = await reportsRepo.findReportById(reportId);
  if (!report) {
    throw new NotFoundError("Report not found", "REPORT_NOT_FOUND");
  }
  return reportsRepo.resolveReport(reportId, data.isResolved);
}
