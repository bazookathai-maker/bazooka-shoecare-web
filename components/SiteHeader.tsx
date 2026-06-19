'use client'

import { useEffect, useState } from 'react'

const nav = [
  { label: 'Featured', href: '#featured' },
  { label: 'Process', href: '#how-it-works' },
  { label: 'Collection', href: '#collection' },
  { label: 'Proof', href: '#before-after' },
  { label: 'Why', href: '#why-bazooka' },
] as const

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled ? 'border-b border-white/5 bg-night/80 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-content items-center justify-between px-5 py-5 md:px-8 lg:px-10">
        <a
          href="#top"
          className="font-display text-xl font-semibold tracking-cinema text-signal md:text-2xl"
        >
          BAZOOKA
        </a>

        <nav className="hidden items-center gap-10 md:flex" aria-label="Primary">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="eyebrow text-[10px] text-steel transition-colors hover:text-signal"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#collection"
            className="rounded-full border border-white/15 bg-white/[0.03] px-5 py-2 text-[10px] font-semibold uppercase tracking-mega text-signal transition hover:border-frost/40 hover:bg-white/[0.06]"
          >
            Shop
          </a>
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-signal md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <span className="flex flex-col gap-1.5">
            <span
              className={`block h-px w-5 bg-signal transition ${open ? 'translate-y-[3px] rotate-45' : ''}`}
            />
            <span className={`block h-px w-5 bg-signal transition ${open ? 'opacity-0' : ''}`} />
            <span
              className={`block h-px w-5 bg-signal transition ${open ? '-translate-y-[7px] -rotate-45' : ''}`}
            />
          </span>
        </button>
      </div>

      <div
        id="mobile-nav"
        className={`md:hidden transition-[max-height,opacity] duration-300 ${
          open ? 'max-h-[520px] border-t border-white/5 bg-night/95 opacity-100 backdrop-blur-2xl' : 'max-h-0 overflow-hidden border-transparent opacity-0'
        }`}
      >
        <div className="flex flex-col gap-1 px-5 py-6">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-xl px-4 py-3 text-sm font-medium text-mist transition hover:bg-white/[0.04]"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a
            href="#collection"
            className="mt-2 rounded-full border border-white/15 px-4 py-3 text-center text-xs font-semibold uppercase tracking-mega text-signal"
            onClick={() => setOpen(false)}
          >
            Shop collection
          </a>
        </div>
      </div>
    </header>
  )
}
