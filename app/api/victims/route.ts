import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Victim ORDER BY victim_name');
    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Victims GET:', error);
    return NextResponse.json({ error: 'Failed to fetch victims' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { victim_name, contact, address_name } = await request.json();
    if (!victim_name || !contact || !address_name) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    const pool = await getPool();
    await pool
      .request()
      .input('victim_name', sql.NVarChar, victim_name)
      .input('contact', sql.NVarChar, contact)
      .input('address_name', sql.NVarChar, address_name)
      .query(
        'INSERT INTO Victim (victim_name, contact, address_name) VALUES (@victim_name, @contact, @address_name)',
      );
    return NextResponse.json({ message: 'Victim added' }, { status: 201 });
  } catch (error) {
    console.error('Victims POST:', error);
    return NextResponse.json({ error: 'Failed to add victim' }, { status: 500 });
  }
}
