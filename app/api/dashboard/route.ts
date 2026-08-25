import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getPool();

    const [stats, crimesByType, crimesByLocation, recentCrimes, statusBreakdown] =
      await Promise.all([
        pool.request().query(`
          SELECT
            (SELECT COUNT(*) FROM Crime)                              AS totalCrimes,
            (SELECT COUNT(*) FROM Criminal)                          AS totalCriminals,
            (SELECT COUNT(*) FROM Officer)                           AS totalOfficers,
            (SELECT COUNT(*) FROM Crime WHERE crime_status = 'Open') AS openCases
        `),
        pool.request().query(`
          SELECT crime_type, COUNT(*) AS count
          FROM Crime
          GROUP BY crime_type
          ORDER BY count DESC
        `),
        pool.request().query(`
          SELECT location_name, COUNT(*) AS count
          FROM Crime
          GROUP BY location_name
          ORDER BY count DESC
        `),
        pool.request().query(`
          SELECT TOP 5
            c.crime_id, c.crime_type, c.crime_date,
            c.location_name, c.crime_status,
            o.officer_name, cr.criminal_name
          FROM Crime c
          LEFT JOIN Officer  o  ON c.officer_id  = o.officer_id
          LEFT JOIN Criminal cr ON c.criminal_id = cr.criminal_id
          ORDER BY c.crime_date DESC
        `),
        pool.request().query(`
          SELECT crime_status, COUNT(*) AS count
          FROM Crime
          GROUP BY crime_status
        `),
      ]);

    return NextResponse.json({
      stats: stats.recordset[0],
      crimesByType: crimesByType.recordset,
      crimesByLocation: crimesByLocation.recordset,
      recentCrimes: recentCrimes.recordset,
      statusBreakdown: statusBreakdown.recordset,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
