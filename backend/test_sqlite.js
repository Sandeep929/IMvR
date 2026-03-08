import Database from 'better-sqlite3';
try {
    const db = new Database(':memory:');
    console.log('BETTER-SQLITE3 SUCCESS');
} catch (err) {
    console.error('BETTER-SQLITE3 FAILURE:', err);
    process.exit(1);
}
