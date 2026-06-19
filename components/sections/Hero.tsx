import Image from 'next/image'

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-night pt-24 md:pt-28">
      <div className="relative min-h-[100svh] overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-grid-fine bg-[length:56px_56px] opacity-[0.35]" />
          <div className="absolute inset-0 bg-radial-fog" />
          <div className="absolute -left-1/4 top-0 h-[120%] w-[80%] bg-gradient-to-br from-frost/10 via-transparent to-transparent blur-3xl animate-drift" />
          <div className="absolute inset-0 bg-gradient-to-b from-night via-transparent to-night" />
          <div className="absolute inset-0 bg-gradient-to-r from-night via-night/20 to-transparent" />
        </div>

      <div className="relative z-10 mx-auto flex max-w-content flex-col gap-16 px-5 pb-24 md:px-8 lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:px-10 lg:pb-28">
        <div className="max-w-3xl lg:pb-6">
          <p className="eyebrow mb-8 animate-fade-up opacity-0 [animation-delay:80ms] [animation-fill-mode:forwards]">
            Studio-Grade Sneaker Care System
          </p>

          <div className="space-y-2 font-display text-[clamp(3.25rem,10vw,7.5rem)] font-semibold leading-[0.92] tracking-[-0.02em] text-signal">
            {['CLEAN.', 'PROTECT.', 'REFRESH.'].map((line, i) => (
              <p
                key={line}
                className="animate-fade-up opacity-0 [animation-fill-mode:forwards]"
                style={{ animationDelay: `${160 + i * 90}ms` }}
              >
                {line}
              </p>
            ))}
          </div>

          <p className="mt-10 max-w-prose text-pretty text-base font-light leading-relaxed text-steel md:text-lg animate-fade-up opacity-0 [animation-delay:520ms] [animation-fill-mode:forwards]">
            Formulas tuned for modern uppers, aggressive outsoles, and daily rotation. Not a vanity
            ritual — a controlled system for pairs that actually leave the box.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-4 animate-fade-up opacity-0 [animation-delay:640ms] [animation-fill-mode:forwards]">
            <a
              href="#collection"
              className="inline-flex min-h-[48px] min-w-[160px] items-center justify-center rounded-full bg-signal px-8 py-3 text-xs font-semibold uppercase tracking-mega text-night transition hover:bg-white"
            >
              Shop Collection
            </a>
            <a
              href="#film"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.03] px-8 py-3 text-xs font-semibold uppercase tracking-mega text-signal backdrop-blur-md transition hover:border-frost/50 hover:bg-white/[0.06]"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-frost shadow-[0_0_18px_rgba(184,201,255,0.9)]" />
              Watch Film
            </a>
          </div>

          <dl className="mt-16 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-10 animate-fade-up opacity-0 [animation-delay:760ms] [animation-fill-mode:forwards]">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-mega text-steel">Lab tested</dt>
              <dd className="mt-2 font-display text-2xl text-signal md:text-3xl">pH-safe</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-mega text-steel">Materials</dt>
              <dd className="mt-2 font-display text-2xl text-signal md:text-3xl">Knit · Lthr</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-mega text-steel">Finish</dt>
              <dd className="mt-2 font-display text-2xl text-signal md:text-3xl">Matte</dd>
            </div>
          </dl>
        </div>

        <div className="relative w-full max-w-xl lg:max-w-[min(44vw,520px)]">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-slate-850 to-night shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] animate-fade-in opacity-0 [animation-delay:400ms] [animation-fill-mode:forwards]">
            <div className="absolute inset-0 bg-gradient-to-tr from-frost/5 via-transparent to-transparent" />
            <Image
              src="/images/hero-bg.jpg"
              alt="BAZOOKA hero product silhouette — replace with photography"
              fill
              className="object-cover object-center opacity-90 mix-blend-screen"
              priority
              sizes="(max-width: 1024px) 100vw, 44vw"
            />
            <div className="absolute inset-x-6 bottom-6 rounded-2xl border border-white/10 bg-night/60 p-4 backdrop-blur-md">
              <p className="font-display text-lg tracking-cinema text-signal">FIELD KIT 01</p>
              <p className="mt-1 text-xs text-steel">Swap this panel for campaign stills in /public/images</p>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-8 -top-8 hidden h-40 w-40 rounded-full border border-white/10 lg:block" />
        </div>
      </div>

      <a
        href="#featured"
        className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-steel transition hover:text-signal md:bottom-10"
        aria-label="Scroll to featured products"
      >
        <span className="text-[10px] uppercase tracking-mega">Scroll</span>
        <span className="block h-8 w-px bg-gradient-to-b from-frost/80 to-transparent" />
      </a>
      </div>

      <div
        id="film"
        className="relative z-10 mx-auto max-w-content px-5 pb-16 md:px-8 lg:px-10"
      >
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]">
          <div className="aspect-[21/9] w-full bg-gradient-to-br from-slate-850 via-night to-slate-950">
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="eyebrow text-frost">Cinematic</p>
              <p className="max-w-xl font-display text-2xl tracking-cinema text-signal md:text-3xl">
                Replace with film — drop a loop in /public/images or wire a hosted asset.
              </p>
              <p className="max-w-md text-sm text-steel">
                This block is anchored for the Watch Film control. Keep it subtle; let texture carry
                the frame.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
