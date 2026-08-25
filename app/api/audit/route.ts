import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        a.audit_id, a.crime_id, a.old_status, a.new_status, a.change_date,
        c.crime_type
      FROM Crime_Audit a
      LEFT JOIN Crime c ON a.crime_id = c.crime_id
      ORDER BY a.change_date DESC
    `);
    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Audit GET:', error);
    return NextResponse.json({ error: 'Failed to fetch audit log' }, { status: 500 });
  }
}
