// Universal Social Web Clipper Content Script
// Injects SPA-aware native action bar buttons on LinkedIn, X/Twitter, Instagram, and YouTube
// Extracts playable iframe embed URLs, source links, high-res images, and auto-tags

console.log("PromptMemory: Universal Social Web Clipper (SPA-Aware Media Hub) loaded.");

// Inject CSS styles for the clipper button with Native Platform Matching
const styleEl = document.createElement('style');
styleEl.textContent = `
  .pm-social-clip-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(24, 24, 27, 0.9);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(139, 92, 246, 0.4);
    border-radius: 9999px;
    color: #f4f4f5;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    z-index: 10000;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    line-height: 1;
    text-decoration: none;
    user-select: none;
    white-space: nowrap;
    margin-left: 6px;
    margin-right: 6px;
  }
  .pm-social-clip-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }
  .pm-social-clip-btn:active {
    transform: translateY(0) scale(0.98);
  }

  /* 💼 LinkedIn Native Matching */
  .pm-social-clip-btn.pm-btn-linkedin {
    background: transparent;
    color: #0a66c2;
    border: 1.5px solid #0a66c2;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 600;
    padding: 6px 14px;
    box-shadow: none;
    font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  .pm-social-clip-btn.pm-btn-linkedin:hover {
    background: rgba(10, 102, 194, 0.08);
    border-color: #004182;
    color: #004182;
  }
  @media (prefers-color-scheme: dark) {
    .pm-social-clip-btn.pm-btn-linkedin {
      color: #70b5f9;
      border-color: #70b5f9;
    }
    .pm-social-clip-btn.pm-btn-linkedin:hover {
      background: rgba(112, 181, 249, 0.1);
      border-color: #93c5fd;
      color: #93c5fd;
    }
  }

  /* 🐦 X / Twitter Native Matching */
  .pm-social-clip-btn.pm-btn-twitter {
    background: transparent;
    color: #0f1419;
    border: 1px solid rgba(15, 20, 25, 0.3);
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 700;
    padding: 6px 14px;
    box-shadow: none;
    font-family: "TwitterChirp", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    .pm-social-clip-btn.pm-btn-twitter {
      color: rgb(239, 243, 244);
      border-color: rgba(239, 243, 244, 0.3);
    }
  }
  .pm-social-clip-btn.pm-btn-twitter:hover {
    background: rgba(15, 20, 25, 0.1);
  }
  @media (prefers-color-scheme: dark) {
    .pm-social-clip-btn.pm-btn-twitter:hover {
      background: rgba(239, 243, 244, 0.1);
      border-color: rgb(239, 243, 244);
    }
  }

  /* 📸 Instagram Native & Reel Matching (Contrasting Pill with Visible Text) */
  #pm-inject-btn.pm-btn-instagram, .pm-social-clip-btn.pm-btn-instagram {
    background: linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%) !important;
    color: #ffffff !important;
    border: 2px solid rgba(255, 255, 255, 0.4) !important;
    border-radius: 20px !important;
    padding: 6px 16px !important;
    margin: 0 6px !important;
    box-shadow: 0 4px 14px rgba(220, 39, 67, 0.45) !important;
    width: auto !important;
    height: 36px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 6px !important;
    cursor: pointer !important;
    font-size: 13px !important;
    font-weight: bold !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    white-space: nowrap !important;
    z-index: 100000 !important;
  }
  #pm-inject-btn.pm-btn-instagram *, .pm-social-clip-btn.pm-btn-instagram * {
    color: #ffffff !important;
    font-weight: bold !important;
  }
  @media (prefers-color-scheme: dark), html[dark], [dark] {
    #pm-inject-btn.pm-btn-instagram, .pm-social-clip-btn.pm-btn-instagram {
      color: #ffffff !important;
      background: linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%) !important;
      border-color: rgba(255, 255, 255, 0.5) !important;
    }
  }
  #pm-inject-btn.pm-btn-instagram:hover, .pm-social-clip-btn.pm-btn-instagram:hover {
    transform: translateY(-1px) scale(1.04) !important;
    box-shadow: 0 6px 18px rgba(220, 39, 67, 0.65) !important;
  }
  #pm-inject-btn.pm-btn-instagram svg.pm-ig-icon, .pm-social-clip-btn.pm-btn-instagram svg.pm-ig-icon {
    width: 18px;
    height: 18px;
    stroke: #ffffff !important;
    fill: none;
  }

  /* 📱 YouTube Shorts Native Matching */
  #pm-inject-btn.pm-shorts-btn, .pm-social-clip-btn.pm-shorts-btn {
    width: 48px !important;
    height: 48px !important;
    border-radius: 50% !important;
    background-color: #e50914 !important;
    color: #ffffff !important;
    border: 2px solid rgba(255, 255, 255, 0.3) !important;
    box-shadow: 0 4px 12px rgba(229, 9, 20, 0.5) !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    margin-top: 16px !important;
    cursor: pointer !important;
    padding: 0 !important;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  }
  #pm-inject-btn.pm-shorts-btn:hover, .pm-social-clip-btn.pm-shorts-btn:hover {
    background-color: #ff0a16 !important;
    transform: scale(1.08) !important;
    box-shadow: 0 6px 16px rgba(229, 9, 20, 0.7) !important;
  }
  #pm-inject-btn.pm-shorts-btn svg, .pm-social-clip-btn.pm-shorts-btn svg {
    width: 24px !important;
    height: 24px !important;
    stroke: #ffffff !important;
    fill: none;
  }
  #pm-inject-btn.pm-btn-instagram.pm-ig-reel, .pm-social-clip-btn.pm-btn-instagram.pm-ig-reel {
    margin: 8px 0 !important;
    display: flex !important;
  }

  /* 📺 YouTube Watch & Shorts Native Matching */
  #pm-inject-btn.pm-btn-youtube, .pm-social-clip-btn.pm-btn-youtube {
    background-color: #e50914 !important;
    color: #ffffff !important;
    border: 2px solid rgba(255, 255, 255, 0.3) !important;
    border-radius: 20px !important;
    font-size: 14px !important;
    font-weight: bold !important;
    height: 36px !important;
    padding: 0 16px !important;
    box-shadow: 0 4px 12px rgba(229, 9, 20, 0.4) !important;
    font-family: "Roboto", "Arial", sans-serif !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 6px !important;
    margin-left: 8px !important;
    cursor: pointer !important;
  }
  #pm-inject-btn.pm-btn-youtube *, .pm-social-clip-btn.pm-btn-youtube * {
    color: #ffffff !important;
    font-weight: bold !important;
  }
  html[dark] #pm-inject-btn.pm-btn-youtube,
  [dark] #pm-inject-btn.pm-btn-youtube,
  @media (prefers-color-scheme: dark) {
    #pm-inject-btn.pm-btn-youtube, .pm-social-clip-btn.pm-btn-youtube {
      background-color: #e50914 !important;
      color: #ffffff !important;
    }
  }
  #pm-inject-btn.pm-btn-youtube:hover, .pm-social-clip-btn.pm-btn-youtube:hover {
    background-color: #ff0a16 !important;
    border-color: #ffffff !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 6px 16px rgba(229, 9, 20, 0.6) !important;
  }
  html[dark] #pm-inject-btn.pm-btn-youtube:hover,
  [dark] #pm-inject-btn.pm-btn-youtube:hover {
    background-color: #ff0a16 !important;
  }

  /* Status Overrides */
  #pm-inject-btn.pm-saving, .pm-social-clip-btn.pm-saving {
    background-color: rgba(99, 102, 241, 0.95) !important;
    border-color: #6366f1 !important;
    color: #fff !important;
    cursor: wait !important;
  }
  #pm-inject-btn.pm-btn-instagram.pm-saving, .pm-social-clip-btn.pm-btn-instagram.pm-saving {
    background-color: rgba(99, 102, 241, 0.95) !important;
    color: #fff !important;
  }
  #pm-inject-btn.pm-saved, .pm-social-clip-btn.pm-saved {
    background-color: rgba(16, 185, 129, 0.95) !important;
    border-color: #10b981 !important;
    color: #fff !important;
  }
  #pm-inject-btn.pm-btn-instagram.pm-saved, .pm-social-clip-btn.pm-btn-instagram.pm-saved {
    background-color: rgba(16, 185, 129, 0.95) !important;
    color: #fff !important;
  }
  #pm-inject-btn.pm-error, .pm-social-clip-btn.pm-error {
    background-color: rgba(239, 68, 68, 0.95) !important;
    border-color: #ef4444 !important;
    color: #fff !important;
  }
  #pm-inject-btn.pm-btn-instagram.pm-error, .pm-social-clip-btn.pm-btn-instagram.pm-error {
    background-color: rgba(239, 68, 68, 0.95) !important;
    color: #fff !important;
  }
  .pm-clipper-wrapper {
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
    z-index: 10000;
  }
`;
document.head.appendChild(styleEl);

