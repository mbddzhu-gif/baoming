require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

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

    try {
        const { userName, company, level, condition, certName, certNumber, majorName } = req.body;
        
        if (!userName) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await pool.query(
            'INSERT INTO submissions (username, company, level, condition, cert_name, cert_number, major_name) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [userName, company, level, condition, certName, certNumber, majorName]
        );

        res.json({ success: true, id: result.rows[0].id });
    } catch (error) {
        console.error('Submit error:', error);
        res.status(500).json({ error: 'Failed to save submission' });
    }
};