import { useState } from 'react';
import { Linkedin } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

type TeamMember = {
  name: string;
  title: string;
  bio: string;
  image: string;
  linkedin: string;
};

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Bentex Torlafia',
    title: 'IP Law Consultant & Academic',
    bio: `*BENTEX TORLAFIA* is an Intellectual Property (IP) Law expert, consultant, and academic. He holds an LLM in Intellectual Property Law with specialisations in Patent Law and Design Law from WIPO/TürkPatent/Ankara University, Turkey, and is an alumnus of the WIPO–Harvard Law School PatentX Programme. He is also an active member of the WIPO International Network for Intellectual Property Education (WINIPE).

Currently, Bentex is an accredited WIPO Academy IP Tutor and also lectures IP and Law at the Department of Public and Private Law, Faculty of Law, North-Eastern University, Gombe, Gombe State. His research interests centre on digital entertainment, business innovation, and SME development, which form the basis of his ongoing PhD-IP Law at the Faculty of Law, Nasarawa State University, Keffi-Nigeria.

Beyond academia, Bentex is a literary creative artist and the Principal Consultant at Regal Legal Consult, offering IP advisory and legal services to Innovators, creatives, and enterprises. His work with WIPO, other National and State IP offices has contributed to IP policy development, commercialisation, and technology transfer in Nigeria.

An award-winning IP influencer recognised by the JIIPCC Academy in 2024, Bentex also co-leads Nasara Creative, a literary initiative supporting Nigerian Creatives in IP awareness and protection. His work continues to bridge the intersection of Law, research, creativity, and innovation for sustainable development.

He's written and researched extensively and is also the author of a new text on IP titled *INTELLECTUAL PROPERTY NEXUS: The Definitive Guide for Students, Innovators, Entrepreneurs and Practitioners.*`,
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=640&q=80',
    linkedin: 'https://www.linkedin.com/in/bentex-torlafia-3b331465',
  },
  {
    name: 'Jummai Ilebaye Abbah',
    title: 'Business Development & Client Relations Specialist',
    bio: `A goal-driven professional with over five years of experience spanning client relationship management, business development, and corporate communication. I bring a strong ability to build and maintain productive relationships while driving organisational growth and operational excellence.

With a solid background in veterinary medicine and hands-on experience in stakeholder engagement, I have developed exceptional organisational, coordination, and problem-solving skills that translate effectively across industries, including construction and infrastructure development. I am highly skilled at managing client expectations, fostering strategic partnerships, and ensuring smooth communication between teams and stakeholders.

I provide value, optimising processes and ensuring successful project execution through discipline, attention to detail, and a firm commitment to excellence. My primary goal is to support business growth while upholding efficiency, professionalism, and long-term client satisfaction.`,
    image: '/IMG_1859.JPG',
    linkedin: 'https://www.linkedin.com/in/jummai-abbah-72047a158',
  },
];

export default function TeamPage() {
  const headingRef = useScrollReveal<HTMLDivElement>();
  const cardsRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const [expandedMembers, setExpandedMembers] = useState<Record<string, boolean>>({});

  const toggleBioExpansion = (name: string) => {
    setExpandedMembers((current) => ({ ...current, [name]: !current[name] }));
  };

  const getPreviewBio = (bio: string) => {
    const firstParagraph = bio.split('\n').find(Boolean) ?? bio;
    if (firstParagraph.length <= 280) return firstParagraph;
    return `${firstParagraph.slice(0, 280).trim()}...`;
  };

  const shouldShowReadMore = (bio: string) => {
    const firstParagraph = bio.split('\n').find(Boolean) ?? bio;
    return bio.length > firstParagraph.length + 40 || bio.includes('\n\n');
  };

  return (
    <main className="flex-1 py-16 sm:py-20 bg-stone-50">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div ref={headingRef} className="reveal-fade-up text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <p className="text-xs font-semibold text-accent-500 uppercase tracking-widest mb-3">
            Meet the team
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-950 leading-tight">
            Experienced leaders building institutional strength and performance.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-navy-600 max-w-2xl mx-auto leading-relaxed">
            Our consultants combine sector expertise, strategic insight, and practical delivery experience to support clients across governance, operations, and performance transformation.
          </p>
        </div>

        <div ref={cardsRef} className="reveal-stagger grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {TEAM_MEMBERS.map((member) => (
            <article
              key={member.name}
              className="group bg-white rounded-[2rem] border border-navy-100/60 shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <div className="relative overflow-hidden h-72 sm:h-80">
                <img
                  src={member.image}
                  alt={`Portrait of ${member.name}`}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-navy-950">{member.name}</h2>
                    <p className="mt-1 text-sm font-medium text-navy-600">{member.title}</p>
                  </div>
                  {member.linkedin ? (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-navy-900 text-white hover:bg-brand-500 transition-colors"
                      aria-label={`Open ${member.name}'s LinkedIn profile`}
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  ) : null}
                </div>

                <div className="mt-5 space-y-4 text-sm leading-relaxed text-navy-600">
                  {(expandedMembers[member.name] ? member.bio : getPreviewBio(member.bio))
                    .split('\n')
                    .filter(Boolean)
                    .map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                </div>
                {shouldShowReadMore(member.bio) ? (
                  <button
                    type="button"
                    onClick={() => toggleBioExpansion(member.name)}
                    className="mt-4 inline-flex items-center text-sm font-semibold text-brand-600 hover:text-brand-700"
                  >
                    {expandedMembers[member.name] ? 'Read less' : 'Read more'}
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>

      </div>
    </main>
  );
}
