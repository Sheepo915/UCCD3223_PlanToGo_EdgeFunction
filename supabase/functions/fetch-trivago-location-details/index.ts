import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface ErrorResponse {
  message: string;
  type: string;
  code: number;
}

interface User {
  username: string;
  user_location: {
    name: string;
    id: string;
  };
  review_count: number;
  reviewer_badge: string;
  avatar: {
    additionalProp: string;
  };
}

interface Address {
  street1: string;
  street2: string;
  city: string;
  state: string;
  country: string;
  postalcode: string;
  address_string: string;
}

interface Ancestor {
  abbrv: string;
  level: string;
  name: string;
  location_id: number;
}

interface Ranking {
  geo_location_id: number;
  ranking_string: string;
  geo_location_name: string;
  ranking_out_of: number;
  ranking: number;
}

interface Subrating {
  additionalProp: {
    name: string;
    localized_name: string;
    rating_image_url: string;
    value: number;
  };
}

interface Paging {
  next: string;
  previous: string;
  results: 0;
  total_results: 0;
  skipped: 0;
}

/**
 * Nearby Search and Location Search shares the same response format
 */
interface SearchResponse {
  data: {
    location_id: number;
    name: string;
    distance: string;
    bearing: string;
    address_obj: Address;
  }[];
  error?: ErrorResponse;
}

interface LocationDetailsResponse {
  location_id: number;
  name: string;
  description: string;
  web_url: string;
  address_obj: Address;
  ancestors: Ancestor[];
  latitude: number;
  longitude: number;
  timezone: string;
  email: string;
  phone: string;
  website: string;
  write_review: string;
  ranking_data: Ranking;
  rating: number;
  rating_image_url: string;
  num_reviews: string;
  review_rating_count: {
    additionalProp: string;
  };
  subratings: Subrating;
  photo_count: number;
  see_all_photos: string;
  price_level: string;
  hours: {
    periods: {
      open: {
        day: number;
        time: string;
      };
      close: {
        day: number;
        time: string;
      };
    }[];
    weekday_text: string[];
  };
  amenities: string[];
  features: string[];
  cuisine: {
    name: string;
    localized_name: string;
  }[];
  parent_brand: string;
  brand: string;
  category: {
    name: string;
    localized_name: string;
  };
  subcategory: {
    name: string;
    localized_name: string;
  }[];
  groups: {
    name: string;
    localized_name: string;
    categories: {
      name: string;
      localized_name: string;
    }[];
  }[];
  styles: string[];
  neighborhood_info: {
    location_id: string;
    name: string;
  }[];
  trip_types: {
    name: string;
    localized_name: string;
    value: string;
  }[];
  awards: {
    award_type: string;
    year: number;
    images: {
      tiny: string;
      small: string;
      large: string;
    };
    categories: string[];
    display_name: string;
  }[];
  error?: ErrorResponse;
}

interface LocationPhotosResponse {
  data: {
    id: number;
    is_blessed: boolean;
    album: string;
    caption: string;
    published_date: string;
    images: {
      additionalProp: {
        width: number;
        url: string;
        height: number;
      };
    };
    source: {
      name: string;
      localized_name: string;
    };
    user: User;
  }[];
  paging: Paging;
  error?: ErrorResponse;
}

interface LocationReviewsResponse {
  data: {
    id: number;
    lang: string;
    location_id: number;
    published_date: string;
    rating: number;
    helpful_votes: number;
    rating_image_url: string;
    url: string;
    trip_type: string;
    travel_date: string;
    text: string;
    title: string;
    owner_response: {
      id: number;
      lang: string;
      text: string;
      title: string;
      author: string;
      published_date: string;
    };
    is_machine_translated: true;
    user: User;
    subratings: Subrating;
  }[];
  paging: Paging;
  error?: ErrorResponse;
}

const CATEGORY = {
  HOTELS: "hotels",
  ATTRACTIONS: "attractions",
  RESTAURANTS: "restaurants",
  GEOS: "geos",
} as const;

const RADIUS_UNIT = {
  KM: "km",
  MI: "mi",
  M: "m",
} as const;

const DEFAULT_RADIUS = 10;

