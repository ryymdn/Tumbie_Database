
SELECT
    a.id_anak,
    a.nama_anak,
    a.nama_ibu,
    p.tanggal_pemeriksaan,
    p.berat_badan,
    p.tinggi_badan,
    p.jenis_imunisasi
FROM anak a
JOIN pemeriksaan p
ON a.id_anak = p.id_anak;
