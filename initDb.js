import pg from 'pg';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const connectionString = "postgres://postgres.fnrhhsdnlcbxdzodsfca:oAEF01tEYiK43g7Z@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require";

const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function init() {
    await client.connect();

    console.log("Setting up tables...");

    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS staff_profiles (
                id text PRIMARY KEY,
                name text,
                role text,
                pin text,
                is_active boolean DEFAULT true
            );

            CREATE TABLE IF NOT EXISTS expenses (
                id text PRIMARY KEY,
                category text,
                amount integer,
                note text,
                date text
            );

            CREATE TABLE IF NOT EXISTS sessions (
                id text PRIMARY KEY,
                name text,
                station text,
                start_time text,
                booked_seconds integer,
                elapsed_seconds integer DEFAULT 0,
                status text,
                is_open boolean DEFAULT false,
                final_total numeric DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS history (
                id text PRIMARY KEY,
                station text,
                ended_at text,
                duration_mins integer,
                final_base_rate numeric,
                final_food_total numeric,
                final_amount_paid numeric,
                discount numeric
            );

            CREATE TABLE IF NOT EXISTS app_settings (
                key text PRIMARY KEY,
                value jsonb
            );

            -- Enable Supabase Realtime for these tables --
            BEGIN;
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_publication_tables 
                    WHERE pubname = 'supabase_realtime' AND tablename = 'sessions'
                ) THEN
                    ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
                END IF;
                IF NOT EXISTS (
                    SELECT 1 FROM pg_publication_tables 
                    WHERE pubname = 'supabase_realtime' AND tablename = 'staff_profiles'
                ) THEN
                    ALTER PUBLICATION supabase_realtime ADD TABLE staff_profiles;
                END IF;
                IF NOT EXISTS (
                    SELECT 1 FROM pg_publication_tables 
                    WHERE pubname = 'supabase_realtime' AND tablename = 'app_settings'
                ) THEN
                    ALTER PUBLICATION supabase_realtime ADD TABLE app_settings;
                END IF;
            END $$;
            COMMIT;

        `);

        console.log("Tables created successfully.");

        // Insert default app settings if not exist
        await client.query(`
            INSERT INTO app_settings (key, value) VALUES 
            ('PC_RATES', '{"30": 50, "60": 100, "90": 140, "120": 180, "180": 260, "240": 320, "300": 380}'),
            ('PS5_RATES', '{"30": {"1": 60, "2": 100, "3": 140, "4": 160}, "60": {"1": 120, "2": 200, "3": 270, "4": 320}, "90": {"1": 180, "2": 290, "3": 390, "4": 460}, "120": {"1": 230, "2": 380, "3": 500, "4": 600}, "180": {"1": 330, "2": 540, "3": 720, "4": 860}, "240": {"1": 420, "2": 700, "3": 940, "4": 1120}, "300": {"1": 500, "2": 840, "3": 1120, "4": 1340}}'),
            ('GLOBAL_SETTINGS', '{"arenaName": "Pixel Gaming – Kalyan Branch", "openTime": "10:00", "closeTime": "23:00", "staffName": "Ravi Kumar", "staffRole": "Manager", "pin": "1234", "branchName": "Main Branch", "notifications": {"sessionAlerts": true, "paymentAlerts": true, "dailyReports": false}}')
            ON CONFLICT (key) DO NOTHING;
        `);
        
        console.log("Default settings inserted.");

        // Insert default staff if empty
        const res = await client.query('SELECT count(*) FROM staff_profiles');
        if (parseInt(res.rows[0].count) === 0) {
            await client.query(`
                INSERT INTO staff_profiles (id, name, role, pin, is_active) VALUES
                ('1', 'Pixel Gaming', 'Owner', '1111', true),
                ('2', 'Ravi Kumar', 'Manager', '1234', true),
                ('3', 'Staff Desk', 'Staff', '0000', true)
            `);
            console.log("Default staff profiles inserted.");
        }

    } catch (e) {
        console.error("Error creating tables: ", e);
    } finally {
        await client.end();
    }
}

init();
