import { Link } from 'react-router-dom'
import { User } from 'lucide-react'

const ArtisanLink = ({ artisanId, artisanName, className = "", showIcon = false }) => {
  if (!artisanId) {
    return <span className={className}>{artisanName || "Unknown Artisan"}</span>
  }

  return (
    <Link 
      to={`/artisan/${artisanId}`}
      className={`text-primary-600 hover:text-primary-700 font-medium transition-colors ${className}`}
    >
      {showIcon && <User className="w-4 h-4 inline mr-1" />}
      {artisanName || "Unknown Artisan"}
    </Link>
  )
}

export default ArtisanLink