/**
 * Fetches nearby locations based on the provided latitude and longitude from the TripAdvisor API.
 *
 * @param {string} baseUrl - The base URL for the TripAdvisor API.
 * @param {Object} params - Parameters for the nearby search request.
 * @param {string} params.latLong - Latitude and longitude to find nearby locations.
 * @param {string} [params.category] - The category of locations to search for. Must be one of the predefined categories.
 * @param {string} [params.phone] - A phone number to search for locations associated with it.
 * @param {string} [params.address] - An address to search for locations near it.
 * @param {string} [params.radius=DEFAULT_RADIUS] - The search radius in the specified unit. Defaults to a predefined value.
 * @param {string} [params.radiusUnit=RADIUS_UNIT.KM] - The unit of measurement for the search radius. Defaults to kilometers.
 * @param {string} [params.language="en"] - The language code for the response. Defaults to "en".
 * @returns {Promise<SearchResponse>} A Promise that resolves to the search response.
 * @throws {Error} Throws an error if the fetch request fails or the response is not ok.
 *
 * @example
 * const nearbyLocations = await fetchLocationSearch("https://api.content.tripadvisor.com/api/v1/location/search", {
 *   searchQuery: "Hakka Mee"
 *   latLong: "40.748817,-73.985428",
 *   category: "restaurants",
 *   radius: "10",
 *   radiusUnit: "km",
 *   language: "en"
 * });
 * console.log(nearbyLocations);
 */
async function fetchLocationSearch(
  baseUrl: string,
  params: {
    searchQuery: string;
    latLong?: string;
    category?: typeof CATEGORY[keyof typeof CATEGORY];
    phone?: string;
    address?: string;
    radius?: string;
    radiusUnit?: typeof RADIUS_UNIT[keyof typeof RADIUS_UNIT];
    language?: string;
  },
): Promise<SearchResponse> {
  const KEY = Deno.env.get("KEY");

  if (!KEY) {
    throw new Error("API key is missing.");
  }

  const {
    latLong,
    searchQuery,
    category,
    phone,
    address,
    radius = DEFAULT_RADIUS,
    radiusUnit = RADIUS_UNIT.KM,
    language = "en",
  } = params;

  const queryParams = new URLSearchParams({
    key: KEY!,
    searchQuery,
    ...(latLong && { latLong }),
    ...(category && { category }),
    ...(phone && { phone }),
    ...(address && { address }),
    radius: radius.toString(),
    radiusUnit,
    language,
  });

  const url = `${baseUrl}/search?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Referer": "https://bcmbrswetxlzoujdpcsw.supabase.co/",
        "Origin": "https://bcmbrswetxlzoujdpcsw.supabase.co/",
      },
    });

    const result: SearchResponse = await response.json();

    if (!response.ok) {
      throw new Error(
        `HTTP error! Status: ${response.status} Response: ${
          JSON.stringify(result)
        }`,
      );
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch search result:", error);
    throw error;
  }
}

async function fetchLocationDetails(
  baseUrl: string,
  params: { location_id: number; language?: string; currency?: string },
): Promise<LocationDetailsResponse> {
  const KEY = Deno.env.get("KEY");

  if (!KEY) {
    throw new Error("API key is missing.");
  }

  const { location_id, language = "en", currency = "MYR" } = params;

  const queryParams = new URLSearchParams({
    key: KEY!,
    language,
    currency,
  });

  const url = `${baseUrl}/${location_id}/details?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Referer": "https://bcmbrswetxlzoujdpcsw.supabase.co/",
        "Origin": "https://bcmbrswetxlzoujdpcsw.supabase.co/",
      },
    });

    const result: LocationDetailsResponse = await response.json();

    if (!response.ok) {
      throw new Error(
        `HTTP error! Status: ${response.status} Response: ${
          JSON.stringify(result)
        }`,
      );
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch location photos:", error);
    throw error;
  }
}

/**
 * Fetches photos for a specific location from the TripAdvisor API.
 *
 * @param {string} baseUrl - The base URL for the TripAdvisor API.
 * @param {Object} params - Parameters for the request.
 * @param {number} params.location_id - The ID of the location to fetch photos for.
 * @param {string} [params.language="en"] - The language code for the response. Defaults to "en".
 * @param {number} [params.limit=5] - The maximum number of photos to retrieve. Defaults to 5.
 * @param {number} [params.offset=0] - The number of photos to skip before starting to collect results. Defaults to 0.
 * @param {string} [params.source] - The source of the photos. Optional.
 * @returns {Promise<LocationPhotosResponse>} A Promise that resolves to the location photos response.
 * @throws {Error} Throws an error if the fetch request fails or the response is not ok.
 *
 * @example
 * const photos = await fetchLocationPhotos("https://api.content.tripadvisor.com/api/v1/location/", {
 *   location_id: 12345,
 *   limit: 10,
 *   offset: 5
 * });
 * console.log(photos);
 */
