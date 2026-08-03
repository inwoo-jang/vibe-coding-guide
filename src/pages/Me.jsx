import { Navigate } from 'react-router-dom'

// 진도는 이제 프로젝트마다 따로 쌓인다.
// "내 진도" 화면 하나로는 어느 프로젝트의 진도인지 말할 수 없어서
// 프로젝트 목록으로 합쳤다. 옛 주소로 들어온 링크를 위해 남겨둔다.
export default function Me() {
  return <Navigate to="/projects" replace />
}
