import Cookies from "universal-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Centralized API handler for backend communication
 */
class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const cookies = new Cookies();
    const token = cookies.get("auth_token");

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Request failed" }));
      throw new Error(
        error.message || error.error || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  // Auth endpoints
  async googleLogin(idToken) {
    return this.request("/auth/google", {
      method: "POST",
      body: JSON.stringify({ id_token: idToken }),
    });
  }

  async getCurrentUser() {
    return this.request("/me");
  }

  // Job Application endpoints
  async createJobApplication(data) {
    return this.request("/job-applications/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async listJobApplications(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set("search", params.search);
    if (params.state) searchParams.set("state", params.state);
    const query = searchParams.toString();
    return this.request(`/job-applications/${query ? `?${query}` : ""}`);
  }

  async getJobApplication(id) {
    return this.request(`/job-applications/${id}`);
  }

  async updateJobApplication(id, data) {
    return this.request(`/job-applications/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteJobApplication(id) {
    return this.request(`/job-applications/${id}`, {
      method: "DELETE",
    });
  }

  // Job Application Log endpoints
  async createJobApplicationLog(applicationId, data) {
    return this.request(`/job-applications/${applicationId}/logs`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async listJobApplicationLogs(applicationId) {
    return this.request(`/job-applications/${applicationId}/logs`);
  }

  async getJobApplicationLog(applicationId, logId) {
    return this.request(`/job-applications/${applicationId}/logs/${logId}`);
  }

  async updateJobApplicationLog(applicationId, logId, data) {
    return this.request(`/job-applications/${applicationId}/logs/${logId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteJobApplicationLog(applicationId, logId) {
    return this.request(`/job-applications/${applicationId}/logs/${logId}`, {
      method: "DELETE",
    });
  }

  // Work Log endpoints
  async upsertWorkLog(data) {
    return this.request("/work-logs/", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async listWorkLogs() {
    return this.request("/work-logs/");
  }

  async getWorkLogByDate(date) {
    return this.request(`/work-logs/${date}`);
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
