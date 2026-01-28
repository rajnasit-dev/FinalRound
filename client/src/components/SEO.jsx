import { useEffect } from "react";

/**
 * SEO Component - Dynamically update meta tags for each page
 * Usage: <SEO title="Page Title" description="Page description" />
 */
const SEO = ({
  title = "FinalRound.Online - Sports Tournament Management",
  description = "Premier sports tournament and team management platform connecting athletes worldwide",
  keywords = "sports tournaments, team management, athlete platform",
  image = "https://finalround.online/og-image.jpg",
  url = "https://finalround.online",
  author = "FinalRound.Online",
  type = "website",
  twitterHandle = "@FinalRoundOnline",
  published = null,
  updated = null,
}) => {
  useEffect(() => {
    // Update title
    document.title = `${title} | FinalRound.Online`;

    // Update or create meta tags
    const updateMetaTag = (name, content, isProperty = false) => {
      const attribute = isProperty ? "property" : "name";
      let tag = document.querySelector(`meta[${attribute}="${name}"]`);

      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attribute, name);
        document.head.appendChild(tag);
      }

      tag.setAttribute("content", content);
    };

    // Basic SEO Meta Tags
    updateMetaTag("title", title);
    updateMetaTag("description", description);
    updateMetaTag("keywords", keywords);
    updateMetaTag("author", author);

    // Open Graph Tags
    updateMetaTag("og:type", type, true);
    updateMetaTag("og:title", title, true);
    updateMetaTag("og:description", description, true);
    updateMetaTag("og:image", image, true);
    updateMetaTag("og:url", url, true);
    updateMetaTag("og:site_name", "FinalRound.Online", true);
    updateMetaTag("og:locale", "en_US", true);

    // Twitter Card Tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", title);
    updateMetaTag("twitter:description", description);
    updateMetaTag("twitter:image", image);
    updateMetaTag("twitter:creator", twitterHandle);

    // Canonical URL
    let canonical = document.querySelector("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    // Article tags (for blog posts or news)
    if (type === "article") {
      if (published) {
        updateMetaTag("article:published_time", published, true);
      }
      if (updated) {
        updateMetaTag("article:modified_time", updated, true);
      }
    }

    // Scroll to top
    window.scrollTo(0, 0);

    return () => {
      // Cleanup if needed
    };
  }, [title, description, keywords, image, url, author, type, published, updated, twitterHandle]);

  // This component doesn't render anything, it only updates meta tags
  return null;
};

export default SEO;
