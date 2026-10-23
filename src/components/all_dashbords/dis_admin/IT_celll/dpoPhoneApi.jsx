const DISTRICT_DETAILS_URL =
  "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend/api/district-details/";

const getAuthHeaders = () => {
  const accessToken = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
};

/** Fetches the district master list with each district's DPO contact. */
export const fetchDistrictDetails = async () => {
  const response = await fetch(DISTRICT_DETAILS_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.detail || `HTTP error! status: ${response.status}`);
  }
  if (data.success === false || !Array.isArray(data.data)) {
    throw new Error(data.message || "Failed to fetch district details");
  }

  return data.data;
};

/**
 * Updates a district's DPO contact details.
 *
 * @param {number} id          - district record id
 * @param {object} updates     - fields to change, e.g. { phone, full_name }
 */
export const updateDistrictDetails = async (id, updates) => {
  const response = await fetch(DISTRICT_DETAILS_URL, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ id, ...updates }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.detail || `HTTP error! status: ${response.status}`);
  }
  if (data.success === false) {
    throw new Error(data.message || "Failed to update the district details");
  }

  return data;
};
