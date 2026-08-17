const REVIEWS = [
  {
    name: "Amina W.",
    text: "The marble print dress is absolutely stunning! Arrived perfectly packaged and the quality is amazing. Styled.ke never disappoints.",
  },
  {
    name: "Cynthia M.",
    text: "Got the beige maxi dress — it is so elegant and fits beautifully. And KES 1,500 for this quality? Unbelievable value!",
  },
  {
    name: "Grace O.",
    text: "The chiffon dresses are to die for. I ordered both colours! WhatsApp ordering was so easy and delivery was super fast.",
  },
];

export function Testimonials() {
  return (
    <section className="bg-black px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-[1060px] text-center">
        <span className="mb-1.5 block text-[0.59rem] font-bold uppercase tracking-[0.25em] text-gold">
          Customer Love
        </span>
        <h2 className="pf mb-10 text-[1.9rem] font-bold text-white">
          What Our Clients Say
        </h2>
        <div className="grid grid-cols-1 gap-5.5 sm:grid-cols-3">
          {REVIEWS.map((r) => (
            <div
              key={r.name}
              className="border border-white/[0.08] bg-white/5 p-6 text-left"
            >
              <div className="mb-2.5 text-[0.93rem] text-gold">★★★★★</div>
              <p className="mb-3 text-[0.83rem] italic leading-loose text-white/[0.73]">
                &ldquo;{r.text}&rdquo;
              </p>
              <div className="pf font-semibold text-gold">{r.name}</div>
              <div className="mt-0.5 text-[0.6rem] uppercase tracking-wide text-white/30">
                Verified Customer
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
