import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Award,
  Shield,
  Shirt,
  Image as ImageIcon,
  User,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import {
  clubProfile,
  clubTimeline,
  clubHonours,
  clubRecords,
  clubLegends,
  clubAlumni,
  clubJerseys,
  clubGallery,
} from '../data/clubHistory';
import type { LegendMember } from '../data/clubHistory';

const navy = 'bg-[#0a1172]';

// Stand-in for a real photo: renders the actual <img> once an item's `image` field is set
// (see the how-to comment atop clubHistory.ts), otherwise falls back to a labeled placeholder box.
const placeholderVariants = {
  dark: 'bg-linear-to-br from-white/10 to-white/[0.02] border border-white/10 text-white/40',
  light: 'bg-linear-to-br from-black/5 to-transparent border border-black/10 text-black/30',
};

const Placeholder: React.FC<{
  icon: React.ReactNode;
  label: string;
  image?: string;
  alt?: string;
  variant?: 'dark' | 'light';
  className?: string;
}> = ({ icon, label, image, alt, variant = 'dark', className }) => {
  if (image) {
    return <img src={image} alt={alt ?? label} className={`object-contain ${className ?? ''}`} />;
  }
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${placeholderVariants[variant]} ${className ?? ''}`}>
      {icon}
      <span className="text-[11px] uppercase tracking-wide text-center px-2">{label}</span>
    </div>
  );
};

// Fades + slides an element up once it scrolls into view (IntersectionObserver, no extra dependency).
const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className ?? ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const arrowButtonClass =
  'w-10 h-10 rounded-full border flex items-center justify-center shrink-0 transition-colors';

export const IntroPage: React.FC = () => {
  const [heroMounted, setHeroMounted] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  const [activeLegend, setActiveLegend] = useState<LegendMember | null>(null);
  const [legendPopoverPos, setLegendPopoverPos] = useState<{ top: number; left: number } | null>(null);

  const [jerseyIndex, setJerseyIndex] = useState(clubJerseys.length - 1);
  const currentJersey = clubJerseys[jerseyIndex];

  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryPaused, setGalleryPaused] = useState(false);
  const [galleryZoomOpen, setGalleryZoomOpen] = useState(false);

  useEffect(() => {
    document.title = `${clubProfile.name} — Lịch sử câu lạc bộ`;
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setHeroMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (galleryPaused || galleryZoomOpen) return;
    const timer = setInterval(() => {
      setGalleryIndex((i) => (i + 1) % clubGallery.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [galleryPaused, galleryZoomOpen]);

  // Keyboard support while the gallery zoom modal is open.
  useEffect(() => {
    if (!galleryZoomOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setGalleryZoomOpen(false);
      if (e.key === 'ArrowLeft') setGalleryIndex((i) => (i - 1 + clubGallery.length) % clubGallery.length);
      if (e.key === 'ArrowRight') setGalleryIndex((i) => (i + 1) % clubGallery.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [galleryZoomOpen]);

  // Closes the legend popover on any click outside a card/the popover itself, or on scroll
  // (its position is captured once on click, so it would otherwise drift away from the card).
  useEffect(() => {
    if (!activeLegend) return;
    const close = () => {
      setActiveLegend(null);
      setLegendPopoverPos(null);
    };
    const closeIfOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-legend-card]') || target.closest('[data-legend-popover]')) return;
      close();
    };
    document.addEventListener('click', closeIfOutside);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('click', closeIfOutside);
      window.removeEventListener('scroll', close, true);
    };
  }, [activeLegend]);

  const scrollTimeline = (dir: 1 | -1) => {
    timelineRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  const toggleLegendPopover = (legend: LegendMember, e: React.MouseEvent<HTMLElement>) => {
    if (activeLegend?.name === legend.name) {
      setActiveLegend(null);
      setLegendPopoverPos(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const popoverWidth = 288; // matches the popover's w-72
    const margin = 16;
    setLegendPopoverPos({
      top: Math.min(rect.top, window.innerHeight - margin),
      left: Math.min(rect.left, window.innerWidth - popoverWidth - margin),
    });
    setActiveLegend(legend);
  };

  const stepJersey = (dir: 1 | -1) => {
    setJerseyIndex((i) => (i + dir + clubJerseys.length) % clubJerseys.length);
  };

  const stepGallery = (dir: 1 | -1) => {
    setGalleryIndex((i) => (i + dir + clubGallery.length) % clubGallery.length);
  };

  return (
    <div className="bg-black text-white">
      {/* Top bar */}
      <div className="fixed top-0 inset-x-0 z-30 flex items-center justify-between px-5 sm:px-10 py-4 bg-black/40 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-wide">{clubProfile.name}</span>
        </div>
        <Link
          to="/login"
          className="text-xs uppercase tracking-wide text-white/60 hover:text-white transition-colors border-b border-transparent hover:border-white"
        >
          Đăng nhập quản lý
        </Link>
      </div>

      {/* 1. Hero */}
      <section className={`relative min-h-screen flex flex-col justify-center px-5 sm:px-10 ${navy} overflow-hidden`}>
        {/* TODO: thay khối gradient này bằng ảnh nền sân vận động / đội hình thật */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-black/40" />
        <div
          className={`relative max-w-5xl transition-all duration-1000 ease-out ${
            heroMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="text-sm sm:text-base font-medium uppercase tracking-[0.3em] text-white/60 mb-4">
            Thành lập năm {clubProfile.foundedYear}
          </p>
          <h1 className="text-6xl sm:text-8xl md:text-9xl font-black uppercase tracking-tight leading-[0.85]">
            {clubProfile.name}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/70 max-w-xl">{clubProfile.tagline}</p>
          <p className="mt-3 text-sm sm:text-base text-white/40 max-w-xl">{clubProfile.description}</p>
          <a
            href="#timeline"
            className="mt-10 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide border-b-2 border-white pb-1 hover:text-white/70 hover:border-white/70 transition-colors"
          >
            Khám phá lịch sử
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </a>
        </div>
      </section>

      {/* 2. Timeline — horizontal carousel of milestones */}
      <section id="timeline" className="bg-black px-5 sm:px-10 py-16 sm:py-24">
        <div className="flex items-center justify-between mb-10">
          <Reveal><h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">Dòng thời gian</h2></Reveal>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scrollTimeline(-1)}
              aria-label="Mốc trước"
              className={`${arrowButtonClass} border-white/15 text-white/50 hover:text-white hover:border-white/40`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollTimeline(1)}
              aria-label="Mốc tiếp theo"
              className={`${arrowButtonClass} border-white/15 text-white/50 hover:text-white hover:border-white/40`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div
          ref={timelineRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mx-5 px-5 sm:-mx-10 sm:px-10"
        >
          {clubTimeline.map((item, i) => (
            <Reveal key={item.title} delay={i * 80} className="snap-start shrink-0 w-64 sm:w-72">
              <div className="h-full rounded-2xl border border-white/10 bg-white/3 p-6 transition-transform duration-300 hover:-translate-y-1">
                <p className="text-3xl font-black text-white/90">{item.year}</p>
                <div className="mt-3 h-px w-10 bg-white/30" />
                <h3 className="mt-3 text-base font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-white/50">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 3. Honours */}
      <section id="honours" className={`${navy} px-5 sm:px-10 py-16 sm:py-24`}>
        <Reveal><h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mb-10">Thành tích</h2></Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {clubHonours.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 100} className="flex flex-col items-start gap-3">
              <Trophy className="w-7 h-7 text-white/70" />
              <p className="text-6xl sm:text-7xl font-black leading-none">{stat.value}</p>
              <p className="text-sm text-white/60">{stat.label}</p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={clubHonours.length * 100}>
          <p className="mt-8 sm:mt-10 text-sm text-white/50 italic">
            ...cùng vô số danh hiệu giao hữu lớn nhỏ khác trên khắp các mặt sân phủi Hà Nội.
          </p>
        </Reveal>
      </section>

      {/* 4. Records */}
      <section id="records" className="bg-white text-black px-5 sm:px-10 py-16 sm:py-24">
        <Reveal><h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mb-10">Kỷ lục đội bóng</h2></Reveal>
        <div className="divide-y divide-black/10 border-t border-b border-black/10">
          {clubRecords.map((record, i) => (
            <Reveal key={record.label} delay={i * 90}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 py-6">
                <Award className="hidden sm:block w-6 h-6 text-black/40 shrink-0" />
                <p className="text-3xl sm:text-4xl font-black w-full sm:w-40 shrink-0">{record.value}</p>
                <div className="min-w-0">
                  <p className="font-semibold">{record.label}</p>
                  <p className="text-sm text-black/50">
                    {[record.holder, record.note].filter(Boolean).join(' — ')}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 5. Hall of Fame — poster-style, distinct from the plain alumni grid below: honours the club's legends only */}
      <section id="legends" className="relative bg-black px-5 sm:px-10 py-20 sm:py-28 overflow-hidden">
        {/* Purely decorative glow behind the heading — safe to remove once real photography adds its own atmosphere */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-xl h-144 rounded-full bg-amber-400/10 blur-3xl" />

        {/* Repeating gold banner, echoing a stadium hall-of-fame plaque — scrolls continuously */}
        <div className="relative overflow-hidden mb-6 mask-[linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="flex w-max animate-marquee">
            {[0, 1].map((group) => (
              <div
                key={group}
                className="flex shrink-0 gap-6 pr-6 whitespace-nowrap text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-amber-400/60"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={i}>• Inductees</span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <Reveal className="relative text-center max-w-2xl mx-auto mb-14">
          {/* Mobile: stacked badge + single-line wordmark — the inline lockup below doesn't fit narrow screens */}
          <div className="flex sm:hidden flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-amber-400/10 border-2 border-amber-400/50 flex items-center justify-center">
              <Shield className="w-7 h-7 text-amber-400" />
            </div>
            <span className="text-2xl xs:text-3xl font-black uppercase tracking-tight">Hall Of Fame</span>
          </div>
          {/* sm and up: badge-between-words lockup */}
          <div className="hidden sm:flex items-center justify-center gap-5">
            <span className="text-5xl font-black uppercase tracking-tight">Hall Of</span>
            <div className="w-20 h-20 rounded-full bg-amber-400/10 border-2 border-amber-400/50 flex items-center justify-center shrink-0">
              <Shield className="w-10 h-10 text-amber-400" />
            </div>
            <span className="text-5xl font-black uppercase tracking-tight">Fame</span>
          </div>
          <p className="mt-6 text-sm text-white/40">
            Vinh danh những cái tên đã làm nên lịch sử của {clubProfile.name}.
          </p>
        </Reveal>

        {/* Tight, edge-to-edge portrait grid — mirrors a hall-of-fame induction poster */}
        <div className="relative grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-2 max-w-6xl mx-auto">
          {clubLegends.map((legend, i) => (
            <Reveal key={legend.name} delay={i * 70}>
              <div
                data-legend-card
                className={`relative aspect-3/4 rounded-lg overflow-hidden border cursor-pointer transition-all duration-300 hover:scale-[1.03] ${
                  activeLegend?.name === legend.name
                    ? 'border-amber-400/70 scale-[1.03]'
                    : 'border-amber-400/20 hover:border-amber-400/50'
                }`}
                onClick={(e) => toggleLegendPopover(legend, e)}
              >
                <Placeholder
                  icon={<User className="w-8 h-8" />}
                  label="Ảnh"
                  image={legend.image}
                  alt={legend.name}
                  className="w-full h-full"
                />
                {legend.jerseyNumber && (
                  <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-400 text-black text-[10px] font-black flex items-center justify-center">
                    {legend.jerseyNumber}
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black via-black/85 to-transparent p-2 sm:p-3">
                  <p className="text-xs sm:text-sm font-bold uppercase leading-tight truncate">{legend.name}</p>
                  <p className="text-[10px] text-amber-400/70 uppercase tracking-wide mt-0.5 truncate">
                    {legend.role} · {legend.period}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 5b. Cựu thành viên — the full alumni grid, plain styling on purpose to contrast with the Hall of Fame above */}
      <section id="alumni" className={`${navy} px-5 sm:px-10 py-16 sm:py-24`}>
        <Reveal><h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mb-2">Cựu thành viên</h2></Reveal>
        <Reveal delay={80}>
          <p className="text-sm text-white/40 mb-10 max-w-lg">
            Những gương mặt đã từng khoác áo {clubProfile.name} qua từng thời kỳ.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {clubAlumni.map((member, i) => (
            <Reveal key={member.name} delay={i * 60}>
              <div className="rounded-2xl border border-white/10 bg-white/3 overflow-hidden transition-transform duration-300 hover:-translate-y-1">
                <Placeholder
                  icon={<User className="w-8 h-8" />}
                  label="Ảnh"
                  image={member.image}
                  alt={member.name}
                  className="aspect-square w-full"
                />
                <div className="p-4">
                  <p className="font-bold truncate">{member.name}</p>
                  {member.role && <p className="text-sm text-white/50 mt-1">{member.role}</p>}
                  <p className="text-xs text-white/30 mt-2">{member.period}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 6. Jerseys through the eras — interactive slider driven by the strip below */}
      <section className="bg-white text-black px-5 sm:px-10 py-16 sm:py-24">
        <div className="flex items-center justify-between mb-10">
          <Reveal><h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">Áo đấu qua các thời kỳ</h2></Reveal>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => stepJersey(-1)}
              aria-label="Mẫu áo trước"
              className={`${arrowButtonClass} border-black/15 text-black/50 hover:text-black hover:border-black/40`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => stepJersey(1)}
              aria-label="Mẫu áo tiếp theo"
              className={`${arrowButtonClass} border-black/15 text-black/50 hover:text-black hover:border-black/40`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Featured jersey — big image left, info right, slides in whenever the selection changes */}
        <div key={jerseyIndex} className="animate-fade-slide-up flex flex-col sm:flex-row gap-6 sm:gap-10 mb-10 sm:mb-14">
          <Placeholder
            icon={<Shirt className="w-12 h-12" />}
            label="Ảnh áo đấu"
            image={currentJersey.image}
            alt={currentJersey.label}
            variant="light"
            className="w-full sm:w-80 aspect-square shrink-0"
          />
          <div className="flex flex-col justify-center">
            <p className="text-sm uppercase tracking-wide text-black/40">
              {jerseyIndex === clubJerseys.length - 1 ? 'Mẫu hiện tại' : 'Mẫu áo'} — {currentJersey.year}
            </p>
            <h3 className="text-3xl sm:text-4xl font-black mt-2">{currentJersey.label}</h3>
            {currentJersey.sponsor && <p className="mt-3 text-black/50">Nhà tài trợ: {currentJersey.sponsor}</p>}
          </div>
        </div>

        {/* Scrollable strip — click an era to slide the featured card to it */}
        <div className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 -mx-5 px-5 sm:-mx-10 sm:px-10">
          {clubJerseys.map((jersey, i) => (
            <Reveal key={jersey.year} delay={i * 70} className="snap-start shrink-0 w-[72vw] xs:w-40 sm:w-48">
              <button onClick={() => setJerseyIndex(i)} className="block w-full text-left cursor-pointer">
                <Placeholder
                  icon={<Shirt className="w-8 h-8" />}
                  label={`${jersey.year}`}
                  image={jersey.image}
                  alt={jersey.label}
                  variant="light"
                  className={`aspect-3/4 w-full transition-all ${
                    i === jerseyIndex ? 'ring-2 ring-black' : 'opacity-70 hover:opacity-100'
                  }`}
                />
                <p className="mt-2 text-sm font-semibold">{jersey.year}</p>
                <p className="text-xs text-black/50">{jersey.label}</p>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 7. Gallery — autoplaying slider with arrows, dots and a thumbnail strip */}
      <section className={`${navy} px-5 sm:px-10 py-16 sm:py-24`}>
        <Reveal><h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mb-10">Hình ảnh kỷ niệm</h2></Reveal>

        <div
          className="relative rounded-2xl overflow-hidden border border-white/10"
          onMouseEnter={() => setGalleryPaused(true)}
          onMouseLeave={() => setGalleryPaused(false)}
        >
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${galleryIndex * 100}%)` }}
          >
            {clubGallery.map((photo, i) => (
              <button
                key={photo.caption}
                type="button"
                onClick={() => {
                  setGalleryIndex(i);
                  setGalleryZoomOpen(true);
                }}
                className="relative w-full aspect-video shrink-0 block text-left cursor-zoom-in"
              >
                <Placeholder
                  icon={<ImageIcon className="w-10 h-10" />}
                  label="Ảnh sự kiện"
                  image={photo.image}
                  alt={photo.caption}
                  className="w-full h-full"
                />
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-4 sm:p-6">
                  <p className="text-sm sm:text-base font-semibold">{photo.caption}</p>
                  <p className="text-xs text-white/50">{photo.year}</p>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => stepGallery(-1)}
            aria-label="Ảnh trước"
            className={`${arrowButtonClass} absolute left-3 top-1/2 -translate-y-1/2 border-white/20 bg-black/30 backdrop-blur-sm text-white/70 hover:text-white hover:border-white/50`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => stepGallery(1)}
            aria-label="Ảnh tiếp theo"
            className={`${arrowButtonClass} absolute right-3 top-1/2 -translate-y-1/2 border-white/20 bg-black/30 backdrop-blur-sm text-white/70 hover:text-white hover:border-white/50`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
            {clubGallery.map((photo, i) => (
              <button
                key={photo.caption}
                onClick={() => setGalleryIndex(i)}
                aria-label={`Xem ảnh ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === galleryIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
              />
            ))}
          </div>
        </div>

        {/* Thumbnail strip for quick browsing */}
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 sm:-mx-10 sm:px-10">
          {clubGallery.map((photo, i) => (
            <Reveal key={photo.caption} delay={i * 70} className="shrink-0">
              <button onClick={() => setGalleryIndex(i)} className="block cursor-pointer">
                <Placeholder
                  icon={<ImageIcon className="w-5 h-5" />}
                  label={`${photo.year}`}
                  image={photo.image}
                  alt={photo.caption}
                  className={`w-20 h-14 sm:w-24 sm:h-16 rounded-lg transition-all ${
                    i === galleryIndex ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-80'
                  }`}
                />
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-black border-t border-white/10 px-5 sm:px-10 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5" />
              <span className="font-bold uppercase tracking-wide">{clubProfile.name}</span>
            </div>
            <p className="text-white/40">{clubProfile.tagline}</p>
          </div>
          <div>
            <p className="font-semibold text-white/70 mb-3">Điều hướng nhanh</p>
            <div className="flex flex-col gap-2 text-white/40">
              <a href="#timeline" className="hover:text-white transition-colors">Dòng thời gian</a>
              <a href="#honours" className="hover:text-white transition-colors">Thành tích &amp; kỷ lục</a>
              <a href="#legends" className="hover:text-white transition-colors">Hall of Fame</a>
              <a href="#alumni" className="hover:text-white transition-colors">Cựu thành viên</a>
            </div>
          </div>
          <div>
            <p className="font-semibold text-white/70 mb-3">Quản lý đội bóng</p>
            <Link to="/login" className="text-white/40 hover:text-white transition-colors">
              Đăng nhập hệ thống FC Manager →
            </Link>
          </div>
        </div>
        <p className="mt-10 text-xs text-white/20">
          © {new Date().getFullYear()} {clubProfile.name}. Nội dung trên trang minh hoạ, sẽ được thay bằng dữ liệu thật.
        </p>
      </footer>

      {/* Hall of Fame detail popover — opened by tapping/clicking a legend's card, anchored to that card's own top-left corner */}
      {activeLegend && legendPopoverPos && (
        <div
          data-legend-popover
          className="fixed z-50 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-amber-400/30 bg-black shadow-2xl shadow-black/60 p-4 animate-fade-slide-up"
          style={{ top: legendPopoverPos.top, left: legendPopoverPos.left }}
        >
          <button
            onClick={() => {
              setActiveLegend(null);
              setLegendPopoverPos(null);
            }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-3 pr-6">
            <div className="relative shrink-0">
              <Placeholder
                icon={<User className="w-6 h-6" />}
                label="Ảnh"
                image={activeLegend.image}
                alt={activeLegend.name}
                className="w-14 h-14 rounded-full ring-2 ring-amber-400/50"
              />
              {activeLegend.jerseyNumber && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-black text-[10px] font-black flex items-center justify-center border-2 border-black">
                  {activeLegend.jerseyNumber}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold truncate">{activeLegend.name}</p>
              <p className="text-[11px] uppercase tracking-wide text-amber-400/80">
                {activeLegend.role} · {activeLegend.period}
              </p>
            </div>
          </div>
          {activeLegend.description && (
            <p className="mt-3 text-xs text-white/70 leading-relaxed">{activeLegend.description}</p>
          )}
        </div>
      )}

      {/* Gallery zoom viewer — opened by tapping a slide; image runs full screen width on mobile for clarity */}
      {galleryZoomOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm sm:p-6"
          onClick={() => setGalleryZoomOpen(false)}
        >
          <div
            className="relative w-full h-full sm:h-auto sm:max-w-4xl flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setGalleryZoomOpen(false)}
              aria-label="Đóng"
              className="absolute top-3 right-3 sm:-top-12 sm:right-0 z-10 w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <button
              onClick={() => stepGallery(-1)}
              aria-label="Ảnh trước"
              className={`${arrowButtonClass} absolute left-2 top-1/2 -translate-y-1/2 z-10 border-white/20 bg-black/40 text-white/70 hover:text-white hover:border-white/50`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => stepGallery(1)}
              aria-label="Ảnh tiếp theo"
              className={`${arrowButtonClass} absolute right-2 top-1/2 -translate-y-1/2 z-10 border-white/20 bg-black/40 text-white/70 hover:text-white hover:border-white/50`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <Placeholder
              icon={<ImageIcon className="w-12 h-12" />}
              label="Ảnh sự kiện"
              image={clubGallery[galleryIndex].image}
              alt={clubGallery[galleryIndex].caption}
              className="w-full max-h-[75vh] sm:max-h-[70vh]"
            />

            <div className="w-full text-center px-4 py-3 sm:py-4">
              <p className="text-sm sm:text-base font-semibold">{clubGallery[galleryIndex].caption}</p>
              <p className="text-xs text-white/50">{clubGallery[galleryIndex].year}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
