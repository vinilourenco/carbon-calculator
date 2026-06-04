// CONFIG — UI and app configuration
// Exposes:
// CONFIG.TRANSPORT_MODES, CONFIG.CARBON_CREDIT
// CONFIG.populateDatalist() -> fills #cities-list from RoutesDB
// CONFIG.setupDistanceAutofill() -> hooks origin/destination inputs to autofill distance

var CONFIG = (function () {
  'use strict';

  var TRANSPORT_MODES = {
    bicycle: { label: 'Bicicleta', icon: '🚴', color: '#10b981' },
    car: { label: 'Carro', icon: '🚗', color: '#0ea5a4' },
    bus: { label: 'Ônibus', icon: '🚌', color: '#f59e0b' },
    truck: { label: 'Caminhão', icon: '🚚', color: '#6b7280' }
  };

  var CARBON_CREDIT = {
    KG_PER_CREDIT: 1000,
    PRICE_MIN_BRL: 50,
    PRICE_MAX_BRL: 150
  };

  // Populate the datalist with cities from RoutesDB
  function populateDatalist() {
    if (typeof RoutesDB === 'undefined' || !RoutesDB.getAllCities) return;

    var cities = RoutesDB.getAllCities();
    var datalist = document.getElementById('cities-list');
    if (!datalist) return;

    // Clear existing options
    datalist.innerHTML = '';

    cities.forEach(function (city) {
      var opt = document.createElement('option');
      opt.value = city;
      datalist.appendChild(opt);
    });
  }

  // Setup autofill behavior for distance based on origin/destination and manual checkbox
  function setupDistanceAutofill() {
    var originEl = document.getElementById('origin');
    var destEl = document.getElementById('destination');
    var distanceEl = document.getElementById('distance');
    var manualChk = document.getElementById('manual-distance');

    if (!originEl || !destEl || !distanceEl || !manualChk) return;

    // helper text element lives in the same .calculator__field as distance
    var helperEl = (function () {
      var parent = distanceEl.parentElement;
      if (!parent) return null;
      return parent.querySelector('.calculator__help');
    })();

    function setHelper(text, colorVar) {
      if (!helperEl) return;
      helperEl.textContent = text;
      if (colorVar) {
        var c = getComputedStyle(document.documentElement).getPropertyValue(colorVar) || colorVar;
        helperEl.style.color = c.trim();
      } else {
        helperEl.style.color = '';
      }
    }

    function tryAutofill() {
      var o = originEl.value && originEl.value.toString().trim();
      var d = destEl.value && destEl.value.toString().trim();
      if (!o || !d) {
        // nothing to do
        return;
      }

      if (typeof RoutesDB === 'undefined' || !RoutesDB.findDistance) {
        setHelper('Banco de rotas indisponível — insira manualmente.', '--text-light');
        return;
      }

      var dist = RoutesDB.findDistance(o, d);
      if (dist !== null && dist !== undefined) {
        distanceEl.value = dist;
        distanceEl.readOnly = true;
        setHelper('Distância encontrada automaticamente', '--primary');
      } else {
        distanceEl.value = '';
        distanceEl.readOnly = false;
        setHelper('Rota não encontrada — marque "Inserir distância manualmente" para digitar.', '--text-light');
      }
    }

    // events
    originEl.addEventListener('input', function () {
      if (!manualChk.checked) tryAutofill();
    });
    destEl.addEventListener('input', function () {
      if (!manualChk.checked) tryAutofill();
    });

    manualChk.addEventListener('change', function () {
      if (manualChk.checked) {
        distanceEl.readOnly = false;
        setHelper('Insira a distância manualmente', '--text-light');
        distanceEl.focus();
      } else {
        // try to autofill again
        tryAutofill();
      }
    });

    // attempt initial autofill on setup
    tryAutofill();
  }

  return {
    TRANSPORT_MODES: TRANSPORT_MODES,
    CARBON_CREDIT: CARBON_CREDIT,
    populateDatalist: populateDatalist,
    setupDistanceAutofill: setupDistanceAutofill
  };
})();

// Auto-run populateDatalist on DOMContentLoaded so the datalist is ready
document.addEventListener('DOMContentLoaded', function () {
  if (typeof CONFIG !== 'undefined' && CONFIG.populateDatalist) {
    CONFIG.populateDatalist();
  }
  if (typeof CONFIG !== 'undefined' && CONFIG.setupDistanceAutofill) {
    CONFIG.setupDistanceAutofill();
  }
});
