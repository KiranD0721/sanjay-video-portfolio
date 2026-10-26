import React, { useEffect, useMemo, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import {

  ArrowLeft,

  Clapperboard,

  ExternalLink,

  Instagram,

  Mail,

  Play,

  Sparkles,

  X,

} from "lucide-react";

import { categories, profile } from "./data/portfolio";

import { supabase } from "./lib/supabase";



const FUNCTION_NAME = "bright-action";

const PUBLIC_SITE_URL = "https://sanjay-video-portfolio.vercel.app";



function getDriveEmbedUrl(url) {

  if (!url) return "";



  try {

    const parsed = new URL(url);



    if (

      parsed.hostname === "drive.google.com" ||

      parsed.hostname === "docs.google.com"

    ) {

      const match = parsed.pathname.match(/\/file\/d\/([^/]+)/);

      const fileId =

        match?.[1] ||

        parsed.searchParams.get("id");



      if (fileId) {

        return `https://drive.google.com/file/d/${fileId}/preview`;

      }

    }

  } catch {

    return "";

  }



  return "";

}



function VideoModal({ video, onClose }) {

  useEffect(() => {

    const handleKey = (event) => {

      if (event.key === "Escape") onClose();

    };



    window.addEventListener("keydown", handleKey);

    document.body.style.overflow = "hidden";



    return () => {

      window.removeEventListener("keydown", handleKey);

      document.body.style.overflow = "";

    };

  }, [onClose]);



  const url = video?.url || "";

  const driveEmbed = getDriveEmbedUrl(url);

  const isYouTubeEmbed =

    url.includes("youtube.com/embed/") ||

    url.includes("youtube-nocookie.com/embed/");

  const isVimeoEmbed = url.includes("player.vimeo.com/video/");

  const isEmbed = Boolean(driveEmbed || isYouTubeEmbed || isVimeoEmbed);



  return (

    <motion.div

      className="modal-backdrop"

      initial={{ opacity: 0 }}

      animate={{ opacity: 1 }}

      exit={{ opacity: 0 }}

      onMouseDown={(event) => {

        if (event.target === event.currentTarget) onClose();

      }}

    >

      <motion.div

        className="video-modal"

        initial={{ opacity: 0, scale: 0.94, y: 16 }}

        animate={{ opacity: 1, scale: 1, y: 0 }}

        exit={{ opacity: 0, scale: 0.96, y: 10 }}

        transition={{ duration: 0.25 }}

      >

        <button

          className="icon-button modal-close"

          onClick={onClose}

          aria-label="Close video"

        >

          <X size={20} />

        </button>



        <div className="player">

          {isEmbed ? (

            <iframe

              src={driveEmbed || url}

              title={video.title}

              allow="autoplay; encrypted-media; picture-in-picture"

              allowFullScreen

            />

          ) : (

            <video

              src={url}

              controls

              autoPlay

              playsInline

            />

          )}

        </div>



        <div className="modal-caption">

          <span>{video.client || "SANJAY · STUDIO"}</span>

          <h3>{video.title}</h3>

          {video.description && <p>{video.description}</p>}

        </div>



        {url && !isEmbed && (

          <a

            href={url}

            target="_blank"

            rel="noreferrer"

            className="external-video-link"

          >

            Open video <ExternalLink size={14} />

          </a>

        )}

      </motion.div>

    </motion.div>

  );

}



function VideoCard({ video, onClick }) {

  return (

    <motion.button

      type="button"

      className="video-card"

      whileHover={{ y: -4 }}

      onClick={onClick}

      aria-label={`Play ${video.title}`}

    >

      <div

        className="video-thumb"

        style={

          video.thumbnail

            ? {

                backgroundImage: `url("${video.thumbnail}")`,

              }

            : undefined

        }

      >

        {!video.thumbnail && (

          <div className="video-placeholder">

            <Clapperboard size={30} />

          </div>

        )}



        <span className="play-button">

          <Play size={18} fill="currentColor" />

        </span>



        <span className="duration">PLAY</span>

      </div>



      <div className="video-meta">

        <span>{video.type || "VIDEO"}</span>

        <h4>{video.title}</h4>

        {video.description && <p>{video.description}</p>}

      </div>

    </motion.button>

  );

}



function PrivateSharePage({

  loading,

  error,

  videos,

  onPlay,

  activeVideo,

  onCloseVideo,

}) {

  return (

    <main className="private-share-page">

      <div className="ambient ambient-one" />

      <div className="ambient ambient-two" />



      <div className="site-shell private-shell">

        <header className="topbar">

          <a

            className="brand"

            href={PUBLIC_SITE_URL}

            aria-label="SANJAY Studio"

          >

            <span className="brand-icon">

              <Clapperboard size={17} />

            </span>



            <span>

              SANJAY <span className="brand-dot">·</span> STUDIO

              <small>PRIVATE PORTFOLIO</small>

            </span>

          </a>

        </header>



        <section className="private-heading">

          <p className="eyebrow">

            <Sparkles size={13} /> PRIVATE COLLECTION

          </p>



          <h1>Selected videos</h1>



          <p>

            A curated collection shared with you by SANJAY · STUDIO.

          </p>

        </section>



        {loading ? (

          <div className="share-status" role="status">

            <div className="loading-spinner" />

            <p>Verifying your private link…</p>

          </div>

        ) : error ? (

          <div className="share-status share-error" role="alert">

            <h2>Portfolio unavailable</h2>

            <p>{error}</p>

            <p>

              Please contact the person who shared this link with you.

            </p>

          </div>

        ) : videos.length === 0 ? (

          <div className="share-status">

            <h2>No videos available</h2>

            <p>This link does not contain any available videos.</p>

          </div>

        ) : (

          <>

            <div className="private-video-count">

              {videos.length} {videos.length === 1 ? "VIDEO" : "VIDEOS"}

            </div>



            <div className="video-grid">

              {videos.map((video) => (

                <VideoCard

                  key={video.id}

                  video={video}

                  onClick={() => onPlay(video)}

                />

              ))}

            </div>

          </>

        )}



        <footer className="private-footer">

          <span>SANJAY · STUDIO</span>

          <span>PRIVATE PORTFOLIO</span>

        </footer>

      </div>



      <AnimatePresence>

        {activeVideo && (

          <VideoModal

            video={activeVideo}

            onClose={onCloseVideo}

          />

        )}

      </AnimatePresence>

    </main>

  );

}



export default function App() {

  const [entered, setEntered] = useState(false);

  const [activeCategory, setActiveCategory] = useState(null);

  const [activeFilter, setActiveFilter] = useState("All");

  const [activeVideo, setActiveVideo] = useState(null);



  const isShareUrl = new URLSearchParams(window.location.search).has("share");
  const [shareMode, setShareMode] = useState(isShareUrl);
  const [shareLoading, setShareLoading] = useState(isShareUrl);

  const [shareError, setShareError] = useState("");

  const [sharedVideos, setSharedVideos] = useState([]);



  // Validate private links independently from the normal public portfolio.

  useEffect(() => {

    const params = new URLSearchParams(window.location.search);

    const token = params.get("share");



    if (!token) return;



    setShareMode(true);

    setEntered(true);

    setShareLoading(true);



    let cancelled = false;



    async function validateShareLink() {

      try {

        const { data, error } = await supabase.functions.invoke(

          FUNCTION_NAME,

          {

            body: {

              action: "validate",

              token,

            },

          }

        );



        if (error) {

          throw new Error(

            error.message || "Could not validate the sharing link."

          );

        }



        if (data?.error) {

          throw new Error(data.error);

        }



        if (!Array.isArray(data?.videos)) {

          throw new Error("The sharing service returned an invalid response.");

        }



        if (data.videos.length === 0) {

          throw new Error("No videos are available for this link.");

        }



        const formattedVideos = data.videos.map((video) => ({

          id: video.id,

          title: video.title || "Untitled video",

          description: video.description || "",

          category_id: video.category_id,

          url: video.drive_url || "",

          thumbnail: video.thumbnail_url || "",

          type: video.video_type || "VIDEO",

          client: "SANJAY · STUDIO",

        }));



        if (formattedVideos.some((video) => !video.url)) {

          throw new Error("One or more shared videos have no video link.");

        }



        if (!cancelled) {

          setSharedVideos(formattedVideos);

          setShareError("");

        }

      } catch (error) {

        console.error("Private share validation failed:", error);



        if (!cancelled) {

          setSharedVideos([]);

          setShareError(

            "This link is invalid, expired, or has been revoked."

          );

        }

      } finally {

        if (!cancelled) {

          setShareLoading(false);

        }

      }

    }



    validateShareLink();



    return () => {

      cancelled = true;

    };

  }, []);



  const selected = categories.find(

    (item) => item.id === activeCategory

  );



  const visibleVideos = useMemo(() => {

    if (!selected) return [];



    const videos = selected.videos || [];



    return activeFilter === "All"

      ? videos

      : videos.filter((video) => video.type === activeFilter);

  }, [selected, activeFilter]);



  const openCategory = (id) => {

    setActiveCategory(id);

    setActiveFilter("All");



    document

      .getElementById("portfolio")

      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  };



  const backToFolders = () => {

    setActiveCategory(null);

    setActiveFilter("All");

  };



  // Critical: share mode returns its own page.

  // The public folder grid below is never rendered for a share URL.

  if (isShareUrl || shareMode) {

    return (

      <PrivateSharePage

        loading={shareLoading}

        error={shareError}

        videos={sharedVideos}

        activeVideo={activeVideo}

        onPlay={setActiveVideo}

        onCloseVideo={() => setActiveVideo(null)}

      />

    );

  }



  return (

    <main>

      <div className="ambient ambient-one" />

      <div className="ambient ambient-two" />



      <AnimatePresence mode="wait">

        {!entered ? (

          <motion.section

            className="welcome-screen"

            key="welcome"

            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}

            exit={{

              opacity: 0,

              scale: 1.04,

              filter: "blur(12px)",

            }}

            transition={{ duration: 0.6 }}

          >

            <div className="welcome-content">

              <motion.div

                className="welcome-mark"

                initial={{ opacity: 0, y: 18 }}

                animate={{ opacity: 1, y: 0 }}

              >

                <Clapperboard size={30} />

              </motion.div>



              <motion.p

                className="eyebrow"

                initial={{ opacity: 0, y: 14 }}

                animate={{ opacity: 1, y: 0 }}

                transition={{ delay: 0.1 }}

              >

                VISUAL STORYTELLING

              </motion.p>



              <motion.h1

                initial={{ opacity: 0, y: 18 }}

                animate={{ opacity: 1, y: 0 }}

                transition={{ delay: 0.18 }}

              >

                SANJAY <span>·</span> STUDIO

              </motion.h1>



              <motion.p

                className="welcome-copy"

                initial={{ opacity: 0, y: 18 }}

                animate={{ opacity: 1, y: 0 }}

                transition={{ delay: 0.28 }}

              >

                Every frame tells a story.

              </motion.p>



              <motion.button

                type="button"

                className="enter-button"

                onClick={() => setEntered(true)}

                initial={{ opacity: 0, y: 18 }}

                animate={{ opacity: 1, y: 0 }}

                transition={{ delay: 0.38 }}

              >

                Explore portfolio <ArrowLeft size={16} />

              </motion.button>

            </div>

          </motion.section>

        ) : (

          <motion.div

            className="site-shell"

            key="portfolio"

            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}

            transition={{ duration: 0.45 }}

          >

            <header className="topbar">

              <button

                type="button"

                className="brand"

                onClick={backToFolders}

                aria-label="Back to portfolio folders"

              >

                <span className="brand-icon">

                  <Clapperboard size={17} />

                </span>



                <span>

                  SANJAY <span className="brand-dot">·</span> STUDIO

                  <small>FILMMAKER & VISUAL STORYTELLER</small>

                </span>

              </button>



              <nav className="topbar-links">

                {profile.instagram && (

                  <a

                    href={profile.instagram}

                    target="_blank"

                    rel="noreferrer"

                    aria-label="Instagram"

                  >

                    <Instagram size={18} />

                  </a>

                )}



                {profile.email && (

                  <a href={`mailto:${profile.email}`} aria-label="Email">

                    <Mail size={18} />

                  </a>

                )}

              </nav>

            </header>



            <section className="intro-row">

              <div className="intro-copy-wrap">

                <p className="eyebrow">

                  <Sparkles size={13} /> THE PORTFOLIO

                </p>



                <h1>

                  Moments become

                  <br />

                  <span>memories.</span>

                </h1>



                <p className="intro-copy">

                  A collection of stories, crafted with intention and

                  captured through the lens.

                </p>

              </div>



              <div className="intro-side">

                <span className="intro-line" />

                <p>CRAFTED WITH VISION</p>

                <p>CAPTURED WITH PURPOSE</p>

              </div>

            </section>



            <section id="portfolio" className="portfolio-section">

              {selected ? (

                <motion.div

                  key={selected.id}

                  className="gallery-view"

                  initial={{ opacity: 0, y: 12 }}

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ duration: 0.35 }}

                >

                  <div className="gallery-header">

                    <button

                      type="button"

                      className="back-button"

                      onClick={backToFolders}

                    >

                      <ArrowLeft size={16} /> All folders

                    </button>



                    <span className="gallery-count">

                      {(selected.videos || []).length} VIDEOS

                    </span>

                  </div>



                  <div className="gallery-banner">

                    {selected.image && (

                      <div

                        className="gallery-banner-image"

                        style={{

                          backgroundImage: `url("${selected.image}")`,

                        }}

                      />

                    )}



                    <div className="gallery-banner-overlay" />



                    <div className="gallery-banner-content">

                      <p className="eyebrow">SELECTED COLLECTION</p>

                      <h2>{selected.title}</h2>

                      <p>

                        {selected.subtitle ||

                          "A collection of visual stories."}

                      </p>

                    </div>

                  </div>



                  {selected.filters?.length > 0 && (

                    <div className="filter-row">

                      {["All", ...selected.filters].map((filter) => (

                        <button

                          type="button"

                          key={filter}

                          className={

                            activeFilter === filter

                              ? "filter-chip active"

                              : "filter-chip"

                          }

                          onClick={() => setActiveFilter(filter)}

                        >

                          {filter}

                        </button>

                      ))}

                    </div>

                  )}



                  {visibleVideos.length > 0 ? (

                    <div className="video-grid">

                      {visibleVideos.map((video) => (

                        <VideoCard

                          key={video.id || video.title}

                          video={video}

                          onClick={() => setActiveVideo(video)}

                        />

                      ))}

                    </div>

                  ) : (

                    <div className="empty-state">

                      <h3>No videos yet</h3>

                      <p>There are no videos in this collection yet.</p>

                    </div>

                  )}

                </motion.div>

              ) : (

                <motion.div

                  key="folders"

                  className="folders-view"

                  initial={{ opacity: 0, y: 12 }}

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ duration: 0.35 }}

                >

                  <div className="section-heading">

                    <div>

                      <p className="eyebrow">EXPLORE THE WORK</p>

                      <h2>Portfolio folders</h2>

                    </div>



                    <span>{categories.length} COLLECTIONS</span>

                  </div>



                  <div className="folder-grid">

                    {categories.map((category, index) => (

                      <motion.button

                        type="button"

                        className="folder-card"

                        key={category.id}

                        onClick={() => openCategory(category.id)}

                        initial={{ opacity: 0, y: 18 }}

                        animate={{ opacity: 1, y: 0 }}

                        transition={{ delay: Math.min(index * 0.07, 0.35) }}

                        whileHover={{ y: -5 }}

                      >

                        <div

                          className="folder-image"

                          style={

                            category.image

                              ? {

                                  backgroundImage: `url("${category.image}")`,

                                }

                              : undefined

                          }

                        >

                          <div className="folder-image-overlay" />

                          <span className="folder-number">

                            {String(index + 1).padStart(2, "0")}

                          </span>

                          <span className="folder-open">

                            <ArrowLeft size={17} />

                          </span>

                        </div>



                        <div className="folder-info">

                          <div>

                            <h3>{category.title}</h3>

                            <p>

                              {category.subtitle ||

                                "Explore this collection"}

                            </p>

                          </div>



                          <span className="folder-video-count">

                            {(category.videos || []).length} VIDEOS

                          </span>

                        </div>

                      </motion.button>

                    ))}

                  </div>

                </motion.div>

              )}

            </section>



            <footer className="site-footer">

              <span>SANJAY · STUDIO</span>

              <span>MADE TO TELL STORIES</span>

              {profile.email && (

                <a href={`mailto:${profile.email}`}>

                  Get in touch <Mail size={14} />

                </a>

              )}

            </footer>

          </motion.div>

        )}

      </AnimatePresence>



      <AnimatePresence>

        {activeVideo && (

          <VideoModal

            video={activeVideo}

            onClose={() => setActiveVideo(null)}

          />

        )}

      </AnimatePresence>

    </main>

  );

}
