import { Linkedin } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

const TEAM_MEMBERS = [
  {
    name: 'Akintunde Adeyemi',
    title: 'Managing Partner',
    bio: 'Akintunde leads Beehive Associates with more than 18 years of experience advising governments and institutions on performance improvement, public-private partnerships, and governance reform.',
    image:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=640&q=80',
    linkedin: 'https://www.linkedin.com/in/placeholder-akintunde',
  },
  {
    name: 'Chinwe Nwosu',
    title: 'Principal Consultant',
    bio: 'Chinwe specialises in institutional strengthening, strategy development, and capacity building for service delivery teams across public and private sectors.',
    image:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=640&q=80',
    linkedin: 'https://www.linkedin.com/in/placeholder-chinwe',
  },
  {
    name: 'Daniel Osei',
    title: 'Senior Advisor',
    bio: 'Daniel brings deep expertise in monitoring and evaluation, data-driven decision making, and sustainable performance frameworks for complex organisations.',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=640&q=80',
    linkedin: '',
  },
  {
    name: 'Fatima Bello',
    title: 'Operations Director',
    bio: 'Fatima manages client delivery, operational systems, and stakeholder engagement to ensure every project is executed on time and to the highest standard.',
    image:
      'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=640&q=80',
    linkedin: 'https://www.linkedin.com/in/placeholder-fatima',
  },
  {
    name: 'Samuel Ibe',
    title: 'Strategy Lead',
    bio: 'Samuel develops strategic roadmaps and partner alignment plans that help institutions accelerate impact and achieve measurable outcomes.',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=640&q=80',
    linkedin: '',
  },
  {
    name: 'Simi Johnson',
    title: 'Client Experience Lead',
    bio: 'Simi ensures every client receives a tailored engagement experience with clear communications, responsive support, and actionable insights.',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=640&q=80',
    linkedin: 'https://www.linkedin.com/in/placeholder-simi',
  },
];

export default function TeamPage() {
  const headingRef = useScrollReveal<HTMLDivElement>();
  const cardsRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

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

                <p className="mt-5 text-sm leading-relaxed text-navy-600">{member.bio}</p>
                <p className="mt-5 text-xs uppercase tracking-[0.18em] text-navy-400">
                  Photo and bio are placeholders. Replace with your team details.
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 sm:mt-16 text-center">
          <p className="text-sm text-navy-500 max-w-2xl mx-auto leading-relaxed">
            Replace placeholder images and bios in the <code className="rounded bg-navy-100 px-1.5 py-0.5 text-navy-700">TEAM_MEMBERS</code> array.
          </p>
        </div>
      </div>
    </main>
  );
}
