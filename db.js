const mysql = require('mysql2/promise');

let sql;

const buatKoneksi = async () => {
    return await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        ssl: {
            rejectUnauthorized: false
        }
    });
};

const tambahBackup = async (id, nama, channel) => {
    const db = await buatKoneksi();

    sql = `INSERT INTO backup VALUES('${id}','${nama}','${channel}',NOW())`;

    try {
        await db.execute(sql);
        await db.end();
        return "1";
    } catch (err) {
        console.log(err);
        await db.end();
        return "0";
    }
};

const tambahTransaksi = async (idx, id, waktux, nominalx, jenisx, deskripsix) => {
    const db = await buatKoneksi();

    sql = `INSERT INTO backup_transaksi VALUES('${idx}','${id}','${waktux}','${nominalx}','${jenisx}','${deskripsix}')`;

    try {
        await db.execute(sql);
        await db.end();
        return "1";
    } catch (err) {
        console.log(err);
        await db.end();
        return "0";
    }
};

const getBackupTerbaru = async () => {
    const db = await buatKoneksi();

    try {
        const [rows] = await db.execute(`
            SELECT *
            FROM backup
            ORDER BY waktu DESC
            LIMIT 1
        `);

        await db.end();
        return rows;
    } catch (err) {
        console.log(err);
        await db.end();
        return [];
    }
};

const getDetailBackup = async (idBackup) => {
    const db = await buatKoneksi();

    try {
        const [rows] = await db.execute(`
            SELECT *
            FROM backup_transaksi
            WHERE id_backup = ?
            ORDER BY waktu DESC
        `, [idBackup]);

        await db.end();
        return rows;
    } catch (err) {
        console.log(err);
        await db.end();
        return [];
    }
};

const totalBackup = async () => {
    const db = await buatKoneksi();

    try {
        const [rows] = await db.execute(`
            SELECT COUNT(*) AS total
            FROM backup
        `);

        await db.end();
        return rows;
    } catch (err) {
        console.log(err);
        await db.end();
        return [{ total: 0 }];
    }
};

const totalTransaksi = async () => {
    const db = await buatKoneksi();

    try {
        const [rows] = await db.execute(`
            SELECT COUNT(*) AS total
            FROM backup_transaksi
        `);

        await db.end();
        return rows;
    } catch (err) {
        console.log(err);
        await db.end();
        return [{ total: 0 }];
    }
};

module.exports = {
    buatKoneksi,
    tambahBackup,
    tambahTransaksi,
    getBackupTerbaru,
    getDetailBackup,
    totalBackup,
    totalTransaksi
};