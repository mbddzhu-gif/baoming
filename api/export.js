require('dotenv').config();
const XLSX = require('exceljs');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

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

    try {
        const result = await pool.query('SELECT * FROM submissions ORDER BY submit_time DESC');
        const submissions = result.rows;

        if (!submissions || !Array.isArray(submissions) || submissions.length === 0) {
            return res.status(400).json({ error: 'No submission data available' });
        }

        const workbook = new XLSX.Workbook();
        const worksheet = workbook.addWorksheet('报名数据');

        worksheet.columns = [
            { header: '姓名', key: 'username', width: 12 },
            { header: '工作单位', key: 'company', width: 24 },
            { header: '报考等级', key: 'level', width: 28 },
            { header: '符合条件', key: 'condition', width: 50 },
            { header: '证书/职称名称', key: 'cert_name', width: 22 },
            { header: '证书/职称编号', key: 'cert_number', width: 22 },
            { header: '专业或相关专业名称', key: 'major_name', width: 22 },
            { header: '提交时间', key: 'submit_time', width: 22 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF2563EB' }
        };
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

        submissions.forEach(s => {
            worksheet.addRow({
                username: s.username || '',
                company: s.company || '',
                level: s.level || '',
                condition: s.condition || '',
                cert_name: s.cert_name || '',
                cert_number: s.cert_number || '',
                major_name: s.major_name || '',
                submit_time: s.submit_time ? s.submit_time.toLocaleString() : ''
            });
        });

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                row.eachCell(cell => {
                    cell.alignment = { vertical: 'middle', wrapText: true };
                });
            }
        });

        const dateStr = new Date().toISOString().slice(0, 10);
        const fileName = encodeURIComponent(`人工智能训练师报名数据_${dateStr}.xlsx`);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${fileName}`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Failed to generate Excel file' });
    }
};