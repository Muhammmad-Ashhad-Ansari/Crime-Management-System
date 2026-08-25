import { createRequire } from 'module';

// Use createRequire to load CJS modules with native addons correctly in ESM context
const sql = createRequire(import.meta.url)('mssql/lib/msnodesqlv8');

const CONNECTION_STRING =
  'Driver={ODBC Driver 17 for SQL Server};' +
  'Server=np:\\\\.\\pipe\\MSSQL$SQLEXPRESS\\sql\\query;' +
  'Database=CRMS;' +
  'Trusted_Connection=Yes;' +
  'TrustServerCertificate=Yes;';

const g = global;

export async function getPool() {
  if (g._crmsPool && !g._crmsPool.connected && !g._crmsPool.connecting) {
    g._crmsPool = null;
  }
  if (!g._crmsPool) {
    g._crmsPool = new sql.ConnectionPool({ connectionString: CONNECTION_STRING });
    await g._crmsPool.connect();
  }
  return g._crmsPool;
}

export { sql };
