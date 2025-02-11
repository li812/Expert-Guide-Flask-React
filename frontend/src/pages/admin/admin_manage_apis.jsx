import React, { useEffect, useState } from "react";
import {
  Grid,
  Column,
  Tile,
  Button,
  InlineNotification,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tag,
  Stack,
  Modal,
  DatePicker,
  DatePickerInput,
  DataTableSkeleton,
  Dropdown,
  CodeSnippet
} from "@carbon/react";
import { TrashCan, View, Download, Copy, ViewOff } from "@carbon/icons-react";
import { useNavigate } from "react-router-dom";
import "./admin.css";

class APIErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('API Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <h2>Something went wrong.</h2>
                    <Button onClick={() => window.location.reload()}>
                        Refresh Page
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

const ApiLogo = ({ api, size = "small" }) => {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setLoading(false);
  };

  const handleImageLoad = () => {
    setLoading(false);
  };

  if (!api.website_app_logo || imageError) {
    return (
      <div className={`api-logo-container ${size}`}>
        <div className="default-avatar">
          <View size={size === "small" ? 24 : 32} />
        </div>
      </div>
    );
  }

  return (
    <div className={`api-logo-container ${size}`}>
      {loading && (
        <div className="loading-logo">
          <View size={size === "small" ? 24 : 32} />
        </div>
      )}
      <img
        src={`http://localhost:5001/${api.website_app_logo}`}
        alt={`${api.website_app}'s logo`}
        className={`api-logo ${loading ? 'hidden' : ''}`}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    </div>
  );
};

