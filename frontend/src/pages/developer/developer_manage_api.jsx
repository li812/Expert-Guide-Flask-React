import React, { useEffect, useState } from 'react';
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
  Modal
} from '@carbon/react';
import { View, TrashCan, CheckmarkOutline, Edit, Copy, ViewOff } from '@carbon/icons-react';
import './developer.css';

const DeveloperManageAPI = ({ username }) => {
  const [apis, setApis] = useState([]);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApi, setSelectedApi] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApiKey, setShowApiKey] = useState({});
  const [copied, setCopied] = useState({});

  useEffect(() => {
    fetchApis();
  }, []);

  const fetchApis = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/developer/apis', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setApis(data.apis || []);
    } catch (error) {
      console.error('Error fetching APIs:', error);
      setError('Error fetching APIs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateDeactivate = async (apiId, status) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/developer/apis/${apiId}/status`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      setApis(prevApis => 
        prevApis.map(api => 
          api.api_id === apiId ? { ...api, status: data.status } : api
        )
      );

      setSuccessMessage(`API ${status === 'active' ? 'activated' : 'deactivated'} successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError('Error updating API status');
    }
  };

  const handleRemoveApi = async (apiId) => {
    if (!window.confirm('Are you sure you want to delete this API?')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `http://localhost:5001/api/developer/apis/${apiId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      setApis(prevApis => prevApis.filter(api => api.api_id !== apiId));
      setSuccessMessage('API deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError('Error deleting API');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewDetails = (api) => {
    setSelectedApi(api);
    setShowDetailsModal(true);
  };

  const copyToClipboard = (text, apiId) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(prev => ({ ...prev, [apiId]: true }));
      setTimeout(() => {
        setCopied(prev => ({ ...prev, [apiId]: false }));
      }, 2000);
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Grid className="dashboard">
      <Column lg={16} md={8} sm={4}>
        <Tile className="stat-tile">
          <h2>Manage APIs</h2>
          <p className="subtitle">View and manage your API integrations</p>

          {successMessage && (
            <InlineNotification
              kind="success"
              title="Success"
              subtitle={successMessage}
              onCloseButtonClick={() => setSuccessMessage(null)}
              style={{ marginBottom: '1rem' }}
            />
          )}

          {error && (
            <InlineNotification
              kind="error"
              title="Error"
              subtitle={error}
              onCloseButtonClick={() => setError(null)}
              style={{ marginBottom: '1rem' }}
            />
          )}

          <DataTable 
            rows={apis.map(api => ({
              ...api,
              id: api.api_id.toString(),
              created_at: formatDate(api.created_at)
            }))}
            headers={[
              { key: 'api_name', header: 'API Name' },
              { key: 'website_app', header: 'Website/App' },
              { key: 'website_app_logo', header: 'Logo' },
              { key: 'api_key', header: 'API Key' },
              { key: 'created_at', header: 'Created At' },
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
              <TableContainer {...getTableContainerProps()}>
                <TableToolbar>
                  <TableToolbarContent>
                    <TableToolbarSearch 
                      onChange={onInputChange}
                      placeholder="Search APIs..."
                    />
                  </TableToolbarContent>
                </TableToolbar>
                
                <Table {...getTableProps()} size="lg">
                  <TableHead>
                    <TableRow>
                      {headers.map(header => (
                        <TableHeader {...getHeaderProps({ header })}>
                          {header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map(row => (
                      <TableRow {...getRowProps({ row })}>
                        {row.cells.map(cell => {
                          if (cell.info.header === 'website_app_logo') {
                            return (
                              <TableCell key={cell.id} className="logo-cell">
                                {cell.value && (
                                  <img
                                    src={`http://localhost:5001/${cell.value}`}
                                    alt="Logo"
                                    className="api-logo"
                                  />
                                )}
                              </TableCell>
                            );
                          }
                          if (cell.info.header === 'status') {
                            return (
                              <TableCell key={cell.id}>
                                <Tag type={cell.value === 'active' ? 'green' : 'red'}>
                                  {cell.value}
                                </Tag>
                              </TableCell>
                            );
                          }
                          if (cell.info.header === 'actions') {
                            const api = apis.find(a => a.api_id.toString() === row.id);
                            return (
                              <TableCell key={cell.id}>
                                <Stack orientation="horizontal" gap={4}>
                                  <Button
                                    kind="ghost"
                                    size="sm"
                                    renderIcon={View}
                                    onClick={() => handleViewDetails(api)}
                                    iconDescription="View Details"
                                  >
                                    View
                                  </Button>
                                  <Button
                                    kind="secondary"
                                    size="sm"
                                    renderIcon={CheckmarkOutline}
                                    onClick={() => handleActivateDeactivate(
                                      api.api_id,
                                      api.status === 'active' ? 'inactive' : 'active'
                                    )}
                                    iconDescription={api.status === 'active' ? 'Deactivate' : 'Activate'}
                                  >
                                    {api.status === 'active' ? 'Deactivate' : 'Activate'}
                                  </Button>
                                  <Button
                                    kind="danger"
                                    size="sm"
                                    renderIcon={TrashCan}
                                    onClick={() => handleRemoveApi(api.api_id)}
                                    iconDescription="Delete"
                                    disabled={isDeleting}
                                  >
                                    Delete
                                  </Button>
                                </Stack>
                              </TableCell>
                            );
                          }
                          if (cell.info.header === 'api_key') {
                            return (
                              <TableCell key={cell.id}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{ fontFamily: 'monospace' }}>
                                    {showApiKey[row.id] ? cell.value : '•'.repeat(15)}
                                  </span>
                                  <Stack orientation="horizontal" gap={4}>
                                    <Button
                                      kind="ghost"
                                      size="sm"
                                      hasIconOnly
                                      renderIcon={showApiKey[row.id] ? View : ViewOff}
                                      iconDescription={showApiKey[row.id] ? "Hide API Key" : "Show API Key"}
                                      onClick={() => setShowApiKey(prev => ({ 
                                        ...prev, 
                                        [row.id]: !prev[row.id] 
                                      }))}
                                    />
                                    <Button
                                      kind="ghost"
                                      size="sm"
                                      hasIconOnly
                                      renderIcon={Copy}
                                      iconDescription={copied[row.id] ? "Copied!" : "Copy to clipboard"}
                                      onClick={() => copyToClipboard(cell.value, row.id)}
                                    />
                                  </Stack>
                                </div>
                              </TableCell>
                            );
                          }
                          return <TableCell key={cell.id}>{cell.value}</TableCell>;
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
        </Tile>
      </Column>

      {/* Details Modal */}
      <Modal
        open={showDetailsModal}
        modalHeading="API Details"
        primaryButtonText="Close"
        hasForm={false}
        passiveModal={true}
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
              <h4>API Name</h4>
              <p>{selectedApi.api_name}</p>
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
              <h4>Website/App</h4>
              <p>{selectedApi.website_app}</p>
            </div>
            <div>
              <h4>Created At</h4>
              <p>{formatDate(selectedApi.created_at)}</p>
            </div>
            <div>
              <h4>Status</h4>
              <Tag type={selectedApi.status === 'active' ? 'green' : 'red'}>
                {selectedApi.status}
              </Tag>
            </div>
          </Stack>
        )}
      </Modal>
    </Grid>
  );
};

export default DeveloperManageAPI;