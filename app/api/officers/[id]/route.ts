import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { officer_name, rank_name, station, contact } = await request.json();
    const pool = await getPool();
    await pool
      .request()
      .input('id', sql.Int, parseInt(id))
      .input('officer_name', sql.NVarChar, officer_name)
      .input('rank_name', sql.NVarChar, rank_name)
      .input('station', sql.NVarChar, station)
      .input('contact', sql.NVarChar, contact)
      .query(
        'UPDATE Officer SET officer_name=@officer_name, rank_name=@rank_name, station=@station, contact=@contact WHERE officer_id=@id',
      );
    return NextResponse.json({ message: 'Officer updated' });
  } catch (error) {
    console.error('Officers PUT:', error);
    return NextResponse.json({ error: 'Failed to update officer' }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const pool = await getPool();
    // Nullify FK references in Crime before deleting officer
    await pool.request().input('id', sql.Int, parseInt(id))
      .query('UPDATE Crime SET officer_id=NULL WHERE officer_id=@id');
    await pool.request().input('id', sql.Int, parseInt(id))
      .query('DELETE FROM Officer WHERE officer_id=@id');
    return NextResponse.json({ message: 'Officer deleted' });
  } catch (error) {
    console.error('Officers DELETE:', error);
    return NextResponse.json({ error: 'Failed to delete officer' }, { status: 500 });
  }
}