function getPlatform(): string {
  const host = window.location.hostname.toLowerCase();
  if (host.includes('linkedin')) return 'linkedin';
  if (host.includes('twitter') || host.includes('x.com')) return 'twitter';
  if (host.includes('instagram')) return 'instagram';
  if (host.includes('youtube')) return 'youtube';
  return 'web';
}

function getNativeActionSelectors(platform: string): string[] {
  switch (platform) {
    case 'youtube':
      return [
        '#top-level-buttons-computed',
        'ytd-menu-renderer #top-level-buttons-computed',
        '#actions ytd-menu-renderer',
        '#actions.ytd-watch-metadata',
        '#top-row #actions #top-level-buttons-computed',
        '#owner-and-teaser #actions #top-level-buttons-computed',
        'ytd-watch-metadata #actions',
        'ytd-watch-flexy #actions #top-level-buttons-computed'
      ];
    case 'instagram':
      // Handled explicitly via native Save/Bookmark SVG targeting in injectClipperButtons
      return [];
    case 'twitter':
      return [
        'article[data-testid="tweet"] [role="group"]',
        '[data-testid="tweet"] [role="group"]'
      ];
    case 'linkedin':
      return [
        '.feed-shared-social-action-bar',
        '.feed-shared-update-v2__action-bar',
        '.social-details-social-activity'
      ];
    default:
      return ['article'];
  }
}

