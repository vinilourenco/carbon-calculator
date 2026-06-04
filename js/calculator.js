// Calculator — emission and carbon credit calculations
// Exposes a single global variable: Calculator
// Uses CONFIG.EMISSION_FACTORS when available; otherwise falls back to sensible defaults.

var Calculator = (function () {
  'use strict';

  // Default emission factors (kg CO2 per km) for modes when CONFIG doesn't provide them
  var DEFAULT_FACTORS = {
    bicycle: 0.012, // e.g., small overhead for food/maintenance
    car: 0.192,     // average passenger car (kg CO2 per km)
    bus: 0.105,     // per passenger (approximate)
    truck: 0.450    // heavy vehicle per ton-km (approximate per vehicle)
  };

  // Helper: get emission factors source (CONFIG.EMISSION_FACTORS preferred)
  function _getFactors() {
    if (typeof CONFIG !== 'undefined' && CONFIG.EMISSION_FACTORS) {
      return CONFIG.EMISSION_FACTORS;
    }
    return DEFAULT_FACTORS;
  }

  // Round number to given decimals
  function _round(value, decimals) {
    var factor = Math.pow(10, decimals || 0);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  /*
    calculateEmission(distanceKm, transportMode)
    - Uses an emission factor (kg CO2 per km) for the transport mode
    - Calculation: emission = distanceKm * factor
    - Returns emission rounded to 2 decimal places
  */
  function calculateEmission(distanceKm, transportMode) {
    var factors = _getFactors();
    var factor = (factors && factors[transportMode]) || DEFAULT_FACTORS[transportMode] || 0;
    var emission = Number(distanceKm || 0) * Number(factor || 0);
    return _round(emission, 2);
  }

  /*
    calculateAllModes(distanceKm)
    - For each transport mode, calculate emission and % versus car as baseline
    - Returns array sorted by emission (lowest first)
    - Each item: { mode, emission, percentageVsCar }
  */
  function calculateAllModes(distanceKm) {
    var factors = _getFactors();
    var modes = Object.keys(factors || DEFAULT_FACTORS);
    var results = [];

    // Calculate car baseline
    var carEmission = calculateEmission(distanceKm, 'car');
    modes.forEach(function (mode) {
      var emission = calculateEmission(distanceKm, mode);
      var percentageVsCar = null;
      if (carEmission && carEmission > 0) {
        percentageVsCar = _round((emission / carEmission) * 100, 2);
      }
      results.push({ mode: mode, emission: emission, percentageVsCar: percentageVsCar });
    });

    // Sort ascending by emission
    results.sort(function (a, b) { return a.emission - b.emission; });
    return results;
  }

  /*
    calculateSavings(emission, baselineEmission)
    - savedKg = baselineEmission - emission
    - percentage = (savedKg / baselineEmission) * 100
    - Returns { savedKg, percentage } rounded to 2 decimals
  */
  function calculateSavings(emission, baselineEmission) {
    var e = Number(emission || 0);
    var b = Number(baselineEmission || 0);
    var saved = b - e;
    var percentage = null;
    if (b && b > 0) {
      percentage = _round((saved / b) * 100, 2);
    }
    return { savedKg: _round(saved, 2), percentage: percentage };
  }

  /*
    calculateCarbonCredits(emissionKg)
    - credits = emissionKg / CONFIG.CARBON_CREDIT.KG_PER_CREDIT
    - Returns value rounded to 4 decimals
  */
  function calculateCarbonCredits(emissionKg) {
    var kg = Number(emissionKg || 0);
    var per = (typeof CONFIG !== 'undefined' && CONFIG.CARBON_CREDIT && CONFIG.CARBON_CREDIT.KG_PER_CREDIT) ? CONFIG.CARBON_CREDIT.KG_PER_CREDIT : 1000;
    var credits = kg / per;
    return _round(credits, 4);
  }

  /*
    estimateCreditPrice(credits)
    - min = credits * PRICE_MIN_BRL
    - max = credits * PRICE_MAX_BRL
    - average = (min + max) / 2
    - Returns { min, max, average } rounded to 2 decimals
  */
  function estimateCreditPrice(credits) {
    var c = Number(credits || 0);
    var minPrice = (typeof CONFIG !== 'undefined' && CONFIG.CARBON_CREDIT && CONFIG.CARBON_CREDIT.PRICE_MIN_BRL) ? CONFIG.CARBON_CREDIT.PRICE_MIN_BRL : 50;
    var maxPrice = (typeof CONFIG !== 'undefined' && CONFIG.CARBON_CREDIT && CONFIG.CARBON_CREDIT.PRICE_MAX_BRL) ? CONFIG.CARBON_CREDIT.PRICE_MAX_BRL : 150;
    var min = c * minPrice;
    var max = c * maxPrice;
    var avg = (min + max) / 2;
    return { min: _round(min, 2), max: _round(max, 2), average: _round(avg, 2) };
  }

  // Public API
  return {
    calculateEmission: calculateEmission,
    calculateAllModes: calculateAllModes,
    calculateSavings: calculateSavings,
    calculateCarbonCredits: calculateCarbonCredits,
    estimateCreditPrice: estimateCreditPrice
  };
})();
