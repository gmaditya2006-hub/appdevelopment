// Proof verification helper for WasteWise.
// This file validates whether a disposal or plantation proof matches the selected bin and awards points.
(function () {
  const properMatches = {
    'Plastic Bottle': ['Recycling Bin'],
    'Battery': ['Hazardous Waste Bin'],
    'Mobile Phone': ['E-Waste Bin'],
    'Banana Peel': ['Organic Bin'],
    'Cardboard': ['Recycling Bin'],
    'Tree Plantation': ['Plantation Zone']
  };

  const awardMap = {
    'Plastic Bottle': 20,
    'Battery': 30,
    'Mobile Phone': 25,
    'Banana Peel': 18,
    'Cardboard': 22,
    'Tree Plantation': 40
  };

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function containsAny(text, words) {
    const value = normalize(text);
    return words.some((word) => value.includes(word));
  }

  function evaluateProofEvidence({ imageName = '', wasteName = '', binName = '' }) {
    const imageText = normalize(imageName);
    const selectedWaste = normalize(wasteName);
    const selectedBin = normalize(binName);

    const treePlantationSignals = ['tree', 'plant', 'plantation', 'sapling', 'seedling', 'garden'];
    const isPlantationEvidence = containsAny(imageText, treePlantationSignals) || containsAny(selectedWaste, treePlantationSignals);

    if (selectedWaste.includes('tree') || selectedWaste.includes('plantation')) {
      if (selectedBin.includes('plantation') || selectedBin.includes('zone')) {
        return {
          valid: true,
          points: awardMap['Tree Plantation'] || 40,
          verdict: 'Plantation proof verified',
          resultMessage: '✅ Verified! You have done plantation work and earned 40 points.'
        };
      }

      return {
        valid: false,
        points: 0,
        verdict: 'No tree planting evidence found',
        resultMessage: 'Sorry, we did not find a proper evidence of his waste disposal or plantation activity in the uploaded image.'
      };
    }

    if (isPlantationEvidence && (selectedBin.includes('plantation') || selectedBin.includes('zone'))) {
      return {
        valid: true,
        points: awardMap['Tree Plantation'] || 40,
        verdict: 'Plantation proof verified',
        resultMessage: '✅ Verified! You have done plantation work and earned 40 points.'
      };
    }

    const expectedBins = properMatches[wasteName] || [];
    const isCorrectBin = expectedBins.some((expectedBin) => normalize(expectedBin) === selectedBin);

    if (isCorrectBin) {
      return {
        valid: true,
        points: awardMap[wasteName] || 15,
        verdict: 'Proper disposal evidence verified',
        resultMessage: `✅ Verified! ${wasteName} was properly disposed of in the ${binName} and earned ${awardMap[wasteName] || 15} points.`
      };
    }

    const fallbackBin = expectedBins[0] || 'the correct waste bin';
    return {
      valid: false,
      points: 0,
      verdict: 'Sorry, no proper evidence found',
      resultMessage: `Sorry, we did not find a proper evidence of his waste disposal. The ${wasteName} should be placed in ${fallbackBin}.`
    };
  }

  const api = { evaluateProofEvidence };

  if (typeof window !== 'undefined') {
    window.evaluateProofEvidence = evaluateProofEvidence;
    window.WasteWiseProofVerifier = api;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
