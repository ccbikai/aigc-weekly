import process from 'node:process'
import Link from 'next/link'
import { Pagination } from '@/components/theme/Pagination'
import { PostMeta } from '@/components/theme/PostMeta'
import { TagList } from '@/components/theme/TagList'
import { TerminalLayout } from '@/components/theme/TerminalLayout'
import { siteConfig } from '@/lib/config'
import { getWeeklyList } from '../../lib/weekly/data'

interface HomePageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const page = parsePage(params?.page)
  const weeklyList = await getWeeklyList({ page })

  const { hasNextPage, hasPrevPage } = weeklyList.pagination
  const prevLink = hasPrevPage
    ? { href: `/?page=${weeklyList.pagination.page - 1}`, text: '上一页' }
    : undefined
  const nextLink = hasNextPage
    ? { href: `/?page=${weeklyList.pagination.page + 1}`, text: '下一页' }
    : undefined

  return (
    <TerminalLayout>
      <div className="index-content">
        <div className="framed">
          <p>
            { siteConfig.description }
          </p>
          <p>
            <a href={`${process.env.NEXT_PUBLIC_BASE_URL}/rss.xml`} rel="alternate" target="_blank">
              RSS 订阅
            </a>
            <span>
              {' '}
              ::
              {' '}
            </span>
            <a href="https://github.com/ccbikai/aigc-weekly" target="_blank" rel="noopener noreferrer">
              GitHub 仓库
            </a>
          </p>
        </div>
      </div>

      <div className="posts">
        {weeklyList.items.map(item => (
          <article className="post on-list" key={item.id}>
            <h2 className="post-title">
              <Link href={`/weekly/${item.slug}`}>{item.title}</Link>
            </h2>

            <PostMeta date={item.publishDate} />

            <TagList tags={item.tags} />

            <div className="post-content">
              {item.summary ? <p>{item.summary}</p> : <p>暂无摘要。</p>}
            </div>

            <div>
              <Link className="read-more button inline" href={`/weekly/${item.slug}`}>
                阅读更多
              </Link>
            </div>
          </article>
        ))}

        <Pagination
          prev={prevLink}
          next={nextLink}
        />
      </div>
    </TerminalLayout>
  )
}

function parsePage(page: string | string[] | undefined) {
  const value = Array.isArray(page) ? page[0] : page
  if (!value)
    return 1

  const parsed = Number(value)
  if (Number.isNaN(parsed) || parsed <= 0)
    return 1

  return Math.floor(parsed)
}
