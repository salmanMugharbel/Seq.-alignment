import PageLayout from '../components/PageLayout';

const REFS = [
  {
    num: 1,
    citation: 'Needleman, S.B. and Wunsch, C.D. (1970). A general method applicable to the search for similarities in the amino acid sequence of two proteins. <em>Journal of Molecular Biology</em>, 48(3), 443-453.',
    url: 'https://doi.org/10.1016/0022-2836(70)90057-4',
  },
  {
    num: 2,
    citation: 'Smith, T.F. and Waterman, M.S. (1981). Identification of common molecular subsequences. <em>Journal of Molecular Biology</em>, 147(1), 195-197.',
    url: 'https://doi.org/10.1016/0022-2836(81)90087-5',
  },
  {
    num: 3,
    citation: 'Altschul, S.F., Gish, W., Miller, W., Myers, E.W. and Lipman, D.J. (1990). Basic local alignment search tool. <em>Journal of Molecular Biology</em>, 215(3), 403-410.',
    url: 'https://doi.org/10.1016/S0022-2836(05)80360-2',
  },
  {
    num: 4,
    citation: 'Henikoff, S. and Henikoff, J.G. (1992). Amino acid substitution matrices from protein blocks. <em>Proceedings of the National Academy of Sciences</em>, 89(22), 10915-10919.',
    url: 'https://doi.org/10.1073/pnas.89.22.10915',
  },
  {
    num: 5,
    citation: 'Dayhoff, M.O., Schwartz, R.M. and Orcutt, B.C. (1978). A model of evolutionary change in proteins. In: Dayhoff, M.O. (ed.) <em>Atlas of Protein Sequence and Structure</em>, 5(Suppl. 3), 345-352. National Biomedical Research Foundation, Washington, DC.',
    url: null,
  },
  {
    num: 6,
    citation: 'Gotoh, O. (1982). An improved algorithm for matching biological sequences. <em>Journal of Molecular Biology</em>, 162(3), 705-708.',
    url: 'https://doi.org/10.1016/0022-2836(82)90398-9',
  },
  {
    num: 7,
    citation: 'Durbin, R., Eddy, S., Krogh, A. and Mitchison, G. (1998). <em>Biological Sequence Analysis: Probabilistic Models of Proteins and Nucleic Acids</em>. Cambridge University Press, Cambridge.',
    url: 'https://doi.org/10.1017/CBO9780511790492',
  },
  {
    num: 8,
    citation: 'Mount, D.W. (2004). <em>Bioinformatics: Sequence and Genome Analysis</em>, 2nd edn. Cold Spring Harbor Laboratory Press, Cold Spring Harbor, NY.',
    url: null,
  },
  {
    num: 9,
    citation: 'Karlin, S. and Altschul, S.F. (1990). Methods for assessing the statistical significance of molecular sequence features by using general scoring schemes. <em>Proceedings of the National Academy of Sciences</em>, 87(6), 2264-2268.',
    url: 'https://doi.org/10.1073/pnas.87.6.2264',
  },
];

const ONLINE_RESOURCES = [
  { label: 'NCBI BLAST', url: 'https://blast.ncbi.nlm.nih.gov/', desc: 'National Center for Biotechnology Information — the reference BLAST service.' },
  { label: 'UniProt', url: 'https://www.uniprot.org/', desc: 'Comprehensive protein sequence and annotation database.' },
  { label: 'EMBL-EBI Clustal Omega', url: 'https://www.ebi.ac.uk/Tools/msa/clustalo/', desc: 'European Bioinformatics Institute multiple sequence alignment service.' },
  { label: 'EMBOSS Needle (global)', url: 'https://www.ebi.ac.uk/Tools/psa/emboss_needle/', desc: 'EBI implementation of Needleman-Wunsch global pairwise alignment.' },
  { label: 'EMBOSS Water (local)', url: 'https://www.ebi.ac.uk/Tools/psa/emboss_water/', desc: 'EBI implementation of Smith-Waterman local pairwise alignment.' },
];

export default function References() {
  return (
    <PageLayout
      title="References"
      subtitle="Primary literature and online resources cited in this report."
    >
      <div className="max-w-3xl space-y-8">
        <ol className="space-y-4">
          {REFS.map(ref => (
            <li key={ref.num} className="flex gap-3">
              <span className="text-gray-400 font-mono text-sm shrink-0 w-5">[{ref.num}]</span>
              <div className="text-sm text-gray-600 leading-relaxed">
                <span dangerouslySetInnerHTML={{ __html: ref.citation }} />
                {ref.url && (
                  <span className="ml-2 text-[#1e3a5f] break-all">
                    DOI: <a href={ref.url} target="_blank" rel="noreferrer" className="hover:underline">{ref.url}</a>
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>

        <section>
          <h2 className="text-xl font-serif text-[#1e3a5f] mb-4">Online resources</h2>
          <ul className="space-y-3">
            {ONLINE_RESOURCES.map(r => (
              <li key={r.url} className="text-sm">
                <a href={r.url} target="_blank" rel="noreferrer" className="font-medium text-[#1e3a5f] hover:underline">
                  {r.label}
                </a>
                <span className="text-gray-500"> — {r.desc}</span>
                <div className="text-xs text-gray-400 mt-0.5">{r.url}</div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageLayout>
  );
}