const AdminManageApis = () => {
  const [apis, setApis] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedApi, setSelectedApi] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState([null, null]);
  const [actionLoading, setActionLoading] = useState({});
  const [showApiKey, setShowApiKey] = useState({});
  const [copied, setCopied] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchApis();
  }, [navigate]);

  const fetchApis = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:5001/api/admin/apis", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });

      if (response.status === 401) {
        navigate("/login");
        return;
      }

      const data = await response.json();
      console.log("Raw API data:", data); // Debug log

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (!Array.isArray(data.apis)) {
        throw new Error('Invalid API response format');
      }

      // Sort APIs by created_at in descending order
      const sortedApis = data.apis.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );

      setApis(sortedApis);
      console.log("Processed APIs:", sortedApis); // Debug log
    } catch (error) {
      console.error("Error fetching APIs:", error);
      setError(error.message || "Error fetching APIs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (api_id) => {
    if (window.confirm("Are you sure you want to delete this API?")) {
      try {
        const response = await fetch(
          `http://localhost:5001/api/admin/apis/${api_id}`,
          {
            method: "DELETE",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setApis(apis.filter((api) => api.api_id !== api_id));
      } catch (error) {
        console.error("Error deleting API:", error);
        setError("Error deleting API");
      }
    }
  };

  const handleChangeStatus = async (api_id, newStatus) => {
    setActionLoading(prev => ({ ...prev, [api_id]: true }));
    try {
      const response = await fetch(
        `http://localhost:5001/api/admin/apis/${api_id}/status`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setApis(prevApis =>
        prevApis.map(api =>
          api.api_id === api_id ? { ...api, status: data.status } : api
        )
      );

      setSuccessMessage(`API ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError("Error updating API status");
    } finally {
      setActionLoading(prev => ({ ...prev, [api_id]: false }));
    }
  };

  const handleViewDetails = (api) => {
    setSelectedApi(api);
    setShowDetailsModal(true);
  };

  const exportToCSV = () => {
    const headers = ['API ID', 'Website/App', 'Developer', 'Developer Type', 'Company', 'Status', 'Created At'];
    const data = filteredApis.map(api => [
        api.api_id,
        api.website_app,
        api.developer_name,
        api.developer_type,
        api.company_name,
        api.status,
        new Date(api.created_at).toLocaleString()
    ]);

    const csvContent = [
        headers.join(','),
        ...data.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `apis_export_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredApis = apis.filter(api => {
    console.log(`Filtering API: ${api.api_id}, Status: ${api.status}, Filter: ${filterStatus}`);
    
    if (filterStatus !== 'all' && api.status?.toLowerCase() !== filterStatus?.toLowerCase()) {
        return false;
    }
    
    if (dateRange[0] || dateRange[1]) {
        const apiDate = new Date(api.created_at);
        if (dateRange[0] && apiDate < new Date(dateRange[0])) return false;
        if (dateRange[1]) {
            const endDate = new Date(dateRange[1]);
            endDate.setHours(23, 59, 59);
            if (apiDate > endDate) return false;
        }
    }
    
    return true;
  });

  console.log("Filtered APIs:", filteredApis); // Add this line to log the filtered APIs

  const copyToClipboard = (text, apiId) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(prev => ({ ...prev, [apiId]: true }));
      setTimeout(() => {
        setCopied(prev => ({ ...prev, [apiId]: false }));
      }, 2000);
    });
  };

  return (
    <APIErrorBoundary>
      <Grid className="dashboard">
        <Column lg={15} md={8} sm={4} id="table-container" style={{ overflowX: 'auto', width: '100%' }}>
          <Tile className="stat-tile">
            <Stack gap={7}>
              <div className="tile-header">
                <h2>Manage APIs</h2>
                <p className="subtitle">View and manage API integrations</p>
              </div>

              {successMessage && (
                <InlineNotification
                  kind="success"
                  title="Success"
                  subtitle={successMessage}
                  onCloseButtonClick={() => setSuccessMessage(null)}
                />
              )}

              {error && (
                <InlineNotification
                  kind="error"
                  title="Error"
                  subtitle={error}
                  onCloseButtonClick={() => setError(null)}
                />
              )}

              {loading ? (
                <DataTableSkeleton columnCount={8} rowCount={5} />
              ) : (
                <DataTable
                  rows={filteredApis.map(api => ({
                    id: String(api.api_id),
                    api_id: String(api.api_id),
                    logo: <ApiLogo api={api} />,
                    websiteApp: api.website_app,
                    developerName: api.developer_name || 'Unknown',
                    developerType: api.developer_type || 'Unknown',
                    companyName: api.company_name || 'Unknown',
                    createdAt: new Date(api.created_at).toLocaleString(),
                    status: (
                      <Tag type={api.status === 'active' ? 'green' : 'red'}>
                        {api.status}
                      </Tag>
                    ),
                    actions: (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <Button
                          kind="ghost"
                          size="sm"
                          renderIcon={View}
                          onClick={() => handleViewDetails(api)}
                        >
                          View
                        </Button>
                        <Button
                          kind="secondary"
                          size="sm"
                          onClick={() => handleChangeStatus(
                            api.api_id,
                            api.status === 'active' ? 'inactive' : 'active'
                          )}
                        >
                          {api.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          kind="danger"
                          size="sm"
                          renderIcon={TrashCan}
                          onClick={() => handleDelete(api.api_id)}
                        >
                          Delete
                        </Button>
                      </div>
                    ),
                  }))}
                  headers={[
                    { key: 'api_id', header: 'API ID' },
                    { key: 'logo', header: 'Logo' },
                    { key: 'websiteApp', header: 'Website/App' },
                    { key: 'developerName', header: 'Developer' },
                    { key: 'developerType', header: 'Developer Type' },
                    { key: 'companyName', header: 'Company' },
                    { key: 'createdAt', header: 'Created At' },
                    { key: 'status', header: 'Status' },
                    { key: 'actions', header: 'Actions' }
                  ]}
                  isSortable
                >
                  {({
                    rows,
                    headers,
                    getHeaderProps,
                    getRowProps,
                    getTableProps,
                    getTableContainerProps,
                    onInputChange,
                  }) => (
                    <TableContainer {...getTableContainerProps()} style={{ overflowX: 'auto', width: '100%' }}>
                      <TableToolbar>
                        <TableToolbarContent>
                          <Button
                            kind="ghost"
                            onClick={() => {
                                setFilterStatus('all');
                                setDateRange([null, null]);
                            }}
                          >
                            Reset Filters
                          </Button>
                          <Dropdown
                            id="status-filter"
                            titleText="Filter by Status"
                            label="Status"
                            items={['All', 'Active', 'Inactive']}
                            selectedItem={filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                            onChange={({ selectedItem }) => setFilterStatus(selectedItem.toLowerCase())}
                            style={{
                              minWidth: '150px',
                              height: '40px',
                              marginRight: '1rem'
                            }}
                          />
                          <DatePicker
                            datePickerType="range"
                            onChange={(dates) => setDateRange(dates)}
                          >
                            <DatePickerInput
                              id="date-picker-input-start"
                              placeholder="mm/dd/yyyy"
                              labelText="Start date"
                            />
                            <DatePickerInput
                              id="date-picker-input-end"
                              placeholder="mm/dd/yyyy"
                              labelText="End date"
                            />
                          </DatePicker>
                          <TableToolbarSearch 
                            onChange={onInputChange}
                            persistent={true}
                            placeholder="Search APIs..."
                          />
                          <Button
                            renderIcon={Download}
                            onClick={exportToCSV}
                          >
                            Export
                          </Button>
                        </TableToolbarContent>
                      </TableToolbar>
                      <br></br><br></br><br></br>
                      <Table {...getTableProps()} style={{ width: '100%', tableLayout: 'fixed' }}>
                        <TableHead>
                          <TableRow>
                            {headers.map(header => {
                              const { key, ...headerProps } = getHeaderProps({ header });
                              return (
                                <TableHeader key={header.key} {...headerProps}>
                                  {header.header}
                                </TableHeader>
                              );
                            })}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {rows.map(row => {
                            const { key, ...rowProps } = getRowProps({ row });
                            return (
                              <TableRow key={row.id} {...rowProps}>
                                {row.cells.map(cell => (
                                  <TableCell key={cell.id} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {cell.value}
                                  </TableCell>
                                ))}
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </DataTable>
              )}
            </Stack>
          </Tile>
        </Column>

        <Modal
          open={showDetailsModal}
          modalHeading="API Details"
          primaryButtonText="Close"
          preventCloseOnClickOutside
          onRequestClose={() => {
            setShowDetailsModal(false);
            setSelectedApi(null);
          }}
          onRequestSubmit={() => {
            setShowDetailsModal(false);
            setSelectedApi(null);
          }}
        >
          {selectedApi && (
            <Stack gap={7}>
              <div>
                <ApiLogo api={selectedApi} size="large" />
              </div>
              <div>
                <h4>Website/App Name</h4>
                <p>{selectedApi.website_app}</p>
              </div>
              <div>
                <h4>API Key</h4>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  backgroundColor: 'var(--cds-layer-01)',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid var(--cds-border-subtle)'
                }}>
                  <span style={{ fontFamily: 'monospace' }}>
                    {showApiKey[selectedApi.id] ? selectedApi.api_key : '•'.repeat(15)}
                  </span>
                  <Stack orientation="horizontal" gap={4}>
                    <Button
                      kind="ghost"
                      size="sm"
                      hasIconOnly
                      renderIcon={showApiKey[selectedApi.id] ? View : ViewOff}
                      iconDescription={showApiKey[selectedApi.id] ? "Hide API Key" : "Show API Key"}
                      onClick={() => setShowApiKey(prev => ({ 
                        ...prev, 
                        [selectedApi.id]: !prev[selectedApi.id] 
                      }))}
                    />
                    <Button
                      kind="ghost"
                      size="sm"
                      hasIconOnly
                      renderIcon={Copy}
                      iconDescription={copied[selectedApi.id] ? "Copied!" : "Copy to clipboard"}
                      onClick={() => copyToClipboard(selectedApi.api_key, selectedApi.id)}
                    />
                  </Stack>
                </div>
              </div>
              <div>
                <h4>Developer Name</h4>
                <p>{selectedApi.developer_name}</p>
              </div>
              <div>
                <h4>Developer Type</h4>
                <p>{selectedApi.developer_type}</p>
              </div>
              <div>
                <h4>Company Name</h4>
                <p>{selectedApi.company_name}</p>
              </div>
              <div>
                <h4>Status</h4>
                <Tag type={selectedApi.status === 'active' ? 'green' : 'red'}>
                  {selectedApi.status}
                </Tag>
              </div>
              <div>
                <h4>Created At</h4>
                <p>{new Date(selectedApi.created_at).toLocaleString()}</p>
              </div>
            </Stack>
          )}
        </Modal>
      </Grid>
    </APIErrorBoundary>
  );
};

export default AdminManageApis;