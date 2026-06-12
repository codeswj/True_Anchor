require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
});

const migrate = async () => {
    let client;
    try {
        client = await pool.connect();
        console.log('Connected to PostgreSQL');

        await client.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) NOT NULL UNIQUE,
                executed_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('Migrations table ready');

        const schemaPath = path.join(__dirname, 'schema.sql');
        if (fs.existsSync(schemaPath)) {
            const { rows } = await client.query(
                "SELECT to_regclass('public.users') AS users_table"
            );

            if (!rows[0].users_table) {
                console.log('Running schema.sql...');
                const schemaSql = fs.readFileSync(schemaPath, 'utf8');
                await client.query(schemaSql);
                console.log('schema.sql executed');
            } else {
                console.log('Skipping schema.sql (database already initialized)');
            }
        }

        const migrationsDir = path.join(__dirname, 'migrations');
        if (fs.existsSync(migrationsDir)) {
            const files = fs
                .readdirSync(migrationsDir)
                .filter((file) => file.endsWith('.sql'))
                .sort();

            for (const file of files) {
                const { rows } = await client.query(
                    'SELECT id FROM migrations WHERE filename = $1',
                    [file]
                );

                if (rows.length > 0) {
                    console.log(`Skipping ${file} (already run)`);
                    continue;
                }

                console.log(`Running migration: ${file}`);
                const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
                await client.query(sql);

                await client.query(
                    'INSERT INTO migrations (filename) VALUES ($1)',
                    [file]
                );
                console.log(`${file} done`);
            }
        }

        console.log('\nAll migrations completed successfully');
    } catch (err) {
        console.error('\nMigration failed:', err.message);
        console.error(err.stack);
        process.exit(1);
    } finally {
        if (client) client.release();
        await pool.end();
    }
};

migrate();
