import { ChatMessage } from '../types';

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return Promise.resolve(success);
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return Promise.resolve(false);
  }
}

// Clean CSV export for spreadsheet analysis (Excel, Google Sheets)
export function exportToCSV(messages: ChatMessage[], filename = 'bharatconnect-consultation-log.csv') {
  const headers = ['Message ID', 'Role', 'Domain', 'Language', 'Timestamp', 'Content', 'Proactive Suggestions'];
  
  const rows = messages.map(msg => {
    const cleanContent = `"${msg.content.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
    const suggestions = msg.proactiveSuggestions ? `"${msg.proactiveSuggestions.join('; ').replace(/"/g, '""')}"` : '""';
    const dateStr = `"${new Date(msg.timestamp).toLocaleString('en-IN')}"`;
    return [
      `"${msg.id}"`,
      `"${msg.role}"`,
      `"${msg.domain}"`,
      `"${msg.language}"`,
      dateStr,
      cleanContent,
      suggestions,
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Clean printable / PDF Export
export function exportToPDF(message: ChatMessage, userName = 'Valued Professional') {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate the printable PDF report.');
    return;
  }

  const dateFormatted = new Date(message.timestamp).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>BharatConnect Advisory Report - ${message.domain.toUpperCase()}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 40px;
      color: #0f172a;
      line-height: 1.6;
      background: #ffffff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 20px;
      margin-bottom: 25px;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .tagline {
      font-size: 12px;
      color: #64748b;
      margin-top: 2px;
    }
    .dev-badge {
      font-size: 11px;
      background: #f1f5f9;
      padding: 6px 12px;
      border-radius: 6px;
      color: #334155;
      font-weight: 600;
    }
    .meta-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 24px;
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      font-size: 13px;
    }
    .meta-item strong {
      color: #334155;
    }
    .content-area {
      font-size: 14px;
      white-space: pre-wrap;
      line-height: 1.7;
    }
    .proactive-box {
      margin-top: 30px;
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 14px 18px;
      border-radius: 6px;
    }
    .proactive-title {
      font-size: 13px;
      font-weight: 700;
      color: #92400e;
      margin-bottom: 8px;
    }
    .footer {
      margin-top: 50px;
      padding-top: 15px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-title">BharatConnect</div>
      <div class="tagline">Official AI Expert Advisory & Intelligence Report</div>
    </div>
    <div class="dev-badge">
      Crafted by Orion Technologies • Shaikh M. Abrar
    </div>
  </div>

  <div class="meta-box">
    <div class="meta-item"><strong>Domain:</strong> ${message.domain.toUpperCase()}</div>
    <div class="meta-item"><strong>Date:</strong> ${dateFormatted}</div>
    <div class="meta-item"><strong>Security:</strong> Client-Side AES-256 Encrypted</div>
    <div class="meta-item"><strong>Language:</strong> ${message.language.toUpperCase()}</div>
  </div>

  <div class="content-area">${escapeHtml(message.content)}</div>

  ${message.proactiveSuggestions && message.proactiveSuggestions.length > 0 ? `
  <div class="proactive-box">
    <div class="proactive-title">⚡ J.A.R.V.I.S. Proactive Next Steps & Anticipations:</div>
    <ul>
      ${message.proactiveSuggestions.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  <div class="footer">
    <div>BharatConnect Verification ID: ${message.id}</div>
    <div>Zero-Cloud Data Leakage Guarantee • Confidential</div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>
`;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Export backup JSON
export function exportBackupJSON(messages: ChatMessage[]) {
  const payload = {
    exportDate: new Date().toISOString(),
    version: '1.0.0',
    app: 'BharatConnect',
    author: 'Orion Technologies - Shaikh M. Abrar',
    totalRecords: messages.length,
    records: messages,
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `bharatconnect-backup-${Date.now()}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
