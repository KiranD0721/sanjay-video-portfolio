import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Instagram, Mail, Play, Sparkles, X, Clapperboard, ExternalLink } from "lucide-react";
import { categories, profile } from "./data/portfolio";

const rise = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }
};

function VideoModal({ video, onClose }) {
  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const isEmbed = video.url.includes("youtube.com/embed") || video.url.includes("player.vimeo.com");
  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div className="video-modal" initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }} transition={{ duration: 0.25 }}>
        <button className="icon-button modal-close" onClick={onClose} aria-label="Close video"><X size={20} /></button>
        <div className="player">
          {isEmbed
            ? <iframe src={video.url} title={video.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
            : <video src={video.url} controls autoPlay playsInline />}
        </div>
        <div className="modal-caption"><span>{video.client}</span><h3>{video.title}</h3></div>
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const [entered, setEntered] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeVideo, setActiveVideo] = useState(null);

  const selected = categories.find((item) => item.id === activeCategory);
  const visibleVideos = useMemo(() => {
    if (!selected) return [];
    return activeFilter === "All" ? selected.videos : selected.videos.filter((video) => video.type === activeFilter);
  }, [selected, activeFilter]);

  const openCategory = (id) => {
    setActiveCategory(id);
    setActiveFilter("All");
    document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const backToFolders = () => {
    setActiveCategory(null);
    setActiveFilter("All");
  };

  return (
    <main>
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <AnimatePresence mode="wait">
        {!entered ? (
          <motion.section className="welcome-screen" key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.04, filter: "blur(12px)" }} transition={{ duration: 0.7 }}>
            <div className="welcome-image" />
            <div className="welcome-shade" />
            <motion.div className="film-strip film-left" initial={{ x: -80, opacity: 0 }} animate={{ x: 0, opacity: 0.45 }} transition={{ duration: 1 }} />
            <motion.div className="welcome-content" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.12 } } }}>
              <motion.p className="eyebrow" variants={rise}>A PERSONAL PORTFOLIO</motion.p>
              <motion.div className="camera-mark" variants={rise}><Clapperboard size={25} strokeWidth={1.3} /></motion.div>
              <motion.p className="welcome-label" variants={rise}>WELCOME TO</motion.p>
              <motion.h1 variants={rise}>{profile.firstName}</motion.h1>
              <motion.p className="role" variants={rise}>{profile.role}</motion.p>
              <motion.div className="gold-line" variants={rise} />
              <motion.p className="tagline" variants={rise}>{profile.tagline}</motion.p>
              <motion.button className="enter-button" variants={rise} whileHover={{ scale: 1.04, boxShadow: "0 0 35px #d5aa5550" }} whileTap={{ scale: 0.97 }} onClick={() => setEntered(true)}>
                <Play size={14} fill="currentColor" /> CLICK HERE TO EXPLORE <ArrowRight size={16} />
              </motion.button>
              <motion.p className="small-note" variants={rise}>LET'S EXPLORE THE WORLD OF STORIES</motion.p>
            </motion.div>
            <div className="welcome-bottom"><span>INDEPENDENT VIDEO EDITOR</span><span>SCROLL LESS. FEEL MORE.</span></div>
          </motion.section>
        ) : (
          <motion.div key="portfolio" className="site-shell" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
            <header className="topbar">
              <button className="brand" onClick={backToFolders}><span className="brand-icon"><Clapperboard size={17}/></span><span>{profile.firstName}<small>VIDEO EDITOR</small></span></button>
              <div className="top-links"><a href={profile.instagram} target="_blank" rel="noreferrer"><Instagram size={16}/> Instagram</a><a href={profile.whatsapp} target="_blank" rel="noreferrer">Let's talk <ExternalLink size={14}/></a></div>
            </header>

            <section className="intro-row">
              <div><p className="eyebrow"><Sparkles size={13}/> SELECTED WORKS</p><h2>{selected ? selected.title : "Stories, in motion."}</h2><p className="intro-copy">{selected ? selected.subtitle : "A collection of moments, carefully framed and edited to make them last."}</p></div>
              {selected && <button className="back-button" onClick={backToFolders}><ArrowLeft size={15}/> All folders</button>}
            </section>

            <section id="portfolio" className="portfolio-section">
              <AnimatePresence mode="wait">
                {!selected ? (
                  <motion.div key="folders" className="folder-grid" initial="hidden" animate="show" exit={{ opacity: 0, y: 15, filter: "blur(5px)" }} variants={{ show: { transition: { staggerChildren: 0.09 } } }}>
                    {categories.map((category, index) => (
                      <motion.button key={category.id} className="folder-card" style={{ "--accent": category.color }} variants={rise} whileHover={{ y: -8, rotateX: 2, scale: 1.015 }} whileTap={{ scale: 0.98 }} onClick={() => openCategory(category.id)}>
                        <div className="folder-tab" />
                        <div className="folder-cover" style={{ backgroundImage: `linear-gradient(180deg, transparent 10%, rgba(0,0,0,.83) 100%), url("${category.image}")` }}>
                          <span className="folder-index">0{index + 1} / 04</span><span className="folder-open"><ArrowRight size={17}/></span>
                          <div className="folder-info"><h3>{category.title}</h3><p>{category.subtitle}</p></div>
                        </div>
                        <div className="folder-foot"><span>{String(category.videos.length).padStart(2, "0")} PROJECTS</span><span className="folder-dot" /></div>
                      </motion.button>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div key={selected.id} className="gallery-view" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} transition={{ duration: 0.35 }}>
                    <div className="gallery-banner" style={{ backgroundImage: `linear-gradient(90deg, rgba(5,5,5,.88), rgba(5,5,5,.12)), url("${selected.image}")` }}>
                      <span className="banner-kicker">PORTFOLIO / {selected.id.toUpperCase()}</span><h3>{selected.title}</h3><p>{selected.subtitle}</p>
                    </div>
                    <div className="filter-row">{selected.filters.map((filter) => <button key={filter} className={`filter-chip ${activeFilter === filter ? "active" : ""}`} onClick={() => setActiveFilter(filter)}>{filter}</button>)}</div>
                    <motion.div className="video-grid" layout>
                      <AnimatePresence mode="popLayout">
                        {visibleVideos.map((video, index) => (
                          <motion.button key={video.title} className="video-card" layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.24, delay: index * 0.035 }} whileHover={{ y: -5 }} onClick={() => setActiveVideo(video)}>
                            <div className="video-thumb" style={{ backgroundImage: `url("${video.thumbnail}")` }}><span className="play-button"><Play size={18} fill="currentColor"/></span><span className="duration">{video.duration}</span></div>
                            <div className="video-meta"><span>{video.type}</span><h4>{video.title}</h4><p>{video.client}</p></div>
                          </motion.button>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                    {visibleVideos.length === 0 && <p className="empty-state">No videos in this category yet.</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <footer className="footer">
              <div><p className="eyebrow">HAVE A STORY TO TELL?</p><h2>Let's make it <em>memorable.</em></h2></div>
              <div className="footer-actions"><a className="contact-button" href={profile.whatsapp} target="_blank" rel="noreferrer">Start a project <ArrowRight size={16}/></a><a className="social-link" href={`mailto:${profile.email}`}><Mail size={16}/> {profile.email}</a></div>
              <div className="footer-bottom"><span>© {new Date().getFullYear()} {profile.firstName}</span><span>MADE FRAME BY FRAME <span className="gold">✦</span></span></div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>{activeVideo && <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />}</AnimatePresence>
    </main>
  );
}