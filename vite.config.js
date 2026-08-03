import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// 로컬 개발에서 /api/* 를 동작시키는 플러그인.
//
// Vercel 에 올리면 api/ 폴더의 파일들이 알아서 서버리스 함수가 된다. 하지만 로컬의
// Vite 개발 서버는 /api 폴더를 모른다. 그래서 개발 중에만 같은 파일을
// 직접 불러 붙여준다. `vercel dev` 를 따로 띄우지 않아도 되게 하려는 것이다.
//
// api/ 에 파일을 새로 추가하면 자동으로 잡힌다 — 여기 손댈 필요 없다.
// (한 곳만 처리하게 짜뒀더니 새 함수를 추가했을 때 소스가 그대로 노출됐다.)
//
// 중요한 건 이 코드가 **서버 쪽에서만** 돈다는 점이다.
// 브라우저 번들에는 api/ 의 파일도, OPENAI_API_KEY 도 들어가지 않는다.
import { existsSync } from 'node:fs'

function apiDevServer(env) {
  return {
    name: 'api-dev-server',
    apply: 'serve',
    configureServer(server) {
      // 메서드를 가리지 않고 넘긴다 — 배포된 Vercel 과 똑같이 동작해야
      // 로컬에서 통과한 게 배포 후에 깨지는 일이 없다.
      server.middlewares.use('/api', async (req, res, next) => {
        // '/keep-alive?x=1' → 'keep-alive'
        const name = (req.url ?? '').split('?')[0].replace(/^\/+|\/+$/g, '')
        // 경로 탈출(../) 차단. 개발 서버라도 열어두지 않는다.
        if (!name || !/^[a-z0-9-]+$/i.test(name)) return next()

        const file = `/api/${name}.js`
        if (!existsSync(`.${file}`)) return next()

        try {
          // .env.local 의 값을 서버 프로세스에 올린다.
          // (Vite 는 VITE_ 없는 변수를 process.env 에 넣어주지 않는다.)
          //
          // VITE_ 붙은 것도 넣는다 — 배포된 Vercel 에서는 서버 함수가 모든 환경변수를
          // 볼 수 있기 때문이다. 여기서 VITE_ 를 빼면 로컬에서만 인증이 안 걸려서,
          // "설정 다 했는데 왜 로그인을 안 시키지?" 하고 한참 헤매게 된다.
          // (VITE_ 값은 어차피 브라우저에 나가는 공개 값이라 서버에 둬도 위험하지 않다.)
          for (const [k, v] of Object.entries(env)) {
            if (process.env[k] === undefined) process.env[k] = v
          }
          const { default: handler } = await server.ssrLoadModule(file)
          await handler(req, res)
        } catch (err) {
          server.config.logger.error(`[${file}] ${err}`)
          res.statusCode = 500
          res.setHeader('content-type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ error: `개발 서버에서 ${file} 실행에 실패했습니다.` }))
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
