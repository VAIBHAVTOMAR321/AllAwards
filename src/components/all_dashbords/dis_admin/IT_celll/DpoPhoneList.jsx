import React, { useState, useEffect } from "react";
import { Row, Col, Card, Table, Badge, Form, Button, Alert, Spinner } from "react-bootstrap";
import {
  FaPhoneAlt,
  FaEdit,
  FaSyncAlt,
  FaSave,
  FaTimes,
  FaSearch,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaUserCircle,
} from "react-icons/fa";
import ITCellTopNav from "./ITCellTopNav";
import ITCellLeftNav from "./ITCellLeftNav";
import { fetchDistrictDetails, updateDistrictDetails } from "./dpoPhoneApi";
import "../DPO_cell/DPODashboard.css";

const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(String(phone || "").trim());

const DpoPhoneList = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [actionMessage, setActionMessage] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editPhone, setEditPhone] = useState("");
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadDistricts = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await fetchDistrictDetails();
      setDistricts(data);
    } catch (err) {
      console.error("Failed to fetch district details:", err);
      setError(err.message || "Failed to fetch district details");
      setDistricts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDistricts();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const filteredDistricts = districts.filter((item) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      (item.district || "").toLowerCase().includes(term) ||
      (item.full_name || "").toLowerCase().includes(term) ||
      (item.phone || "").includes(term)
    );
  });

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setEditPhone(item.phone || "");
    setEditName(item.full_name || "");
    setEditError(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditPhone("");
    setEditName("");
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (editingId === null || saving) return;

    const nextPhone = editPhone.trim();
    const nextName = editName.trim();

    if (nextPhone && !isValidPhone(nextPhone)) {
      setEditError("कृपया वैध 10 अंकों का मोबाइल नंबर दर्शाएं।");
      return;
    }

    const duplicate = districts.some(
      (item) => item.id !== editingId && item.phone && item.phone === nextPhone
    );
    if (duplicate) {
      setEditError("यह मोबाइल नंबर पहले से किसी अन्य जिले में मौजूद है।");
      return;
    }

    setSaving(true);
    setEditError(null);
    try {
      await updateDistrictDetails(editingId, {
        phone: nextPhone || null,
        full_name: nextName || null,
      });
      await loadDistricts(true);
      setActionMessage({ type: "success", text: "District contact updated successfully." });
      handleCancelEdit();
    } catch (err) {
      setEditError(err.message || "Failed to update the district contact");
    } finally {
      setSaving(false);
    }
  };

  const withPhone = districts.filter((item) => item.phone).length;
  const withoutPhone = districts.length - withPhone;

  return (
    <div className="dashboard-container">
      <ITCellLeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      <div className="main-content-dash">
        <ITCellTopNav toggleSidebar={toggleSidebar} />

        <div fluid className="p-4 p-md-5" style={{ background: "#f8fafc", minHeight: "calc(100vh - 60px)" }}>
          {/* Page Header */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1 fw-bold text-dark" style={{ fontSize: "1.5rem" }}>
                DPO Phone Directory
              </h2>
              <p className="text-muted mb-0" style={{ fontSize: "0.875rem" }}>
                जिला कार्यक्रम अधिकारी मोबाइल नंबर सूची - View and update anytime
              </p>
            </div>
            <Button
              variant="light"
              size="sm"
              className="d-flex align-items-center border shadow-sm mt-3 mt-md-0"
              onClick={() => loadDistricts(true)}
              disabled={refreshing || loading}
            >
              {refreshing ? <Spinner size="sm" className="me-2" /> : <FaSyncAlt className="me-2" />}
              Refresh
            </Button>
          </div>

          {actionMessage && (
            <Alert
              variant={actionMessage.type}
              className="rounded-3 border-0 shadow-sm"
              onClose={() => setActionMessage(null)}
              dismissible
            >
              {actionMessage.text}
            </Alert>
          )}

          {error && (
            <Alert variant="danger" className="rounded-3 border-0 shadow-sm">
              {error}
            </Alert>
          )}

          {loading && (
            <div className="text-center mt-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading district contacts...</p>
            </div>
          )}

          {!loading && (
            <>
              {/* Compact Stat Cards */}
              <Row className="g-3 mb-4">
                {[
                  { label: "Total Districts", value: districts.length, icon: <FaMapMarkerAlt />, bg: "primary-soft", color: "primary" },
                  { label: "Phone Added", value: withPhone, icon: <FaCheckCircle />, bg: "success-soft", color: "success" },
                  { label: "Pending", value: withoutPhone, icon: <FaUserCircle />, bg: "warning-soft", color: "warning" },
                ].map((stat, idx) => (
                  <Col xs={6} lg={3} key={idx}>
                    <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
                      <Card.Body className="d-flex align-items-center p-3">
                        <div
                          className="d-flex align-items-center justify-content-center me-3"
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            background: `var(--${stat.bg}, #e2e8f0)`,
                            color: `var(--bs-${stat.color}, #333)`,
                            fontSize: "1.1rem",
                          }}
                        >
                          {stat.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            {stat.label}
                          </div>
                          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>
                            {stat.value}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              <Card className="border-0 shadow-sm" style={{ borderRadius: "12px" }}>
                <Card.Body className="p-4">
                  {/* Filter Bar */}
                  <div className="mb-4">
                    <Row className="g-3 align-items-center">
                      <Col xs={12} md={6} lg={5}>
                        <div className="input-group">
                          <span className="input-group-text bg-white border-end-0" style={{ borderRadius: "8px 0 0 8px", borderColor: "#cbd5e1" }}>
                            <FaSearch className="text-muted" size={14} />
                          </span>
                          <Form.Control
                            type="text"
                            placeholder="Search by district, name or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border-start-0"
                            style={{ borderRadius: "0 8px 8px 0", borderColor: "#cbd5e1", padding: "10px 12px", fontSize: "0.875rem" }}
                          />
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Table */}
                  <div className="table-responsive">
                    <Table hover className="align-items-center" style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                          <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", width: "50px" }}>#</th>
                          <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            <FaMapMarkerAlt className="me-1" /> District
                          </th>
                          <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>DPO Name</th>
                          <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            <FaPhoneAlt className="me-1" /> Phone Number
                          </th>
                          <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</th>
                          <th style={{ padding: "12px 16px", color: "#64748b", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDistricts.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center py-5 text-muted" style={{ fontSize: "0.9rem" }}>
                              No district contacts found.
                            </td>
                          </tr>
                        ) : (
                          filteredDistricts.map((item, index) => {
                            const isEditingRow = editingId === item.id;
                            return (
                              <tr key={item.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                <td style={{ padding: "12px 16px", color: "#94a3b8", fontWeight: 500 }}>{index + 1}</td>
                                <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0f172a", fontSize: "0.875rem" }}>
                                  {item.district}
                                </td>
                                <td style={{ padding: "12px 16px" }}>
                                  {isEditingRow ? (
                                    <Form.Control
                                      type="text"
                                      value={editName}
                                      onChange={(e) => setEditName(e.target.value)}
                                      className="border"
                                      placeholder="DPO name"
                                      style={{ borderRadius: "8px", borderColor: "#cbd5e1", fontSize: "0.85rem", padding: "6px 10px" }}
                                    />
                                  ) : (
                                    <span style={{ color: "#475569", fontSize: "0.875rem" }}>{item.full_name || "-"}</span>
                                  )}
                                </td>
                                <td style={{ padding: "12px 16px" }}>
                                  {isEditingRow ? (
                                    <Form.Control
                                      type="tel"
                                      maxLength={10}
                                      value={editPhone}
                                      onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ""))}
                                      className="border"
                                      placeholder="10 digit mobile"
                                      autoFocus
                                      style={{ borderRadius: "8px", borderColor: "#cbd5e1", fontSize: "0.85rem", padding: "6px 10px" }}
                                    />
                                  ) : (
                                    <span style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.875rem" }}>
                                      {item.phone || "-"}
                                    </span>
                                  )}
                                </td>
                                <td style={{ padding: "12px 16px" }}>
                                  {item.phone ? (
                                    <Badge bg="success" className="badge-soft">
                                      <FaCheckCircle className="me-1" /> Added
                                    </Badge>
                                  ) : (
                                    <Badge bg="warning" text="dark" className="badge-soft">
                                      Pending
                                    </Badge>
                                  )}
                                </td>
                                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                                  {isEditingRow ? (
                                    <div className="d-flex gap-2 justify-content-end">
                                      <Button
                                        variant="success"
                                        size="sm"
                                        onClick={handleSaveEdit}
                                        disabled={saving}
                                        className="d-flex align-items-center"
                                        style={{ borderRadius: "8px", padding: "0px 10px", height: "32px", fontSize: "0.78rem", fontWeight: 500 }}
                                      >
                                        {saving ? <Spinner size="sm" /> : <FaSave className="me-1" />}
                                        Save
                                      </Button>
                                      <Button
                                        variant="light"
                                        size="sm"
                                        onClick={handleCancelEdit}
                                        disabled={saving}
                                        className="d-flex align-items-center justify-content-center border"
                                        style={{ width: "32px", height: "32px", padding: 0, borderRadius: "8px", borderColor: "#e2e8f0", color: "#64748b" }}
                                        title="Cancel"
                                      >
                                        <FaTimes size={14} />
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      variant="light"
                                      size="sm"
                                      onClick={() => handleEditClick(item)}
                                      className="d-flex align-items-center justify-content-center border"
                                      style={{ width: "32px", height: "32px", padding: 0, borderRadius: "8px", borderColor: "#e2e8f0", color: "#64748b" }}
                                      title="Edit contact"
                                    >
                                      <FaEdit size={14} />
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </Table>
                  </div>

                  {editingId !== null && editError && (
                    <Alert variant="danger" className="rounded-3 py-2 mt-3 mb-0" style={{ fontSize: "0.8rem" }}>
                      {editError}
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DpoPhoneList;
