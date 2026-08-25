import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const pool = await getPool();
    await pool
      .request()
      .input('id', sql.Int, parseInt(id))
      .query('DELETE FROM FIR WHERE fir_id=@id');
    return NextResponse.json({ message: 'FIR deleted' });
  } catch (error) {
    console.error('FIR DELETE:', error);
    return NextResponse.json({ error: 'Failed to delete FIR' }, { status: 500 });
  }
}
