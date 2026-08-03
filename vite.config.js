import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// 로컬 개발에서 /api/ai 를 동작시키는 플러그인.
//
// Vercel 에 올리면 api/ai.js 가 알아서 서버리스 함수가 된다. 하지만 로컬의
// Vite 개발 서버는 /api 폴더를 모른다. 그래서 개발 중에만 같은 파일을
// 직접 불러 붙여준다. `vercel dev` 를 따로 띄우지 않아도 되게 하려는 것이다.
//
// 중요한 건 이 코드가 **서버 쪽에서만** 돈다는 점이다.
// 브라우저 번들에는 api/ai.js 도, OPENAI_API_KEY 도 들어가지 않는다.
function apiDevServer(env) {
  return {
    name: 'api-dev-server',
    apply: 'serve',
    configureServer(server) {
      // 메서드를 가리지 않고 넘긴다 — 배포된 Vercel 과 똑같이 동작해야
      // 로컬에서 통과한 게 배포 후에 깨지는 일이 없다.
      server.middlewares.use('/api/ai', async (req, res) => {
        try {
          // .env.local 의 비밀 값을 서버 프로세스에만 올린다.
          // (Vite 는 VITE_ 없는 변수를 process.env 에 넣어주지 않는다.)
          for (const [k, v] of Object.entries(env)) {
            if (!k.startsWith('VITE_') && process.env[k] === undefined) process.env[k] = v
          }
          const { default: handler } = await server.ssrLoadModule('/api/ai.js')
          await handler(req, res)
        } catch (err) {
          server.config.logger.error(`[api/ai] ${err}`)
          res.statusCode = 500
          res.setHeader('content-type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ error: '개발 서버에서 /api/ai 실행에 실패했습니다.' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // 세 번째 인자 '' = VITE_ 접두사 없는 변수까지 읽는다. 서버 쪽에서만 쓴다.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), apiDevServer(env)],
  }
})
