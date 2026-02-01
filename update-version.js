import fs from 'fs';

// Baca package.json
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

// Pecah versi (misal 1.0.0 menjadi [1, 0, 0])
const versionParts = packageJson.version.split('.').map(Number);

// Tambah angka terakhir (patch version)
versionParts[2] += 1;

// Gabungkan kembali
const newVersion = versionParts.join('.');
packageJson.version = newVersion;

// Simpan kembali ke file
fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));

console.log(`✅ Versi Aplikasi diperbarui ke: ${newVersion}`);
