export function formatToISODate(value: string): string {
  const strVal = String(value).trim();
  if (!strVal) return '';

  // 1. Si coincide con formato DD/MM/AAAA o DD-MM-AAAA
  const dmyMatch = strVal.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // 2. Si coincide con formato AAAA/MM/DD o AAAA-MM-DD
  const ymdMatch = strVal.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 3. Si es un número (fecha serie de Excel)
  const num = Number(strVal);
  if (!isNaN(num) && num > 0) {
    const date = new Date((num - 25569) * 86400 * 1000);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 4. Intentar parseo de Date estándar
  const timestamp = Date.parse(strVal);
  if (!isNaN(timestamp)) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return strVal;
}
