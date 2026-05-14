/**
 * SEO Schema Data for JSON-LD Structured Data
 * Provides semantic markup for search engines
 */

export interface SchemaData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

// Organization Schema
export const organizationSchema: SchemaData = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Beehive Associates',
  url: 'https://beehiveassociates.com',
  logo: 'https://beehiveassociates.com/Horizontal_Logo.png',
  description: 'Institutional Capacity Building & Strategic Advisory Services - Strategic consulting, management consulting, and organizational development for governments, corporates, and development organizations',
  image: 'https://beehiveassociates.com/Horizontal_Logo.png',
  alternateName: 'Beehive Associates Consulting',
  sameAs: [
    'https://www.linkedin.com/company/beehive-associates',
    'https://twitter.com/beehiveassoc',
  ],
  areaServed: [
    { '@type': 'Country', name: 'Nigeria' },
    { '@type': 'Country', name: 'United Kingdom' },
    { '@type': 'Country', name: 'United States' },
    { '@type': 'Country', name: 'United Arab Emirates' },
    { '@type': 'Country', name: 'South Africa' },
  ],
  serviceType: [
    'Strategic Consulting',
    'Management Consulting',
    'Organizational Development',
    'Institutional Capacity Building',
    'Training & Development',
    'Advisory Services',
    'Business Transformation',
  ],
  priceRange: 'Contact for pricing',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Business Development',
    telephone: '+234-XXX-XXXX-XXX',
    email: 'info@beehiveassociates.com',
  },
  founder: {
    '@type': 'Organization',
    name: 'Beehive Associates',
  },
  foundingDate: '2015',
  knowsAbout: [
    'Business Consulting',
    'Strategic Planning',
    'Operational Excellence',
    'Management Consulting',
    'Business Transformation',
    'Organizational Development',
    'Professional Advisory Services',
  ],
};

// Breadcrumb Schema
export function createBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// FAQSchema for common consulting questions
export const faqSchema: SchemaData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What consulting services does Beehive Associates offer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Beehive Associates provides strategic consulting, management consulting, institutional capacity building, organizational development, and professional advisory services to governments, corporates, and development organizations.',
      },
    },
    {
      '@type': 'Question',
      name: 'What industries does Beehive Associates serve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We serve government agencies, private corporations, development organizations, and public institutions across multiple sectors including public sector reform, governance, and organizational transformation.',
      },
    },
    {
      '@type': 'Question',
      name: 'In which countries does Beehive Associates operate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We provide consulting services in Nigeria, United Kingdom, United States, United Arab Emirates, and South Africa.',
      },
    },
    {
      '@type': 'Question',
      name: 'How can I request a consultation?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can request a consultation by filling out our consultation form on our website or contacting us directly through our contact information.',
      },
    },
  ],
};

// LocalBusiness Schema
export const localBusinessSchema: SchemaData = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Beehive Associates',
  url: 'https://beehiveassociates.com',
  logo: 'https://beehiveassociates.com/Horizontal_Logo.png',
  description: 'Professional consulting services for institutional capacity building and strategic advisory',
};

// Service Schema Template
export function createServiceSchema(serviceName: string, description: string, areaServed: string[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceName,
    description: description,
    provider: {
      '@type': 'ProfessionalService',
      name: 'Beehive Associates',
      url: 'https://beehiveassociates.com',
    },
    areaServed: areaServed.map(area => ({
      '@type': 'Country',
      name: area,
    })),
  };
}

// Article/Blog Post Schema Template
export function createArticleSchema(title: string, description: string, publishDate: string, authorName: string = 'Beehive Associates') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    datePublished: publishDate,
    author: {
      '@type': 'Organization',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Beehive Associates',
      logo: {
        '@type': 'ImageObject',
        url: 'https://beehiveassociates.com/Horizontal_Logo.png',
      },
    },
  };
}
