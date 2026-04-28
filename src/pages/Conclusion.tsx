import PageLayout from '../components/PageLayout';

export default function Conclusion() {
  return (
    <PageLayout
      title="Conclusion"
      subtitle="Summary of results, observations, and directions for future work."
    >
      <div className="max-w-3xl space-y-6 text-gray-600 leading-relaxed text-sm">
        <section>
          <h2 className="text-xl font-serif text-[#1e3a5f] mb-3">What was accomplished</h2>
          <p>
            This project implemented three canonical sequence alignment algorithms entirely in
            TypeScript, running in the browser without a server backend: the Needleman-Wunsch
            global alignment algorithm, the Smith-Waterman local alignment algorithm, and
            a BLAST-lite heuristic search engine. Each algorithm was validated against known
            test cases and unit-tested with Vitest. The application includes interactive
            visualisations of DP matrices with animated fill and traceback highlighting,
            dot-plot rendering, substitution matrix heatmaps, sensitivity analysis plots,
            and a score distribution experiment that motivates the statistical E-value concept.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-[#1e3a5f] mb-3">Key observations</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Global alignment is sensitive to the choice of gap penalty. Very mild penalties produce
              overly gapped alignments; very severe penalties force mismatches instead of gaps.
            </li>
            <li>
              Local alignment is more robust to divergent flanking sequence, making it preferable
              when looking for conserved domains within otherwise dissimilar sequences.
            </li>
            <li>
              The BLAST heuristic recovers biologically meaningful hits with the correct ranking order,
              demonstrating that k-mer seeding successfully filters irrelevant sequences before the
              more expensive extension step.
            </li>
            <li>
              BLOSUM62 and PAM250 differ substantially in how they score conservative vs. radical
              amino acid substitutions. The choice of substitution matrix has a measurable effect
              on the final alignment score and should be matched to the expected evolutionary distance
              between the sequences being compared.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-serif text-[#1e3a5f] mb-3">Practical significance</h2>
          <p>
            Sequence alignment is the cornerstone of comparative genomics, structural biology, and
            molecular medicine. The algorithms implemented here underlie widely-used tools such as
            NCBI BLAST, EMBOSS Needle/Water, and ClustalW. Understanding their mathematical
            foundations and parameter sensitivity is essential for interpreting alignment results
            correctly, avoiding false positives, and selecting appropriate tools for a given task.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-[#1e3a5f] mb-3">Possible extensions</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Multiple sequence alignment (MSA).</strong> Extend pairwise alignment to three
              or more sequences using progressive methods (ClustalW, MUSCLE) or iterative refinement
              (MAFFT). MSA is essential for phylogenetic analysis and conservation scoring.
            </li>
            <li>
              <strong>Profile HMM-based methods.</strong> Replace substitution matrices with
              position-specific scoring matrices (PSSM) or hidden Markov models (HMMs), as used in
              HMMER and PSI-BLAST. These methods are more sensitive for detecting remote homologues.
            </li>
            <li>
              <strong>GPU acceleration.</strong> The O(m&times;n) DP matrix fill is embarrassingly
              parallelisable along anti-diagonals. WebGPU compute shaders could accelerate large
              alignments (e.g., full chromosomes) by orders of magnitude.
            </li>
            <li>
              <strong>Gapped BLAST extension.</strong> This implementation uses ungapped extension
              only. Adding gapped extension with Smith-Waterman on high-scoring segment pairs (HSPs)
              would match the sensitivity of the full BLAST pipeline.
            </li>
          </ul>
        </section>
      </div>
    </PageLayout>
  );
}
