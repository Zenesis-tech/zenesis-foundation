"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import gsap from "gsap";
import styles from "./zenesis-home.module.css";

const config = {
  smoothing: 0.1,
  movementThreshold: 0.01,
  sizeFromSpeed: 0.2,
  expandMultiplier: 2,
  expandTime: 2,
  expandEase: "power1.inOut",
  dissolveStart: 2,
  dissolveTime: 3,
  dissolveEase: "power3.in",
} as const;

const pillars = [
  { label: "Sustainable Agriculture", className: styles.agriculture },
  { label: "Healthcare & Longevity", className: styles.healthcare },
  { label: "Biotechnology Research", className: styles.biotech },
  { label: "Financial Innovation", className: styles.finance },
  { label: "Space Exploration & Future Systems", className: styles.space },
];

export function ZenesisHomeHero() {
  const heroRef = useRef<HTMLElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const smudgeContainerRef = useRef<SVGGElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);
  const pointerRef = useRef({ x: 0, y: 0 });
  const smoothPointerRef = useRef({ x: 0, y: 0 });
  const filterId = useId();
  const maskId = useId();

  const ids = useMemo(
    () => ({
      filter: `filter-${filterId.replace(/:/g, "")}`,
      mask: `mask-${maskId.replace(/:/g, "")}`,
    }),
    [filterId, maskId],
  );

  useEffect(() => {
    const heroSection = heroRef.current;
    const smudgeSVG = svgRef.current;
    const smudgeContainer = smudgeContainerRef.current;

    if (!heroSection || !smudgeSVG || !smudgeContainer) {
      return;
    }

    const onPointerMove = (clientX: number, clientY: number) => {
      const bounds = heroSection.getBoundingClientRect();
      const x = clientX - bounds.left;
      const y = clientY - bounds.top;

      if (!hasStartedRef.current) {
        pointerRef.current.x = smoothPointerRef.current.x = x;
        pointerRef.current.y = smoothPointerRef.current.y = y;
        hasStartedRef.current = true;
        return;
      }

      pointerRef.current.x = x;
      pointerRef.current.y = y;
    };

    const matchSVGToViewport = () => {
      const bounds = heroSection.getBoundingClientRect();
      smudgeSVG.setAttribute("viewBox", `0 0 ${bounds.width} ${bounds.height}`);
      smudgeSVG.style.width = `${bounds.width}px`;
      smudgeSVG.style.height = `${bounds.height}px`;
    };

    const stampSmudgeAt = (x: number, y: number, radius: number) => {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");

      circle.setAttribute("cx", String(x));
      circle.setAttribute("cy", String(y));
      circle.setAttribute("r", String(radius));
      circle.setAttribute("fill", "#fff");

      smudgeContainer.prepend(circle);

      const animatedRadius = { current: radius };

      const timeline = gsap.timeline({
        onUpdate() {
          circle.setAttribute("r", String(Math.max(0, animatedRadius.current)));
        },
        onComplete() {
          timeline.kill();
          circle.remove();
        },
      });

      timeline.to(animatedRadius, {
        current: radius * config.expandMultiplier,
        duration: config.expandTime,
        ease: config.expandEase,
      });

      timeline.to(
        animatedRadius,
        {
          current: 0,
          duration: config.dissolveTime,
          ease: config.dissolveEase,
        },
        config.dissolveStart,
      );
    };

    const update = () => {
      if (hasStartedRef.current) {
        smoothPointerRef.current.x +=
          (pointerRef.current.x - smoothPointerRef.current.x) * config.smoothing;
        smoothPointerRef.current.y +=
          (pointerRef.current.y - smoothPointerRef.current.y) * config.smoothing;

        const speed = Math.hypot(
          pointerRef.current.x - smoothPointerRef.current.x,
          pointerRef.current.y - smoothPointerRef.current.y,
        );

        if (speed > config.movementThreshold) {
          stampSmudgeAt(
            smoothPointerRef.current.x,
            smoothPointerRef.current.y,
            speed * config.sizeFromSpeed,
          );
        }
      }

      rafRef.current = window.requestAnimationFrame(update);
    };

    const handleMouseMove = (event: MouseEvent) => {
      onPointerMove(event.clientX, event.clientY);
    };

    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      onPointerMove(event.touches[0].clientX, event.touches[0].clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      onPointerMove(event.touches[0].clientX, event.touches[0].clientY);
    };

    matchSVGToViewport();
    heroSection.addEventListener("mousemove", handleMouseMove);
    heroSection.addEventListener("touchstart", handleTouchStart, { passive: false });
    heroSection.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("resize", matchSVGToViewport);
    rafRef.current = window.requestAnimationFrame(update);

    return () => {
      heroSection.removeEventListener("mousemove", handleMouseMove);
      heroSection.removeEventListener("touchstart", handleTouchStart);
      heroSection.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", matchSVGToViewport);

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [ids.filter]);

  return (
    <section ref={heroRef} className={styles.hero}>
      <div className={styles.heroContentForeground}>
        <div className={styles.heroShell}>
          <div className={styles.topBar}>
            <p className={styles.eyebrow}>Zenesis Foundation</p>
           
          </div>

          <div className={styles.heroCopy}>
            <p className={styles.kicker}>Research-driven innovation for human progress</p>
            <h1>Thinking beyond Earth&apos;s limits.</h1>
            <p className={styles.lede}>
              Zenesis Foundation advances human civilization through bold work across
              agriculture, healthcare, biotechnology, financial infrastructure, and
              space exploration.
            </p>
          </div>

          <div className={styles.heroMeta}>
            <div className={styles.metaCard}>
              <span className={styles.metaLabel}>Mission</span>
              <strong>Smarter, healthier, sustainable futures</strong>
            </div>
            <div className={styles.metaCard}>
              <span className={styles.metaLabel}>Approach</span>
              <strong>Science, technology, and long-term vision</strong>
            </div>
            <div className={styles.metaCard}>
              <span className={styles.metaLabel}>Belief</span>
              <strong>Responsible innovation through collaboration</strong>
            </div>
          </div>
        </div>
      </div>

      <div
        className={styles.heroContentBackground}
        style={{
          mask: `url(#${ids.mask})`,
          WebkitMask: `url(#${ids.mask})`,
        }}
      >
        <div className={styles.backgroundPanel}>
          <div className={styles.backgroundPanelHeader}>
            <div>
              <p className={styles.backgroundTag}>Core Pillars</p>
              <h2>Building the next era of civilization.</h2>
            </div>
          </div>

          <div className={styles.pillarGrid}>
            {pillars.map((pillar) => (
              <p key={pillar.label} className={`${styles.pillarCard} ${pillar.className}`}>
                {pillar.label}
              </p>
            ))}
          </div>

          <p className={styles.backgroundNote}>
            From food security and biotech breakthroughs to digital infrastructure and
            space-based systems, Zenesis works where breakthrough research meets
            humanity&apos;s long horizon.
          </p>
        </div>
      </div>

      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className={styles.smudgeRevealer}
      >
        <defs>
          <filter id={ids.filter}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="25" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 60 -14"
            />
          </filter>
        </defs>
        <mask id={ids.mask}>
          <g ref={smudgeContainerRef} filter={`url(#${ids.filter})`} />
        </mask>
      </svg>
    </section>
  );
}
