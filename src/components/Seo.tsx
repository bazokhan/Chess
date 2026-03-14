import { FC, useEffect } from 'react'

type SeoProps = {
  title: string
  description: string
  path: string
  image?: string
  keywords?: string
}

const upsertMeta = (selector: string, attrs: Record<string, string>, content: string) => {
  let meta = document.head.querySelector(selector) as HTMLMetaElement | null
  if (!meta) {
    meta = document.createElement('meta')
    Object.entries(attrs).forEach(([key, value]) => meta?.setAttribute(key, value))
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', content)
}

const upsertLink = (selector: string, attrs: Record<string, string>, href: string) => {
  let link = document.head.querySelector(selector) as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    Object.entries(attrs).forEach(([key, value]) => link?.setAttribute(key, value))
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

export const Seo: FC<SeoProps> = ({ title, description, path, image, keywords }) => {
  useEffect(() => {
    const origin = window.location.origin
    const canonical = `${origin}${path}`
    const imageUrl = image
      ? image.startsWith('http')
        ? image
        : `${origin}${image.startsWith('/') ? image : `/${image}`}`
      : `${origin}/favicon.svg`

    document.title = title
    upsertMeta('meta[name="description"]', { name: 'description' }, description)
    if (keywords) {
      upsertMeta('meta[name="keywords"]', { name: 'keywords' }, keywords)
    }

    upsertMeta('meta[property="og:type"]', { property: 'og:type' }, 'website')
    upsertMeta('meta[property="og:title"]', { property: 'og:title' }, title)
    upsertMeta('meta[property="og:description"]', { property: 'og:description' }, description)
    upsertMeta('meta[property="og:url"]', { property: 'og:url' }, canonical)
    upsertMeta('meta[property="og:image"]', { property: 'og:image' }, imageUrl)

    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image')
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, title)
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, description)
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, imageUrl)

    upsertLink('link[rel="canonical"]', { rel: 'canonical' }, canonical)
  }, [description, image, keywords, path, title])

  return null
}
