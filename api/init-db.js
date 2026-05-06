require('dotenv').config();
const { Client } = require('pg');

const createTableQuery = `
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    level VARCHAR(255),
    condition TEXT,
    cert_name VARCHAR(255),
    cert_number VARCHAR(255),
    major_name VARCHAR(255),
    submit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function initDb() {
    const client = new Client({
        connectionString: process.env.POSTGRES_URL
    });

    try {
        await client.connect();
        console.log('Connected to database');
        
        await client.query(createTableQuery);
        console.log('Table created successfully');
        
        await client.end();
        console.log('Database initialization complete');
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
}

initDb();