function showClipperToast(message: string, type: 'info' | 'success' | 'error') {
  let container = document.getElementById('pm-clipper-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'pm-clipper-toast-container';
    container.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bgColors = {
    info: 'rgba(99, 102, 241, 0.95)',
    success: 'rgba(16, 185, 129, 0.95)',
    error: 'rgba(239, 68, 68, 0.95)'
  };
  const icons = {
    info: '⏳',
    success: '✅',
    error: '❌'
  };

  toast.style.cssText = `
    background: ${bgColors[type]};
    color: white;
    padding: 12px 18px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    gap: 10px;
    transform: translateY(20px);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: auto;
  `;
  toast.innerHTML = `<span style="font-size: 16px;">${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  });

  setTimeout(() => {
    toast.style.transform = 'translateY(10px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, type === 'info' ? 1500 : 3500);

  return toast;
}

function extractMediaAndEmbed(container: HTMLElement, platform: string): { 
  text: string; 
  imageUrl: string | null;
  embedUrl: string | null;
  sourceLink: string;
  tags: string[];
} {
  try {
    let bestText = '';
    let imageUrl: string | null = null;
    let embedUrl: string | null = null;
    const currentUrl = window.location.href;
    let sourceLink: string = currentUrl;
    const tags: string[] = ['#Media'];

    // 1. YouTube Precision Extraction
    if (platform === 'youtube') {
      tags.push('#YouTube', '#Video');
      let videoId: string | null = null;
      const urlParams = new URLSearchParams(window.location.search);
      videoId = urlParams.get('v');

      if (!videoId && currentUrl.includes('/shorts/')) {
        tags.push('#Short', '#Vertical');
        const match = currentUrl.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
        if (match) videoId = match[1];
      }

      if (!videoId) {
        const link = container.querySelector('a[href*="watch?v="], a[href*="/shorts/"]');
        if (link) {
          const href = link.getAttribute('href') || '';
          const vMatch = href.match(/watch\?v=([a-zA-Z0-9_-]+)/);
          const sMatch = href.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
          if (vMatch) { videoId = vMatch[1]; }
          else if (sMatch) { videoId = sMatch[1]; tags.push('#Short', '#Vertical'); }
        }
      }

      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
        imageUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        sourceLink = currentUrl.includes('watch?v=') || currentUrl.includes('/shorts/') ? currentUrl : `https://www.youtube.com/watch?v=${videoId}`;
      }

      const titleEl = document.querySelector('h1.ytd-watch-metadata, h1.title, ytd-video-primary-info-renderer h1');
      if (titleEl && titleEl.textContent?.trim()) {
        bestText = titleEl.textContent.trim();
      } else if (document.title) {
        bestText = document.title.replace(' - YouTube', '').trim();
      }
      if (!bestText) bestText = `YouTube Video (${videoId || 'Clip'})`;
      
      return { text: bestText, imageUrl, embedUrl, sourceLink, tags: Array.from(new Set(tags)) };
    }

    // 2. Instagram Robust Extraction with Strict Try/Catch & Fallbacks
    if (platform === 'instagram') {
      tags.push('#Instagram', '#Social');
      try {
        let postCode: string | null = null;

        if (currentUrl.includes('/p/') || currentUrl.includes('/reel/') || currentUrl.includes('/reels/')) {
          if (currentUrl.includes('/reel')) tags.push('#Reel', '#Video');
          else tags.push('#Post', '#Photo');
          const match = currentUrl.match(/\/(?:p|reel|reels)\/([a-zA-Z0-9_-]+)/);
          if (match) postCode = match[1];
        } else {
          const link = container.querySelector('a[href*="/p/"], a[href*="/reel/"], a[href*="/reels/"]');
          if (link) {
            const href = link.getAttribute('href') || '';
            if (href.includes('/reel')) tags.push('#Reel', '#Video');
            else tags.push('#Post', '#Photo');
            const match = href.match(/\/(?:p|reel|reels)\/([a-zA-Z0-9_-]+)/);
            if (match) {
              postCode = match[1];
              sourceLink = `https://www.instagram.com${href.startsWith('/') ? href : '/' + href}`;
            }
          }
        }

        if (postCode) {
          embedUrl = `https://www.instagram.com/p/${postCode}/embed/`;
          if (!sourceLink.includes(postCode)) {
            sourceLink = `https://www.instagram.com/p/${postCode}/`;
          }
        } else {
          sourceLink = window.location.href;
        }

        const video = container.querySelector('video');
        if (video) {
          if (video.poster) imageUrl = video.poster;
          else if (video.src && !video.src.startsWith('blob:')) imageUrl = video.src;
          tags.push('#Video');
        }

        if (!imageUrl) {
          const images = Array.from(container.querySelectorAll('img'));
          let maxArea = -1;
          for (const img of images) {
            const src = img.src || img.getAttribute('data-src') || img.getAttribute('srcset')?.split(' ')[0] || '';
            if (!src || src.startsWith('data:') || src.includes('profile') || src.includes('avatar') || src.includes('icon') || src.includes('logo')) continue;
            const rect = img.getBoundingClientRect();
            const area = (img.naturalWidth || rect.width || 0) * (img.naturalHeight || rect.height || 0);
            if (area > maxArea && area > 1000) {
              maxArea = area;
              imageUrl = src;
            } else if (!imageUrl && !src.includes('emoji')) {
              imageUrl = src;
            }
          }
        }

        // Strict Fallback Logic
        if (!imageUrl) {
          const ogImage = document.querySelector('meta[property="og:image"], meta[name="og:image"]')?.getAttribute('content');
          if (ogImage && !ogImage.startsWith('data:')) {
            imageUrl = ogImage;
          }
        }

        if (!sourceLink || sourceLink === 'about:blank' || !sourceLink.startsWith('http')) {
          sourceLink = window.location.href;
        }

        const captionEl = container.querySelector('h1, span._aacl, div._a9zs, ul._a9z6 span, article span, article h1');
        if (captionEl && captionEl.textContent?.trim()) {
          bestText = captionEl.textContent.trim();
        } else {
          const ogTitle = document.querySelector('meta[property="og:title"], meta[name="og:title"]')?.getAttribute('content');
          bestText = ogTitle || `Instagram Media (${postCode || 'Clip'})`;
        }
      } catch (igError) {
        console.warn("PromptMemory: IG extraction error caught, falling back to safe DOM/meta attributes:", igError);
        imageUrl = document.querySelector('meta[property="og:image"], meta[name="og:image"]')?.getAttribute('content') || null;
        sourceLink = window.location.href;
        bestText = document.title || 'Instagram Media Clip';
      }

      if (imageUrl && !tags.includes('#Image') && !tags.includes('#Video') && !tags.includes('#Reel')) {
        tags.push('#Image');
      }

      return { text: bestText || 'Instagram Media Clip', imageUrl, embedUrl, sourceLink, tags: Array.from(new Set(tags)) };
    }

    // 3. Other Platforms (Twitter/X, LinkedIn, General Web)
    const clone = container.cloneNode(true) as HTMLElement;
    const injected = clone.querySelector('.pm-clipper-wrapper, .pm-social-clip-btn');
    if (injected) injected.remove();

    let maxScore = -10000;
    const candidates = Array.from(clone.querySelectorAll('p, span, h1, h2, h3, h4, div, blockquote, section'));
    for (const el of candidates) {
      const text = (el as HTMLElement).innerText?.trim() || '';
      if (text.length < 10) continue;
      if (/^(like|comment|share|reply|follow|send|save|repost|view all|more|less|verified|promote|subscribe)$/i.test(text)) continue;

      const interactiveCount = el.querySelectorAll('button, input, select, [role="button"], [role="menuitem"], nav, ul, ol').length;
      let score = text.length;
      if (['P', 'SPAN', 'H1', 'H2', 'H3', 'BLOCKQUOTE'].includes(el.tagName)) {
        score += 300;
      }
      score -= (interactiveCount * 200);

      if (score > maxScore && score < 8000) {
        maxScore = score;
        bestText = text;
      }
    }

    if (!bestText) {
      bestText = clone.innerText?.trim() || '';
    }

    bestText = bestText.replace(/\s+/g, ' ').trim();
    if (bestText.length > 1500) bestText = bestText.substring(0, 1500) + '...';
    if (!bestText) bestText = `Saved media from ${platform.toUpperCase()}`;

    if (platform === 'twitter') {
      tags.push('#Twitter', '#X', '#Post', '#Social');
      let tweetId: string | null = null;

      if (currentUrl.includes('/status/')) {
        const match = currentUrl.match(/\/status\/([0-9]+)/);
        if (match) tweetId = match[1];
      } else {
        const link = container.querySelector('a[href*="/status/"]');
        if (link) {
          const href = link.getAttribute('href') || '';
          const match = href.match(/\/status\/([0-9]+)/);
          if (match) {
            tweetId = match[1];
            sourceLink = `https://x.com${href.startsWith('/') ? href : '/' + href}`;
          }
        }
      }

      if (tweetId) {
        embedUrl = `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}`;
        if (!sourceLink.includes(tweetId)) {
          sourceLink = `https://x.com/i/status/${tweetId}`;
        }
      }
    } else if (platform === 'linkedin') {
      tags.push('#LinkedIn', '#Professional', '#Post');
      const link = container.querySelector('a[href*="/posts/"], a[href*="/activity/"]');
      if (link) {
        const href = link.getAttribute('href') || '';
        if (href.startsWith('http')) sourceLink = href;
        else sourceLink = `https://www.linkedin.com${href.startsWith('/') ? href : '/' + href}`;
      }
    }

    if (!imageUrl) {
      const images = Array.from(container.querySelectorAll('img'));
      let maxArea = -1;

      for (const img of images) {
        const src = img.src || img.getAttribute('data-src') || img.getAttribute('srcset')?.split(' ')[0] || '';
        if (!src || src.startsWith('data:') || src.includes('emoji') || src.includes('profile') || src.includes('avatar') || src.includes('icon') || src.includes('logo')) {
          continue;
        }
        const rect = img.getBoundingClientRect();
        const width = img.naturalWidth || img.width || rect.width || 0;
        const height = img.naturalHeight || img.height || rect.height || 0;
        const area = width * height;

        if (area > maxArea && (width >= 100 || height >= 100 || area === 0)) {
          maxArea = area;
          imageUrl = src;
        } else if (!imageUrl) {
          imageUrl = src;
        }
      }
    }

    if (!imageUrl) {
      const video = container.querySelector('video');
      if (video && video.poster) {
        imageUrl = video.poster;
        tags.push('#Video');
      }
    }

    if (!imageUrl) {
      const ogImage = document.querySelector('meta[property="og:image"], meta[name="og:image"], meta[property="twitter:image"], meta[name="twitter:image"]')?.getAttribute('content');
      if (ogImage && !ogImage.startsWith('data:')) {
        imageUrl = ogImage;
      }
    }

    if (imageUrl && !tags.includes('#Image') && !tags.includes('#Video') && !tags.includes('#Reel')) {
      tags.push('#Image');
    }

    return { text: bestText, imageUrl, embedUrl, sourceLink, tags: Array.from(new Set(tags)) };
  } catch (globalErr) {
    console.warn("PromptMemory: Universal extraction error caught, returning safe meta fallback:", globalErr);
    const ogImage = document.querySelector('meta[property="og:image"], meta[name="og:image"], meta[property="twitter:image"]')?.getAttribute('content') || null;
    return {
      text: document.title || `Saved media from ${platform.toUpperCase()}`,
      imageUrl: ogImage,
      embedUrl: null,
      sourceLink: window.location.href,
      tags: ['#Media', `#${platform.charAt(0).toUpperCase() + platform.slice(1)}`, '#Clip']
    };
  }
}

