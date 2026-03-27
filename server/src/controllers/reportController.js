import { saveMonitorPdfReport } from '../services/pdfReportService.js';

export async function saveMonitorPdf(req, res) {
  const report = saveMonitorPdfReport(req.body);
  res.status(201).json({
    success: true,
    message: 'PDF report saved successfully',
    data: report
  });
}
