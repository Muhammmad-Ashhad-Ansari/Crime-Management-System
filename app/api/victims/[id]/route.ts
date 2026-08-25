import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const pool = await getPool();
    // Delete related FIR records first to satisfy FK constraint
    await pool
      .request()
      .input('id', sql.Int, parseInt(id))
      .query('DELETE FROM FIR WHERE victim_id=@id');
    await pool
      .request()
      .input('id', sql.Int, parseInt(id))
      .query('DELETE FROM Victim WHERE victim_id=@id');
    return NextResponse.json({ message: 'Victim deleted' });
  } catch (error) {
    console.error('Victims DELETE:', error);
    return NextResponse.json({ error: 'Failed to delete victim' }, { status: 500 });
  }
}
