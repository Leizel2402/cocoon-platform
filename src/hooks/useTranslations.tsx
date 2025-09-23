import { useMemo } from 'react';

type Language = 'EN' | 'ES' | 'FR' | 'DE';

const translations = {
  EN: {
    // Header
    getPrequalified: 'Get Prequalified',
    back: 'Back',
    signOut: 'Sign Out',
    
    // Search and Filters
    searchPlaceholder: 'Enter city, neighborhood, or ZIP code',
    priceRange: 'Price',
    bedsBaths: 'Beds/Baths',
    homeType: 'Home Type',
    moveInDate: 'Move-In Date',
    allFilters: 'All Filters',
    search: 'Search',
    clearAllFilters: 'Clear All Filters',
    resetFilters: 'Reset Filters',
    saveSearch: 'Save Search',
    
    // Property Listings
    apartmentsForRent: 'Apartments for Rent in',
    rentals: 'Rentals',
    sort: 'Sort:',
    default: 'Default',
    noPropertiesFound: 'No properties found',
    adjustFilters: 'Try adjusting your filters to see more results.',
    seeDetails: 'See Details',
    
    // Property Types
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    propertyType: 'Property Type',
    studio: 'Studio',
    apartment: 'Apartment',
    condo: 'Condo',
    townhome: 'Townhome',
    house: 'House',
    loft: 'Loft',
    
    // Amenities
    amenities: 'Amenities',
    pool: 'Pool',
    gym: 'Gym',
    petFriendly: 'Pet Friendly',
    parking: 'Parking',
    inUnitLaundry: 'In Unit Laundry',
    balcony: 'Balcony',
    concierge: 'Concierge',
    businessCenter: 'Business Center',
    clubhouse: 'Clubhouse',
    
    // Map Options
    applyBoundary: 'Apply Boundary',
    drawing: 'Drawing...',
    clear: 'Clear',
    options: 'Options',
    mapStyle: 'Map Style',
    overlays: 'Overlays',
    satellite: 'Satellite',
    dark: 'Dark',
    streets: 'Streets',
    traffic: 'Traffic',
    schools: 'Schools',
    campuses: 'Campuses',
    restaurants: 'Restaurants',
    transit: 'Transit',
    
    // Languages
    english: 'English',
    spanish: 'Español',
    french: 'Français',
    german: 'Deutsch',
    
    // New Filter Options
    propertySpecs: 'Property Specs',
    squareFootage: 'Square Footage',
    yearBuilt: 'Year Built',
    petAndParking: 'Pet & Parking',
    petPolicy: 'Pet Policy',
    anyPetPolicy: 'Any Pet Policy',
    noPets: 'No Pets',
    catFriendly: 'Cat Friendly',
    dogFriendly: 'Dog Friendly',
    largeDogsOK: 'Large Dogs OK',
    parkingType: 'Parking Type',
    specialties: 'Specialties',
    additionalSpecialties: 'Additional Specialties',
    laundryFacilities: 'Laundry Facilities',
    ratingsAndNetwork: 'Ratings & Network',
    ratings: 'Ratings',
    anyRating: 'Any Rating',
    fiveStars: '5 Stars',
    fourStarsPlus: '4 Stars+',
    threeStarsPlus: '3 Stars+',
    showOnlyRentWise: 'Show Only RentWise Network',
    propertyFeatures: 'Property Features'
  },
  ES: {
    // Header
    getPrequalified: 'Precalificar',
    back: 'Atrás',
    signOut: 'Cerrar Sesión',
    
    // Search and Filters
    searchPlaceholder: 'Ingrese ciudad, vecindario o código postal',
    priceRange: 'Precio',
    bedsBaths: 'Hab/Baños',
    homeType: 'Tipo de Casa',
    moveInDate: 'Fecha de Mudanza',
    allFilters: 'Todos los Filtros',
    search: 'Buscar',
    clearAllFilters: 'Limpiar Filtros',
    resetFilters: 'Reiniciar Filtros',
    saveSearch: 'Guardar Búsqueda',
    
    // Property Listings
    apartmentsForRent: 'Apartamentos en Alquiler en',
    rentals: 'Alquileres',
    sort: 'Ordenar:',
    default: 'Predeterminado',
    noPropertiesFound: 'No se encontraron propiedades',
    adjustFilters: 'Intenta ajustar tus filtros para ver más resultados.',
    seeDetails: 'Ver Detalles',
    
    // Property Types
    bedrooms: 'Habitaciones',
    bathrooms: 'Baños',
    propertyType: 'Tipo de Propiedad',
    studio: 'Estudio',
    apartment: 'Apartamento',
    condo: 'Condominio',
    townhome: 'Casa Adosada',
    house: 'Casa',
    loft: 'Loft',
    
    // Amenities
    amenities: 'Comodidades',
    pool: 'Piscina',
    gym: 'Gimnasio',
    petFriendly: 'Acepta Mascotas',
    parking: 'Estacionamiento',
    inUnitLaundry: 'Lavandería en Unidad',
    balcony: 'Balcón',
    concierge: 'Conserje',
    businessCenter: 'Centro de Negocios',
    clubhouse: 'Casa Club',
    
    // Map Options
    applyBoundary: 'Aplicar Límite',
    drawing: 'Dibujando...',
    clear: 'Limpiar',
    options: 'Opciones',
    mapStyle: 'Estilo de Mapa',
    overlays: 'Capas',
    satellite: 'Satélite',
    dark: 'Oscuro',
    streets: 'Calles',
    traffic: 'Tráfico',
    schools: 'Escuelas',
    campuses: 'Campus',
    restaurants: 'Restaurantes',
    transit: 'Transporte',
    
    // Languages
    english: 'English',
    spanish: 'Español',
    french: 'Français',
    german: 'Deutsch',
    
    // New Filter Options
    propertySpecs: 'Especificaciones',
    squareFootage: 'Metros Cuadrados',
    yearBuilt: 'Año de Construcción',
    petAndParking: 'Mascotas y Estacionamiento',
    petPolicy: 'Política de Mascotas',
    anyPetPolicy: 'Cualquier Política',
    noPets: 'Sin Mascotas',
    catFriendly: 'Acepta Gatos',
    dogFriendly: 'Acepta Perros',
    largeDogsOK: 'Perros Grandes OK',
    parkingType: 'Tipo de Estacionamiento',
    specialties: 'Especialidades',
    additionalSpecialties: 'Especialidades Adicionales',
    laundryFacilities: 'Instalaciones de Lavandería',
    ratingsAndNetwork: 'Calificaciones y Red',
    ratings: 'Calificaciones',
    anyRating: 'Cualquier Calificación',
    fiveStars: '5 Estrellas',
    fourStarsPlus: '4 Estrellas+',
    threeStarsPlus: '3 Estrellas+',
    showOnlyRentWise: 'Solo Red RentWise',
    propertyFeatures: 'Características'
  },
  FR: {
    // Header
    getPrequalified: 'Se Préqualifier',
    back: 'Retour',
    signOut: 'Se Déconnecter',
    
    // Search and Filters
    searchPlaceholder: 'Entrez ville, quartier ou code postal',
    priceRange: 'Prix',
    bedsBaths: 'Ch/SdB',
    homeType: 'Type de Logement',
    moveInDate: 'Date d\'Emménagement',
    allFilters: 'Tous les Filtres',
    search: 'Rechercher',
    clearAllFilters: 'Effacer les Filtres',
    resetFilters: 'Réinitialiser les Filtres',
    saveSearch: 'Sauvegarder la Recherche',
    
    // Property Listings
    apartmentsForRent: 'Appartements à Louer à',
    rentals: 'Locations',
    sort: 'Trier:',
    default: 'Par Défaut',
    noPropertiesFound: 'Aucune propriété trouvée',
    adjustFilters: 'Essayez d\'ajuster vos filtres pour voir plus de résultats.',
    seeDetails: 'Voir Détails',
    
    // Property Types
    bedrooms: 'Chambres',
    bathrooms: 'Salles de Bain',
    propertyType: 'Type de Propriété',
    studio: 'Studio',
    apartment: 'Appartement',
    condo: 'Condo',
    townhome: 'Maison de Ville',
    house: 'Maison',
    loft: 'Loft',
    
    // Amenities
    amenities: 'Commodités',
    pool: 'Piscine',
    gym: 'Salle de Sport',
    petFriendly: 'Animaux Acceptés',
    parking: 'Parking',
    inUnitLaundry: 'Buanderie en Unité',
    balcony: 'Balcon',
    concierge: 'Concierge',
    businessCenter: 'Centre d\'Affaires',
    clubhouse: 'Club House',
    
    // Map Options
    applyBoundary: 'Appliquer Limite',
    drawing: 'Dessin...',
    clear: 'Effacer',
    options: 'Options',
    mapStyle: 'Style de Carte',
    overlays: 'Couches',
    satellite: 'Satellite',
    dark: 'Sombre',
    streets: 'Rues',
    traffic: 'Trafic',
    schools: 'Écoles',
    campuses: 'Campus',
    restaurants: 'Restaurants',
    transit: 'Transport',
    
    // Languages
    english: 'English',
    spanish: 'Español',
    french: 'Français',
    german: 'Deutsch',
    
    // New Filter Options
    propertySpecs: 'Spécifications',
    squareFootage: 'Surface',
    yearBuilt: 'Année de Construction',
    petAndParking: 'Animaux et Parking',
    petPolicy: 'Politique Animaux',
    anyPetPolicy: 'Toute Politique',
    noPets: 'Pas d\'Animaux',
    catFriendly: 'Chats Acceptés',
    dogFriendly: 'Chiens Acceptés',
    largeDogsOK: 'Gros Chiens OK',
    parkingType: 'Type de Parking',
    specialties: 'Spécialités',
    additionalSpecialties: 'Spécialités Supplémentaires',
    laundryFacilities: 'Buanderie',
    ratingsAndNetwork: 'Notes et Réseau',
    ratings: 'Notes',
    anyRating: 'Toute Note',
    fiveStars: '5 Étoiles',
    fourStarsPlus: '4 Étoiles+',
    threeStarsPlus: '3 Étoiles+',
    showOnlyRentWise: 'Réseau RentWise Seulement',
    propertyFeatures: 'Caractéristiques'
  },
  DE: {
    // Header
    getPrequalified: 'Vorqualifizieren',
    back: 'Zurück',
    signOut: 'Abmelden',
    
    // Search and Filters
    searchPlaceholder: 'Stadt, Nachbarschaft oder PLZ eingeben',
    priceRange: 'Preis',
    bedsBaths: 'Zi/Bad',
    homeType: 'Haustyp',
    moveInDate: 'Einzugsdatum',
    allFilters: 'Alle Filter',
    search: 'Suchen',
    clearAllFilters: 'Filter Löschen',
    resetFilters: 'Filter Zurücksetzen',
    saveSearch: 'Suche Speichern',
    
    // Property Listings
    apartmentsForRent: 'Wohnungen zur Miete in',
    rentals: 'Vermietungen',
    sort: 'Sortieren:',
    default: 'Standard',
    noPropertiesFound: 'Keine Immobilien gefunden',
    adjustFilters: 'Versuchen Sie, Ihre Filter anzupassen, um mehr Ergebnisse zu sehen.',
    seeDetails: 'Details Anzeigen',
    
    // Property Types
    bedrooms: 'Schlafzimmer',
    bathrooms: 'Badezimmer',
    propertyType: 'Immobilientyp',
    studio: 'Studio',
    apartment: 'Wohnung',
    condo: 'Eigentumswohnung',
    townhome: 'Reihenhaus',
    house: 'Haus',
    loft: 'Loft',
    
    // Amenities
    amenities: 'Ausstattung',
    pool: 'Pool',
    gym: 'Fitnessstudio',
    petFriendly: 'Haustierfreundlich',
    parking: 'Parkplatz',
    inUnitLaundry: 'Waschküche in der Einheit',
    balcony: 'Balkon',
    concierge: 'Concierge',
    businessCenter: 'Business Center',
    clubhouse: 'Clubhaus',
    
    // Map Options
    applyBoundary: 'Grenze Anwenden',
    drawing: 'Zeichnen...',
    clear: 'Löschen',
    options: 'Optionen',
    mapStyle: 'Kartenstil',
    overlays: 'Ebenen',
    satellite: 'Satellit',
    dark: 'Dunkel',
    streets: 'Straßen',
    traffic: 'Verkehr',
    schools: 'Schulen',
    campuses: 'Campus',
    restaurants: 'Restaurants',
    transit: 'Verkehr',
    
    // Languages
    english: 'English',
    spanish: 'Español',
    french: 'Français',
    german: 'Deutsch',
    
    // New Filter Options
    propertySpecs: 'Immobilienspezifikationen',
    squareFootage: 'Quadratfuß',
    yearBuilt: 'Baujahr',
    petAndParking: 'Haustiere & Parkplatz',
    petPolicy: 'Haustierpolitik',
    anyPetPolicy: 'Beliebige Politik',
    noPets: 'Keine Haustiere',
    catFriendly: 'Katzenfreundlich',
    dogFriendly: 'Hundefreundlich',
    largeDogsOK: 'Große Hunde OK',
    parkingType: 'Parkplatz Typ',
    specialties: 'Spezialitäten',
    additionalSpecialties: 'Zusätzliche Spezialitäten',
    laundryFacilities: 'Waschküche',
    ratingsAndNetwork: 'Bewertungen & Netzwerk',
    ratings: 'Bewertungen',
    anyRating: 'Beliebige Bewertung',
    fiveStars: '5 Sterne',
    fourStarsPlus: '4 Sterne+',
    threeStarsPlus: '3 Sterne+',
    showOnlyRentWise: 'Nur RentWise Netzwerk',
    propertyFeatures: 'Immobilienmerkmale'
  }
};

export const useTranslation = (language: Language = 'EN') => {
  const t = useMemo(() => {
    return (key: keyof typeof translations.EN): string => {
      return translations[language]?.[key] || translations.EN[key] || key;
    };
  }, [language]);

  return { t };
};