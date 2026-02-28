import Cookies from "universal-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6020";

/**
 * Centralized API handler for backend communication
 * Returns { data, error } objects instead of throwing errors
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

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorBody = await response
          .json()
          .catch(() => ({ message: "Request failed" }));
        return {
          data: null,
          error: {
            status: response.status,
            message: errorBody.message || errorBody.error || `HTTP error! status: ${response.status}`,
          },
        };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (err) {
      return {
        data: null,
        error: {
          status: 0,
          message: err.message || "Network error",
        },
      };
    }
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

  async deleteWorkLog(date) {
    return this.request(`/work-logs/${date}`, {
      method: "DELETE",
    });
  }

  // Work Log Summary endpoints
  async generateWorkLogSummary(month) {
    return this.request("/work-logs/summary", {
      method: "POST",
      body: JSON.stringify({ month }),
    });
  }

  async getWorkLogSummary(month) {
    return this.request(`/work-logs/summary/${month}`);
  }

  async downloadWorkLogs(startDate, endDate) {
    const cookies = new Cookies();
    const token = cookies.get("auth_token");

    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      });
      const response = await fetch(`${this.baseUrl}/work-logs/download?${params}`, {
        headers,
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: "Download failed" }));
        return {
          data: null,
          error: {
            status: response.status,
            message: errorBody.message || errorBody.error || `HTTP error! status: ${response.status}`,
          },
        };
      }

      // Get the markdown content as text
      const content = await response.text();
      return { data: content, error: null };
    } catch (err) {
      return {
        data: null,
        error: {
          status: 0,
          message: err.message || "Network error",
        },
      };
    }
  }

  // Journal endpoints
  async createJournal(data) {
    return this.request("/journals", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async listJournals(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.title) searchParams.set("title", params.title);
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    const query = searchParams.toString();
    return this.request(`/journals${query ? `?${query}` : ""}`);
  }

  async getJournal(id) {
    return this.request(`/journals/${id}`);
  }

  async deleteJournal(id) {
    return this.request(`/journals/${id}`, {
      method: "DELETE",
    });
  }

  async updateJournal(id, data) {
    return this.request(`/journals/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async refreshJournalTranscript(id) {
    return this.request(`/journals/${id}/refresh-transcript`, {
      method: "POST",
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
