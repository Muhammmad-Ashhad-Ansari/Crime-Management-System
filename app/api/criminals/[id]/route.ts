import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { criminal_name, city, status_name, age } = await request.json();
    if (Number(age) < 18) {
      return NextResponse.json({ error: 'Age must be at least 18' }, { status: 400 });
    }
    const pool = await getPool();
    await pool
      .request()
      .input('id', sql.Int, parseInt(id))
      .input('criminal_name', sql.NVarChar, criminal_name)
      .input('city', sql.NVarChar, city)
      .input('status_name', sql.NVarChar, status_name)
      .input('age', sql.Int, parseInt(age))
      .query(
        'UPDATE Criminal SET criminal_name=@criminal_name, city=@city, status_name=@status_name, age=@age WHERE criminal_id=@id',
      );
    return NextResponse.json({ message: 'Criminal updated' });
  } catch (error) {
    console.error('Criminals PUT:', error);
    return NextResponse.json({ error: 'Failed to update criminal' }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const pool = await getPool();
    // Nullify FK references in Crime before deleting criminal
    await pool.request().input('id', sql.Int, parseInt(id))
      .query('UPDATE Crime SET criminal_id=NULL WHERE criminal_id=@id');
    await pool.request().input('id', sql.Int, parseInt(id))
      .query('DELETE FROM Criminal WHERE criminal_id=@id');
    return NextResponse.json({ message: 'Criminal deleted' });
  } catch (error) {
    console.error('Criminals DELETE:', error);
    return NextResponse.json({ error: 'Failed to delete criminal' }, { status: 500 });
  }
}
