import { Link } from 'react-router-dom';

const CARDS = [
  {
    to: '/needleman-wunsch',
    title: 'Needleman-Wunsch',
    desc: 'Global alignment of two sequences. Visualise the full DP matrix and traceback path.',
    tag: 'Global',
  },
  {
    to: '/smith-waterman',
    title: 'Smith-Waterman',
    desc: 'Local alignment. Identifies the best-matching sub-region between two sequences.',
    tag: 'Local',
  },
  {
    to: '/blast',
    title: 'BLAST-lite',
    desc: 'Heuristic database search using k-mer seeding and ungapped extension.',
    tag: 'Heuristic',
  },
  {
    to: '/substitution-matrices',
    title: 'Substitution Matrices',
    desc: 'Interactive heatmaps of BLOSUM62, BLOSUM50, PAM250, PAM30, and DNA matrices.',
    tag: 'Reference',
  },
];

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="bg-[#1e3a5f] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl font-serif font-normal leading-tight">
            Sequence Alignment in Bioinformatics
          </h1>
          <p className="text-white/75 text-lg max-w-2xl mx-auto">
            An interactive educational tool covering pairwise alignment algorithms,
            substitution scoring matrices, and heuristic database search methods.
          </p>
          <div className="text-sm text-white/60 pt-2 space-y-0.5">
            <p>Salman Mugharbel &bull; Computer Engineering, 6B06103, Course 3</p>
            <p>Al-Farabi Kazakh National University &bull; Bioinformatics, Spring 2026</p>
            <p className="italic font-light">Task 6: Sequence Alignment and Similarity Measures</p>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-xl font-serif text-[#1e3a5f] mb-3">About this project</h2>
        <p className="text-gray-600 leading-relaxed">
          This application implements three canonical sequence alignment algorithms entirely in
          TypeScript, running in the browser with no server backend. It accompanies the written
          report for the Bioinformatics final control (Task 6) and is intended to serve as both
          a program-implementation deliverable and a live visual aid during the oral defense.
          Each section of the navigation bar corresponds to a chapter of the written report.
          The interactive tools accept arbitrary DNA or protein sequences and compute alignments,
          DP matrices, traceback paths, similarity statistics, and database search results in real time.
        </p>
      </section>

      {/* Tool cards */}
      <section className="max-w-4xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-serif text-[#1e3a5f] mb-5">Interactive tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CARDS.map(({ to, title, desc, tag }) => (
            <Link
              key={to}
              to={to}
              className="block border border-gray-200 rounded-lg p-5 hover:border-[#1e3a5f] hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-[#1e3a5f] group-hover:underline">{title}</h3>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{tag}</span>
              </div>
              <p className="text-sm text-gray-500">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Chapter index */}
      <section className="bg-gray-50 border-t border-gray-200 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-serif text-[#1e3a5f] mb-4">Report chapters</h2>
          <ol className="space-y-1 text-sm text-gray-600 list-decimal list-inside">
            <li><Link to="/"                      className="text-[#1e3a5f] hover:underline">Introduction</Link></li>
            <li><Link to="/theory"                className="text-[#1e3a5f] hover:underline">Theoretical Foundations</Link> (dot matrices, scoring, gap penalties, DP recurrences, BLAST)</li>
            <li><Link to="/needleman-wunsch"      className="text-[#1e3a5f] hover:underline">Needleman-Wunsch Global Alignment</Link></li>
            <li><Link to="/smith-waterman"        className="text-[#1e3a5f] hover:underline">Smith-Waterman Local Alignment</Link></li>
            <li><Link to="/blast"                 className="text-[#1e3a5f] hover:underline">BLAST-lite Heuristic Search</Link></li>
            <li><Link to="/substitution-matrices" className="text-[#1e3a5f] hover:underline">Substitution Matrix Viewer</Link></li>
            <li><Link to="/test-cases"            className="text-[#1e3a5f] hover:underline">Predefined Test Cases</Link></li>
            <li><Link to="/analysis"              className="text-[#1e3a5f] hover:underline">Analysis of Results</Link></li>
            <li><Link to="/source"                className="text-[#1e3a5f] hover:underline">Source Code Listing</Link></li>
            <li><Link to="/conclusion"            className="text-[#1e3a5f] hover:underline">Conclusion</Link></li>
            <li><Link to="/references"            className="text-[#1e3a5f] hover:underline">References</Link></li>
          </ol>
        </div>
      </section>
    </main>
  );
}
