require('dotenv').config();
const { Pool } = require('pg');

let pool = null;

async function initPool() {
    try {
        if (!process.env.POSTGRES_URL) {
            console.error('POSTGRES_URL environment variable is not set');
            return null;
        }
        
        pool = new Pool({
            connectionString: process.env.POSTGRES_URL,
            ssl: {
                rejectUnauthorized: false
            },
            connectionTimeoutMillis: 10000
        });
        
        return pool;
    } catch (error) {
        console.error('Failed to initialize pool:', error.message || error);
        return null;
    }
}

let initialized = false;

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!initialized) {
        await initPool();
        initialized = true;
    }

    if (!pool) {
        return res.status(500).json({ error: 'Database connection not available' });
    }

    try {
        const result = await pool.query('SELECT * FROM submissions ORDER BY submit_time DESC');
        res.json({ submissions: result.rows });
    } catch (error) {
        console.error('List error:', error.message || error);
        res.status(500).json({ error: 'Failed to load submissions' });
    }
};