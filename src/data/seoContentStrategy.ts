/**
 * SEO Content Keywords and Recommendations for Beehive Associates
 * 
 * TARGET KEYWORDS (Organized by Intent)
 * ===================================
 * 
 * PRIMARY KEYWORDS (High Priority):
 * - business consulting
 * - strategic consulting
 * - management consulting
 * - consulting services
 * - professional advisory services
 * 
 * SECONDARY KEYWORDS (Medium Priority):
 * - business transformation
 * - operational excellence
 * - organizational development
 * - institutional capacity building
 * - strategic planning
 * 
 * LONG-TAIL KEYWORDS (Specific Intent):
 * - strategic business consulting services
 * - management consulting firms
 * - business transformation consulting
 * - organizational development services
 * - operational excellence consulting
 * - institutional capacity building consulting
 * - professional advisory for businesses
 * - C-suite consulting services
 * - executive advisory services
 * - operational improvement consulting
 * 
 * LOCATION-BASED KEYWORDS:
 * - consulting services Africa
 * - consulting services Nigeria
 * - consulting services UK
 * - consulting services USA
 * - consulting services UAE
 * - international consulting services
 * 
 * INDUSTRY-SPECIFIC KEYWORDS:
 * - public sector consulting
 * - corporate consulting
 * - government consulting
 * - development organization consulting
 * 
 */

export const SEO_KEYWORDS = {
  // Primary high-intent keywords
  primary: [
    'business consulting',
    'strategic consulting',
    'management consulting',
    'consulting services',
    'professional advisory services',
  ],
  
  // Secondary supporting keywords
  secondary: [
    'business transformation',
    'operational excellence',
    'organizational development',
    'institutional capacity building',
    'strategic planning',
    'executive advisory',
    'professional consulting',
    'organizational consulting',
  ],
  
  // Long-tail keywords with high conversion potential
  longTail: [
    'strategic business consulting services',
    'professional management consulting',
    'business transformation consulting',
    'organizational development services',
    'operational excellence consulting',
    'institutional capacity building services',
    'executive coaching and consulting',
    'C-suite consulting services',
    'strategic planning consulting',
    'organizational change management',
  ],
  
  // Geographic modifiers
  location: [
    'business consulting Africa',
    'strategic consulting Nigeria',
    'management consulting UK',
    'consulting services USA',
    'advisory services UAE',
    'consulting firm South Africa',
    'international business consulting',
  ],
};

/**
 * CONTENT RECOMMENDATIONS FOR EACH SECTION
 * ========================================
 */

export const CONTENT_STRATEGY = {
  homepage: {
    h1: 'Professional Business Consulting & Strategic Advisory Services',
    description: 'Strategic consulting, management consulting, and business transformation services for executives and organizations seeking operational excellence and sustainable growth.',
    keyPoints: [
      'Expert strategic consulting for business transformation',
      'Management consulting for operational excellence',
      'Institutional capacity building and organizational development',
      'Professional advisory services across multiple sectors',
      'Proven track record with government, corporate, and development organizations',
    ],
  },
  
  services: {
    h1: 'Business Consulting Services',
    description: 'Comprehensive consulting services including strategic planning, operational consulting, organizational development, and institutional capacity building.',
    sections: [
      {
        title: 'Strategic Consulting',
        keywords: ['strategic consulting', 'strategic planning', 'business strategy'],
        description: 'Develop long-term strategic plans and business transformation initiatives.',
      },
      {
        title: 'Management Consulting',
        keywords: ['management consulting', 'operational excellence', 'management services'],
        description: 'Optimize operations and organizational structure for maximum efficiency.',
      },
      {
        title: 'Organizational Development',
        keywords: ['organizational development', 'change management', 'team development'],
        description: 'Build high-performing teams and organizational capabilities.',
      },
      {
        title: 'Institutional Capacity Building',
        keywords: ['capacity building', 'institutional development', 'process improvement'],
        description: 'Strengthen institutional systems and deliver sustainable outcomes.',
      },
    ],
  },
  
  team: {
    h1: 'Our Consulting Team',
    description: 'Meet our experienced consultants and advisors specializing in business consulting, strategic advisory, and organizational development.',
    keyPoints: [
      'Expert consultants with deep industry experience',
      'Specialized in strategic consulting and management advisory',
      'Track record of successful business transformations',
      'Dedicated to client success and sustainable growth',
    ],
  },
  
  about: {
    h1: 'About Beehive Associates',
    description: 'Leading consulting firm providing strategic consulting, management consulting, and institutional capacity building services.',
    keyPoints: [
      'Institutional capacity building focus',
      'Strategic advisory expertise',
      'International consulting presence',
      'Client-centric approach to business consulting',
      'Proven track record across sectors',
    ],
  },
};

/**
 * INTERNAL LINKING STRATEGY
 * ========================
 * 
 * Links to include in key pages:
 * - Homepage → Services (strategic consulting, management consulting)
 * - Homepage → Team (our experienced consultants)
 * - Homepage → Consultation booking (schedule a consultation)
 * - Services → Case studies/testimonials (proof of success)
 * - Services → Consultation (book a service)
 * - Team → Services (team expertise areas)
 * - Blog/Articles → Related services
 * - Consultation → Services (what we offer)
 */

export const INTERNAL_LINKING = {
  homepage: [
    { anchor: 'View Our Services', href: '#/services', keyword: 'consulting services' },
    { anchor: 'Meet Our Team', href: '#/team', keyword: 'consulting team' },
    { anchor: 'Book a Consultation', href: '#/consultation', keyword: 'business consultation' },
  ],
  services: [
    { anchor: 'Schedule a consultation', href: '#/consultation', keyword: 'book consultation' },
    { anchor: 'Learn about our approach', href: '#/about', keyword: 'about our consulting' },
  ],
};

/**
 * METADATA OPTIMIZATION
 * ====================
 */

export const METADATA = {
  // These should be updated based on current page
  descriptions: {
    homepage: 'Award-winning consulting firm providing strategic consulting, management consulting, and business transformation services. Helping executives and organizations achieve operational excellence and sustainable growth.',
    services: 'Comprehensive business consulting services including strategic planning, operational consulting, organizational development, and institutional capacity building. Expert advisory for executives and organizations.',
    team: 'Meet our experienced consulting team - expert advisors specializing in strategic consulting, management consulting, and business transformation.',
    about: 'Beehive Associates is a leading consulting firm dedicated to institutional capacity building, strategic advisory, and helping organizations achieve sustainable growth.',
    consultation: 'Book a consultation with our expert consultants to discuss your organization\'s strategic and operational challenges. Free initial consultation available.',
  },
};

/**
 * SCHEMA.ORG RECOMMENDATIONS
 * =========================
 * 
 * Implement the following schema types:
 * - ProfessionalService (Organization level)
 * - Service (For each consulting service)
 * - LocalBusiness (For office locations)
 * - BreadcrumbList (For navigation)
 * - FAQPage (For common questions)
 * - Article (For blog posts/case studies)
 * - Person (For team members)
 */

export const SCHEMA_RECOMMENDATIONS = {
  organizationTypes: [
    'ProfessionalService',
    'LocalBusiness',
    'Organization',
  ],
  serviceTypes: [
    'Service',
  ],
  contentTypes: [
    'Article',
    'FAQPage',
    'BreadcrumbList',
  ],
  personTypes: [
    'Person',
  ],
};
