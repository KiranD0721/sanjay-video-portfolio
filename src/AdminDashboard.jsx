
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

const FUNCTION_NAME = "bright-action";
const PRODUCTION_URL = "https://sanjay-video-portfolio.vercel.app";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#101010",
    color: "#f5f5f5",
    padding: "32px 20px",
    fontFamily: "Arial, sans-serif",
  },
  container: { maxWidth: "1050px", margin: "0 auto" },
  card: {
    background: "#1b1b1b",
    border: "1px solid #383838",
    borderRadius: "14px",
    padding: "24px",
    marginBottom: "24px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    marginTop: "8px",
    borderRadius: "8px",
    border: "1px solid #505050",
    background: "#111",
    color: "#fff",
    fontSize: "15px",
  },
  label: {
    display: "block",
    marginTop: "18px",
    fontSize: "14px",
  },
  button: {
    padding: "12px 16px",
    border: 0,
    borderRadius: "8px",
    background: "#c5a46d",
    color: "#111",
    fontWeight: "bold",
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "9px 12px",
    border: "1px solid #555",
    borderRadius: "7px",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
  },
  muted: { color: "#aaa", lineHeight: 1.6 },
  item: {
    border: "1px solid #383838",
    borderRadius: "10px",
    padding: "16px",
    marginTop: "12px",
  },
  shareCard: {
    background: "#141414",
    border: "1px solid #383838",
    borderRadius: "9px",
    padding: "14px",
    marginTop: "12px",
  },
};

