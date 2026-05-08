import fs from 'fs';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'myapp-mysql.c4zoaaw22k3n.us-east-1.rds.amazonaws.com',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || '#1Powerpeople1!',
    database: process.env.DB_NAME || 'Beer_Me_Web_MySql',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

const getAllBeers = async () => {
    const [rows] = await pool.query('SELECT * FROM beers ORDER BY date DESC');
    return rows;
};

const getTopBeers = async () => {
    const [rows] = await pool.query('SELECT * FROM beers ORDER BY rating DESC LIMIT 10');
    return rows;
};

const addBeer = async (beer) => {
    const sql = `INSERT INTO beers (name, type, brewery, description, location, rating, image, date)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.execute(sql, [
        beer.name, beer.type, beer.brewery, beer.description,
        beer.location, beer.rating, beer.image, beer.date,
    ]);
    return { insertId: result.insertId, image: beer.image, id: result.insertId };
};

const getBeerById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM beers WHERE id = ?', [id]);
    return rows[0] || null;
};

const editBeer = async (beer) => {
    if (beer.image) {
        const [existing] = await pool.query('SELECT image FROM beers WHERE id = ?', [beer.id]);
        const existingImage = existing[0] ? existing[0].image : null;

        const sql = `UPDATE beers SET name=?, type=?, brewery=?, description=?, location=?, rating=?, image=?, updatedDate=? WHERE id=?`;
        const [result] = await pool.execute(sql, [
            beer.name, beer.type, beer.brewery, beer.description,
            beer.location, beer.rating, beer.image, beer.updatedDate, beer.id,
        ]);

        const image = beer.image || existingImage;
        if (image && image !== 'placeholder.png' && image !== existingImage) {
            try { await fs.promises.unlink(`./public/img/${existingImage}`); } catch (e) {}
        }

        return { affectedRows: result.affectedRows, image, updatedDate: beer.updatedDate };
    } else {
        const sql = `UPDATE beers SET name=?, type=?, brewery=?, description=?, location=?, rating=?, updatedDate=? WHERE id=?`;
        const [result] = await pool.execute(sql, [
            beer.name, beer.type, beer.brewery, beer.description,
            beer.location, beer.rating, beer.updatedDate, beer.id,
        ]);
        return { affectedRows: result.affectedRows, updatedDate: beer.updatedDate };
    }
};

const deleteBeer = async (id) => {
    const [rows] = await pool.query('SELECT image FROM beers WHERE id = ?', [id]);
    const image = rows[0] ? rows[0].image : null;

    const [result] = await pool.execute('DELETE FROM beers WHERE id = ?', [id]);

    if (image && image !== 'placeholder.png') {
        try { await fs.promises.unlink(`./public/img/${image}`); } catch (e) { console.error(e); }
    }

    if (result.affectedRows === 0) return { ok: false, message: 'Beer not found' };
    return { ok: true, message: 'Beer deleted successfully' };
};

export default {
    getAllBeers,
    addBeer,
    getBeerById,
    editBeer,
    deleteBeer,
    getTopBeers,
};