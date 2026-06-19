const steps = [
  {
    n: '01',
    title: 'Assess the pair',
    body: 'Check upper family, stitch density, and outsole compound. BAZOOKA is built to respect factory finishes — not bury them.',
  },
  {
    n: '02',
    title: 'Clean with intent',
    body: 'Work in zones: midsole line, eye stay, tongue. Lift contamination without opening fibers or leaving detergent bloom.',
  },
  {
    n: '03',
    title: 'Protect the rotation',
    body: 'Mist barrier where friction and weather hit hardest. Cure, then walk — the goal is invisible armor, not a glossy mask.',
  },
] as const

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-night py-24 md:py-32">
      <div className="mx-auto max-w-content px-5 md:px-8 lg:px-10">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
          <div className="lg:sticky lg:top-32">
            <p className="eyebrow mb-4 text-frost">How it works</p>
            <h2 className="font-display text-4xl tracking-cinema text-signal md:text-5xl">
              A straight-line system
            </h2>
            <p className="mt-6 max-w-prose text-pretty text-base leading-relaxed text-steel">
              No seventeen-step theater. Three disciplined moves you can repeat on Sunday night before
              the week starts again.
            </p>
          </div>

          <ol className="space-y-10">
            {steps.map((step) => (
              <li
                key={step.n}
                className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-10"
              >
                <div className="flex items-baseline gap-6">
                  <span className="font-display text-sm tracking-mega text-frost">{step.n}</span>
                  <div>
                    <h3 className="font-display text-2xl tracking-cinema text-signal md:text-3xl">
                      {step.title}
                    </h3>
                    <p className="mt-4 max-w-prose text-sm leading-relaxed text-steel md:text-base">
                      {step.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