function isGoogleDriveUrl(value) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      ["drive.google.com", "docs.google.com"].includes(url.hostname)
    );
  } catch {
    return false;
  }
}

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [categories, setCategories] = useState([]);
  const [videos, setVideos] = useState([]);
  const [shareLinks, setShareLinks] = useState([]);

  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [driveUrl, setDriveUrl] = useState("");

  const [shareCategory, setShareCategory] = useState("");
  const [selectedVideoIds, setSelectedVideoIds] = useState([]);
  const [generatedLink, setGeneratedLink] = useState("");
  const [generatedShareLinkId, setGeneratedShareLinkId] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const categoryVideos = useMemo(
    () => videos.filter((video) => video.category_id === shareCategory),
    [videos, shareCategory]
  );

  useEffect(() => {
    let alive = true;

    async function checkSession() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (data.session) {
          const { data: admin, error: adminError } = await supabase
            .from("admin_users")
            .select("user_id")
            .eq("user_id", data.session.user.id)
            .maybeSingle();

          if (adminError) {
            console.error("Admin check failed:", adminError);
            if (alive) {
              setErrorMessage(
                `Admin check failed: ${adminError.message}`
              );
            }
            return;
          }

          if (!admin) {
            if (alive) {
              setErrorMessage(
                "No admin record found for this signed-in account."
              );
            }
            return;
          }

          if (alive) {
            setSession(data.session);
            setErrorMessage("");
          }
        }
      } catch (err) {
        console.error("Session check failed:", err);

        if (alive) {
          setErrorMessage(
            err.message || "Could not check the login session."
          );
        }
      } finally {
        if (alive) setReady(true);
      }
    }

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (alive) setSession(newSession);
      }
    );

    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session) {
      loadDashboard();
    } else {
      setCategories([]);
      setVideos([]);
      setShareLinks([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  useEffect(() => {
    setSelectedVideoIds([]);
    setGeneratedLink("");
    setGeneratedShareLinkId("");
  }, [shareCategory]);

  async function loadDashboard() {
    setErrorMessage("");

    const [
      { data: categoryRows, error: categoryError },
      { data: videoRows, error: videoError },
      { data: linkRows, error: linkError },
    ] = await Promise.all([
      supabase
        .from("categories")
        .select("id, name, sort_order")
        .order("sort_order"),
      supabase
        .from("videos")
        .select(
          "id, title, description, category_id, drive_url, thumbnail_url, video_type, published, created_at"
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("share_links")
        .select("id, category_id, expires_at, active, created_at")
        .order("created_at", { ascending: false }),
    ]);

    if (categoryError || videoError) {
      setErrorMessage(
        categoryError?.message || videoError?.message || "Could not load dashboard."
      );
      return;
    }

    setCategories(categoryRows || []);
    setVideos(videoRows || []);

    if (linkError) {
      setErrorMessage(
        `Videos loaded, but sharing links could not be loaded: ${linkError.message}`
      );
    } else {
      setShareLinks(linkRows || []);
    }

    if (
      categoryRows?.length &&
      !categoryRows.some((item) => item.id === categoryId)
    ) {
      setCategoryId(categoryRows[0].id);
    }

    if (
      categoryRows?.length &&
      !categoryRows.some((item) => item.id === shareCategory)
    ) {
      setShareCategory(categoryRows[0].id);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setErrorMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (adminError || !admin) {
        await supabase.auth.signOut();
        throw new Error("This account does not have admin access.");
      }

      setSession(data.session);
      setMessage("Signed in successfully.");
    } catch (err) {
      setErrorMessage(err.message || "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveVideo(event) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!title.trim() || !categoryId || !driveUrl.trim()) {
      setErrorMessage("Enter a title, choose a folder, and paste a Drive link.");
      return;
    }

    if (!isGoogleDriveUrl(driveUrl.trim())) {
      setErrorMessage("Please enter a valid HTTPS Google Drive or Google Docs link.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("videos").insert({
        title: title.trim(),
        description: description.trim(),
        category_id: categoryId,
        drive_url: driveUrl.trim(),
        published: true,
      });

      if (error) throw error;

      setTitle("");
      setDescription("");
      setDriveUrl("");
      setShareCategory(categoryId);
      setMessage("Video saved successfully.");
      await loadDashboard();
    } catch (err) {
      setErrorMessage(`Could not save video: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  function toggleVideo(videoId) {
    setSelectedVideoIds((previous) =>
      previous.includes(videoId)
        ? previous.filter((id) => id !== videoId)
        : [...previous, videoId]
    );
  }

  function selectAllVideos() {
    setSelectedVideoIds(categoryVideos.map((video) => video.id));
  }

  function clearVideoSelection() {
    setSelectedVideoIds([]);
  }

  async function handleGenerateLink() {
    setMessage("");
    setErrorMessage("");

    if (!shareCategory) {
      setErrorMessage("Choose a folder first.");
      return;
    }

    if (selectedVideoIds.length === 0) {
      setErrorMessage("Select at least one video to include in the share link.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
        body: {
          action: "create",
          category_id: shareCategory,
          video_ids: selectedVideoIds,
        },
      });

      if (error) {
        throw new Error(error.message || "Could not contact the sharing service.");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.token || !data?.share_link_id) {
        throw new Error(
          "The sharing service did not return the expected link details. Check the Edge Function response."
        );
      }

      // Always generate client links using the deployed Vercel website,
      // even when the admin dashboard is opened on localhost.
      const url = `${PRODUCTION_URL}/?share=${encodeURIComponent(
        data.token
      )}`;

      setGeneratedLink(url);
      setGeneratedShareLinkId(data.share_link_id);
      setMessage(
        `Share link created for ${data.video_count ?? selectedVideoIds.length} video(s). It expires in 48 hours.`
      );
    } catch (err) {
      setErrorMessage(`Could not generate link: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyLink(url) {
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      setMessage("Share link copied to clipboard.");
      setErrorMessage("");
    } catch {
      setErrorMessage("Automatic copy failed. Select the link field and copy it manually.");
    }
  }

  async function handleRevokeLink(linkId) {
    if (!linkId) {
      setErrorMessage("No share-link ID is available to revoke.");
      return;
    }

    if (!window.confirm("Revoke this share link? Visitors will no longer be able to use it.")) {
      return;
    }

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    try {
      const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
        body: {
          action: "revoke",
          share_link_id: linkId,
        },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setGeneratedLink("");
      setGeneratedShareLinkId("");
      setMessage("Share link revoked.");
      await loadDashboard();
    } catch (err) {
      setErrorMessage(`Could not revoke link: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(video) {
    const confirmed = window.confirm(
      `Delete "${video.title}" from the portfolio?`
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("videos")
        .delete()
        .eq("id", video.id);

      if (error) throw error;

      setSelectedVideoIds((previous) =>
        previous.filter((id) => id !== video.id)
      );

      setMessage("Video record deleted.");
      await loadDashboard();
    } catch (err) {
      setErrorMessage(`Could not delete video: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setSession(null);
      setMessage("Signed out.");
    } catch (err) {
      setErrorMessage(`Could not sign out: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  function getLinkStatus(link) {
    if (!link.active) return "Revoked";
    if (!link.expires_at || new Date(link.expires_at).getTime() <= Date.now()) {
      return "Expired";
    }
    return "Active";
  }

  if (!ready) {
    return <main style={styles.page}>Loading admin dashboard…</main>;
  }

  if (!session) {
    return (
      <main style={{ ...styles.page, display: "grid", placeItems: "center" }}>
        <form
          style={{ ...styles.card, width: "100%", maxWidth: "420px" }}
          onSubmit={handleLogin}
        >
          <p style={{ color: "#c5a46d", letterSpacing: "3px" }}>
            SANJAY · STUDIO
          </p>
          <h1>Admin login</h1>
          <p style={styles.muted}>Sign in to manage the video portfolio.</p>

          <label style={styles.label} htmlFor="admin-email">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            style={styles.input}
          />

          <label style={styles.label} htmlFor="admin-password">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={styles.input}
          />

          {errorMessage && <p role="alert">{errorMessage}</p>}
          {message && <p role="status">{message}</p>}

          <button
            type="submit"
            style={{ ...styles.button, width: "100%", marginTop: "24px" }}
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </main>
    );
  }

  const selectedCategory = categories.find(
    (category) => category.id === shareCategory
  );

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "28px",
          }}
        >
          <div>
            <p style={{ color: "#c5a46d", letterSpacing: "3px" }}>
              SANJAY · STUDIO
            </p>
            <h1 style={{ marginBottom: "6px" }}>Admin Dashboard</h1>
            <p style={styles.muted}>
              Manage videos and create private portfolio links.
            </p>
          </div>

          <button
            type="button"
            style={styles.secondaryButton}
            onClick={handleLogout}
            disabled={loading}
          >
            Sign out
          </button>
        </header>

        {errorMessage && (
          <div
            role="alert"
            style={{
              ...styles.card,
              borderColor: "#a84e4e",
              color: "#ffb6b6",
            }}
          >
            {errorMessage}
          </div>
        )}

        {message && (
          <div
            role="status"
            style={{ ...styles.card, borderColor: "#6b5b3d" }}
          >
            {message}
          </div>
        )}

        <section style={styles.card}>
          <h2>Add a video</h2>
          <p style={styles.muted}>
            Paste a Google Drive video link. For playback to work, make sure
            the Drive file's sharing permissions allow the intended viewer to
            access it.
          </p>

          <form onSubmit={handleSaveVideo}>
            <label style={styles.label} htmlFor="video-title">
              Video title
            </label>
            <input
              id="video-title"
              style={styles.input}
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Wedding highlight film"
            />

            <label style={styles.label} htmlFor="video-description">
              Description (optional)
            </label>
            <textarea
              id="video-description"
              style={{ ...styles.input, minHeight: "90px" }}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Short description"
            />

            <label style={styles.label} htmlFor="video-category">
              Folder
            </label>
            <select
              id="video-category"
              style={styles.input}
              required
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <label style={styles.label} htmlFor="video-drive-url">
              Google Drive video link
            </label>
            <input
              id="video-drive-url"
              type="url"
              style={styles.input}
              required
              value={driveUrl}
              onChange={(event) => setDriveUrl(event.target.value)}
              placeholder="https://drive.google.com/file/d/..."
            />

            <button
              type="submit"
              style={{ ...styles.button, marginTop: "20px" }}
              disabled={loading || categories.length === 0}
            >
              {loading ? "Please wait…" : "Save video"}
            </button>
          </form>
        </section>

        <section style={styles.card}>
          <h2>Create a private share link</h2>
          <p style={styles.muted}>
            Choose a folder, select exactly which videos the visitor can see,
            then generate a link that expires after 48 hours.
          </p>

          <label style={styles.label} htmlFor="share-category">
            Choose folder
          </label>
          <select
            id="share-category"
            style={styles.input}
            value={shareCategory}
            onChange={(event) => setShareCategory(event.target.value)}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
              marginTop: "22px",
            }}
          >
            <h3 style={{ margin: 0 }}>
              {selectedCategory?.name || "Folder"} videos ({categoryVideos.length})
            </h3>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={selectAllVideos}
                disabled={categoryVideos.length === 0}
              >
                Select all
              </button>
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={clearVideoSelection}
                disabled={selectedVideoIds.length === 0}
              >
                Clear selection
              </button>
            </div>
          </div>

          {categoryVideos.length === 0 ? (
            <p style={styles.muted}>No videos saved in this folder yet.</p>
          ) : (
            categoryVideos.map((video) => (
              <label
                key={video.id}
                style={{
                  ...styles.item,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedVideoIds.includes(video.id)}
                  onChange={() => toggleVideo(video.id)}
                  style={{ marginTop: "4px" }}
                />
                <span>
                  <strong>{video.title}</strong>
                  {video.description && (
                    <span
                      style={{
                        ...styles.muted,
                        display: "block",
                        marginTop: "5px",
                      }}
                    >
                      {video.description}
                    </span>
                  )}
                </span>
              </label>
            ))
          )}

          <p style={styles.muted}>
            Selected: {selectedVideoIds.length} video(s)
          </p>

          <button
            type="button"
            style={{ ...styles.button, marginTop: "8px" }}
            onClick={handleGenerateLink}
            disabled={loading || selectedVideoIds.length === 0}
          >
            {loading ? "Please wait…" : "Generate 48-hour link"}
          </button>

          {generatedLink && (
            <div style={styles.shareCard}>
              <h3>Generated share link</h3>
              <p style={styles.muted}>
                Share this URL with the intended viewer. It contains a private
                access token.
              </p>

              <input
                readOnly
                aria-label="Generated share URL"
                value={generatedLink}
                style={styles.input}
                onFocus={(event) => event.target.select()}
              />

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginTop: "12px",
                }}
              >
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={() => handleCopyLink(generatedLink)}
                >
                  Copy link
                </button>

                <button
                  type="button"
                  style={styles.secondaryButton}
                  disabled={loading || !generatedShareLinkId}
                  onClick={() => handleRevokeLink(generatedShareLinkId)}
                >
                  Revoke link
                </button>
              </div>
            </div>
          )}
        </section>

        <section style={styles.card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <h2>Saved videos ({videos.length})</h2>
            <button
              type="button"
              style={styles.secondaryButton}
              onClick={loadDashboard}
              disabled={loading}
            >
              Refresh
            </button>
          </div>

          {videos.length === 0 ? (
            <p style={styles.muted}>No videos saved yet.</p>
          ) : (
            videos.map((video) => {
              const category = categories.find(
                (item) => item.id === video.category_id
              );

              return (
                <article key={video.id} style={styles.item}>
                  <strong>{video.title}</strong>
                  <p style={styles.muted}>
                    Folder: {category?.name || "Uncategorized"}
                  </p>

                  {video.description && (
                    <p style={styles.muted}>{video.description}</p>
                  )}

                  {video.drive_url && (
                    <p>
                      <a
                        href={video.drive_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#c5a46d" }}
                      >
                        Open Google Drive link
                      </a>
                    </p>
                  )}

                  <small style={{ color: "#888" }}>
                    Added {new Date(video.created_at).toLocaleString()}
                  </small>

                  <div style={{ marginTop: "14px" }}>
                    <button
                      type="button"
                      style={styles.secondaryButton}
                      disabled={loading}
                      onClick={() => handleDelete(video)}
                    >
                      Delete video record
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </section>

        <section style={styles.card}>
          <h2>Share-link records</h2>
          <p style={styles.muted}>
            These are the link records currently returned by your database.
            A secret URL cannot be reconstructed after a page refresh because
            only its token hash is stored.
          </p>

          {shareLinks.length === 0 ? (
            <p style={styles.muted}>No share-link records found.</p>
          ) : (
            shareLinks.map((link) => {
              const category = categories.find(
                (item) => item.id === link.category_id
              );
              const status = getLinkStatus(link);

              return (
                <article key={link.id} style={styles.item}>
                  <strong>{category?.name || "Portfolio folder"}</strong>
                  <p>
                    Status:{" "}
                    <strong
                      style={{
                        color: status === "Active" ? "#c5a46d" : "#aaa",
                      }}
                    >
                      {status}
                    </strong>
                  </p>
                  <p style={styles.muted}>
                    Expires:{" "}
                    {link.expires_at
                      ? new Date(link.expires_at).toLocaleString()
                      : "Unknown"}
                  </p>
                </article>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}
