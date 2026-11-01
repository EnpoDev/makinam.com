/**
 * Exports data to a CSV file with UTF-8 BOM encoding for seamless Excel compatibility.
 */
export function exportToCSV(filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]) {
  const sanitizeCell = (cell: any): string => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(sanitizeCell).join(';'),
    ...rows.map((row) => row.map(sanitizeCell).join(';'))
  ].join('\r\n');

  // Add UTF-8 BOM (0xEF, 0xBB, 0xBF) so Excel properly detects Turkish characters
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
