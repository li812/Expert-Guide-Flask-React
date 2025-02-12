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
  Stack,
  Modal,
  Tag,
  Pagination,
  Dropdown,
  DatePicker,
  DatePickerInput,
  Loading
} from '@carbon/react';
import { View, TrashCan } from '@carbon/icons-react';
import { format, parse } from 'date-fns';

// Helper function to truncate text
const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

const UserManageComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDateRange, setFilterDateRange] = useState([null, null]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch complaints on mount
  useEffect(() => {
    const fetchComplaints = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5001/api/user/complaints', {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch complaints');
        const data = await response.json();
        setComplaints(data.complaints || []);
        setFilteredComplaints(data.complaints || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  // Delete complaint handler
  const handleDeleteComplaint = async (complaintId) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/user/complaints/${complaintId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete complaint');
      
      setComplaints(prev => prev.filter(c => c.id !== complaintId));
      setFilteredComplaints(prev => prev.filter(c => c.id !== complaintId));
      setSuccessMessage('Complaint deleted successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // View message handler using the original complaint data from state
  const handleViewMessage = useCallback((row) => {
    const originalComplaint = complaints.find(c => c.id.toString() === row.id);
    if (originalComplaint) {
      setSelectedMessage({
        id: originalComplaint.id,
        subject: originalComplaint.subject,
        message: originalComplaint.message,
        status: originalComplaint.status,
        send_time: originalComplaint.send_time,
        reply: originalComplaint.reply,
        reply_time: originalComplaint.reply_time
      });
      setShowMessageModal(true);
    }
  }, [complaints]);

  // Filter function
  const filterComplaints = useCallback((status, dateRange) => {
    let filtered = [...complaints];

    if (status !== 'All') {
      filtered = filtered.filter(complaint => complaint.status === status);
    }

    if (dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(complaint => {
        const complaintDate = parse(complaint.send_time, 'yyyy-MM-dd HH:mm:ss', new Date());
        return complaintDate >= dateRange[0] && complaintDate <= dateRange[1];
      });
    }

    setFilteredComplaints(filtered);
  }, [complaints]);

  // Handler for status filter changes
  const handleFilterChange = ({ selectedItem }) => {
    setFilterStatus(selectedItem);
    filterComplaints(selectedItem, filterDateRange);
  };

  // Handler for date range changes
  const handleDateRangeChange = (dates) => {
    setFilterDateRange(dates);
    filterComplaints(filterStatus, dates);
  };

  // Calculate paginated complaints
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Modal for displaying complaint details
  const MessageModal = () => (
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
      size="lg"
    >
      <div style={{ padding: '1rem' }}>
        <Stack gap={7}>
          <div>
            <h4>Subject</h4>
            <p>{selectedMessage?.subject}</p>
          </div>
          <div>
            <h4>Message</h4>
            <p style={{ whiteSpace: 'pre-wrap' }}>{selectedMessage?.message}</p>
          </div>
          <div>
            <h4>Status</h4>
            <Tag type={selectedMessage?.status === 'solved' ? 'green' : 'red'}>
              {selectedMessage?.status}
            </Tag>
          </div>
          {selectedMessage?.reply && (
            <>
              <div>
                <h4>Admin Reply</h4>
                <p>{selectedMessage.reply}</p>
              </div>
              <div>
                <h4>Reply Time</h4>
                <p>{selectedMessage.reply_time}</p>
              </div>
            </>
          )}
        </Stack>
      </div><br></br><br></br>
    </Modal>
  );

  return (
    <Grid className="complaints-page">
      <Column lg={16} md={8} sm={4}>
        <Tile className="complaints-section">
          <h2>Manage Complaints</h2><br></br>

          {/* Filters */}
          <Stack gap={5}>
            <Dropdown
              id="status-filter"
              titleText="Filter by Status"
              items={['All', 'pending', 'solved']}
              selectedItem={filterStatus}
              onChange={handleFilterChange}
            />

            <DatePicker datePickerType="range" onChange={handleDateRangeChange}>
              <DatePickerInput
                id="date-picker-input-1"
                placeholder="Start date"
                labelText="Start date"
              />
              <DatePickerInput
                id="date-picker-input-2"
                placeholder="End date"
                labelText="End date"
              />
            </DatePicker>
          </Stack>

          {/* Data Table */}
          <DataTable
            rows={paginatedComplaints.map(complaint => ({
              id: complaint.id.toString(),
              subject: complaint.subject,
              // Display a truncated version in the table; the full text is kept in state.
              message: truncateText(complaint.message),
              created_at: format(new Date(complaint.send_time), 'dd/MM/yyyy HH:mm'),
              status: complaint.status,
              reply: complaint.reply ? truncateText(complaint.reply) : 'No reply yet',
              reply_time: complaint.reply_time ? format(new Date(complaint.reply_time), 'dd/MM/yyyy HH:mm') : '-'
            }))}
            headers={[
              { key: 'subject', header: 'Subject' },
              { key: 'created_at', header: 'Created At' },
              { key: 'status', header: 'Status' },
              { key: 'reply', header: 'Reply' },
              { key: 'actions', header: 'Actions' }
            ]}
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
                    <TableToolbarSearch onChange={onInputChange} />
                  </TableToolbarContent>
                </TableToolbar>
                <Table {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      {headers.map(header => (
                        <TableHeader key={header.key} {...getHeaderProps({ header })}>
                          {header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map(row => (
                      <TableRow key={row.id} {...getRowProps({ row })}>
                        {row.cells.map(cell => (
                          <TableCell key={cell.id}>
                            {cell.info.header === 'actions' ? (
                              <div style={{ display: 'flex', gap: '1rem' }}>
                                <Button
                                  kind="ghost"
                                  renderIcon={View}
                                  iconDescription="View Details"
                                  onClick={() => handleViewMessage(row)}
                                  size="sm"
                                >
                                  View
                                </Button>
                                <Button
                                  kind="danger"
                                  renderIcon={TrashCan}
                                  iconDescription="Delete"
                                  onClick={() => handleDeleteComplaint(row.id)}
                                  size="sm"
                                >
                                  Delete
                                </Button>
                              </div>
                            ) : cell.info.header === 'status' ? (
                              <Tag type={cell.value === 'solved' ? 'green' : 'red'}>
                                {cell.value}
                              </Tag>
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
              setCurrentPage(page);
              setPageSize(pageSize);
            }}
          />
        </Tile>

        {/* Notifications */}
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

        {/* Modals */}
        {showMessageModal && <MessageModal />}
        {isLoading && <Loading />}
      </Column>
    </Grid>
  );
};

export default UserManageComplaints;
