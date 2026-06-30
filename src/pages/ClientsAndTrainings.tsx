import { motion } from 'framer-motion';

const companyPartners = [
  {
    name: 'Ercas Integrated Solutions',
    logo: '/Logos/ercas.png',
    description: 'Technology, digital transformation, and operational support for service-driven organisations.',
  },
  {
    name: 'Agri Course',
    logo: null, // Set to null for now so it shows a clean fallback text box until you drop in a file!
    description: 'Agribusiness advisory and capacity building for agricultural value chain development.',
  },
  {
    name: 'First Forty Hotel',
    logo: '/Logos/firstforty.png',
    description: 'Hospitality strategy, process improvement, and service delivery consulting.',
  },
];

const trainingClients = [
  {
    name: 'NNPC',
    logo: '/Logos/nnpc.png',
    description: 'Strategic training for petroleum sector leadership, governance, and performance management.',
  },
  {
    name: 'PTDF',
    logo: '/Logos/ptdf.png', // Changed from PTDF.png to lowercase ptdf.png to match your exact file name in image_f48e64.png!
    description: 'Capacity-building workshops for talent development and industry-focused training programmes.',
  },
  {
    name: 'First Forty Hotel',
    logo: '/Logos/firstforty.png',
    description: 'Hospitality and operations training designed to elevate guest experience and service standards.',
  },
  {
    name: 'Bjorne Suite Hotel',
    logo: null,
    description: 'Custom learning programmes delivered with a polished, modern training experience.',
  },
  {
    name: 'Heal The Youth Foundation',
    logo: '/Logos/healyouth.png',
    description: 'Mission-aligned workshops that support youth empowerment, social impact, and organisational growth.',
  },
];

const containerVariants: Record<string, any> = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants: Record<string, any> = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

export default function ClientsAndTrainings() {
  return (
    <main className="flex-1 bg-zinc-50">
      {/* Header Section */}
      <section className="relative overflow-hidden bg-zinc-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_22%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.14),_transparent_24%)]" />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-3xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent-500 mb-4">
              Our Clients & Collaborations
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-950 leading-tight">
              Trusted partners and training clients shaping stronger institutions.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-navy-600 max-w-2xl leading-relaxed">
              Beehive Associates works with public and private sector leaders, delivering strategic advisory, training design, and performance-focused learning experiences with purpose.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Corporate Partners Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_minmax(280px,0.7fr)] items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-accent-500 mb-3">
                Companies We've Done Business With
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-950 leading-tight">
                Select partner engagements across consulting, digital services, and hospitality.
              </h2>
            </div>
            <p className="text-sm text-navy-600 leading-relaxed">
              These organisations have relied on Beehive Associates for advisory support, operational planning, technology enablement, and service excellence across diverse industry needs.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {companyPartners.map((partner) => (
              <motion.article
                key={partner.name}
                variants={cardVariants}
                className="rounded-[2rem] border border-zinc-200/70 bg-white p-8 shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-100 shadow-sm border border-zinc-200/40 p-4">
                  {partner.logo ? (
                    <img
                      src={partner.logo}
                      alt={`${partner.name} logo`}
                      className="max-h-16 max-w-full object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center text-center px-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-navy-700 leading-tight">
                        {partner.name}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="mt-10 text-xl font-semibold text-navy-950">{partner.name}</h3>
                <p className="mt-4 text-sm text-navy-600 leading-relaxed">{partner.description}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Training Clients Section */}
      <section className="py-16 sm:py-20 bg-zinc-50 text-navy-950">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_minmax(280px,0.7fr)] items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-accent-500 mb-3">
                Trainings Conducted by Beehive Associates
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-950 leading-tight">
                Empowering teams through practical learning and institutional capability building.
              </h2>
            </div>
            <p className="text-sm text-navy-600 leading-relaxed">
              Our training engagements cover governance, energy sector operations, hospitality excellence, and youth development for public and private institutions.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {trainingClients.map((client) => (
              <motion.article
                key={client.name}
                variants={cardVariants}
                className="rounded-[2rem] border border-zinc-200/70 bg-white p-8 shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-100 shadow-sm border border-zinc-200/40 p-4">
                  {client.logo ? (
                    <img
                      src={client.logo}
                      alt={`${client.name} logo`}
                      className="max-h-16 max-w-full object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center text-center px-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-navy-700 leading-tight">
                        {client.name}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="mt-10 text-xl font-semibold text-navy-950">{client.name}</h3>
                <p className="mt-4 text-sm text-navy-600 leading-relaxed">{client.description}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  );
}