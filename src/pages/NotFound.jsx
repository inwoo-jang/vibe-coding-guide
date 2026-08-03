import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page page-narrow">
      <h1>없는 페이지입니다</h1>
      <p className="lede">주소를 다시 확인해주세요.</p>
      <Link to="/" className="btn btn-primary">
        처음으로
      </Link>
    </div>
  )
}
