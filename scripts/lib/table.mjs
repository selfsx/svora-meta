/**
 * @fileoverview ASCII tables for terminal output. Numbers right-aligned,
 * strings left-aligned, long names middle-ellipsised.
 */

export function ellipsis(s, width) {
  s = String(s ?? '');
  if (s.length <= width) return s;
  const head = Math.ceil((width - 1) / 2);
  const tail = Math.floor((width - 1) / 2);
  return `${s.slice(0, head)}…${s.slice(s.length - tail)}`;
}

/**
 * @param {!Array<string>} columns
 * @param {!Array<!Array<*>>} rows
 * @param {{nameWidth: (number|undefined)}=} o
 * @return {string}
 */
export function table(columns, rows, o = {}) {
  const nameWidth = o.nameWidth || 60;
  const cells = rows.map((r) => r.map((v, i) => fmt(v, columns[i], nameWidth)));
  const widths = columns.map((c, i) => Math.max(c.length, ...cells.map((r) => r[i].length)));
  const isNum = columns.map((c, i) => rows.some((r) => typeof r[i] === 'number'));
  const line = (r) => r.map((v, i) => (isNum[i] ? v.padStart(widths[i]) : v.padEnd(widths[i]))).join('  ');
  return [line(columns), widths.map((w) => '-'.repeat(w)).join('  '), ...cells.map(line)].join('\n');
}

function fmt(v, col, nameWidth) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') {
    if (Number.isInteger(v)) return v.toLocaleString('en-US');
    return v.toFixed(2);
  }
  return /name/i.test(col) ? ellipsis(v, nameWidth) : String(v);
}
