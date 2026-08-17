export function TikTokSection() {
  return (
    <section className="mx-auto max-w-[820px] px-6 py-16 text-center sm:px-10">
      <span className="sec-label">Social</span>
      <h2 className="sec-title mb-1.5">@styled.ke on TikTok</h2>
      <div className="mb-7 text-[0.9rem] font-bold text-gold">84K+ Followers</div>
      <div className="mb-5.5 grid grid-cols-3 gap-[3px] sm:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex aspect-[9/16] cursor-pointer items-center justify-center bg-[#f5f5f5] opacity-100 transition-opacity hover:opacity-65"
          >
            <span className="text-lg opacity-35">▶</span>
          </div>
        ))}
      </div>
      <a href="https://tiktok.com/@styled.ke" target="_blank" rel="noreferrer">
        <span className="btn-out px-6 py-2.5 text-[0.68rem]">FOLLOW @styled.ke →</span>
      </a>
    </section>
  );
}
