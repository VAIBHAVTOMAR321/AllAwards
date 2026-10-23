const APPLICANT_REQUESTS_URL =
  "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/applicant-requests/it-cell/";

const getAuthHeaders = () => {
  const accessToken = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
};

/** Fetches the applicant queries raised by users (IT Cell inbox). */
export const fetchApplicantRequests = async () => {
  const response = await fetch(APPLICANT_REQUESTS_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || data.detail || `HTTP error! status: ${response.status}`,
    );
  }
  if (data.status === false || !Array.isArray(data.data)) {
    throw new Error(data.message || "Failed to fetch applicant queries");
  }

  return data.data;
};
