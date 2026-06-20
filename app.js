const Pusher = require("pusher");
const express = require("express");
const cors = require("cors");
const db = require("./db.js");

const app = express();

const pusher = new Pusher({
    appId: "2167066",
    key: "2bf1da82b22a4c6d7405",
    secret: "03c8214fe7328ca4180d",
    cluster: "ap1",
    useTLS: true
});

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
        let dtx = Buffer.from(req.body.dtx, "base64").toString("utf-8");

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

                if (proses2 == "1") {
                    berhasil++;
                } else {
                    gagal++;
                }
            }

            const backupTerbaru = await db.getBackupTerbaru();

            let detail = [];

            if (backupTerbaru.length > 0) {
                detail = await db.getDetailBackup(
                    backupTerbaru[0].id
                );
            }

            try {

                const payload = {
                    nama_backup: backupTerbaru[0]?.nama ?? nama,
                    waktu: backupTerbaru[0]?.waktu ?? new Date(),
                    total_transaksi: detail.length,
                    detail: detail,
                    source: "nodejs"
                };

                console.log("=== KIRIM EVENT PUSHER ===");
                console.log(payload);

                await pusher.trigger(
                    "backup-channel",
                    "backup.created",
                    payload
                );

                console.log("=== EVENT PUSHER BERHASIL DIKIRIM ===");

            } catch (pusherError) {

                console.error("=== PUSHER ERROR ===");
                console.error(pusherError);

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

app.get("/monitoring", async (req, res) => {
    try {

        let backupTerbaru = await db.getBackupTerbaru();

        let detail = [];

        if (backupTerbaru.length > 0) {
            detail = await db.getDetailBackup(
                backupTerbaru[0].id
            );
        }

        return res.status(200).json({
            total_backup: (await db.totalBackup())[0].total,
            total_transaksi: (await db.totalTransaksi())[0].total,
            backup_terbaru: backupTerbaru,
            detail: detail
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            kode: "00",
            status: "ERROR SERVER",
            pesan: err.message
        });

    }
});

if (process.env.NODE_ENV !== "production") {

    const port = 3000;

    app.listen(port, () => {
        console.log(`API Berjalan di Port: ${port}`);
    });

}

app.get("/daftar_backup", async (req, res) => {
    const dtbackup = await db.bacaBackup();
    if(dtbackup == false){
        res.send('{"kode":"00","pesan":"Data Backup Tidak Di Temukan"}');
    }else{
        res.send('{"kode":"01","pesan":"Data Backup Di Temukan","data":' + JSON.stringify(dtbackup) + '}');
    }
})

app.post("/detail_backup", async (req, res) => {
    let idbackup = req.body.idbackup;
    const dtdetail = await db.bacaDetailBackup(idbackup);
    if(dtdetail == false){
        res.send('{"kode":"00","pesan":"Data Detail Backup Tidak Di Temukan"}');
    }else{
        res.send('{"kode":"01","pesan":"Data Detail Backup Di Temukan","data":' + JSON.stringify(dtdetail) + '}');
    }
})

module.exports = app;

