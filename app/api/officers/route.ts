import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Officer ORDER BY officer_name');
    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Officers GET:', error);
    return NextResponse.json({ error: 'Failed to fetch officers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { officer_name, rank_name, station, contact } = await request.json();
    if (!officer_name || !rank_name || !station || !contact) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    const pool = await getPool();
    await pool
      .request()
      .input('officer_name', sql.NVarChar, officer_name)
      .input('rank_name', sql.NVarChar, rank_name)
      .input('station', sql.NVarChar, station)
      .input('contact', sql.NVarChar, contact)
      .query(
        'INSERT INTO Officer (officer_name, rank_name, station, contact) VALUES (@officer_name, @rank_name, @station, @contact)',
      );
    return NextResponse.json({ message: 'Officer added' }, { status: 201 });
  } catch (error) {
    console.error('Officers POST:', error);
    return NextResponse.json({ error: 'Failed to add officer' }, { status: 500 });
  }
}
