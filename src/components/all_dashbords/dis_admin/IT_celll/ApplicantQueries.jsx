import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Badge,
  Form,
  Button,
  Alert,
  Spinner,
  Modal,
} from "react-bootstrap";
import {
  FaSyncAlt,
  FaSearch,
  FaEye,
  FaFileAlt,
  FaCheckCircle,
  FaUserCircle,
  FaExternalLinkAlt,
} from "react-icons/fa";
import ITCellTopNav from "./ITCellTopNav";
import ITCellLeftNav from "./ITCellLeftNav";
import { fetchApplicantRequests } from "./applicantRequestsApi";
import "../DPO_cell/DPODashboard.css";

const API_BASE =
  "https://wecdukaward.in/balvirtaawardproject/balvirtaawardproject_backend";

const TH_STYLE = {
  padding: "12px 16px",
  color: "#64748b",
  fontSize: "0.75rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const TD_STYLE = {
  padding: "12px 16px",
  fontWeight: 500,
  fontSize: "0.875rem",
};

const getFileUrl = (file) => {
  if (!file) return null;
  return `${API_BASE}${file.startsWith("/") ? "" : "/"}${file}`;
};

const isPdf = (file) => Boolean(file && /\.pdf$/i.test(file));

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusVariant = (status) => {
  const value = String(status || "").toLowerCase();
  if (value === "pending") return "warning";
  if (value === "resolved" || value === "done" || value === "closed")
    return "success";
  return "secondary";
};

