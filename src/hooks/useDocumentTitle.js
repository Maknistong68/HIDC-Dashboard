import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ROUTE_TITLES = {
  '/': 'Dashboard',
  '/data-control': 'Data Control',
  '/outlook': 'Safety Outlook',
  '/files': 'File Management',
  '/legal': 'Legal',
}

const BASE_TITLE = 'HSE Dashboard'

export default function useDocumentTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    const pageTitle = ROUTE_TITLES[pathname]
    document.title = pageTitle ? `${pageTitle} | ${BASE_TITLE}` : BASE_TITLE
  }, [pathname])
}
