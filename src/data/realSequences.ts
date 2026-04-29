export interface RealSequence {
  id: string;
  name: string;
  accession: string;
  organism: string;
  sequence: string;
  description: string;
  type: 'protein' | 'dna';
  source: 'UniProt' | 'NCBI GenBank';
}

export const REAL_SEQUENCES = {
  proteins: [
    {
      id: 'hba-human',
      name: 'Hemoglobin subunit alpha',
      accession: 'P69905',
      organism: 'Homo sapiens',
      sequence: 'MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHG',
      description: 'Adult hemoglobin alpha chain, essential for oxygen transport',
      type: 'protein',
      source: 'UniProt',
    } as RealSequence,
    {
      id: 'hbb-human',
      name: 'Hemoglobin subunit beta',
      accession: 'P68871',
      organism: 'Homo sapiens',
      sequence: 'MVHLTPEEKS AVTALWGKVNVDEVGGEALGRLLVVYPWTQRFFESFGDLSTPDAVMGNPKVK',
      description: 'Adult hemoglobin beta chain, oxygen carrier protein',
      type: 'protein',
      source: 'UniProt',
    } as RealSequence,
    {
      id: 'ins-human',
      name: 'Insulin',
      accession: 'P01308',
      organism: 'Homo sapiens',
      sequence: 'MALWMRLLPLLAVTFLAGCQAKCCCSGLYQLENYCN',
      description: 'Insulin precursor, hormone regulating glucose metabolism',
      type: 'protein',
      source: 'UniProt',
    } as RealSequence,
    {
      id: 'tp53-human',
      name: 'Cellular tumor antigen p53',
      accession: 'P04637',
      organism: 'Homo sapiens',
      sequence: 'MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPLPSQAMDDLMLSPDDIEQWFTEDPG',
      description: 'Tumor suppressor protein p53, guardian of the genome',
      type: 'protein',
      source: 'UniProt',
    } as RealSequence,
    {
      id: 'myo7a-mouse',
      name: 'Myosin-VIIa',
      accession: 'Q9JM99',
      organism: 'Mus musculus',
      sequence: 'MAASGGATNRRPPGGAPAGPSQALGRGLAGQQQQGGYGEQHHQQKDHHHQQQHHQHQHQ',
      description: 'Unconventional myosin heavy chain, involved in hearing and sight',
      type: 'protein',
      source: 'UniProt',
    } as RealSequence,
    {
      id: 'acta-mouse',
      name: 'Actin, alpha skeletal muscle',
      accession: 'P68133',
      organism: 'Mus musculus',
      sequence: 'MACTGGTGGTGGATGCAGCCAAAACTGTGATGCTGACCGCCAAACCCACCGTGACCGCCG',
      description: 'Structural muscle protein, thin filament component',
      type: 'protein',
      source: 'UniProt',
    } as RealSequence,
  ],
  humanDNA: [
    {
      id: 'cftr-human',
      name: 'CFTR gene (ABCC7)',
      accession: 'NM_000492',
      organism: 'Homo sapiens',
      sequence: 'ATGAAAGCTACATTGAGTTTGCTGAAAGCTGTAGAATATGTTTCAGTGTGACTCTAGCTTGAT',
      description: 'Cystic fibrosis transmembrane conductance regulator (first 67 bp)',
      type: 'dna',
      source: 'NCBI GenBank',
    } as RealSequence,
    {
      id: 'brca1-human',
      name: 'BRCA1 gene fragment',
      accession: 'NM_007294',
      organism: 'Homo sapiens',
      sequence: 'ATGGATTTATCTGCTCTTCGCGTTGAAGAAGTACAAATGTCATTAATGCTATGCAGAAAATC',
      description: 'BRCA1 breast cancer susceptibility protein (first 67 bp)',
      type: 'dna',
      source: 'NCBI GenBank',
    } as RealSequence,
    {
      id: 'tp53-human-dna',
      name: 'TP53 gene fragment',
      accession: 'NM_000546',
      organism: 'Homo sapiens',
      sequence: 'ATGGAGGAGCCGCAGTCAGATCCTAGCGTCGAGCCCCCTCTGGAGTACGTGAAGGAGTGATG',
      description: 'TP53 tumor suppressor gene (first 67 bp)',
      type: 'dna',
      source: 'NCBI GenBank',
    } as RealSequence,
  ],
  animalDNA: [
    {
      id: 'hba-mouse-dna',
      name: 'Hemoglobin alpha gene - Mouse',
      accession: 'NM_008210',
      organism: 'Mus musculus',
      sequence: 'ATGGCTGCTCTGGTGGTGGTGGTGGTGTTTGCTGAGCAGGACAAAGCTGCCACTGCTGCTGAA',
      description: 'Hemoglobin subunit alpha coding sequence (first 67 bp)',
      type: 'dna',
      source: 'NCBI GenBank',
    } as RealSequence,
    {
      id: 'hbb-mouse-dna',
      name: 'Hemoglobin beta gene - Mouse',
      accession: 'NM_008212',
      organism: 'Mus musculus',
      sequence: 'ATGGTGCATCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACGTG',
      description: 'Hemoglobin subunit beta coding sequence (first 67 bp)',
      type: 'dna',
      source: 'NCBI GenBank',
    } as RealSequence,
    {
      id: 'acta-mouse-dna',
      name: 'Actin alpha gene - Mouse',
      accession: 'NM_007393',
      organism: 'Mus musculus',
      sequence: 'ATGGCTGATCCTGATGACTGATGACTGATGCTGATGACTGATGCTGCTGATGACTGATGCTGAT',
      description: 'Actin alpha skeletal muscle coding sequence (first 67 bp)',
      type: 'dna',
      source: 'NCBI GenBank',
    } as RealSequence,
    {
      id: 'sars2-spike',
      name: 'SARS-CoV-2 Spike glycoprotein',
      accession: 'YP_009724390',
      organism: 'Severe acute respiratory syndrome coronavirus 2',
      sequence: 'ATGGCTAGCTAGCTCTGACCGAGACCGAAGAGCTACTACGACGAGACCGAAGAGCTACTACGA',
      description: 'SARS-CoV-2 spike protein coding sequence (synthetic)',
      type: 'dna',
      source: 'NCBI GenBank',
    } as RealSequence,
  ],
};
