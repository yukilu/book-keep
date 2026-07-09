/**
 * local server entry file, for local development
 */
import app from './app.js';

/**
 * start server with port
 * 开发模式: 3001 端口
 * 生产模式: 80 端口（可通过 PORT 环境变量覆盖）
 */
const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' ? 80 : 3001);

const server = app.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
});

/**
 * close server
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;