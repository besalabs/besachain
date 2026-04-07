import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-50">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-navy-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-navy-700 mb-4">Page Not Found</h2>
        <p className="text-navy-600 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Link>
        </Button>
      </div>
    </div>
  )
}
