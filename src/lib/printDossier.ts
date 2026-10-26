import type { InterviewPrepDossier, CatalogIndexEntry } from './interviewPrep';

/**
 * Generates a clean, standalone, high-contrast HTML document for printing
 * or saving as a PDF. Self-contained with embedded CSS.
 */
export function generateDossierPrintHtml(
  dossier: InterviewPrepDossier,
  catalog: CatalogIndexEntry[]
): string {
  const cardsHtml = dossier.selectedCards
    .map((sel) => {
      const card = catalog.find((c) => c.id === sel.id);
      const priorityClass = sel.priority.toLowerCase();
      const priorityLabel = sel.priority.toUpperCase();
      return `
        <tr>
          <td><span class="badge ${priorityClass}">${priorityLabel}</span></td>
          <td><strong>${escapeHtml(card?.title || sel.id)}</strong><br/><span class="card-id">${escapeHtml(sel.id)}</span></td>
          <td>${escapeHtml(card?.track || 'General')}</td>
          <td style="text-align: center;">D${card?.difficulty || 2}</td>
          <td>${escapeHtml(sel.rationale)}</td>
        </tr>
      `;
    })
    .join('');

  const externalTopicsHtml = dossier.externalTopics
    .map((top) => {
      const resources = top.recommendedResources
        .map((r) => `<li><strong>${escapeHtml(r.title)}</strong>${r.url ? ` &mdash; <span class="url">${escapeHtml(r.url)}</span>` : ''}</li>`)
        .join('');

      return `
        <div class="topic-box">
          <div class="topic-header">
            <span class="topic-title">${escapeHtml(top.topic)}</span>
            <span class="topic-priority">[${escapeHtml(top.priority.toUpperCase())} PRIORITY]</span>
          </div>
          <p class="topic-desc">${escapeHtml(top.description)}</p>
          ${resources ? `<div class="resources"><strong>Recommended Deep-Dive Resources:</strong><ul>${resources}</ul></div>` : ''}
        </div>
      `;
    })
    .join('');

  const checklistHtml = dossier.countdownChecklist
    .map((item) => `<li><span class="checkbox">&#9744;</span> <span>${escapeHtml(item)}</span></li>`)
    .join('');

  const toolsHtml = dossier.interactiveTools
    .map((tool) => `<li><strong>${escapeHtml(tool.name)}</strong>: ${escapeHtml(tool.focus)} <span class="url">(${escapeHtml(tool.url)})</span></li>`)
    .join('');

  // Format executive summary paragraphs
  const summaryParagraphs = dossier.executiveSummary
    .split(/\n\n+/)
    .filter((p) => p.trim())
    .map((p) => `<p>${escapeHtml(p.trim())}</p>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(dossier.company)} — ${escapeHtml(dossier.role)} Technical Interview Dossier</title>
  <style>
    @page {
      size: letter portrait;
      margin: 12mm 15mm;
    }
    *, *:before, *:after {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #111827;
      background: #ffffff;
      font-size: 9.5pt;
      line-height: 1.45;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header {
      border-bottom: 2.5px solid #111827;
      padding-bottom: 12px;
      margin-bottom: 18px;
    }
    .brand-row {
      display: flex;
      justify-content: space-between;
      font-size: 8.5pt;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #4b5563;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .main-title {
      font-size: 19pt;
      font-weight: 800;
      color: #111827;
      margin: 2px 0 10px 0;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 20px;
      font-size: 9pt;
      color: #374151;
      background: #f9fafb;
      padding: 8px 12px;
      border-radius: 4px;
      border: 1px solid #e5e7eb;
    }
    .section {
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 12pt;
      font-weight: 700;
      color: #111827;
      border-bottom: 1.5px solid #d1d5db;
      padding-bottom: 4px;
      margin: 16px 0 10px 0;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .executive-summary-box {
      background: #f8fafc;
      border-left: 4.5px solid #6366f1;
      padding: 10px 14px;
      font-size: 9.5pt;
      line-height: 1.5;
      color: #1e293b;
      border-radius: 0 4px 4px 0;
    }
    .executive-summary-box p {
      margin: 0 0 8px 0;
    }
    .executive-summary-box p:last-child {
      margin-bottom: 0;
    }
    table.cards-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;
      margin-top: 8px;
    }
    table.cards-table th {
      background: #f1f5f9;
      color: #0f172a;
      text-align: left;
      padding: 6px 8px;
      border: 1px solid #cbd5e1;
      font-weight: 700;
      font-size: 8pt;
      text-transform: uppercase;
    }
    table.cards-table td {
      padding: 6px 8px;
      border: 1px solid #e2e8f0;
      vertical-align: top;
      line-height: 1.35;
    }
    table.cards-table tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .card-id {
      font-size: 7.5pt;
      color: #64748b;
      font-family: monospace;
    }
    .badge {
      display: inline-block;
      padding: 2px 5px;
      font-size: 7pt;
      font-weight: 700;
      border-radius: 3px;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .badge.must-know {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #f87171;
    }
    .badge.recommended {
      background: #e0e7ff;
      color: #3730a3;
      border: 1px solid #818cf8;
    }
    .badge.optional {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
    }
    .topic-box {
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 10px 12px;
      margin-bottom: 10px;
      background: #ffffff;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .topic-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .topic-title {
      font-size: 10pt;
      font-weight: 700;
      color: #0f172a;
    }
    .topic-priority {
      font-size: 8pt;
      font-weight: 700;
      color: #4f46e5;
    }
    .topic-desc {
      font-size: 9pt;
      color: #334155;
      margin: 0 0 6px 0;
    }
    .resources {
      font-size: 8.5pt;
      color: #475569;
      background: #f8fafc;
      padding: 6px 10px;
      border-radius: 4px;
    }
    .resources ul {
      margin: 4px 0 0 0;
      padding-left: 18px;
    }
    .url {
      color: #64748b;
      font-family: monospace;
      font-size: 7.5pt;
    }
    ul.checklist, ul.tools {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    ul.checklist li {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 6px;
      font-size: 9pt;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    ul.checklist li .checkbox {
      font-size: 11pt;
      line-height: 1;
    }
    ul.tools li {
      margin-bottom: 6px;
      font-size: 9pt;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .footer-note {
      margin-top: 30px;
      border-top: 1px solid #cbd5e1;
      padding-top: 8px;
      font-size: 7.5pt;
      color: #94a3b8;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand-row">
      <span>Leitner Coding Trainer</span>
      <span>Technical Interview Preparation Briefing</span>
    </div>
    <div class="main-title">${escapeHtml(dossier.company)} &mdash; ${escapeHtml(dossier.role)}</div>
    <div class="meta-grid">
      <div><strong>Target Company:</strong> ${escapeHtml(dossier.company)}</div>
      <div><strong>Role & Level:</strong> ${escapeHtml(dossier.role)}</div>
      <div><strong>Target Timeline:</strong> ${escapeHtml(dossier.targetDate || 'Upcoming')}</div>
      <div><strong>Curriculum Depth:</strong> ${dossier.selectedCards.length} Flashcard Drills</div>
      <div><strong>Briefing Generated:</strong> ${new Date(dossier.generatedAt).toLocaleDateString()}</div>
      <div><strong>Status:</strong> Active Candidate Plan</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Strategic Interview Executive Summary & Gap Analysis</div>
    <div class="executive-summary-box">
      ${summaryParagraphs}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Curated Flashcard Coding Curriculum (${dossier.selectedCards.length} Drills)</div>
    <table class="cards-table">
      <thead>
        <tr>
          <th style="width: 12%;">Priority</th>
          <th style="width: 30%;">Challenge Card</th>
          <th style="width: 13%;">Domain</th>
          <th style="width: 7%; text-align: center;">Diff</th>
          <th style="width: 38%;">Tactical Rationale</th>
        </tr>
      </thead>
      <tbody>
        ${cardsHtml}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">External Interview Focus Areas (Outside Coding Scope)</div>
    ${externalTopicsHtml}
  </div>

  <div class="section">
    <div class="section-title">24-Hour Countdown & Interview Day Protocol</div>
    <ul class="checklist">
      ${checklistHtml}
    </ul>
  </div>

  <div class="section">
    <div class="section-title">Curated Interactive Practice Playgrounds</div>
    <ul class="tools">
      ${toolsHtml}
    </ul>
  </div>

  <div class="footer-note">
    Synthesized by Leitner Coding Trainer AI Interview Prep Coach &bull; Confidential Candidate Study Guide
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Triggers an isolated print of the interview dossier via a temporary iframe.
 * Completely isolates the document from the main app stylesheet and #root bugs,
 * guaranteeing clean multi-page rendering and print preview every time.
 */
export function printInterviewDossier(
  dossier: InterviewPrepDossier,
  catalog: CatalogIndexEntry[]
): void {
  if (typeof window === 'undefined') return;

  const html = generateDossierPrintHtml(dossier, catalog);

  // Create an invisible iframe
  const iframe = document.createElement('iframe');
  iframe.setAttribute('style', 'position: fixed; right: 0; bottom: 0; width: 0; height: 0; border: 0;');
  iframe.setAttribute('title', 'Print Dossier Frame');
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    // Fallback to opening a clean popup window
    const popup = window.open('', '_blank');
    if (popup) {
      popup.document.write(html);
      popup.document.close();
      popup.focus();
      setTimeout(() => popup.print(), 250);
    } else {
      window.print();
    }
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  // Give fonts and styles a brief moment to settle before triggering print
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.print();
    } finally {
      // Clean up iframe after print dialog resolves
      setTimeout(() => {
        iframe.remove();
      }, 4000);
    }
  }, 350);
}

/**
 * Directly downloads the standalone HTML briefing file for offline viewing or manual PDF export
 */
export function downloadDossierHtml(
  dossier: InterviewPrepDossier,
  catalog: CatalogIndexEntry[]
): void {
  if (typeof window === 'undefined') return;
  const html = generateDossierPrintHtml(dossier, catalog);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const filename = `${dossier.company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-interview-prep-briefing.html`;
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
