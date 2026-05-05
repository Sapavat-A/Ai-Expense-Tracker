const normalizeDate = (rawValue) => {
  const value = String(rawValue || '').trim();
  if (!value) {
    return '';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }
  return parsed.toISOString().slice(0, 10);
};

const normalizeCategory = (description, fallback = 'Other') => {
  const text = String(description || '').toLowerCase();
  if (text.includes('swiggy') || text.includes('zomato') || text.includes('restaurant')) {
    return 'Food';
  }
  if (text.includes('uber') || text.includes('ola') || text.includes('fuel') || text.includes('metro')) {
    return 'Travel';
  }
  if (text.includes('amazon') || text.includes('flipkart') || text.includes('myntra')) {
    return 'Shopping';
  }
  if (text.includes('netflix') || text.includes('spotify') || text.includes('movie')) {
    return 'Entertainment';
  }
  return fallback;
};

const splitCsvLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
};

const findIndex = (headers, aliases) => headers.findIndex((header) => aliases.includes(header));

export const parseBankStatementCsv = (textContent) => {
  const lines = String(textContent || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = splitCsvLine(lines[0]).map((header) => header.toLowerCase());
  const amountIdx = findIndex(headers, ['amount', 'debit', 'withdrawal', 'withdraw']);
  const creditIdx = findIndex(headers, ['credit', 'deposit']);
  const dateIdx = findIndex(headers, ['date', 'transaction date', 'txn date']);
  const categoryIdx = findIndex(headers, ['category', 'merchant category']);
  const descriptionIdx = findIndex(headers, ['description', 'narration', 'merchant', 'details']);

  if (amountIdx === -1 || dateIdx === -1) {
    return [];
  }

  return lines
    .slice(1)
    .map((row) => splitCsvLine(row))
    .map((cells) => {
      const debitAmount = Number(cells[amountIdx] || 0);
      const creditAmount = creditIdx >= 0 ? Number(cells[creditIdx] || 0) : 0;
      const normalizedAmount = Number.isFinite(debitAmount) ? Math.max(debitAmount - creditAmount, 0) : 0;
      const description = descriptionIdx >= 0 ? String(cells[descriptionIdx] || '') : '';
      const derivedCategory = categoryIdx >= 0 ? String(cells[categoryIdx] || '') : '';
      const category = normalizeCategory(description, derivedCategory || 'Other');
      return {
        amount: normalizedAmount,
        category,
        date: normalizeDate(cells[dateIdx]),
      };
    })
    .filter((item) => Number.isFinite(item.amount) && item.amount > 0 && item.date);
};
