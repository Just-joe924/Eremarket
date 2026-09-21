import { useEffect, useMemo, useState } from 'react'
import Newsletter from '../components/Newsletter'
import ProductCard from '../components/ProductCard'
import { listCategories, listProducts } from '../api/products'
import { groupCategories, slugsUnder } from '../lib/categories'
import type { Category, Product } from '../types'

type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'name'

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A–Z' },
]

const selectClass =
  'cursor-pointer rounded-md border border-primary-border bg-surface px-2.5 py-2 text-sm outline-none focus:border-primary'
const labelClass =
  'flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-muted'

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState<SortKey>('newest')

  useEffect(() => {
    let active = true
    Promise.all([listProducts(), listCategories()])
      .then(([prods, cats]) => {
        if (!active) return
        setProducts(prods)
        setCategories(cats)
      })
      .catch((err) => console.error('Failed to load shop:', err))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const grouped = useMemo(() => groupCategories(categories), [categories])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    // Picking a group matches every leaf under it, so "Electronics" shows
    // laptops, cameras and headphones alike.
    const allowed = category === 'all' ? null : new Set(slugsUnder(categories, category))

    const filtered = products.filter((p) => {
      const brand = `${p.sellers?.brand_name ?? ''} ${p.sellers?.business_name ?? ''}`.toLowerCase()
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || brand.includes(q)
      const matchesCategory = !allowed || (p.categories?.slug ? allowed.has(p.categories.slug) : false)
      return matchesQuery && matchesCategory
    })

    const sorted = [...filtered]
    switch (sort) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price)
        break
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'newest':
      default:
        break
    }
    return sorted
  }, [products, categories, query, category, sort])

  const hasActiveFilters = query.trim() !== '' || category !== 'all' || sort !== 'newest'

  function resetFilters() {
    setQuery('')
    setCategory('all')
    setSort('newest')
  }

  return (
    <>
      <section className="page-banner">
        <div className="banner-rule" />
        <h2>Shop the marketplace</h2>
        <p>Every listing from every merchant on EreMarket — filter by category or search a shop.</p>
      </section>

      <section className="flex flex-col items-stretch justify-between gap-5 border-b border-primary-border bg-surface-2 px-5 py-6 sm:px-10 lg:flex-row lg:items-center lg:px-20">
        <div className="flex max-w-sm flex-1 items-center gap-2.5 rounded-md border border-primary-border bg-surface px-4 py-2.5 focus-within:border-primary">
          <i className="fa-solid fa-magnifying-glass text-primary"></i>
          <input
            type="search"
            placeholder="Search products or shops..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
            className="w-full text-sm outline-none"
          />
        </div>

        <div className="flex flex-wrap items-end gap-3.5">
          <label className={labelClass}>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
              <option value="all">All Categories</option>
              {grouped.map(({ group, children }) => (
                <optgroup key={group.id} label={group.name}>
                  <option value={group.slug}>All {group.name}</option>
                  {children.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          <label className={labelClass}>
            Sort by
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={selectClass}>
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="cursor-pointer self-end py-2.5 text-[13px] font-semibold text-primary underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      <section className="section-x pt-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <i className="fa-solid fa-spinner fa-spin text-3xl text-primary"></i>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-2">
              Showing <span className="font-bold text-primary">{visible.length}</span> of{' '}
              {products.length} products
            </p>
            {visible.length === 0 ? (
              <div className="empty-state">
                <img src="/assets/images/empty-catalog.svg" alt="" aria-hidden="true" />
                <h4>Nothing matches those filters</h4>
                <p>Try a different category, or clear the filters to see everything on sale.</p>
                <button type="button" className="btn-primary" onClick={resetFilters}>
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {visible.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <Newsletter />
    </>
  )
}
