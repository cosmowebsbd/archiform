'use client'

import React, { useState, useEffect } from 'react'
import { Search, Folder, Users, UserCircle, FileText } from 'lucide-react'
import { gql } from '@apollo/client'
import { apolloClient } from '@/lib/apollo-client'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

const SEARCH_QUERY = gql`
  query {
    projects { id name status category totalBudget }
    staff { id title user { firstName lastName email } }
    contacts { id name email company city }
    invoices { id invoiceNumber status total project { name } }
  }
`

type ResultItem = {
  id: string
  type: 'project' | 'staff' | 'contact' | 'invoice'
  title: string
  subtitle: string
  meta: string
  href: string
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [allData, setAllData] = useState<ResultItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apolloClient.query({ query: SEARCH_QUERY, fetchPolicy: 'network-only' })
      .then(r => {
        const items: ResultItem[] = []

        r.data?.projects?.forEach((p: any) => items.push({
          id: p.id, type: 'project',
          title: p.name,
          subtitle: p.category || p.status,
          meta: formatCurrency(p.totalBudget),
          href: '/projects',
        }))

        r.data?.staff?.forEach((s: any) => items.push({
          id: s.id, type: 'staff',
          title: `${s.user.firstName} ${s.user.lastName}`,
          subtitle: s.title || s.user.email,
          meta: 'Staff member',
          href: '/staff',
        }))

        r.data?.contacts?.forEach((c: any) => items.push({
          id: c.id, type: 'contact',
          title: c.name,
          subtitle: c.company || c.email || '',
          meta: c.city || '',
          href: '/contacts',
        }))

        r.data?.invoices?.forEach((i: any) => items.push({
          id: i.id, type: 'invoice',
          title: i.invoiceNumber,
          subtitle: i.project?.name || '',
          meta: formatCurrency(i.total),
          href: '/money',
        }))

        setAllData(items)
        setLoading(false)
      })
      .catch(err => { console.error(err); setLoading(false) })
  }, [])

  const results = query.trim().length < 2 ? [] : allData.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(query.toLowerCase())
  )

  const iconMap = {
    project: <Folder className="w-4 h-4 text-brand-500" />,
    staff: <Users className="w-4 h-4 text-green-500" />,
    contact: <UserCircle className="w-4 h-4 text-purple-500" />,
    invoice: <FileText className="w-4 h-4 text-orange-500" />,
  }

  const typeLabel = {
    project: 'Project',
    staff: 'Staff',
    contact: 'Contact',
    invoice: 'Invoice',
  }

  return (
    <div>
      <div className="app-topbar">
        <h1 className="text-lg font-semibold text-navy-900">Search</h1>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        {/* Search input */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, staff, contacts, invoices..."
            className="w-full pl-12 pr-4 py-3.5 border border-border rounded-xl text-sm
              bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500
              focus:border-brand-500"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground
                hover:text-foreground text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>

        {/* Results */}
        {loading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-white rounded-xl
        border border-border p-4"
              >
                <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {!loading && query.trim().length < 2 && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground text-sm">
              Type at least 2 characters to search across all your data
            </p>
            <div className="flex items-center justify-center gap-6 mt-6">
              {[
                {
                  icon: <Folder className="w-4 h-4" />,
                  label: "Projects",
                  count: allData.filter((i) => i.type === "project").length,
                },
                {
                  icon: <Users className="w-4 h-4" />,
                  label: "Staff",
                  count: allData.filter((i) => i.type === "staff").length,
                },
                {
                  icon: <UserCircle className="w-4 h-4" />,
                  label: "Contacts",
                  count: allData.filter((i) => i.type === "contact").length,
                },
                {
                  icon: <FileText className="w-4 h-4" />,
                  label: "Invoices",
                  count: allData.filter((i) => i.type === "invoice").length,
                },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div
                    className="w-10 h-10 bg-white border border-border rounded-xl
                    flex items-center justify-center mx-auto mb-1 text-muted-foreground"
                  >
                    {item.icon}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.count} {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && query.trim().length >= 2 && results.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-sm">
              No results found for "<strong>{query}</strong>"
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-3">
              {results.length} result{results.length !== 1 ? "s" : ""} for "
              {query}"
            </p>
            {results.map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.href}
                className="flex items-center gap-4 bg-white rounded-xl border border-border
                  p-4 hover:shadow-md hover:border-brand-200 transition-all"
              >
                <div
                  className="w-9 h-9 rounded-lg bg-gray-50 border border-border
                  flex items-center justify-center flex-shrink-0"
                >
                  {iconMap[item.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-navy-900 text-sm">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.subtitle}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span
                    className="text-xs font-medium text-muted-foreground bg-gray-100
                    px-2 py-0.5 rounded-full"
                  >
                    {typeLabel[item.type]}
                  </span>
                  {item.meta && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.meta}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}