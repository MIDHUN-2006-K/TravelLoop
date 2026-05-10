"use client";

import React, { useState, useCallback, useMemo } from "react";
import { City } from "@/types";
import { citiesService } from "@/services/api";
import { Search, MapPin } from "lucide-react";

interface CitySearchProps {
  onSelectCity?: (city: City) => void;
  showAddButton?: boolean;
}

const CitySearch: React.FC<CitySearchProps> = ({
  onSelectCity,
  showAddButton = true,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  // Get unique countries for filter
  const countries = useMemo(() => {
    return Array.from(new Set(cities.map((c) => c.country))).sort();
  }, [cities]);

  // Debounced search function
  const performSearch = useCallback(
    debounce(async (query: string) => {
      if (!query || query.length < 2) {
        setCities([]);
        return;
      }

      try {
        setLoading(true);
        const results = await citiesService.searchCities(query);
        setCities(Array.isArray(results) ? results : results.data || []);
        setError("");
      } catch (err) {
        setError("Failed to search cities");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    performSearch(value);
  };

  // Filter cities based on selected filters
  const filteredCities = useMemo(() => {
    return cities.filter((city) => {
      const countryMatch =
        selectedCountries.length === 0 ||
        selectedCountries.includes(city.country);
      return countryMatch;
    });
  }, [cities, selectedCountries]);

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Search size={20} className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search cities by name..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Search cities"
        />
      </div>

      {/* Filters */}
      {countries.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 text-sm">Filters</h3>

          {/* Country Filter */}
          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">Countries</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCountries([])}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  selectedCountries.length === 0
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {countries.slice(0, 8).map((country) => (
                <button
                  key={country}
                  onClick={() =>
                    setSelectedCountries((prev) =>
                      prev.includes(country)
                        ? prev.filter((c) => c !== country)
                        : [...prev, country]
                    )
                  }
                  className={`px-3 py-1 rounded-full text-sm transition ${
                    selectedCountries.includes(country)
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && filteredCities.length === 0 && searchQuery && (
        <div className="text-center py-8 text-gray-500">
          <MapPin size={32} className="mx-auto mb-2 opacity-50" />
          <p>No cities found. Try a different search.</p>
        </div>
      )}

      {!loading && filteredCities.length === 0 && !searchQuery && (
        <div className="text-center py-8 text-gray-500">
          <Search size={32} className="mx-auto mb-2 opacity-50" />
          <p>Start typing to search for cities...</p>
        </div>
      )}

      {/* City Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCities.map((city) => (
          <div
            key={city.city_id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-primary transition cursor-pointer"
            onClick={() => onSelectCity?.(city)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onSelectCity?.(city);
              }
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">{city.name}</h3>
                <p className="text-sm text-gray-600">{city.country}</p>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {city.country?.substring(0, 2).toUpperCase()}
              </span>
            </div>

            {city.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {city.description}
              </p>
            )}

            {/* Coordinates (if available) */}
            {city.latitude && city.longitude && (
              <p className="text-xs text-gray-500 mb-3">
                📍 {city.latitude.toFixed(2)}, {city.longitude.toFixed(2)}
              </p>
            )}

            {/* Add Button */}
            {showAddButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCity?.(city);
                }}
                className="w-full mt-3 px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                Select City
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Results Summary */}
      {!loading && filteredCities.length > 0 && (
        <div className="text-sm text-gray-600 text-center">
          Found {filteredCities.length}{" "}
          {filteredCities.length === 1 ? "city" : "cities"}
        </div>
      )}
    </div>
  );
};

export default CitySearch;

// Simple debounce implementation if lodash is not available
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}
