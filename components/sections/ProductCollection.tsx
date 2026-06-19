import Image from 'next/image'

const rows = [
  {
    name: 'Studio Brush Set',
    meta: 'Synthetic + boar blend',
    href: '#collection',
    image: '/images/collection-brushes.svg',
  },
  {
    name: 'Eraser Block',
    meta: 'Suede nap recovery',
    href: '#collection',
    image: '/images/collection-eraser.svg',
  },
  {
    name: 'Travel Case',
    meta: 'Hard-shell, TSA calm',
    href: '#collection',
    image: '/images/collection-case.svg',
  },
  {
    name: 'Odor Neutralizer',
    meta: 'Enzyme, not perfume',
    href: '#collection',
    image: '/images/collection-neutral.svg',
  },
] as const

export function ProductCollection() {
  return (
    <section id="collection" className="scroll-mt-24 border-t border-white/5 bg-slate-950 py-24 md:py-32">
      <div className="mx-auto max-w-content px-5 md:px-8 lg:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-4 text-frost">Product collection</p>
            <h2 className="font-display text-4xl tracking-cinema text-signal md:text-5xl">
              Built as a kit, sold as modules
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-steel md:text-right">
            Add pieces as your rotation grows. Every SKU is photographed to match — swap rows by
            updating filenames in <span className="text-mist">/public/images</span>.
          </p>
        </div>

        <div className="mt-14 divide-y divide-white/10 border-y border-white/10">
          {rows.map((row) => (
            <a
              key={row.name}
              href={row.href}
              className="group grid items-center gap-6 py-10 md:grid-cols-[120px_minmax(0,1fr)_auto]"
            >
              <div className="relative h-24 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 md:h-28 md:w-[120px]">
                <Image
                  src={row.image}
                  alt={row.name}
                  fill
                  className="object-cover opacity-90 transition duration-500 group-hover:scale-[1.04]"
                  sizes="120px"
                />
              </div>
              <div>
                <p className="font-display text-2xl tracking-cinema text-signal md:text-3xl">{row.name}</p>
                <p className="mt-2 text-sm text-steel">{row.meta}</p>
              </div>
              <span className="justify-self-start font-display text-sm text-frost md:justify-self-end">
                Add
                <span className="ml-2 inline-block translate-x-0 transition group-hover:translate-x-1">
                  →
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
