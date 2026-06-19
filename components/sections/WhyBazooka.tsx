const pillars = [
  {
    title: 'Engineered for sneakers',
    copy: 'Last shapes, foams, and coatings change every season. BAZOOKA tracks how pairs are actually worn — not how they look in a catalog.',
  },
  {
    title: 'Invisible finish discipline',
    copy: 'We chase matte clarity and true color. If it reads like plastic wrap, it does not ship.',
  },
  {
    title: 'Culture-first restraint',
    copy: 'No spa cues, no soft-focus rituals. This is maintenance for people who line up, scuff, and still expect a clean exit.',
  },
] as const

export function WhyBazooka() {
  return (
    <section id="why-bazooka" className="scroll-mt-24 border-t border-white/5 bg-slate-950 py-24 md:py-32">
      <div className="mx-auto max-w-content px-5 md:px-8 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="eyebrow mb-4 text-frost">Why BAZOOKA</p>
            <h2 className="font-display text-4xl tracking-cinema text-signal md:text-5xl">
              Precision without the performance
            </h2>
            <p className="mt-6 max-w-prose text-pretty text-base leading-relaxed text-steel">
              We are not here to romanticize a bottle. We are here to keep your rotation credible: the
              pairs you beat, the pairs you bench, and the pairs you resell when the silhouette turns.
            </p>
          </div>

          <div className="space-y-8">
            {pillars.map((p) => (
              <div key={p.title} className="border-b border-white/10 pb-8 last:border-0 last:pb-0">
                <h3 className="font-display text-2xl tracking-cinema text-signal">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-steel md:text-base">{p.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
