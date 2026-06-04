// app.js — initialization and event handling for the CO2 calculator
// Sets up the UI, hooks form submit, performs calculations and renders results

(function () {
  'use strict';

  // Run when DOM is ready
  document.addEventListener('DOMContentLoaded', function () {
    // 1) Populate city datalist and wire autofill behavior
    if (typeof CONFIG !== 'undefined' && CONFIG.populateDatalist) CONFIG.populateDatalist();
    if (typeof CONFIG !== 'undefined' && CONFIG.setupDistanceAutofill) CONFIG.setupDistanceAutofill();

    // 2) Get the form element
    var form = document.getElementById('calculator-form');
    if (!form) return;

    // 3) Add submit handler
    form.addEventListener('submit', function (e) {
      e.preventDefault(); // prevent page reload

      // Get trimmed values from the form
      var origin = (document.getElementById('origin') && document.getElementById('origin').value) ? document.getElementById('origin').value.toString().trim() : '';
      var destination = (document.getElementById('destination') && document.getElementById('destination').value) ? document.getElementById('destination').value.toString().trim() : '';
      var distanceRaw = (document.getElementById('distance') && document.getElementById('distance').value) ? document.getElementById('distance').value : '';
      var distance = parseFloat(distanceRaw);
      var transportRadio = document.querySelector('input[name="transport"]:checked');
      var transportMode = transportRadio ? transportRadio.value : 'car';

      // Validation
      if (!origin) {
        alert('Por favor, informe a Origem.');
        return;
      }
      if (!destination) {
        alert('Por favor, informe o Destino.');
        return;
      }
      if (isNaN(distance) || distance <= 0) {
        alert('Por favor, verifique a distância (deve ser maior que 0).');
        return;
      }

      // Submit button and show loading
      var submitButton = form.querySelector('button[type="submit"]');
      if (submitButton && window.UI && UI.showLoading) UI.showLoading(submitButton);

      // Hide previous results
      if (window.UI && UI.hideElement) {
        UI.hideElement('results');
        UI.hideElement('comparison');
        UI.hideElement('carbon-credits');
      }

      // Simulate processing delay
      setTimeout(function () {
        try {
          // Calculate emission for selected mode
          var emission = (window.Calculator && Calculator.calculateEmission) ? Calculator.calculateEmission(distance, transportMode) : 0;

          // Baseline (car)
          var carEmission = (window.Calculator && Calculator.calculateEmission) ? Calculator.calculateEmission(distance, 'car') : 0;

          // Savings compared to car
          var saving = (window.Calculator && Calculator.calculateSavings) ? Calculator.calculateSavings(emission, carEmission) : { savedKg: 0, percentage: 0 };

          // Comparison across modes
          var modesComparison = (window.Calculator && Calculator.calculateAllModes) ? Calculator.calculateAllModes(distance) : [];

          // Carbon credits and price estimate
          var credits = (window.Calculator && Calculator.calculateCarbonCredits) ? Calculator.calculateCarbonCredits(emission) : 0;
          var priceEstimate = (window.Calculator && Calculator.estimateCreditPrice) ? Calculator.estimateCreditPrice(credits) : { min: 0, max: 0, average: 0 };

          // Build data objects
          var resultsData = {
            origin: origin,
            destination: destination,
            distance: distance,
            emission: emission,
            mode: transportMode,
            saving: saving
          };

          var creditsData = {
            credits: credits,
            price: priceEstimate
          };

          // Render to DOM
          if (window.UI && UI.renderResults) {
            var resultsContainer = document.getElementById('results-content');
            if (resultsContainer) resultsContainer.innerHTML = UI.renderResults(resultsData);
          }

          if (window.UI && UI.renderComparison) {
            var comparisonContainer = document.getElementById('comparison-content');
            if (comparisonContainer) comparisonContainer.innerHTML = UI.renderComparison(modesComparison, transportMode);
          }

          if (window.UI && UI.renderCarbonCredits) {
            var ccContainer = document.getElementById('carbon-credits-content');
            if (ccContainer) ccContainer.innerHTML = UI.renderCarbonCredits(creditsData);
          }

          // Show sections
          if (window.UI && UI.showElement) {
            UI.showElement('results');
            UI.showElement('comparison');
            UI.showElement('carbon-credits');
            UI.scrollToElement('results');
          }

          // Hide loading
          if (submitButton && window.UI && UI.hideLoading) UI.hideLoading(submitButton);
        } catch (err) {
          console.error(err);
          alert('Ocorreu um erro ao calcular as emissões. Tente novamente.');
          if (submitButton && window.UI && UI.hideLoading) UI.hideLoading(submitButton);
        }
      }, 1500);
    });

    // Log initialization message
    try {
      console.log(':check: Calculadora inicializada!');
    } catch (e) {
      // ignore
    }
  });
})();
