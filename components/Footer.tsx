const footerNav = [
  { label: 'Featured', href: '#featured' },
  { label: 'Process', href: '#how-it-works' },
  { label: 'Collection', href: '#collection' },
  { label: 'Proof', href: '#before-after' },
  { label: 'Why', href: '#why-bazooka' },
  { label: 'Film', href: '#film' },
] as const

export function Footer() {
  return (
    <footer id="contact" className="border-t border-white/10 bg-void">
      <div className="mx-auto max-w-content px-5 py-16 md:px-8 md:py-20 lg:px-10">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-display text-3xl tracking-cinema text-signal">BAZOOKA</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-steel">
              Studio-grade sneaker care. Bangkok-built mindset, global rotation.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-10 gap-y-3 sm:grid-cols-3" aria-label="Footer">
            {footerNav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-steel transition hover:text-signal"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-4">
            <a
              href="mailto:hello@bazooka.example"
              className="text-sm font-medium text-signal underline-offset-4 hover:underline"
            >
              hello@bazooka.example
            </a>
            <p className="text-xs uppercase tracking-mega text-steel">Social placeholders</p>
            <div className="flex gap-4 text-xs text-steel">
              <a className="transition hover:text-signal" href="#top">
                Instagram
              </a>
              <a className="transition hover:text-signal" href="#top">
                TikTok
              </a>
              <a className="transition hover:text-signal" href="#top">
                X
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-steel md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} BAZOOKA. All rights reserved.</p>
          <div className="flex flex-wrap gap-6">
            <a className="transition hover:text-signal" href="#top">
              Privacy
            </a>
            <a className="transition hover:text-signal" href="#top">
              Terms
            </a>
            <a className="transition hover:text-signal" href="#top">
              Warranty
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
