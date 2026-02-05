import type { Mod } from "@/types";

const API_URL = "https://dsktcc.dvh.sh";

export interface ApiResponse<T> {
  status: number;
  data: T;
}

const fetchJSON = async <T>(endpoint: string): Promise<T> => {
  const response = await fetch(endpoint);
  if (!response.ok) {
    return Promise.reject();
  }
  const responseData: ApiResponse<T> = await response.json();
  return responseData.data;
};

export interface ModStats {
  _id: string;
  name: string;
  downloads: number;
  views: number;
}

interface ModsQuery {
  search?: string;
  sort?: string;
  type?: string;
  category?: string;
}

const fetchMods = async (query: ModsQuery = {}): Promise<Mod[]> => {
  const params = new URLSearchParams();
  if (query.search) params.append("search", query.search);
  if (query.sort) params.append("sort", query.sort);
  if (query.type) params.append("type", query.type);
  if (query.category) params.append("category", query.category);

  return fetchJSON<Mod[]>(`${API_URL}/mods?${params.toString()}`);
};

const fetchFeaturedMods = async (): Promise<Mod[]> => {
  return fetchJSON<Mod[]>(`${API_URL}/mods/featured`);
};

const fetchModByName = async (name: string): Promise<Mod> => {
  return fetchJSON<Mod>(`${API_URL}/mod/${name}`);
};

const fetchModStats = async (): Promise<ModStats[]> => {
  return fetchJSON<ModStats[]>(`${API_URL}/mods/stats`);
};

const incrementModViews = async (
  name: string,
): Promise<{ success: boolean; remainingTime?: number }> => {
  try {
    const response = await fetch(`${API_URL}/mod/${name}/view`, {
      method: "PUT",
    });
    const data = await response.json();

    if (data.status === 429) {
      return {
        success: false,
        remainingTime: Math.ceil(data.remainingTime / (1000 * 60 * 60)), // Convert to hours
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error incrementing views:", error);
    return { success: false };
  }
};

const incrementModDownloads = async (
  name: string,
): Promise<{ success: boolean; remainingTime?: number }> => {
  try {
    const response = await fetch(`${API_URL}/mod/${name}/download`, {
      method: "PUT",
    });
    const data = await response.json();

    if (data.status === 429) {
      return {
        success: false,
        remainingTime: Math.ceil(data.remainingTime / (1000 * 60 * 60)), // Convert to hours
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error incrementing downloads:", error);
    return { success: false };
  }
};

export {
  fetchMods,
  fetchFeaturedMods,
  fetchModByName,
  fetchModStats,
  incrementModViews,
  incrementModDownloads,
};
