import React, { useState, useEffect, useCallback } from 'react';
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
  Form,
  Stack,
  Modal,
  Tag,
  Pagination,
  Dropdown,
  DatePicker,
  DatePickerInput,
  TextInput,
  TextArea,
  Loading
} from '@carbon/react';
import { View, TrashCan, Edit } from '@carbon/icons-react';
import { format, parse, isValid } from 'date-fns';
import { ErrorBoundary } from 'react-error-boundary';

// Add this helper function at the top
const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <InlineNotification
    kind="error"
    title="Something went wrong"
    subtitle={error.message}
    actions={
      <Button onClick={resetErrorBoundary}>
        Try again
      </Button>
    }
  />
);

/**
 * @typedef {Object} Complaint
 * @property {string} id
 * @property {string} subject
 * @property {string} message
 * @property {string} send_time
 * @property {string} reply
 * @property {string} reply_time
 * @property {string} status
 */


const DeveloperManageComplaints = ({ username }) => {
  const [complaint, setComplaint] = useState({ subject: '', message: '' });
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDateRange, setFilterDateRange] = useState([null, null]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  // Add these state variables
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5001/api/developer/complaints', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setComplaints(data.complaints || []);
        setFilteredComplaints(data.complaints || []);
      } catch (error) {
        console.error('Error fetching complaints:', error);
        setError('Error fetching complaints');
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setComplaint({ ...complaint, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/developer/complaints', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(complaint),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setComplaints([...complaints, data.complaint]);
      setFilteredComplaints([...complaints, data.complaint]);
      setComplaint({ subject: '', message: '' });
      setSuccessMessage('Complaint sent successfully!');
    } catch (error) {
      console.error('Error sending complaint:', error);
      setError('Error sending complaint');
    } finally {
      setIsLoading(false);
    }
  };

  // Update handleViewReply to use MessageModal
  const handleViewReply = async (row) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5001/api/developer/complaints/${row.id}/details`,
        {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const { complaint } = await response.json();
      setSelectedMessage(complaint);
      setShowMessageModal(true);
    } catch (error) {
      setError('Error fetching complaint details');
    } finally {
      setIsLoading(false);
    }
  };

  // Add validation helper
  const validateComplaint = (complaint) => {
    const errors = [];
    if (!complaint.subject?.trim()) errors.push('Subject is required');
    if (!complaint.message?.trim()) errors.push('Message is required');
    if (complaint.subject?.length > 200) errors.push('Subject is too long (max 200 characters)');
    if (complaint.message?.length > 3000) errors.push('Message is too long (max 1000 characters)');
    return errors;
  };

  // Update handleEditComplaint function
  const handleEditComplaint = async (complaint) => {
    setIsLoading(true);
    try {
      // Fetch the latest complaint data
      const response = await fetch(
        `http://localhost:5001/api/developer/complaints/${complaint.id}/details`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const { complaint: fetchedComplaint } = await response.json();
      
      setSelectedComplaint({
        ...fetchedComplaint,
        id: fetchedComplaint.id.toString(),
        subject: fetchedComplaint.subject,
        message: fetchedComplaint.message,
      });
      setIsEditMode(true);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching complaint details:', error);
      setError('Error fetching complaint details');
    } finally {
      setIsLoading(false);
    }
  };

  // Improve handleUpdateComplaint function
  const handleUpdateComplaint = async () => {
    const validationErrors = validateComplaint(selectedComplaint);
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setIsLoading(true);
    const previousComplaints = [...complaints];
    const previousFilteredComplaints = [...filteredComplaints];

    try {
      // Only send changed fields
      const updateData = {};
      if (selectedComplaint.subject !== undefined) {
        updateData.subject = selectedComplaint.subject;
      }
      if (selectedComplaint.message !== undefined) {
        updateData.message = selectedComplaint.message;
      }

      const response = await fetch(
        `http://localhost:5001/api/developer/complaints/${selectedComplaint.id}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const { complaint } = await response.json();
      
      // Update with server response
      const updateComplaintsList = list => list.map(c => 
        c.id === complaint.id ? {
          ...complaint,
          id: complaint.id.toString(),
          created_at: formatDate(complaint.send_time),
          reply_time: complaint.reply_time ? formatDate(complaint.reply_time) : 'N/A'
        } : c
      );

      setComplaints(updateComplaintsList(complaints));
      setFilteredComplaints(updateComplaintsList(filteredComplaints));
      setSuccessMessage('Complaint updated successfully!');
      setIsModalOpen(false);
      setSelectedComplaint(null);
      setIsEditMode(false);

    } catch (error) {
      console.error('Error updating complaint:', error);
      // Rollback on error
      setComplaints(previousComplaints);
      setFilteredComplaints(previousFilteredComplaints);
      setError('Failed to update complaint. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedComplaint(null);
  };

  const handleDeleteComplaint = async (complaintId) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/developer/complaints/${complaintId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update both complaints and filteredComplaints states
      const updatedComplaints = complaints.filter(
        complaint => complaint.id.toString() !== complaintId.toString()
      );
      const updatedFilteredComplaints = filteredComplaints.filter(
        complaint => complaint.id.toString() !== complaintId.toString()
      );

      setComplaints(updatedComplaints);
      setFilteredComplaints(updatedFilteredComplaints);
      setSuccessMessage('Complaint deleted successfully!');

      // Reset current page if necessary
      if (paginatedComplaints.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error('Error deleting complaint:', error);
      setError('Error deleting complaint');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    try {
      // Parse the date string to Date object
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return format(date, 'yyyy-MM-dd HH:mm:ss');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handleFilterChange = ({ selectedItem }) => {
    setFilterStatus(selectedItem);
    filterComplaints(selectedItem, filterDateRange);
  };

  const handleDateRangeChange = (dates) => {
    if (!dates || dates.length < 2) {
      setFilterDateRange([null, null]);
      filterComplaints(filterStatus, [null, null]);
      return;
    }

    const [startDate, endDate] = dates;
    setFilterDateRange([startDate, endDate]);
    filterComplaints(filterStatus, [startDate, endDate]);
  };

  const filterComplaints = useCallback((status, dateRange) => {
    let filtered = [...complaints];

    // Filter by status
    if (status !== 'All') {
      filtered = filtered.filter(complaint => complaint.status === status);
    }

    // Filter by date range
    if (dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(complaint => {
        try {
          const complaintDate = new Date(complaint.send_time);
          const startDate = new Date(dateRange[0]);
          const endDate = new Date(dateRange[1]);
          
          // Set time to start of day for start date
          startDate.setHours(0, 0, 0, 0);
          // Set time to end of day for end date
          endDate.setHours(23, 59, 59, 999);

          return complaintDate >= startDate && complaintDate <= endDate;
        } catch (error) {
          console.error('Date parsing error:', error);
          return false;
        }
      });
    }

    setFilteredComplaints(filtered);
  }, [complaints]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
  };

  const paginatedComplaints = filteredComplaints.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Improve Modal component
  const EditComplaintModal = React.memo(() => (
    <Modal
      open={isModalOpen}
      modalHeading={isEditMode ? "Edit Complaint" : "Complaint Details"}
      primaryButtonText={isEditMode ? "Save Changes" : "Close"}
      
      secondaryButtonText={isEditMode ? "Cancel" : null}
      onRequestClose={() => {
        setIsModalOpen(false);
        setSelectedComplaint(null);
        setIsEditMode(false);
        setError(null);
      }}
      onRequestSubmit={isEditMode ? handleUpdateComplaint : () => setIsModalOpen(false)}
      primaryButtonDisabled={isLoading}
    >
      {isEditMode ? (
        <div className="edit-form">
          <Stack gap={7}>
            <TextInput
              id="editSubject"
              name="subject"
              selectorPrimaryFocus="#editSubject"
              labelText="Subject"
              value={selectedComplaint?.subject || ''}
              onChange={(e) => {
                setSelectedComplaint(prev => ({
                  ...prev,
                  subject: e.target.value
                }));
              }}
              invalid={!selectedComplaint?.subject?.trim()}
              invalidText="Subject is required"
              disabled={isLoading}
              maxLength={200}
            />
            <TextArea
              id="editMessage"
              name="message"
              labelText="Message"
              value={selectedComplaint?.message || ''}
              onChange={(e) => {
                setSelectedComplaint(prev => ({
                  ...prev,
                  message: e.target.value
                }));
              }}
              invalid={!selectedComplaint?.message?.trim()}
              invalidText="Message is required"
              disabled={isLoading}
              maxLength={1000}
            />
          </Stack>
        </div>
      ) : (
        <div className="complaint-details">
          <Stack gap={5}>
            <div>
              <p className="detail-label">Subject:</p>
              <p className="detail-value">{selectedComplaint?.subject}</p>
            </div>
            <div>
              <p className="detail-label">Message:</p>
              <p className="detail-value">{selectedComplaint?.message}</p>
            </div>
            <div>
              <p className="detail-label">Status:</p>
              <Tag type={selectedComplaint?.status === 'solved' ? 'green' : 'red'} size="sm">
                {selectedComplaint?.status}
              </Tag>
            </div>
            <div>
              <p className="detail-label">Reply:</p>
              <p className="detail-value">{selectedComplaint?.reply || 'No reply yet'}</p>
            </div>
            {selectedComplaint?.reply_time && (
              <div>
                <p className="detail-label">Reply Time:</p>
                <p className="detail-value">{selectedComplaint?.reply_time}</p>
              </div>
            )}
          </Stack>
        </div>
      )}
      {error && (
        <InlineNotification
          kind="error"
          title="Error"
          subtitle={error}
          onCloseButtonClick={() => setError(null)}
          style={{ marginTop: '1rem' }}
        />
      )}
    </Modal>
  ));

  // Add view message handler
  const handleViewMessage = useCallback((row) => {
    // Map the row data to match our complaint structure
    const complaintData = {
      id: row.id,
      subject: row.cells.find(cell => cell.info.header === 'subject')?.value,
      message: row.cells.find(cell => cell.info.header === 'message')?.value,
      status: row.cells.find(cell => cell.info.header === 'status')?.value,
      send_time: row.cells.find(cell => cell.info.header === 'created_at')?.value,
      reply: row.cells.find(cell => cell.info.header === 'reply')?.value,
      reply_time: row.cells.find(cell => cell.info.header === 'reply_time')?.value
    };
    setSelectedMessage(complaintData);
    setShowMessageModal(true);
  }, []);

  // Update MessageModal component with theme-aware styles
  const MessageModal = React.memo(() => (
    <Modal
      open={showMessageModal}
      modalHeading="Complaint Details"
      primaryButtonText="Close"


      onRequestClose={() => {
        setShowMessageModal(false);
        setSelectedMessage(null);
      }}
      onRequestSubmit={() => {
        setShowMessageModal(false);
        setSelectedMessage(null);
      }}
      onSecondarySubmit={() => {
        if (selectedMessage?.id) {
          handleDeleteComplaint(selectedMessage.id);
          setShowMessageModal(false);
          setSelectedMessage(null);
        }
      }}
      size="lg"
    >
      <div className="complaint-details" style={{ padding: '1rem' }}>
        <Stack gap={7}>
          <div>
            <p style={{ 
              fontWeight: '600', 
              marginBottom: '0.5rem',
              color: 'var(--cds-text-primary)'
            }}>Subject:</p>
            <p style={{ 
              fontSize: '1rem', 
              lineHeight: '1.5',
              color: 'var(--cds-text-primary)'
            }}>
              {selectedMessage?.subject || 'No subject'}
            </p>
          </div>
          
          <div>
            <p style={{ 
              fontWeight: '600', 
              marginBottom: '0.5rem',
              color: 'var(--cds-text-primary)'
            }}>Message:</p>
            <p style={{ 
              fontSize: '1rem', 
              lineHeight: '1.5', 
              whiteSpace: 'pre-wrap',
              backgroundColor: 'var(--cds-layer-01)',
              padding: '1rem',
              borderRadius: '4px',
              color: 'var(--cds-text-primary)',
              border: '1px solid var(--cds-border-subtle)'
            }}>
              {selectedMessage?.message || 'No message'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '2rem' }}>
            <div>
              <p style={{ 
                fontWeight: '600', 
                marginBottom: '0.5rem',
                color: 'var(--cds-text-primary)'
              }}>Status:</p>
              <Tag type={selectedMessage?.status === 'solved' ? 'green' : 'red'}>
                {selectedMessage?.status || 'Unknown'}
              </Tag>
            </div>
            
            <div>
              <p style={{ 
                fontWeight: '600', 
                marginBottom: '0.5rem',
                color: 'var(--cds-text-primary)'
              }}>Created At:</p>
              <p style={{ color: 'var(--cds-text-primary)' }}>
                {selectedMessage?.send_time || 'Unknown date'}
              </p>
            </div>
          </div>

          <div>
            <p style={{ 
              fontWeight: '600', 
              marginBottom: '0.5rem',
              color: 'var(--cds-text-primary)'
            }}>Reply:</p>
            <p style={{ 
              fontSize: '1rem',
              backgroundColor: selectedMessage?.reply ? 'var(--cds-layer-01)' : 'transparent',
              padding: selectedMessage?.reply ? '1rem' : '0',
              borderRadius: '4px',
              color: 'var(--cds-text-primary)',
              border: selectedMessage?.reply ? '1px solid var(--cds-border-subtle)' : 'none'
            }}>
              {selectedMessage?.reply || 'No reply yet'}
            </p>
          </div>

          {selectedMessage?.reply_time && (
            <div>
              <p style={{ 
                fontWeight: '600', 
                marginBottom: '0.5rem',
                color: 'var(--cds-text-primary)'
              }}>Reply Time:</p>
              <p style={{ color: 'var(--cds-text-primary)' }}>
                {selectedMessage?.reply_time}
              </p>
            </div>
          )}

          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginTop: '1rem',
            borderTop: '1px solid var(--cds-border-subtle)',
            paddingTop: '1rem'
          }}>
            
          </div>
        </Stack>
      </div>
    </Modal>
  ));

  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset state here
        setComplaints([]);
        setFilteredComplaints([]);
        setError(null);
        setSuccessMessage(null);
        // Fetch complaints again
        fetchComplaints();
      }}
    >
      <Grid className="dashboard">
        {error && (
          <InlineNotification
            kind="error"
            title="Error"
            subtitle={error}
            onCloseButtonClick={() => setError(null)}
          />
        )}
        {successMessage && (
          <InlineNotification
            kind="success"
            title="Success"
            subtitle={successMessage}
            onCloseButtonClick={() => setSuccessMessage(null)}
          />
        )}
        {selectedComplaint && <EditComplaintModal />}
        {showMessageModal && <MessageModal />}

        <Column lg={16} md={8} sm={4}>
          <Tile className="stat-tile">
            <h4>Manage Complaints</h4>
            <Dropdown
              id="filterStatus"
              titleText="Filter by Status"
              label="Select Status"
              items={['All', 'pending', 'solved']}
              selectedItem={filterStatus}
              onChange={handleFilterChange}
            />
            <br></br><br></br>
            <DatePicker
              datePickerType="range"
              onChange={handleDateRangeChange}
              dateFormat="Y-m-d"
            >
              <DatePickerInput
                id="startDate"
                placeholder="Start date"
                labelText="Start date"
                size="md"
              />
              <DatePickerInput
                id="endDate"
                placeholder="End date"
                labelText="End date"
                size="md"
              />
            </DatePicker>
            <DataTable
              rows={paginatedComplaints
                .filter(complaint => complaint && complaint.id) // Only include valid complaints
                .map(complaint => ({
                  ...complaint,
                  key: complaint.id.toString(), // Add key property
                  id: complaint.id.toString(),
                  created_at: formatDate(complaint.send_time),
                  status: complaint.status,
                  reply: complaint.reply || 'No reply yet',
                  reply_time: complaint.reply_time ? formatDate(complaint.reply_time) : 'N/A',
                }))}
              headers={[
                { key: 'subject', header: 'Subject' },
                { key: 'message', header: 'Message' },
                { key: 'created_at', header: 'Created At' },
                { key: 'status', header: 'Status' },
                { key: 'reply', header: 'Reply' },
                { key: 'reply_time', header: 'Reply Time' },
                { key: 'actions', header: 'Actions' },
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
                        placeholder="Search complaints..."
                      />
                    </TableToolbarContent>
                  </TableToolbar>
                  <Table {...getTableProps()} size="lg">
                    <TableHead>
                      <TableRow>
                        {headers.map(header => {
                          const headerProps = getHeaderProps({ header });
                          // Remove key from props to spread
                          const { key, ...spreadableProps } = headerProps;
                          return (
                            <TableHeader key={header.key} {...spreadableProps}>
                              {header.header}
                            </TableHeader>
                          );
                        })}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map(row => (
                        <TableRow key={row.id} {...getRowProps({ row })}>
                          {row.cells.map(cell => (
                            <TableCell key={cell.id}>
                              {cell.info.header === 'message' ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                  {truncateText(cell.value, 30)}
                                  <Button
                                    kind="ghost"
                                    renderIcon={View}
                                    iconDescription="View Full Message"
                                    onClick={() => handleViewMessage({
                                      ...row,
                                      cells: row.cells
                                    })}
                                    size="sm"
                                  >
                                    View
                                  </Button>
                                </div>
                              ) : cell.info.header === 'reply' ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                  {cell.value === 'No reply yet' ? (
                                    <span style={{ color: 'var(--cds-text-helper)' }}>No reply yet</span>
                                  ) : (
                                    <>
                                      {truncateText(cell.value, 30)}
                                      <Button
                                        kind="ghost"
                                        renderIcon={View}
                                        iconDescription="View Reply"
                                        onClick={() => handleViewReply(row)}
                                        size="sm"
                                      >
                                        View Reply
                                      </Button>
                                    </>
                                  )}
                                </div>
                              ) : cell.info.header === 'status' ? (
                                <Tag type={cell.value === 'solved' ? 'green' : 'red'} size="sm">
                                  {cell.value}
                                </Tag>
                              ) : cell.info.header === 'actions' ? (
                                <div className="action-buttons">
                                  {/* <Button
                                    kind="ghost"
                                    renderIcon={Edit}
                                    iconDescription="Edit"
                                    onClick={() => handleEditComplaint(row)}
                                    size="sm"
                                  >
                                    Edit
                                  </Button> */}
                                  <Button
                                    kind="danger"
                                    renderIcon={TrashCan}
                                    iconDescription="Delete"
                                    onClick={() => handleDeleteComplaint(row.id)}
                                    size="sm"
                                    disabled={isLoading}
                                  >
                                    {isLoading ? 'Deleting...' : 'Delete'}
                                  </Button>
                                </div>
                              ) : (
                                cell.value
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DataTable>
            <Pagination
              totalItems={filteredComplaints.length}
              pageSize={pageSize}
              pageSizes={[10, 20, 30, 40, 50]}
              onChange={({ page, pageSize }) => {
                handlePageChange(page);
                handlePageSizeChange(pageSize);
              }}
            />
          </Tile>
          <br></br><br></br>
        </Column>

        

        {isLoading && <Loading />}
      </Grid>
    </ErrorBoundary>
  );
};

export default DeveloperManageComplaints;