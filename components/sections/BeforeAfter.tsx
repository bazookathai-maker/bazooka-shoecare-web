import Image from 'next/image'

export function BeforeAfter() {
  return (
    <section id="before-after" className="scroll-mt-24 bg-night py-24 md:py-32">
      <div className="mx-auto max-w-content px-5 md:px-8 lg:px-10">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4 text-frost">Before &amp; after</p>
          <h2 className="font-display text-4xl tracking-cinema text-signal md:text-5xl">
            Proof on real pavement
          </h2>
          <p className="mt-6 text-base leading-relaxed text-steel">
            Swap the placeholders for your own side-by-side. Keep lighting consistent — sneaker
            culture reads authenticity instantly.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <figure className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40">
            <div className="relative aspect-[16/11] w-full">
              <Image
                src="/images/compare-before.svg"
                alt="Before cleaning — replace with brand photography"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <figcaption className="flex items-center justify-between border-t border-white/10 px-6 py-4 text-xs uppercase tracking-mega text-steel">
              <span>Before</span>
              <span className="text-mist">City week · 40km</span>
            </figcaption>
          </figure>

          <figure className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40">
            <div className="relative aspect-[16/11] w-full">
              <Image
                src="/images/compare-after.svg"
                alt="After BAZOOKA system — replace with brand photography"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <figcaption className="flex items-center justify-between border-t border-white/10 px-6 py-4 text-xs uppercase tracking-mega text-steel">
              <span>After</span>
              <span className="text-mist">BAZOOKA 3-step</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
