// UI — utility and rendering helpers for the CO2 calculator
// Defines a single global variable: UI

var UI = (function () {
  'use strict';

  /* Utility methods */
  function formatNumber(number, decimals) {
    var d = typeof decimals === 'number' ? decimals : 2;
    var n = Number(number || 0);
    return n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  }

  function formatCurrency(value) {
    var v = Number(value || 0);
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function showElement(elementId) {
    var el = document.getElementById(elementId);
    if (!el) return;
    el.classList.remove('hidden');
    el.removeAttribute('hidden');
    el.setAttribute('aria-hidden', 'false');
  }

  function hideElement(elementId) {
    var el = document.getElementById(elementId);
    if (!el) return;
    el.classList.add('hidden');
    el.setAttribute('hidden', '');
    el.setAttribute('aria-hidden', 'true');
  }

  function scrollToElement(elementId) {
    var el = document.getElementById(elementId);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* Rendering methods
     Each render* method returns an HTML string that can be inserted
     directly into the DOM (e.g., innerHTML = UI.renderResults(data)).
  */

  function renderResults(data) {
    // data: { origin, destination, distance, emission, mode, saving }
    var modeMeta = (window.CONFIG && CONFIG.TRANSPORT_MODES && CONFIG.TRANSPORT_MODES[data.mode]) || {};
    var icon = modeMeta.icon || '';
    var label = modeMeta.label || (data.mode || '—');
    var color = modeMeta.color || '#10b981';

    // Cards: route, distance, emission, transport, savings (optional)
    var routeCard = '<div class="results_card results_card--route"><h4 class="results_card__title">Rota</h4><p class="results_card__body">' +
      (data.origin || '—') + ' → ' + (data.destination || '—') + '</p></div>';

    var distanceCard = '<div class="results_card results_card--distance"><h4 class="results_card__title">Distância</h4><p class="results_card__body">' +
      formatNumber(data.distance || 0, 0) + ' km</p></div>';

    var emissionCard = '<div class="results_card results_card--emission"><h4 class="results_card__title">Emissão</h4><p class="results_card__body">🌿 ' +
      formatNumber(data.emission || 0, 2) + ' kg CO₂</p></div>';

    var transportCard = '<div class="results_card results_card--transport"><h4 class="results_card__title">Transporte</h4><p class="results_card__body" style="color:' + color + '">' +
      (icon ? (icon + ' ') : '') + label + '</p></div>';

    var savingsHtml = '';
    if (data.mode !== 'car' && data.saving && data.saving.savedKg && data.saving.savedKg > 0) {
      savingsHtml = '<div class="results_card results_card--savings"><h4 class="results_card__title">Economia vs Carro</h4>' +
        '<p class="results_card__body">' + formatNumber(data.saving.savedKg, 2) + ' kg (' + (data.saving.percentage || 0) + '%)</p></div>';
    }

    // Wrap cards in a results container
    var html = '<div class="results__grid">' + routeCard + distanceCard + emissionCard + transportCard + savingsHtml + '</div>';
    return html;
  }

  function renderComparison(modesArray, selectedMode) {
    // modesArray: [ { mode, emission, percentageVsCar }, ... ]
    if (!Array.isArray(modesArray)) return '';

    var maxEmission = 0;
    modesArray.forEach(function (m) { if (m.emission > maxEmission) maxEmission = m.emission; });
    if (maxEmission === 0) maxEmission = 1; // avoid divide by zero

    var itemsHtml = modesArray.map(function (m) {
      var meta = (window.CONFIG && CONFIG.TRANSPORT_MODES && CONFIG.TRANSPORT_MODES[m.mode]) || {};
      var icon = meta.icon || '';
      var label = meta.label || m.mode;
      var selected = (m.mode === selectedMode) ? ' comparison_item--selected' : '';

      // Determine color based on percentage vs car
      var pct = m.percentageVsCar || 0;
      var barColor = '#10b981';
      if (pct <= 25) barColor = '#10b981';
      else if (pct <= 75) barColor = '#f59e0b';
      else if (pct <= 100) barColor = '#f97316';
      else barColor = '#ef4444';

      var widthPct = Math.round((m.emission / maxEmission) * 100);

      var badge = (m.mode === selectedMode) ? '<span class="comparison_item__badge">Selecionado</span>' : '';

      return '<div class="comparison_item' + selected + '">' +
        '<div class="comparison_item__header">' + (icon ? '<span class="comparison_item__icon">' + icon + '</span>' : '') +
        '<strong class="comparison_item__label">' + label + '</strong>' + badge + '</div>' +
        '<div class="comparison_item__stats">' +
          '<div class="comparison_item__emission">' + formatNumber(m.emission, 2) + ' kg CO₂</div>' +
          '<div class="comparison_item__pct">' + (m.percentageVsCar !== null ? (m.percentageVsCar + '%') : '—') + '</div>' +
        '</div>' +
        '<div class="comparison_item__bar" style="background:#e6e6e6;border-radius:6px;overflow:hidden;margin-top:8px;">' +
          '<div style="width:' + widthPct + '%;background:' + barColor + ';height:10px;"></div>' +
        '</div>' +
      '</div>';
    }).join('');

    var tip = '<div class="comparison_tip"><strong>Dica:</strong> Escolher transporte coletivo ou bicicleta reduz significativamente as emissões.</div>';

    return '<div class="comparison__list">' + itemsHtml + '</div>' + tip;
  }

  function renderCarbonCredits(creditsData) {
    // creditsData: { credits, price: { min, max, average } }
    var c = creditsData && creditsData.credits ? creditsData.credits : 0;
    var price = creditsData && creditsData.price ? creditsData.price : { min: 0, max: 0, average: 0 };

    var cardCredits = '<div class="cc_card cc_card--credits"><h4 class="cc_card__title">Créditos necessários</h4>' +
      '<p class="cc_card__big">' + formatNumber(c, 4) + '</p>' +
      '<p class="cc_card__help">1 crédito = ' + (window.CONFIG && CONFIG.CARBON_CREDIT && CONFIG.CARBON_CREDIT.KG_PER_CREDIT ? CONFIG.CARBON_CREDIT.KG_PER_CREDIT : 1000) + ' kg CO₂</p></div>';

    var cardPrice = '<div class="cc_card cc_card--price"><h4 class="cc_card__title">Preço estimado</h4>' +
      '<p class="cc_card__big">' + formatCurrency(price.average || 0) + '</p>' +
      '<p class="cc_card__help">Faixa: ' + formatCurrency(price.min || 0) + ' — ' + formatCurrency(price.max || 0) + '</p></div>';

    var info = '<div class="cc_info">Créditos de carbono são mecanismos para compensar emissões, comprando certificados que financiam projetos de redução de CO₂.</div>';

    var button = '<div class="cc_actions"><button class="calculator__button">:button: Compensar Emissões</button></div>';

    var html = '<div class="cc_grid">' + cardCredits + cardPrice + '</div>' + info + button;
    return html;
  }

  /* Loading helpers for buttons */
  function showLoading(buttonElement) {
    if (!buttonElement) return;
    if (!buttonElement.dataset.originalText) {
      buttonElement.dataset.originalText = buttonElement.innerHTML;
    }
    buttonElement.disabled = true;
    buttonElement.innerHTML = '<span class="spinner" aria-hidden="true"></span> Calculando...';
  }

  function hideLoading(buttonElement) {
    if (!buttonElement) return;
    buttonElement.disabled = false;
    if (buttonElement.dataset.originalText) {
      buttonElement.innerHTML = buttonElement.dataset.originalText;
      delete buttonElement.dataset.originalText;
    }
  }

  // Expose API
  return {
    formatNumber: formatNumber,
    formatCurrency: formatCurrency,
    showElement: showElement,
    hideElement: hideElement,
    scrollToElement: scrollToElement,
    renderResults: renderResults,
    renderComparison: renderComparison,
    renderCarbonCredits: renderCarbonCredits,
    showLoading: showLoading,
    hideLoading: hideLoading
  };
})();