async function fetchLocationPhotos(
  baseUrl: string,
  params: {
    location_id: number;
    language?: string;
    limit?: number;
    offset?: number;
    source?: string;
  },
): Promise<LocationPhotosResponse> {
  const KEY = Deno.env.get("KEY");

  if (!KEY) {
    throw new Error("API key is missing.");
  }

  const { location_id, language = "en", limit = 5, offset = 0, source } =
    params;

  const queryParams = new URLSearchParams({
    key: KEY!,
    language,
    limit: limit.toString(),
    offset: offset.toString(),
    ...(source && { source }),
  });

  const url = `${baseUrl}/${location_id}/photos?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Referer": "https://bcmbrswetxlzoujdpcsw.supabase.co/",
        "Origin": "https://bcmbrswetxlzoujdpcsw.supabase.co/",
      },
    });

    const result: LocationPhotosResponse = await response.json();

    if (!response.ok) {
      throw new Error(
        `HTTP error! Status: ${response.status} Response: ${
          JSON.stringify(result)
        }`,
      );
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch location photos:", error);
    throw error;
  }
}

/**
 * Fetches detailed information for a specific location from the TripAdvisor API.
 *
 * @param {string} baseUrl - The base URL for the TripAdvisor API.
 * @param {Object} params - Parameters for the request.
 * @param {number} params.location_id - The ID of the location to fetch details for.
 * @param {string} [params.language="en"] - The language code for the response. Defaults to "en".
 * @param {string} [params.currency="MYR"] - The currency code for the response. Defaults to "MYR".
 * @returns {Promise<LocationDetailsResponse>} A Promise that resolves to the location details response.
 * @throws {Error} Throws an error if the fetch request fails or the response is not ok.
 *
 * @example
 * const details = await fetchLocationDetails("https://api.content.tripadvisor.com/api/v1/location/", {
 *   location_id: 12345,
 *   language: "en",
 *   currency: "USD"
 * });
 * console.log(details);
 */
async function fetchLocationReviews(
  baseUrl: string,
  params: {
    location_id: number;
    language?: string;
    limit?: number;
    offset?: number;
  },
): Promise<LocationReviewsResponse> {
  const KEY = Deno.env.get("KEY");

  if (!KEY) {
    throw new Error("API key is missing.");
  }

  const { location_id, language = "en", limit = 5, offset = 0 } = params;

  const queryParams = new URLSearchParams({
    key: KEY!,
    language,
    limit: limit.toString(),
    offset: offset.toString(),
  });

  const url = `${baseUrl}/${location_id}/reviews?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Referer": "https://bcmbrswetxlzoujdpcsw.supabase.co/",
        "Origin": "https://bcmbrswetxlzoujdpcsw.supabase.co/",
      },
    });

    const result: LocationReviewsResponse = await response.json();

    if (!response.ok) {
      throw new Error(
        `HTTP error! Status: ${response.status} Response: ${response.body}`,
      );
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch location photos:", error);
    throw error;
  }
}

interface RequestSchema {
  locationId: number;
}

/**
 * Handles incoming HTTP requests and provides integrated location data from the TripAdvisor API.
 *
 * @param {Request} req - The incoming HTTP request.
 * @returns {Promise<Response>} A Promise that resolves to the HTTP response containing the location data.
 */
Deno.serve(async (req) => {
  const BASE_URL = "https://api.content.tripadvisor.com/api/v1/location";

  let request: RequestSchema;

  try {
    // Parse the incoming JSON request
    request = await req.json();

    request = {
      locationId: request.locationId,
    };
  } catch (error) {
    console.error("Failed to parse request:", error);
    return new Response(
      JSON.stringify({
        error: { message: "Invalid request format", stack: error },
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    // Fetch nearby locations based on the request data
    const locationId = request.locationId;

    const [locationDetails, locationPhotos, locationReviews] = await Promise
      .all([
        fetchLocationDetails(BASE_URL, { location_id: locationId }),
        fetchLocationPhotos(BASE_URL, { location_id: locationId }),
        fetchLocationReviews(BASE_URL, { location_id: locationId }),
      ]);

    const compiledData = {
      details: locationDetails,
      photos: locationPhotos.data,
      reviews: locationReviews.data,
    };

    console.log(compiledData);

    // Return the integrated location data
    return new Response(
      JSON.stringify(compiledData),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return new Response(
      JSON.stringify({
        error: { message: "Failed to fetch data", stack: error },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/fetch-trivago-location-details' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