const ApplicantQueries = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuery, setSelectedQuery] = useState(null);

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

  const loadQueries = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await fetchApplicantRequests();
      setQueries(data);
    } catch (err) {
      console.error("Failed to fetch applicant queries:", err);
      setError(err.message || "Failed to fetch applicant queries");
      setQueries([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadQueries();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const filteredQueries = queries.filter((item) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      (item.applicant_id || "").toLowerCase().includes(term) ||
      (item.mobile_number || "").includes(term) ||
      (item.remark || "").toLowerCase().includes(term)
    );
  });

  const pendingCount = queries.filter(
    (item) => String(item.status || "").toLowerCase() === "pending",
  ).length;
  const withFileCount = queries.filter((item) => item.file).length;

  const closeModal = () => setSelectedQuery(null);

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

        <div
          fluid
          className="p-4 p-md-5"
          style={{ background: "#f8fafc", minHeight: "calc(100vh - 60px)" }}
        >
          {/* Page Header */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1 fw-bold text-dark" style={{ fontSize: "1.5rem" }}>
                User Queries
              </h2>
              <p className="text-muted mb-0" style={{ fontSize: "0.875rem" }}>
                आवेदक प्रश्न सूची - View applicant queries and attachments
              </p>
            </div>
            <Button
              variant="light"
              size="sm"
              className="d-flex align-items-center border shadow-sm mt-3 mt-md-0"
              onClick={() => loadQueries(true)}
              disabled={refreshing || loading}
            >
              {refreshing ? (
                <Spinner size="sm" className="me-2" />
              ) : (
                <FaSyncAlt className="me-2" />
              )}
              Refresh
            </Button>
          </div>

          {error && (
            <Alert variant="danger" className="rounded-3 border-0 shadow-sm">
              {error}
            </Alert>
          )}

          {loading && (
            <div className="text-center mt-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading user queries...</p>
            </div>
          )}

          {!loading && (
            <>
              {/* Compact Stat Cards */}
              <Row className="g-3 mb-4">
                {[
                  {
                    label: "Total Queries",
                    value: queries.length,
                    icon: <FaFileAlt />,
                    bg: "primary-soft",
                    color: "primary",
                  },
                  {
                    label: "Pending",
                    value: pendingCount,
                    icon: <FaUserCircle />,
                    bg: "warning-soft",
                    color: "warning",
                  },
                  {
                    label: "With Attachment",
                    value: withFileCount,
                    icon: <FaCheckCircle />,
                    bg: "success-soft",
                    color: "success",
                  },
                ].map((stat, idx) => (
                  <Col xs={6} lg={3} key={idx}>
                    <Card
                      className="border-0 shadow-sm h-100"
                      style={{ borderRadius: "12px" }}
                    >
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
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "#64748b",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {stat.label}
                          </div>
                          <div
                            style={{
                              fontSize: "1.25rem",
                              fontWeight: 700,
                              color: "#0f172a",
                              lineHeight: 1.2,
                            }}
                          >
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
                          <span
                            className="input-group-text bg-white border-end-0"
                            style={{
                              borderRadius: "8px 0 0 8px",
                              borderColor: "#cbd5e1",
                            }}
                          >
                            <FaSearch className="text-muted" size={14} />
                          </span>
                          <Form.Control
                            type="text"
                            placeholder="Search by applicant ID, mobile or query..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border-start-0"
                            style={{
                              borderRadius: "0 8px 8px 0",
                              borderColor: "#cbd5e1",
                              padding: "10px 12px",
                              fontSize: "0.875rem",
                            }}
                          />
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Table */}
                  <div className="table-responsive">
                    <Table
                      hover
                      className="align-items-center"
                      style={{ borderBottom: "1px solid #e2e8f0" }}
                    >
                      <thead>
                        <tr
                          style={{
                            background: "#f8fafc",
                            borderBottom: "2px solid #e2e8f0",
                          }}
                        >
                          <th style={{ ...TH_STYLE, width: "50px" }}>#</th>
                          <th style={TH_STYLE}>Applicant ID</th>
                          <th style={TH_STYLE}>Mobile Number</th>
                          <th style={TH_STYLE}>Query</th>
                          <th style={TH_STYLE}>Attachment</th>
                          <th style={TH_STYLE}>Status</th>
                          <th style={TH_STYLE}>Submitted On</th>
                          <th style={{ ...TH_STYLE, textAlign: "right" }}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredQueries.length === 0 ? (
                          <tr>
                            <td
                              colSpan="8"
                              className="text-center py-5 text-muted"
                              style={{ fontSize: "0.9rem" }}
                            >
                              No user queries found.
                            </td>
                          </tr>
                        ) : (
                          filteredQueries.map((item, index) => (
                            <tr
                              key={item.id}
                              style={{ borderBottom: "1px solid #e2e8f0" }}
                            >
                              <td style={TD_STYLE}>{index + 1}</td>
                              <td
                                style={{
                                  ...TD_STYLE,
                                  fontWeight: 600,
                                  color: "#0f172a",
                                }}
                              >
                                {item.applicant_id || "-"}
                              </td>
                              <td style={TD_STYLE}>
                                <span
                                  style={{
                                    fontWeight: 600,
                                    color: "#0f172a",
                                  }}
                                >
                                  {item.mobile_number || "-"}
                                </span>
                              </td>
                              <td style={{ ...TD_STYLE, maxWidth: "300px" }}>
                                <span
                                  style={{
                                    color: "#475569",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }}
                                  title={item.remark}
                                >
                                  {item.remark || "-"}
                                </span>
                              </td>
                              <td style={TD_STYLE}>
                                {item.file ? (
                                  <FaFileAlt
                                    className="text-primary"
                                    title="Attachment available"
                                  />
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                              <td style={TD_STYLE}>
                                <Badge
                                  bg={statusVariant(item.status)}
                                  className="badge-soft"
                                >
                                  {item.status || "pending"}
                                </Badge>
                              </td>
                              <td style={{ ...TD_STYLE, color: "#475569" }}>
                                {formatDateTime(item.created_at)}
                              </td>
                              <td style={{ ...TD_STYLE, textAlign: "right" }}>
                                <Button
                                  variant="light"
                                  size="sm"
                                  onClick={() => setSelectedQuery(item)}
                                  className="d-flex align-items-center justify-content-center border"
                                  style={{
                                    height: "32px",
                                    padding: "0 10px",
                                    borderRadius: "8px",
                                    borderColor: "#e2e8f0",
                                    color: "#64748b",
                                    fontSize: "0.78rem",
                                    fontWeight: 500,
                                  }}
                                  title="View query"
                                >
                                  <FaEye className="me-1" /> View
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </>
          )}
        </div>

        {/* Query Details Modal */}
        <Modal
          show={Boolean(selectedQuery)}
          onHide={closeModal}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FaFileAlt className="me-2" />
              Query Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedQuery && (
              <div>
                <Row className="mb-3">
                  <Col md={6}>
                    <div className="text-muted small">Applicant ID</div>
                    <div style={{ fontWeight: 600, color: "#0f172a" }}>
                      {selectedQuery.applicant_id || "-"}
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="text-muted small">Mobile Number</div>
                    <div style={{ fontWeight: 600, color: "#0f172a" }}>
                      {selectedQuery.mobile_number || "-"}
                    </div>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md={6}>
                    <div className="text-muted small">Status</div>
                    <Badge bg={statusVariant(selectedQuery.status)}>
                      {selectedQuery.status || "pending"}
                    </Badge>
                  </Col>
                  <Col md={6}>
                    <div className="text-muted small">Submitted On</div>
                    <div style={{ fontWeight: 600, color: "#0f172a" }}>
                      {formatDateTime(selectedQuery.created_at)}
                    </div>
                  </Col>
                </Row>
                <div className="mb-3">
                  <div className="text-muted small mb-1">Query / Remark</div>
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "12px",
                      fontSize: "0.9rem",
                      color: "#0f172a",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {selectedQuery.remark || "-"}
                  </div>
                </div>
                {selectedQuery.file && (
                  <div>
                    <div className="text-muted small mb-1">Attachment</div>
                    <div
                      className="d-flex align-items-center gap-2 mb-2"
                      style={{ gap: "8px" }}
                    >
                      <FaExternalLinkAlt style={{ flexShrink: 0 }} />
                      <a
                        href={getFileUrl(selectedQuery.file)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ wordBreak: "break-all", color: "#0d6efd" }}
                      >
                        {selectedQuery.file}
                      </a>
                    </div>
                    {isPdf(selectedQuery.file) && (
                      <iframe
                        title="Attachment preview"
                        src={getFileUrl(selectedQuery.file)}
                        style={{
                          width: "100%",
                          height: "420px",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default ApplicantQueries;
