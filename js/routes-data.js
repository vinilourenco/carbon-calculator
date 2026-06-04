// RoutesDB — simple in-memory database of common Brazilian routes
// Structure:
// RoutesDB = {
//   routes: [ { origin: 'City, ST', destination: 'City, ST', distanceKm: 123 }, ... ],
//   getAllCities: function() { ... },
//   findDistance: function(origin, destination) { ... }
// }
// This file defines a single global variable: RoutesDB

var RoutesDB = (function () {
  'use strict';

  var routes = [
    { origin: 'São Paulo, SP', destination: 'Rio de Janeiro, RJ', distanceKm: 430 },
    { origin: 'São Paulo, SP', destination: 'Brasília, DF', distanceKm: 1016 },
    { origin: 'Rio de Janeiro, RJ', destination: 'Brasília, DF', distanceKm: 1148 },
    { origin: 'São Paulo, SP', destination: 'Campinas, SP', distanceKm: 95 },
    { origin: 'Rio de Janeiro, RJ', destination: 'Niterói, RJ', distanceKm: 13 },
    { origin: 'Belo Horizonte, MG', destination: 'Ouro Preto, MG', distanceKm: 100 },
    { origin: 'Salvador, BA', destination: 'Recife, PE', distanceKm: 800 },
    { origin: 'Fortaleza, CE', destination: 'Natal, RN', distanceKm: 305 },
    { origin: 'Manaus, AM', destination: 'Porto Velho, RO', distanceKm: 870 },
    { origin: 'Belém, PA', destination: 'Macapá, AP', distanceKm: 530 },
    { origin: 'Curitiba, PR', destination: 'Florianópolis, SC', distanceKm: 300 },
    { origin: 'Porto Alegre, RS', destination: 'Caxias do Sul, RS', distanceKm: 130 },
    { origin: 'Goiânia, GO', destination: 'Anápolis, GO', distanceKm: 55 },
    { origin: 'Campinas, SP', destination: 'Ribeirão Preto, SP', distanceKm: 250 },
    { origin: 'São Paulo, SP', destination: 'Santos, SP', distanceKm: 72 },
    { origin: 'Rio de Janeiro, RJ', destination: 'Búzios, RJ', distanceKm: 170 },
    { origin: 'Recife, PE', destination: 'Maceió, AL', distanceKm: 250 },
    { origin: 'Salvador, BA', destination: 'Ilhéus, BA', distanceKm: 280 },
    { origin: 'Natal, RN', destination: 'João Pessoa, PB', distanceKm: 180 },
    { origin: 'Porto Alegre, RS', destination: 'Curitiba, PR', distanceKm: 710 },
    { origin: 'São Luís, MA', destination: 'Teresina, PI', distanceKm: 340 },
    { origin: 'Cuiabá, MT', destination: 'Rondonópolis, MT', distanceKm: 220 },
    { origin: 'Aracaju, SE', destination: 'Maceió, AL', distanceKm: 280 },
    { origin: 'Florianópolis, SC', destination: 'Porto Alegre, RS', distanceKm: 470 },
    { origin: 'Belo Horizonte, MG', destination: 'Rio de Janeiro, RJ', distanceKm: 435 },
    { origin: 'Belo Horizonte, MG', destination: 'São Paulo, SP', distanceKm: 586 },
    { origin: 'Brasília, DF', destination: 'Goiânia, GO', distanceKm: 200 },
    { origin: 'Manaus, AM', destination: 'Belém, PA', distanceKm: 1680 },
    { origin: 'Recife, PE', destination: 'Fortaleza, CE', distanceKm: 807 },
    { origin: 'Maceió, AL', destination: 'Aracaju, SE', distanceKm: 170 },
    { origin: 'Rio Branco, AC', destination: 'Porto Velho, RO', distanceKm: 540 },
    { origin: 'Boa Vista, RR', destination: 'Manaus, AM', distanceKm: 760 },
    { origin: 'Macapá, AP', destination: 'Belém, PA', distanceKm: 530 },
    { origin: 'São Paulo, SP', destination: 'Belo Horizonte, MG', distanceKm: 586 },
    { origin: 'Campina Grande, PB', destination: 'João Pessoa, PB', distanceKm: 120 },
    { origin: 'Caxias, MA', destination: 'Timon, MA', distanceKm: 20 }
  ];

  // Return unique sorted array of city names (origins and destinations)
  function getAllCities() {
    var set = new Set();
    routes.forEach(function (r) {
      if (r.origin) set.add(r.origin);
      if (r.destination) set.add(r.destination);
    });
    // Convert to array and sort alphabetically (locale aware)
    return Array.from(set).sort(function (a, b) {
      return a.localeCompare(b, 'pt-BR');
    });
  }

  // Find distance between two cities (search both directions)
  function findDistance(origin, destination) {
    if (!origin || !destination) return null;
    var o = origin.toString().trim().toLowerCase();
    var d = destination.toString().trim().toLowerCase();

    for (var i = 0; i < routes.length; i++) {
      var r = routes[i];
      var ro = r.origin.toLowerCase();
      var rd = r.destination.toLowerCase();
      if ((ro === o && rd === d) || (ro === d && rd === o)) {
        return r.distanceKm;
      }
    }
    return null;
  }

  // Expose public API
  return {
    routes: routes,
    getAllCities: getAllCities,
    findDistance: findDistance
  };
})();

// Example usage (global):
// RoutesDB.getAllCities();
// RoutesDB.findDistance('São Paulo, SP', 'Rio de Janeiro, RJ');
