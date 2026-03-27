import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..', '..', '..');
const reportsDir = path.join(workspaceRoot, 'reports');

function escapePdfText(text) {
  return String(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildPdf(lines) {
  const content = [
    'BT',
    '/F1 12 Tf',
    '50 780 Td',
    ...lines.flatMap((line, index) => {
      if (index === 0) {
        return [`(${escapePdfText(line)}) Tj`];
      }
      return ['0 -18 Td', `(${escapePdfText(line)}) Tj`];
    }),
    'ET'
  ].join('\n');

  const objects = [];
  objects.push('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj');
  objects.push('2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj');
  objects.push('3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj');
  objects.push('4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj');
  objects.push(`5 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`);

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return pdf;
}

export function saveMonitorPdfReport(payload) {
  fs.mkdirSync(reportsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `eye-monitor-report-${timestamp}.pdf`;
  const fullPath = path.join(reportsDir, fileName);

  const lines = [
    'Eye Monitoring Report',
    `Generated At: ${payload.generatedAt || new Date().toISOString()}`,
    '----------------------------------------',
    'Participant',
    `Participant ID: ${payload.participant?.participantId || 'N/A'}`,
    `Participant Name: ${payload.participant?.participantName || 'N/A'}`,
    `Occupation: ${payload.participant?.occupation || 'N/A'}`,
    `Session ID: ${payload.sessionId || 'Not started'}`,
    '----------------------------------------',
    'Current Metrics',
    `Blink Rate: ${payload.currentMetrics?.blinkRate ?? 'N/A'} per minute`,
    `Blink Duration: ${payload.currentMetrics?.blinkDuration ?? 'N/A'} ms`,
    `Eye Aspect Ratio: ${payload.currentMetrics?.eyeAspectRatio ?? 'N/A'}`,
    `Blink Pattern: ${payload.currentAnalysis?.blinkPatternStatus || 'N/A'}`,
    `Fatigue Risk: ${payload.currentAnalysis?.fatigueRisk || 'N/A'}`,
    `Medical Severity: ${payload.currentAnalysis?.medicalSeverity || 'N/A'}`,
    `Eye Stress Score: ${payload.currentAnalysis?.eyeStressScore ?? 'N/A'}`,
    '----------------------------------------',
    'Assessment',
    `Symptoms: ${(payload.currentAnalysis?.symptoms || []).join(', ') || 'None'}`,
    `Probable Causes: ${(payload.currentAnalysis?.probableCauses || []).join(', ') || 'None'}`,
    `Warnings: ${(payload.currentAnalysis?.warnings || []).join(', ') || 'None'}`,
    `Suggested Remedies: ${(payload.currentAnalysis?.suggestedRemedies || []).join(', ') || 'None'}`
  ];

  const pdf = buildPdf(lines);
  fs.writeFileSync(fullPath, pdf, 'binary');

  return {
    fileName,
    fullPath
  };
}
