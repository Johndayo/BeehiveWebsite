import { useEffect } from 'react';
import type { SchemaData } from '../data/seoSchema';

interface SEOComponentProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  schemaData?: SchemaData | SchemaData[];
  robots?: string;
  children?: React.ReactNode;
}

/**
 * SEO Component - Manages meta tags, canonical URLs, and structured data
 * Use this component at the page level to optimize SEO
 */
export default function SEO({
  title,
  description,
  keywords = [],
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  twitterTitle,
  twitterDescription,
  twitterImage,
  canonicalUrl = 'https://beehiveassociates.com',
  schemaData,
  robots = 'index, follow',
}: SEOComponentProps) {
  useEffect(() => {
    // Update title
    if (title) {
      document.title = title;
      updateMetaTag('og:title', ogTitle || title);
      updateMetaTag('twitter:title', twitterTitle || title);
    }

    // Update description
    if (description) {
      updateMetaTag('description', description);
      updateMetaTag('og:description', ogDescription || description);
      updateMetaTag('twitter:description', twitterDescription || description);
    }

    // Update keywords
    if (keywords.length > 0) {
      updateMetaTag('keywords', keywords.join(', '));
    }

    // Update OG image
    if (ogImage) {
      updateMetaTag('og:image', ogImage);
      updateMetaTag('twitter:image', twitterImage || ogImage);
      updateMetaTag('og:image:width', '1200');
      updateMetaTag('og:image:height', '630');
    }

    // Update OG URL
    if (ogUrl) {
      updateMetaTag('og:url', ogUrl);
    }

    // Update robots
    updateMetaTag('robots', robots);

    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Add structured data (JSON-LD)
    if (schemaData) {
      addStructuredData(schemaData);
    }
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, ogUrl, twitterTitle, twitterDescription, twitterImage, canonicalUrl, schemaData, robots]);

  return null;
}

/**
 * Helper function to update or create meta tags
 */
function updateMetaTag(name: string, content: string): void {
  let tag = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    const isProperty = name.startsWith('og:') || name.startsWith('twitter:');
    if (isProperty) {
      tag.setAttribute('property', name);
    } else {
      tag.setAttribute('name', name);
    }
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

/**
 * Helper function to add JSON-LD structured data
 */
function addStructuredData(data: SchemaData | SchemaData[]): void {
  const dataArray = Array.isArray(data) ? data : [data];
  
  // Remove existing schema.org scripts
  const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
  existingScripts.forEach(script => {
    if (script.innerHTML.includes('"@context"')) {
      script.remove();
    }
  });

  // Add new schema.org scripts
  dataArray.forEach(schemaItem => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(schemaItem);
    document.head.appendChild(script);
  });
}

/**
 * Hook to easily set SEO for a page
 */
export function useSEO(seoProps: SEOComponentProps) {
  useEffect(() => {
    const seoComponent = <SEO {...seoProps} />;
    // Component handles updates via its own useEffect
  }, [seoProps]);
}
