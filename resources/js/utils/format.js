// Format mata uang mengikuti bahasa yang sedang aktif.
//
// Rupiah tetap mata uangnya, hanya penulisannya yang menyesuaikan pembaca:
// "Rp 30.000" untuk pembaca Indonesia, "IDR 30,000" untuk pembaca asing.
// Lambang "Rp" tidak dikenal luas di luar Indonesia, sedangkan "IDR" adalah
// kode ISO 4217 yang dipakai secara internasional.

export const formatCurrency = (value, locale = 'id') => {
  const amount = Number(value || 0);
  return locale === 'en'
    ? `IDR ${amount.toLocaleString('en-US')}`
    : `Rp ${amount.toLocaleString('id-ID')}`;
};

// Bentuk ringkas untuk sumbu grafik: "Rp 180k" / "IDR 180k".
export const formatCurrencyCompact = (value, locale = 'id') => {
  const thousands = Number(value || 0) / 1000;
  return `${locale === 'en' ? 'IDR' : 'Rp'} ${thousands.toFixed(0)}k`;
};

export const numberLocale = (locale = 'id') => (locale === 'en' ? 'en-US' : 'id-ID');