const BOOKMARK_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`;
const PM_LOGO_ICON_SVG = `<svg width="24" height="24" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pm-ig-icon"><path d="M8 22V12C8 10.3431 9.34315 9 11 9C12.6569 9 14 10.3431 14 12V18L16 15L18 18V12C18 10.3431 19.3431 9 21 9C22.6569 9 24 10.3431 24 12V22"></path><circle cx="16" cy="11" r="2.5" fill="currentColor"></circle></svg>`;

// Async polling helper: waits for a CSS selector to appear in the DOM
// before firing the callback. SPA frameworks (IG, YT) render action bars
// asynchronously — this prevents null references from firing too early.
function pollForElement(
  selector: string,
  callback: (el: Element) => void,
  intervalMs = 500,
  maxAttempts = 20
) {
  let attempts = 0;
  const timer = setInterval(() => {
    attempts++;
    const el = document.querySelector(selector);
    if (el) {
      clearInterval(timer);
      callback(el);
    } else if (attempts >= maxAttempts) {
      clearInterval(timer);
      console.log(`PromptMemory: pollForElement gave up after ${maxAttempts} attempts for: ${selector.substring(0, 80)}`);
    }
  }, intervalMs);
}

function injectClipperButtons() {
  const platform = getPlatform();

  // 📸 Instagram — Direct Polling Injection with Visible Text & Styling
  if (platform === 'instagram') {
    const allBookmarks = document.querySelectorAll('svg[aria-label="Save"], svg[aria-label="Remove"], svg[aria-label*="Save" i], svg[aria-label*="Bookmark" i], [role="button"] svg[aria-label*="Save" i], [role="button"] svg[aria-label*="Bookmark" i]');
    allBookmarks.forEach((svg) => {
      const isArticle = svg.closest('article') || svg.closest('[role="article"]');
      const isModal = svg.closest('div[role="dialog"], div[role="presentation"]');
      if (!isArticle && !isModal && !window.location.pathname.includes('/reel')) return;

      const actionSection = svg.closest('section') || svg.closest('div[role="group"]') || svg.parentElement?.parentElement?.parentElement;
      if (!actionSection) return;
      if (actionSection.querySelector('.pm-btn-instagram')) return;

      let leftGroup: Element | null = null;
      for (const child of Array.from(actionSection.children)) {
        if (!child.contains(svg)) {
          leftGroup = child;
          break;
        }
      }

      if (!leftGroup) {
        const saveWrapper = svg.closest('button') || svg.closest('[role="button"]') || svg.parentElement?.parentElement || svg.parentElement;
        if (saveWrapper && saveWrapper.parentElement) {
          leftGroup = saveWrapper.parentElement;
        }
      }
      if (!leftGroup) return;

      const btn = document.createElement('button');
      btn.id = 'pm-inject-btn';
      btn.className = 'pm-social-clip-btn pm-btn-instagram';
      btn.title = 'Save to PromptMemory Vault';
      btn.innerHTML = `${PM_LOGO_ICON_SVG}<span>Save to PM</span>`;

      btn.addEventListener('click', async (e) => {
        e.stopPropagation(); e.preventDefault();
        if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
          alert("PromptMemory Extension updated. Please refresh this page to continue saving.");
          return;
        }
        if (btn.classList.contains('pm-saving')) return;
        btn.classList.add('pm-saving'); btn.innerHTML = `<span>⏳</span><span>Saving...</span>`;
        const infoToast = showClipperToast("Saving Playable Media to PromptMemory...", 'info');
        try {
          const targetContainer = actionSection.closest('article') || actionSection.closest('[role="article"]') || actionSection.closest('div[role="dialog"], div[role="presentation"]') || actionSection.closest('section') || document.body;
          const { text, imageUrl, embedUrl, sourceLink, tags } = extractMediaAndEmbed(targetContainer as HTMLElement, platform);
          const response = await new Promise<any>((resolve) => {
            if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
              resolve({ success: false, error: "Extension updated. Please refresh page." });
              return;
            }
            chrome.runtime.sendMessage({
              action: 'SAVE_PROMPT',
              payload: { platform: platform, content: text, image_url: imageUrl, embed_url: embedUrl, source_link: sourceLink, tags: tags, category: 'Social Clip' }
            }, (res) => {
              if (chrome.runtime.lastError) resolve({ success: false, error: chrome.runtime.lastError.message });
              else resolve(res || { success: true });
            });
          });
          if (infoToast && infoToast.parentNode) infoToast.remove();
          if (response && response.success) {
            btn.classList.remove('pm-saving'); btn.classList.add('pm-saved'); btn.innerHTML = `<span>✅</span><span>Saved!</span>`;
            showClipperToast("Saved to Media Hub! Playable embed ready in PromptMemory.", 'success');
            setTimeout(() => { btn.classList.remove('pm-saved'); btn.innerHTML = `${PM_LOGO_ICON_SVG}<span>Save to PM</span>`; }, 2500);
          } else throw new Error(response?.error || "Failed to save clip.");
        } catch (err: any) {
          if (infoToast && infoToast.parentNode) infoToast.remove();
          btn.classList.remove('pm-saving'); btn.classList.add('pm-error'); btn.innerHTML = `<span>❌</span><span>Error</span>`;
          showClipperToast("Error: " + (err.message || 'Could not save clip.'), 'error');
          setTimeout(() => { btn.classList.remove('pm-error'); btn.innerHTML = `${PM_LOGO_ICON_SVG}<span>Save to PM</span>`; }, 3000);
        }
      });
      leftGroup.appendChild(btn);
    });
    return;
  }

  // 📱 YouTube Shorts — Async Polling Injection (Vertical Action Bar)
  if (platform === 'youtube' && window.location.pathname.includes('/shorts/')) {
    const shortsSelectors = [
      'ytd-reel-video-renderer #actions',
      'ytd-reel-video-renderer[is-active] #actions',
      'ytd-reel-player-overlay-renderer #actions',
      '#actions.ytd-reel-player-overlay-renderer',
      'ytd-shorts #actions',
      '#shorts-container #actions',
      '#shorts-inner-container #actions'
    ].join(', ');

    // Poll for the Shorts action bar to render
    pollForElement(
      shortsSelectors,
      () => {
        let shortsActionsList = Array.from(document.querySelectorAll(shortsSelectors));

        if (shortsActionsList.length === 0) {
          document.querySelectorAll('#actions').forEach(el => {
            if (el.closest('ytd-reel-video-renderer') || el.closest('ytd-shorts') || el.closest('[is-active]')) {
              shortsActionsList.push(el);
            }
          });
        }

        if (shortsActionsList.length === 0) {
          const likeBtn = document.querySelector('ytd-reel-video-renderer #like-button, ytd-reel-video-renderer ytd-like-button-renderer, ytd-reel-video-renderer ytd-toggle-button-renderer');
          if (likeBtn) {
            const actionsParent = likeBtn.closest('#actions');
            if (actionsParent) shortsActionsList.push(actionsParent);
          }
        }

        shortsActionsList.forEach((actionsContainer) => {
          if (actionsContainer.querySelector('.pm-shorts-btn')) return;

          const btn = document.createElement('button');
          btn.id = 'pm-inject-btn';
          btn.className = 'pm-social-clip-btn pm-shorts-btn';
          btn.title = 'Save Short to PromptMemory Hub';
          btn.innerHTML = PM_LOGO_ICON_SVG;

          btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (btn.classList.contains('pm-saving')) return;
            btn.classList.add('pm-saving');
            btn.innerHTML = `<span style="font-size: 16px;">⏳</span>`;

            const infoToast = showClipperToast("Saving YouTube Short to PromptMemory...", 'info');
            try {
              const reelContainer = actionsContainer.closest('ytd-reel-video-renderer, ytd-shorts, ytd-player, ytd-watch-flexy') || document.body;
              const href = window.location.href;
              let videoId = '';
              const match = href.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
              if (match) videoId = match[1];

              const titleEl = reelContainer.querySelector('h2, .title, #video-title');
              const titleText = titleEl?.textContent?.trim() || document.title || 'YouTube Short';
              const imageUrl = videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : null;
              const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;

              const response = await new Promise<any>((resolve) => {
                if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
                  resolve({ success: false, error: "Extension updated. Please refresh page." });
                  return;
                }
                chrome.runtime.sendMessage({
                  action: 'SAVE_PROMPT',
                  payload: {
                    platform: 'youtube',
                    content: titleText,
                    image_url: imageUrl,
                    embed_url: embedUrl,
                    source_link: href,
                    tags: ['#YouTube', '#Short', '#Video', '#Vertical'],
                    category: 'Social Clip'
                  }
                }, (res) => {
                  if (chrome.runtime.lastError) resolve({ success: false, error: chrome.runtime.lastError.message });
                  else resolve(res || { success: true });
                });
              });

              if (infoToast && infoToast.parentNode) infoToast.remove();
              if (response && response.success) {
                btn.classList.remove('pm-saving');
                btn.classList.add('pm-saved');
                btn.innerHTML = `<span style="font-size: 16px;">✅</span>`;
                showClipperToast("Saved YouTube Short to Media Hub!", 'success');
                setTimeout(() => {
                  btn.classList.remove('pm-saved');
                  btn.innerHTML = PM_LOGO_ICON_SVG;
                }, 2500);
              } else {
                throw new Error(response?.error || 'Failed to save Short.');
              }
            } catch (err: any) {
              if (infoToast && infoToast.parentNode) infoToast.remove();
              btn.classList.remove('pm-saving');
              btn.classList.add('pm-error');
              btn.innerHTML = `<span style="font-size: 16px;">❌</span>`;
              showClipperToast("Error: " + (err.message || 'Failed to save Short'), 'error');
              setTimeout(() => {
                btn.classList.remove('pm-error');
                btn.innerHTML = PM_LOGO_ICON_SVG;
              }, 3000);
            }
          });

          actionsContainer.insertBefore(btn, actionsContainer.children[1] || actionsContainer.firstChild);
        });
      },
      500, 20 // Poll every 500ms, up to 20 attempts (10 seconds)
    );
    return; // STOP! Never run general action bar injection on Shorts!
  }

  // General Platform Action Bar Injection (YouTube, X/Twitter, LinkedIn)
  if (platform === 'instagram' || (platform === 'youtube' && window.location.pathname.includes('/shorts/'))) {
    return;
  }
  const selectors = getNativeActionSelectors(platform);
  const selectorStr = selectors.join(', ');

  const actionBars = document.querySelectorAll(selectorStr);
  actionBars.forEach((element) => {
    const actionBar = element as HTMLElement;
    if (actionBar.querySelector('#pm-save-btn') || actionBar.querySelector('.pm-clipper-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'pm-clipper-wrapper';

    const btn = document.createElement('button');
    btn.id = 'pm-inject-btn';
    btn.className = `pm-social-clip-btn pm-btn-${platform}`;
    btn.innerHTML = `${BOOKMARK_SVG}<span>Save to PM</span>`;
    btn.title = 'Clip Playable Media & Text to PromptMemory Vault';

    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      e.preventDefault();

      if (btn.classList.contains('pm-saving')) return;
      btn.classList.add('pm-saving');
      btn.innerHTML = `<span>⏳</span><span>Saving...</span>`;

      const infoToast = showClipperToast("Saving Playable Media to PromptMemory...", 'info');

      try {
        const targetContainer = btn.closest('article') || 
                                btn.closest('[role="article"]') || 
                                btn.closest('ytd-watch-flexy, ytd-reel-video-renderer, ytd-video-renderer, ytd-rich-item-renderer') || 
                                btn.closest('.feed-shared-update-v2, .occludable-update, div._aabd, main section') || 
                                actionBar.closest('article, section, div[role="main"]') ||
                                document.body;

        const extractionResult = await new Promise<ReturnType<typeof extractMediaAndEmbed>>((resolve) => {
          const res = extractMediaAndEmbed(targetContainer as HTMLElement, platform);
          if (res.imageUrl || (res.embedUrl && res.embedUrl !== window.location.href) || res.text) {
            resolve(res);
          } else {
            setTimeout(() => {
              const resAfterWait = extractMediaAndEmbed(targetContainer as HTMLElement, platform);
              resolve(resAfterWait);
            }, 500);
          }
        });

        const { text, imageUrl, embedUrl, sourceLink, tags } = extractionResult;
        console.log("PM Social Clipper extracting:", { platform, text: text.substring(0, 50), imageUrl, embedUrl, sourceLink, tags });

        const response = await new Promise<any>((resolve) => {
          if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
            resolve({ success: false, error: "Extension updated. Please refresh page." });
            return;
          }
          chrome.runtime.sendMessage({
            action: 'SAVE_PROMPT',
            payload: {
              platform: platform,
              content: text,
              image_url: imageUrl,
              embed_url: embedUrl,
              source_link: sourceLink,
              tags: tags,
              category: 'Social Clip'
            }
          }, (res) => {
            if (chrome.runtime.lastError) {
              resolve({ success: false, error: chrome.runtime.lastError.message });
            } else {
              resolve(res || { success: true });
            }
          });
        });

        if (infoToast && infoToast.parentNode) infoToast.remove();

        if (response && response.success) {
          btn.classList.remove('pm-saving');
          btn.classList.add('pm-saved');
          btn.innerHTML = `<span>✅</span><span>Saved!</span>`;
          showClipperToast("Saved to Media Hub! Playable embed ready in PromptMemory.", 'success');
          setTimeout(() => {
            btn.classList.remove('pm-saved');
            btn.innerHTML = `${BOOKMARK_SVG}<span>Save to PM</span>`;
          }, 2500);
        } else {
          throw new Error(response?.error || 'Failed to save media clip.');
        }
      } catch (err: any) {
        console.error("PM Social Clipper Error:", err);
        if (infoToast && infoToast.parentNode) infoToast.remove();
        btn.classList.remove('pm-saving');
        if (err.message === 'TIMEOUT_NO_MEDIA' || err.message?.includes('TIMEOUT')) {
          btn.innerHTML = `${BOOKMARK_SVG}<span>Save to PM</span>`;
          showClipperToast("No media found on this page.", 'error');
          return;
        }
        btn.classList.add('pm-error');
        btn.innerHTML = `<span>❌</span><span>Error</span>`;
        showClipperToast("Error: " + (err.message || 'Could not save clip.'), 'error');
        setTimeout(() => {
          btn.classList.remove('pm-error');
          btn.innerHTML = `${BOOKMARK_SVG}<span>Save to PM</span>`;
        }, 3000);
      }
    });

    wrapper.appendChild(btn);
    actionBar.appendChild(wrapper);
  });
}

