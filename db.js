const mysql = require('mysql2/promise');
let sql;
const buatKoneksi = async () => {
    return await mysql.createConnection({
        host: 'localhost',
        user: '?????',
        password: '?????',
        database: '?????'
    })
}
const tambahBackup = async (id, nama, channel) => {
    const db = await buatKoneksi();
    sql = `INSERT INTO backup VALUES('${id}','${nama}','${channel}',NOW())`;
    try{
        await db.excute(sql);
        return "1";
    }catch(err){
        return "0";
    }
}
const tambahTransaksi = async (idx, id, waktux, nominalx, jenisx, deskripsix) => {
    const db = await buatKoneksi();
    sql = `INSERT INTO backup_transaksi VALUES('${idx}','${id}','${waktux}','${nominalx}','${jenisx}','${deskripsix}',)`;
    try{
        await db.excute(sql);
        return "1";
    }catch(err){
        return "0";
    }
}
module.exports = {buatKoneksi, tambahBackup, tambahTransaksi}