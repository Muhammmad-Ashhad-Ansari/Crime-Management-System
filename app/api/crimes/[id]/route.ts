import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const {
      crime_type,
      crime_date,
      location_name,
      crime_status,
      officer_id,
      criminal_id,
      evidence_details,
    } = await request.json();
    const pool = await getPool();
    // Updating crime_status will fire the SQL audit trigger automatically
    await pool
      .request()
      .input('id', sql.Int, parseInt(id))
      .input('crime_type', sql.NVarChar, crime_type)
      .input('crime_date', sql.Date, new Date(crime_date))
      .input('location_name', sql.NVarChar, location_name)
      .input('crime_status', sql.NVarChar, crime_status)
      .input('officer_id', sql.Int, officer_id ? parseInt(officer_id) : null)
      .input('criminal_id', sql.Int, criminal_id ? parseInt(criminal_id) : null)
      .input('evidence_details', sql.NVarChar(sql.MAX), evidence_details || null)
      .query(`
        UPDATE Crime
        SET crime_type=@crime_type, crime_date=@crime_date, location_name=@location_name,
            crime_status=@crime_status, officer_id=@officer_id, criminal_id=@criminal_id,
            evidence_details=@evidence_details
        WHERE crime_id=@id
      `);
    return NextResponse.json({ message: 'Crime updated' });
  } catch (error) {
    console.error('Crimes PUT:', error);
    return NextResponse.json({ error: 'Failed to update crime' }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const pool = await getPool();
    // Delete child records first to satisfy FK constraints
    await pool.request().input('id', sql.Int, parseInt(id)).query('DELETE FROM FIR WHERE crime_id=@id');
    await pool.request().input('id', sql.Int, parseInt(id)).query('DELETE FROM Crime_Audit WHERE crime_id=@id');
    await pool.request().input('id', sql.Int, parseInt(id)).query('DELETE FROM Crime WHERE crime_id=@id');
    return NextResponse.json({ message: 'Crime deleted' });
  } catch (error) {
    console.error('Crimes DELETE:', error);
    return NextResponse.json({ error: 'Failed to delete crime' }, { status: 500 });
  }
}
