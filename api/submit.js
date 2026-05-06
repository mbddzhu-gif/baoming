require('dotenv').config();
const { Pool } = require('pg');

let pool = null;

try {
    pool = new Pool({
        connectionString: process.env.POSTGRES_URL,
        ssl: {
            rejectUnauthorized: false
        },
        connectionTimeoutMillis: 10000
    });
    
    pool.on('error', (err) => {
        console.error('PostgreSQL connection error:', err);
    });
} catch (error) {
    console.error('Failed to create pool:', error);
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!pool) {
        console.error('Database pool not initialized');
        return res.status(500).json({ success: false, error: 'Database connection not available' });
    }

    try {
        const { userName, company, level, condition, certName, certNumber, majorName } = req.body;
        
        console.log('Received submission:', { userName, company, level });
        
        if (!userName) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const result = await pool.query(
            'INSERT INTO submissions (username, company, level, condition, cert_name, cert_number, major_name) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [userName, company, level, condition, certName, certNumber, majorName]
        );

        console.log('Submission saved successfully, id:', result.rows[0].id);
        res.json({ success: true, id: result.rows[0].id });
    } catch (error) {
        console.error('Submit error:', error.message || error);
        res.status(500).json({ success: false, error: 'Failed to save submission: ' + (error.message || error) });
    }
};