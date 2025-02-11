import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  TextArea,
  Loading
} from '@carbon/react';
import { View } from '@carbon/icons-react';
import { format, parse, isValid } from 'date-fns';
import { ErrorBoundary } from 'react-error-boundary';

// Helper functions
const truncateText = (text, maxLength = 50) => 
  text?.length > maxLength ? `${text.substring(0, maxLength)}...` : text || '';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = parse(dateString, 'yyyy-MM-dd HH:mm:ss', new Date());
  return isValid(date) ? format(date, 'MMM dd, yyyy hh:mm a') : 'Invalid date';
};

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <InlineNotification
    kind="error"
    title="Something went wrong"
    subtitle={error.message}
    actions={<Button onClick={resetErrorBoundary}>Try again</Button>}
  />
);

// Reply Modal Component
const ReplyModal = ({ 
  isOpen,
  onClose,
  onSubmit,
  complaintData,
  isSubmitting,
  replyText,
  setReplyText,
  textAreaRef
}) => {
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!replyText.trim()) {
      setError('Reply cannot be empty');
      return;
    }
    onSubmit(replyText);
  };

  return (
    <Modal
      open={isOpen}
      modalHeading="Reply to Complaint"
      primaryButtonText={isSubmitting ? 'Sending...' : 'Send Reply'}
      secondaryButtonText="Cancel"
      onRequestSubmit={handleSubmit}
      onRequestClose={onClose}
      primaryButtonDisabled={isSubmitting}
      size="lg"
    >
      <div style={{ padding: '1rem' }}>
        <Stack gap={7}>
          <div>
            <h4 style={{ marginBottom: '0.5rem' }}>Complaint Details</h4>
            <p><strong>Subject:</strong> {complaintData?.subject}</p>
            <p><strong>Message:</strong></p>
            <div style={{ 
              whiteSpace: 'pre-wrap',
              padding: '1rem',
              borderRadius: '4px',
              border: '1px solid #e0e0e0'
            }}>
              {complaintData?.message}
            </div>
          </div>

          <div>
            <h4 style={{ marginBottom: '0.5rem' }}>Your Reply</h4>
            <TextArea
              ref={textAreaRef}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply here..."
              labelText="Reply"
              maxLength={1000}
              invalid={!!error}
              invalidText={error}
              style={{ minHeight: '150px' }}
            />
            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
              {replyText.length}/1000
            </div>
          </div>
        </Stack>
      </div>
    </Modal>
  );
};

const AdminManageUserComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDateRange, setFilterDateRange] = useState([null, null]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [replyText, setReplyText] = useState('');
  const textAreaRef = useRef(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/admin/user-complaints', { // Changed from developer-complaints to user-complaints
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to fetch complaints');
      
      const data = await response.json();
      setComplaints(data.complaints || []);
      setFilteredComplaints(data.complaints || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchInput = (e) => {
    const search = e.target.value.toLowerCase();
    setSearchTerm(search);
    
    setFilteredComplaints(complaints.filter(complaint =>
      Object.values(complaint).some(value =>
        String(value).toLowerCase().includes(search)
      )
    ));
  };

  const handleFilterChange = ({ selectedItem }) => {
    setFilterStatus(selectedItem);
    setFilteredComplaints(
      selectedItem === 'All' 
        ? complaints 
        : complaints.filter(c => c.status === selectedItem)
    );
  };

  const handleDateRangeChange = ([start, end]) => {
    setFilterDateRange([start, end]);
    if (start && end) {
      setFilteredComplaints(complaints.filter(c => {
        const date = parse(c.send_time, 'yyyy-MM-dd HH:mm:ss', new Date());
        return date >= start && date <= end;
      }));
    }
  };

  const handleReplySubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `http://localhost:5001/api/admin/user-complaints/${selectedComplaint.id}/reply`, // Changed from developer-complaints to user-complaints
        {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reply: replyText }),
        }
      );

      if (!response.ok) throw new Error('Failed to submit reply');
      
      await fetchComplaints();
      setSuccessMessage('Reply sent successfully');
      setSelectedComplaint(null);
      setReplyText('');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewMessage = (row) => {
    const complaint = complaints.find(c => c.id.toString() === row.id);
    setSelectedComplaint(complaint);
    setReplyText(complaint?.reply || '');
  };

  const headers = [
    { key: 'subject', header: 'Subject' },
    { key: 'message', header: 'Message' },
    { key: 'created_at', header: 'Created At' },
    { key: 'status', header: 'Status' },
    { key: 'reply', header: 'Reply' },
    { key: 'reply_time', header: 'Reply Time' },
    { key: 'actions', header: 'Actions' }
  ];

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={fetchComplaints}>
      <Grid className="dashboard">
        {error && (
          <InlineNotification
            kind="error"
            title="Error"
            subtitle={error}
            onClose={() => setError(null)}
          />
        )}
        {successMessage && (
          <InlineNotification
            kind="success"
            title="Success"
            subtitle={successMessage}
            onClose={() => setSuccessMessage(null)}
          />
        )}
        
        <ReplyModal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onSubmit={handleReplySubmit}
          complaintData={selectedComplaint || {}}
          isSubmitting={isSubmitting}
          replyText={replyText}
          setReplyText={setReplyText}
          textAreaRef={textAreaRef}
        />

        <Column lg={16} md={8} sm={4}>
          <Tile className="stat-tile">
            <h2>Manage User's Complaints</h2>
            
            <Dropdown
              id="filterStatus"
              titleText="Filter by Status"
              label="Select Status"
              items={['All', 'pending', 'solved']}
              selectedItem={filterStatus}
              onChange={handleFilterChange}
              style={{ marginBottom: '1rem' }}
            />

            <DatePicker
              datePickerType="range"
              onChange={handleDateRangeChange}
              dateFormat="Y-m-d"
            >
              <DatePickerInput
                id="startDate"
                placeholder="Start date"
                labelText="Start date"
              />
              <DatePickerInput
                id="endDate"
                placeholder="End date"
                labelText="End date"
              />
            </DatePicker>

            <DataTable
              rows={filteredComplaints.map(c => ({
                id: c.id.toString(),
                subject: c.subject,
                message: truncateText(c.message),
                created_at: formatDate(c.send_time),
                status: c.status,
                reply: truncateText(c.reply),
                reply_time: formatDate(c.reply_time)
              }))}
              headers={headers}
              isSortable
            >
              {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
                <TableContainer>
                  <TableToolbar>
                    <TableToolbarContent>
                      <TableToolbarSearch onChange={handleSearchInput} />
                    </TableToolbarContent>
                  </TableToolbar>
                  <Table {...getTableProps()}>
                    <TableHead>
                      <TableRow>
                        {headers.map(header => {
                          const { key, ...headerProps } = getHeaderProps({ header });
                          return (
                            <TableHeader key={key} {...headerProps}>
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
                              {cell.info.header === 'actions' ? (
                                <Button
                                  kind="ghost"
                                  renderIcon={View}
                                  onClick={() => handleViewMessage(row)}
                                >
                                  View
                                </Button>
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
              pageSizes={[10, 20, 30]}
              page={currentPage}
              onChange={({ page, pageSize }) => {
                setCurrentPage(page);
                setPageSize(pageSize);
              }}
            />
          </Tile>
        </Column>
        {isLoading && <Loading />}
      </Grid>
    </ErrorBoundary>
  );
};

export default AdminManageUserComplaints;