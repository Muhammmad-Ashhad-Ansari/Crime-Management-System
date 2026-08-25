import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        c.crime_id, c.crime_type, c.crime_date, c.location_name,
        c.crime_status, c.officer_id, c.criminal_id, c.evidence_details,
        o.officer_name, cr.criminal_name
      FROM Crime c
      LEFT JOIN Officer  o  ON c.officer_id  = o.officer_id
      LEFT JOIN Criminal cr ON c.criminal_id = cr.criminal_id
      ORDER BY c.crime_date DESC
    `);
    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Crimes GET:', error);
    return NextResponse.json({ error: 'Failed to fetch crimes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      crime_type,
      crime_date,
      location_name,
      crime_status,
      officer_id,
      criminal_id,
      evidence_details,
    } = await request.json();
    if (!crime_type || !crime_date || !location_name || !crime_status) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }
    const pool = await getPool();
    await pool
      .request()
      .input('crime_type', sql.NVarChar, crime_type)
      .input('crime_date', sql.Date, new Date(crime_date))
      .input('location_name', sql.NVarChar, location_name)
      .input('crime_status', sql.NVarChar, crime_status)
      .input('officer_id', sql.Int, officer_id ? parseInt(officer_id) : null)
      .input('criminal_id', sql.Int, criminal_id ? parseInt(criminal_id) : null)
      .input('evidence_details', sql.NVarChar(sql.MAX), evidence_details || null)
      .query(`
        INSERT INTO Crime (crime_type, crime_date, location_name, crime_status, officer_id, criminal_id, evidence_details)
        VALUES (@crime_type, @crime_date, @location_name, @crime_status, @officer_id, @criminal_id, @evidence_details)
      `);
    return NextResponse.json({ message: 'Crime added' }, { status: 201 });
  } catch (error) {
    console.error('Crimes POST:', error);
    return NextResponse.json({ error: 'Failed to add crime' }, { status: 500 });
  }
}
