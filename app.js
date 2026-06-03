const express = require("express");
const cors = require("cors");
const db = require("./db.js");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/status", (req, res) => {
    res.status(200).json({
        kode: "01",
        status: "API Berbasis ExpressJS OK"
    });
});

app.post("/backup", async (req, res) => {
    try {
        let nama = req.body.nama_backup;
        let dtx = atob(req.body.dtx);

        let id = Date.now();
        let arr_data = dtx.split("#");

        let proses = await db.tambahBackup(id, nama, "nodejs");

        if (proses == "1") {
            let berhasil = 0;
            let gagal = 0;

            for (let k of arr_data) {
                let arr_data2 = k.split("|");

                let idx = arr_data2[0];
                let deskripsix = arr_data2[1];
                let waktux = arr_data2[2];
                let nominalx = arr_data2[3];
                let jenisx = arr_data2[4];

                let proses2 = await db.tambahTransaksi(
                    `${id}-${idx}`,
                    id,
                    waktux,
                    nominalx,
                    jenisx,
                    deskripsix
                );

                proses2 == "1" ? berhasil++ : gagal++;
            }

            return res.status(200).json({
                kode: "01",
                status: "Proses Backup Berhasil dengan Rincian",
                berhasil: berhasil,
                gagal: gagal
            });
        }

        return res.status(500).json({
            kode: "00",
            status: "Proses Backup Gagal, Periksa Kembali Data Anda"
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            kode: "00",
            status: "ERROR SERVER",
            pesan: err.message
        });
    }
});

// Untuk localhost
if (process.env.NODE_ENV !== "production") {
    const port = 3000;

    app.listen(port, () => {
        console.log(`API Berjalan di Port: ${port}`);
    });
}

// Untuk Vercel
module.exports = app;