const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Device {
  id: number;
  hostname: string;
  ip_address: string;
  mac_address: string;
  device_type: 'router' | 'switch' | 'firewall' | 'access_point' | 'server';
  vendor: string;
  model: string;
  serial_number: string;
  firmware_version: string;
  status: 'active' | 'offline' | 'maintenance' | 'decommissioned';
  location_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: number;
  site_name: string;
  building_rack: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface GNS3Project {
  project_id: string;
  name: string;
  path: string;
  status: string;
  filename: string;
}

export interface SyncResult {
  synced_devices: number;
  skipped_devices: number;
  errors: string[];
  project_name: string;
  project_id: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    if (typeof fetch === 'undefined') {
      throw new Error('fetch is not available. This API client must be used in a client component.');
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Devices
  async getDevices(params?: { skip?: number; limit?: number; status?: string; vendor?: string; search?: string }): Promise<Device[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.vendor) queryParams.append('vendor', params.vendor);
    if (params?.search) queryParams.append('search', params.search);
    
    const query = queryParams.toString();
    return this.request<Device[]>(`/api/v1/devices${query ? `?${query}` : ''}`);
  }

  async getDevice(id: number): Promise<Device> {
    return this.request<Device>(`/api/v1/devices/${id}`);
  }

  async createDevice(device: Partial<Device>): Promise<Device> {
    return this.request<Device>('/api/v1/devices', {
      method: 'POST',
      body: JSON.stringify(device),
    });
  }

  async updateDevice(id: number, device: Partial<Device>): Promise<Device> {
    return this.request<Device>(`/api/v1/devices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(device),
    });
  }

  async deleteDevice(id: number): Promise<void> {
    return this.request<void>(`/api/v1/devices/${id}`, {
      method: 'DELETE',
    });
  }

  // Locations
  async getLocations(): Promise<Location[]> {
    return this.request<Location[]>('/api/v1/locations');
  }

  async getLocation(id: number): Promise<Location> {
    return this.request<Location>(`/api/v1/locations/${id}`);
  }

  async createLocation(location: Partial<Location>): Promise<Location> {
    return this.request<Location>('/api/v1/locations', {
      method: 'POST',
      body: JSON.stringify(location),
    });
  }

  async updateLocation(id: number, location: Partial<Location>): Promise<Location> {
    return this.request<Location>(`/api/v1/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(location),
    });
  }

  async deleteLocation(id: number): Promise<void> {
    return this.request<void>(`/api/v1/locations/${id}`, {
      method: 'DELETE',
    });
  }

  // GNS3
  async getGNS3Projects(): Promise<GNS3Project[]> {
    return this.request<GNS3Project[]>('/api/v1/gns3/projects');
  }

  async syncGNS3Project(projectId: string, createLocation?: boolean, locationName?: string): Promise<SyncResult> {
    const queryParams = new URLSearchParams();
    if (createLocation !== undefined) queryParams.append('create_location', createLocation.toString());
    if (locationName) queryParams.append('location_name', locationName);
    
    const query = queryParams.toString();
    return this.request<SyncResult>(`/api/v1/gns3/sync/${projectId}${query ? `?${query}` : ''}`, {
      method: 'POST',
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; service: string; database: string }> {
    return this.request<{ status: string; service: string; database: string }>('/health');
  }
}

export const api = new ApiClient();
