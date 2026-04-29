import React, { useState } from 'react';
import { REAL_SEQUENCES, type RealSequence } from '../data/realSequences';

interface SequenceSelectorProps {
  onSequenceSelect: (sequence: RealSequence) => void;
}

export const SequenceSelector: React.FC<SequenceSelectorProps> = ({ onSequenceSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState<'proteins' | 'humanDNA' | 'animalDNA'>('proteins');
  const [selectedId, setSelectedId] = useState<string>('');

  const getSequencesByCategory = () => {
    return REAL_SEQUENCES[selectedCategory];
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value as 'proteins' | 'humanDNA' | 'animalDNA';
    setSelectedCategory(category);
    setSelectedId('');
  };

  const handleSequenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedId(id);
    const sequences = getSequencesByCategory();
    const selected = sequences.find(seq => seq.id === id);
    if (selected) {
      onSequenceSelect(selected);
    }
  };

  const sequences = getSequencesByCategory();

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Load Real Sequences</h3>
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="proteins">Proteins</option>
            <option value="humanDNA">Human DNA</option>
            <option value="animalDNA">Animal DNA</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-600 mb-1">Sequence</label>
          <select
            value={selectedId}
            onChange={handleSequenceChange}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select a sequence --</option>
            {sequences.map(seq => (
              <option key={seq.id} value={seq.id}>
                {seq.name} ({seq.organism})
              </option>
            ))}
          </select>
        </div>
      </div>
      {selectedId && (
        <div className="mt-3 text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
          <div><strong>Accession:</strong> {REAL_SEQUENCES[selectedCategory].find(s => s.id === selectedId)?.accession}</div>
          <div><strong>Source:</strong> {REAL_SEQUENCES[selectedCategory].find(s => s.id === selectedId)?.source}</div>
          <div><strong>Description:</strong> {REAL_SEQUENCES[selectedCategory].find(s => s.id === selectedId)?.description}</div>
        </div>
      )}
    </div>
  );
};
