import { StatusPage } from "@/components/status-page"

export default function NotFound() {
  return (
    <StatusPage
      variant="error"
      title="Page not found"
      message="The page or course you're looking for doesn't exist or may have been removed."
    />
  )
}
