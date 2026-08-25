import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        f.fir_id, f.crime_id, f.victim_id, f.report_date, f.fir_description,
        v.victim_name, c.crime_type
      FROM FIR f
      LEFT JOIN Victim v ON f.victim_id = v.victim_id
      LEFT JOIN Crime  c ON f.crime_id  = c.crime_id
      ORDER BY f.report_date DESC
    `);
    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('FIR GET:', error);
    return NextResponse.json({ error: 'Failed to fetch FIRs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { crime_id, victim_id, report_date, fir_description } = await request.json();
    if (!crime_id || !victim_id || !report_date || !fir_description) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    const pool = await getPool();
    await pool
      .request()
      .input('crime_id', sql.Int, parseInt(crime_id))
      .input('victim_id', sql.Int, parseInt(victim_id))
      .input('report_date', sql.Date, new Date(report_date))
      .input('fir_description', sql.NVarChar(sql.MAX), fir_description)
      .query(
        'INSERT INTO FIR (crime_id, victim_id, report_date, fir_description) VALUES (@crime_id, @victim_id, @report_date, @fir_description)',
      );
    return NextResponse.json({ message: 'FIR added' }, { status: 201 });
  } catch (error) {
    console.error('FIR POST:', error);
    return NextResponse.json({ error: 'Failed to add FIR' }, { status: 500 });
  }
}
