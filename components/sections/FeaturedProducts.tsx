import Image from 'next/image'

const items = [
  {
    name: 'Deep Clean Solution',
    tag: 'Lift grime without haze',
    src: '/images/featured-clean.svg',
  },
  {
    name: 'Barrier Spray',
    tag: 'Repel rain, road, rail',
    src: '/images/featured-shield.svg',
  },
  {
    name: 'Matte Refresher',
    tag: 'Even nap, kill chalk',
    src: '/images/featured-refresh.svg',
  },
] as const

export function FeaturedProducts() {
  return (
    <section id="featured" className="scroll-mt-24 border-t border-white/5 bg-slate-950 py-24 md:py-32">
      <div className="mx-auto max-w-content px-5 md:px-8 lg:px-10">
        <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow mb-4 text-frost">Featured</p>
            <h2 className="font-display text-4xl tracking-cinema text-signal md:text-5xl">
              Rotation-ready essentials
            </h2>
            <p className="mt-6 max-w-prose text-pretty text-base leading-relaxed text-steel">
              Three anchors that cover the real wear cycle: strip the week, lock the surface, bring
              depth back without plastic shine.
            </p>
          </div>
          <a href="#collection" className="link-underline self-start text-xs font-semibold uppercase tracking-mega text-signal md:self-auto">
            View full collection
          </a>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.name}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-850/80 to-night"
            >
              <div className="relative aspect-[5/6] w-full overflow-hidden">
                <Image
                  src={item.src}
                  alt={item.name}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-transparent opacity-80" />
              </div>
              <div className="flex flex-1 flex-col justify-end p-7">
                <h3 className="font-display text-2xl tracking-cinema text-signal">{item.name}</h3>
                <p className="mt-2 text-sm text-steel">{item.tag}</p>
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-6">
                  <span className="text-[10px] font-semibold uppercase tracking-mega text-steel">
                    Replace art in /public/images
                  </span>
                  <a
                    href="#collection"
                    className="rounded-full border border-white/15 px-4 py-2 text-[10px] font-semibold uppercase tracking-mega text-signal transition hover:border-frost/40"
                  >
                    Details
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
