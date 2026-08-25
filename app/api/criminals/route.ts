import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .query('SELECT * FROM Criminal ORDER BY criminal_name');
    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Criminals GET:', error);
    return NextResponse.json({ error: 'Failed to fetch criminals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { criminal_name, city, status_name, age } = await request.json();
    if (!criminal_name || !city || !status_name || age === undefined) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (Number(age) < 18) {
      return NextResponse.json({ error: 'Age must be at least 18' }, { status: 400 });
    }
    const pool = await getPool();
    await pool
      .request()
      .input('criminal_name', sql.NVarChar, criminal_name)
      .input('city', sql.NVarChar, city)
      .input('status_name', sql.NVarChar, status_name)
      .input('age', sql.Int, parseInt(age))
      .query(
        'INSERT INTO Criminal (criminal_name, city, status_name, age) VALUES (@criminal_name, @city, @status_name, @age)',
      );
    return NextResponse.json({ message: 'Criminal added' }, { status: 201 });
  } catch (error) {
    console.error('Criminals POST:', error);
    return NextResponse.json({ error: 'Failed to add criminal' }, { status: 500 });
  }
}
