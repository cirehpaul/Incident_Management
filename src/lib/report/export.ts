import * as XLSX from 'xlsx';
import { toPng } from 'html-to-image';
import type { Incident } from '@/types/incident';
import type { WeeklyReportData } from '@/types/sla';
import type { AgingReportData } from '@/types/aging';

/**
 * Builds the extract file rows: preserves 100% of the original raw data,
 * and updates the re-assigned team/technician based on the calculator routing.
 */
export function buildExtractedIncidentRows(incidents: Incident[]): Record<string, unknown>[] {
  return incidents.map((inc) => {
    // Preserve the exact raw data uploaded
    const row: Record<string, unknown> = { ...(inc.rawData || {}) };

    // Find the technician / assigned team column in the raw data
    const techKey = Object.keys(row).find(
      (k) =>
        k.toLowerCase() === 'technician' ||
        k.toLowerCase() === 'assigned team' ||
        k.toLowerCase() === 'auto assigned group/technician' ||
        k.toLowerCase().includes('technician')
    ) || 'Technician';

    // Update technician to the re-assigned team based on the calculator
    row[techKey] = inc.assignedTeam;

    // Ensure Final Team column is present
    row['Final Team'] = inc.assignedTeam;

    return row;
  });
}

function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export extracted raw data with re-assigned team as XLSX
 */
export function exportToXLSX(
  incidents: Incident[],
  reportData?: WeeklyReportData | AgingReportData | null,
  filename: string = 'Extracted_Incidents.xlsx'
): void {
  const wb = XLSX.utils.book_new();

  const rows = buildExtractedIncidentRows(incidents);
  const wsIncidents = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, wsIncidents, 'Raw Data');

  XLSX.writeFile(wb, filename);
}

/**
 * Export extracted raw data as XLS
 */
export function exportToXLS(
  incidents: Incident[],
  filename: string = 'Extracted_Incidents.xls'
): void {
  const wb = XLSX.utils.book_new();
  const rows = buildExtractedIncidentRows(incidents);
  const wsIncidents = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, wsIncidents, 'Raw Data');
  XLSX.writeFile(wb, filename, { bookType: 'biff8' });
}

/**
 * Export extracted raw data as CSV
 */
export function exportToCSV(
  incidents: Incident[],
  filename: string = 'Extracted_Incidents.csv'
): void {
  const rows = buildExtractedIncidentRows(incidents);
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  downloadBlob(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * Export extracted raw data as HTML file
 */
export function exportToHTML(
  incidents: Incident[],
  reportData?: WeeklyReportData | AgingReportData | null,
  filename: string = 'Extracted_Incidents.html'
): void {
  const rows = buildExtractedIncidentRows(incidents);
  const ws = XLSX.utils.json_to_sheet(rows);
  const htmlTable = XLSX.utils.sheet_to_html(ws);

  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Extracted Incident Data</title>
  <style>
    body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; margin: 24px; background: #ffffff; color: #111827; }
    h2 { color: #1f4e79; margin-bottom: 4px; }
    p.meta { color: #6b7280; font-size: 13px; margin-bottom: 20px; }
    table { border-collapse: collapse; width: 100%; font-size: 12px; margin-bottom: 24px; }
    th, td { border: 1px solid #d1d5db; padding: 6px 10px; text-align: left; }
    th { background: #1f4e79; color: #ffffff; font-weight: 600; }
    tr:nth-child(even) { background: #f9fafb; }
    tr:hover { background: #f3f4f6; }
  </style>
</head>
<body>
  <h2>Extracted Incident Data</h2>
  <p class="meta">Generated: ${new Date().toLocaleString()}</p>
  ${htmlTable}
</body>
</html>`;

  downloadBlob(fullHtml, filename, 'text/html;charset=utf-8;');
}

/**
 * Export report as PDF (triggers print dialog)
 */
export function exportToPDF(): void {
  window.print();
}

/**
 * Export table as high-resolution PNG on pure white background
 */
export async function exportAsPng(elementId: string, filename: string = 'sla-report.png'): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  try {
    const dataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: 2.5,
      backgroundColor: '#ffffff',
      style: {
        background: '#ffffff',
        backgroundColor: '#ffffff',
        transform: 'scale(1)',
        transformOrigin: 'top left',
        margin: '0',
      },
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Failed to export as PNG:', error);
    throw error;
  }
}
