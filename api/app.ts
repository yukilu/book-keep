import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import transactionRoutes from './routes/transactions.js'
import chartRoutes from './routes/charts.js'
import statsRoutes from './routes/stats.js'
import categoryRoutes from './routes/categories.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// API 路由
app.use('/api/auth', authRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/charts', chartRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/categories', categoryRoutes)

// 健康检查
app.use('/api/health', (_req: Request, res: Response): void => {
  res.status(200).json({ success: true, message: 'ok' })
})

// 生产环境托管前端静态文件
// 打包后 index.mjs 在 dist-server/ 目录，前端在 dist/ 目录，同属项目根目录下
const distPath = path.join(__dirname, 'dist')
app.use(express.static(distPath))

// SPA 回退：非 API 的 GET 请求返回 index.html
app.use((req: Request, res: Response, next: NextFunction): void => {
  if (req.method !== 'GET' || req.path.startsWith('/api/')) {
    next()
    return
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).json({ error: '前端文件未构建，请先运行 npm run build' })
    }
  })
})

// 错误处理
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', error.message)
  res.status(500).json({ success: false, error: '服务器内部错误' })
})

export default app
