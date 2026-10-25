// Dựng CSDL test riêng (study_work_test) trong cùng container Postgres rồi áp toàn bộ migration.
const { execSync } = require('child_process');

module.exports = async () => {
  const base = 'postgresql://postgres:postgrespassword@localhost:5435';
  process.env.DATABASE_URL = `${base}/study_work_test?schema=public`;
  // Test gọi API rất nhiều lần từ cùng một địa chỉ → nới giới hạn (test riêng kiểm tra giới hạn thật)
  process.env.THROTTLE_LIMIT = process.env.THROTTLE_LIMIT || '100000';
  process.env.THROTTLE_AUTH_LIMIT = process.env.THROTTLE_AUTH_LIMIT || '100000';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-only-for-e2e';
  try {
    execSync('docker exec study_work_postgres psql -U postgres -c "DROP DATABASE IF EXISTS study_work_test WITH (FORCE)"', { stdio: 'ignore' });
    execSync('docker exec study_work_postgres psql -U postgres -c "CREATE DATABASE study_work_test"', { stdio: 'ignore' });
  } catch (e) {
    throw new Error('Không tạo được CSDL test. Hãy chạy: docker compose up -d');
  }
  execSync('npx prisma migrate deploy', { stdio: 'ignore', env: process.env });
};
