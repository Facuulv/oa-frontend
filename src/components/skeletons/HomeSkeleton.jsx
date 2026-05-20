import {
  HOME_CAROUSEL_CLASS,
  HOME_CAROUSEL_VIEWPORT_CLASS,
  HOME_CAROUSEL_TRACK_CLASS,
  HOME_CATEGORY_GRID_CLASS,
  HOME_CONTENT_CLASS,
  HOME_FEATURED_CARD_SHELL_CLASS,
  HOME_FEATURED_SLIDE_CLASS,
  HOME_PAGE_CLASS,
  HOME_SECTION_CLASS,
  HOME_SECTION_LEAD_CLASS,
} from "@/constants/homeTheme";

function HomeSectionHeaderSkeleton() {
  return (
    <header className="home-section-header">
      <div className="home-section-header__accent space-y-2">
        <div className="h-5 w-36 rounded-md bg-white/80 md:h-6 md:w-44" />
        <div className="h-3.5 w-52 max-w-full rounded-md bg-white/60 md:w-64" />
      </div>
    </header>
  );
}

function FeaturedCarouselSkeletonBlock() {
  return (
    <div className={HOME_CAROUSEL_CLASS}>
      <div className={HOME_CAROUSEL_VIEWPORT_CLASS}>
        <div className={HOME_CAROUSEL_TRACK_CLASS}>
          {[0, 1, 2].map((k) => (
            <div key={k} className={HOME_FEATURED_SLIDE_CLASS}>
              <div className={HOME_FEATURED_CARD_SHELL_CLASS}>
                <div className="home-featured-card__media bg-zinc-100/80" />
                <div className="space-y-2.5 p-3.5 md:p-4">
                  <div className="h-4 rounded-md bg-zinc-100/80" />
                  <div className="h-4 w-[88%] rounded-md bg-zinc-100/70" />
                  <div className="h-6 w-20 rounded-md bg-zinc-100/80" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomeSkeleton() {
  return (
    <div className={`${HOME_PAGE_CLASS} animate-pulse`}>
      <div className={HOME_CONTENT_CLASS}>
        <section className={HOME_SECTION_LEAD_CLASS} aria-hidden="true">
          <HomeSectionHeaderSkeleton />
          <FeaturedCarouselSkeletonBlock />
        </section>

        <section className={HOME_SECTION_CLASS} aria-hidden="true">
          <div className="home-cta-group">
            <div className="h-[5.5rem] rounded-2xl bg-primary/25" />
            <div className="h-[5.5rem] rounded-2xl border-2 border-primary/30 bg-white/80" />
          </div>
          <HomeSectionHeaderSkeleton />
          <div className={HOME_CATEGORY_GRID_CLASS}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="min-h-[7.6rem] rounded-2xl bg-white/70 md:min-h-[8.6rem] lg:min-h-[9.5rem]" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
