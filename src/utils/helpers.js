/**
 * Memformat angka menjadi format mata uang Rupiah (IDR).
 * @param {number} amount - Jumlah nominal.
 * @returns {string} - String mata uang terformat.
 */
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return 'Rp0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};