// ⚙️ YOUTUBE HOMEPAGE (3-Dots Menu) SUPPORT
let lastClickedYtCard: HTMLElement | null = null;

window.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const menuBtn = target.closest('ytd-menu-renderer, [aria-label*="Action menu" i], [aria-label*="More" i]');
  if (menuBtn) {
    const card = menuBtn.closest('ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer, ytd-playlist-video-renderer');
    if (card) {
      lastClickedYtCard = card as HTMLElement;
    }
  }
}, true);

const ytMenuObserver = new MutationObserver(() => {
  if (getPlatform() !== 'youtube') return;
  
  const popupMenus = document.querySelectorAll('ytd-menu-popup-renderer #items, ytd-menu-popup-renderer tp-yt-paper-listbox');
  popupMenus.forEach((itemsList) => {
    if (itemsList.querySelector('#pm-yt-menu-item')) return;
    if (!lastClickedYtCard) return;

    const pmMenuItem = document.createElement('div');
    pmMenuItem.id = 'pm-yt-menu-item';
    pmMenuItem.className = 'style-scope ytd-menu-service-item-renderer';
    pmMenuItem.style.cssText = 'display: flex; align-items: center; gap: 12px; padding: 10px 16px; cursor: pointer; font-family: Roboto, Arial, sans-serif; font-size: 14px; color: var(--yt-spec-text-primary, #0f0f0f); width: 100%; box-sizing: border-box; transition: background 0.2s;';
    pmMenuItem.innerHTML = `<span style="font-size: 18px;">💾</span><span style="font-weight: 500;">Save to PromptMemory</span>`;
    
    pmMenuItem.addEventListener('mouseenter', () => {
      pmMenuItem.style.background = 'var(--yt-spec-badge-chip-background, rgba(255, 255, 255, 0.1))';
    });
    pmMenuItem.addEventListener('mouseleave', () => {
      pmMenuItem.style.background = 'transparent';
    });

    pmMenuItem.addEventListener('click', async (e) => {
      e.stopPropagation();
      e.preventDefault();
      
      const infoToast = showClipperToast("Saving video from homepage to PromptMemory...", 'info');
      try {
        const aTag = lastClickedYtCard?.querySelector('a[href*="/watch?v="], a[href*="/shorts/"]');
        const href = aTag?.getAttribute('href') || '';
        let videoId = '';
        const watchMatch = href.match(/\/watch\?v=([a-zA-Z0-9_-]+)/);
        const shortsMatch = href.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
        if (watchMatch) videoId = watchMatch[1];
        else if (shortsMatch) videoId = shortsMatch[1];

        if (!videoId) throw new Error("Could not extract Video ID from card.");

        const fullUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        const imageUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
        
        const titleEl = lastClickedYtCard?.querySelector('#video-title, #title, h3, a[title]');
        const titleText = titleEl?.textContent?.trim() || titleEl?.getAttribute('title') || 'YouTube Video';

        const response = await new Promise<any>((resolve) => {
          if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
            resolve({ success: false, error: "Extension updated. Please refresh page." });
            return;
          }
          chrome.runtime.sendMessage({
            action: 'SAVE_PROMPT',
            payload: {
              platform: 'youtube',
              content: titleText,
              image_url: imageUrl,
              embed_url: embedUrl,
              source_link: fullUrl,
              tags: ['#YouTube', '#Video', '#SavedFromHome'],
              category: 'Social Clip'
            }
          }, (res) => {
                  if (chrome.runtime.lastError) resolve({ success: false, error: chrome.runtime.lastError.message });
                  else resolve(res || { success: false });
                });
        });

        if (infoToast && infoToast.parentNode) infoToast.remove();
        if (response && response.success) {
          showClipperToast("Saved YouTube Video to Media Hub!", 'success');
        } else {
          throw new Error("Failed to save clip.");
        }
      } catch (err: any) {
        if (infoToast && infoToast.parentNode) infoToast.remove();
        showClipperToast("Error: " + err.message, 'error');
      }
    });

    itemsList.insertBefore(pmMenuItem, itemsList.firstChild);
  });
});
ytMenuObserver.observe(document.body, { childList: true, subtree: true });

// Initial scan and periodic check for dynamic feeds
injectClipperButtons();
setInterval(injectClipperButtons, 1500);

// MutationObserver for instant feed loading
const observer = new MutationObserver(() => {
  injectClipperButtons();
});
observer.observe(document.body, { childList: true, subtree: true });

// SPA History Overrides (pushState, replaceState, popstate)
const originalPushState = history.pushState;
history.pushState = function (...args) {
  const result = originalPushState.apply(this, args);
  window.dispatchEvent(new Event('locationchange'));
  return result;
};

const originalReplaceState = history.replaceState;
history.replaceState = function (...args) {
  const result = originalReplaceState.apply(this, args);
  window.dispatchEvent(new Event('locationchange'));
  return result;
};

window.addEventListener('popstate', () => {
  window.dispatchEvent(new Event('locationchange'));
});

window.addEventListener('locationchange', () => {
  console.log("PM Social Clipper: SPA navigation detected, re-injecting action buttons...");
  setTimeout(injectClipperButtons, 500);
  setTimeout(injectClipperButtons, 1500);
});
