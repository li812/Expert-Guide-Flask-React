import React, { useState, useEffect } from 'react';
import { Grid, Column, Tile, TextInput, TextArea, Button, InlineNotification, DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, TableContainer, TableToolbar, TableToolbarContent, TableToolbarSearch, Form, Stack, Modal, Tag, Pagination, Dropdown, DatePicker, DatePickerInput, Loading } from '@carbon/react';
import { Email, View, TrashCan, Edit } from '@carbon/icons-react';
import { format, parse, isValid } from 'date-fns';
import './developer.css'; // Import the CSS file for styling

const DeveloperComplaints = ({ username }) => {
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

  const handleViewReply = async (row) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5001/api/developer/complaints/${row.id}/details`, 
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSelectedComplaint(data.complaint);
      setIsEditMode(false);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching complaint details:', error);
      setError('Error fetching complaint details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleUpdateComplaint = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/developer/complaints/${selectedComplaint.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedComplaint),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { complaint } = await response.json();
      
      // Update both complaints and filteredComplaints states
      const updateComplaintsList = list => list.map(c => 
        c.id === complaint.id ? complaint : c
      );

      setComplaints(updateComplaintsList(complaints));
      setFilteredComplaints(updateComplaintsList(filteredComplaints));
      
      setSuccessMessage('Complaint updated successfully!');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating complaint:', error);
      setError('Error updating complaint');
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
    const date = parse(dateString, 'yyyy-MM-dd HH:mm:ss', new Date());
    return isValid(date) ? format(date, 'yyyy-MM-dd HH:mm:ss') : 'Invalid Date';
  };

  const handleFilterChange = ({ selectedItem }) => {
    setFilterStatus(selectedItem);
    filterComplaints(selectedItem, filterDateRange);
  };

  const handleDateRangeChange = (dates) => {
    setFilterDateRange(dates);
    filterComplaints(filterStatus, dates);
  };

  const filterComplaints = (status, dateRange) => {
    let filtered = complaints;

    if (status !== 'All') {
      filtered = filtered.filter(complaint => complaint.status === status);
    }

    if (dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(complaint => {
        const complaintDate = new Date(complaint.created_at);
        return complaintDate >= dateRange[0] && complaintDate <= dateRange[1];
      });
    }

    setFilteredComplaints(filtered);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
  };

  const paginatedComplaints = filteredComplaints.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const ReplyModal = () => (
    <Modal
      open={isModalOpen}
      modalHeading={isEditMode ? "Edit Complaint" : "Complaint Details"}
      primaryButtonText="Close"
      secondaryButtonText={isEditMode ? "Save" : null}
      onRequestClose={closeModal}
      onRequestSubmit={isEditMode ? handleUpdateComplaint : closeModal}
    >
      {isEditMode ? (
        <Form>
          <Stack gap={7}>
            <TextInput
              id="editSubject"
              name="subject"
              labelText="Subject"
              value={selectedComplaint?.subject || ''}
              onChange={(e) => setSelectedComplaint({ 
                ...selectedComplaint, 
                subject: e.target.value 
              })}
              required
            />
            <TextArea
              id="editMessage"
              name="message"
              labelText="Message"
              value={selectedComplaint?.message || ''}
              onChange={(e) => setSelectedComplaint({ 
                ...selectedComplaint, 
                message: e.target.value 
              })}
              required
            />
          </Stack>
        </Form>
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
    </Modal>
  );

  return (
    <Grid className="dashboard">
      <Column lg={16} md={8} sm={4}>
        <Tile className="stat-tile">
          <h4>Send a Complaint</h4>
          <Form onSubmit={handleSubmit}>
            <Stack gap={7}>
              <TextInput
                id="subject"
                name="subject"
                labelText="Subject"
                value={complaint.subject}
                onChange={handleInputChange}
                required
              />
              <TextArea
                id="message"
                name="message"
                labelText="Message"
                value={complaint.message}
                onChange={handleInputChange}
                required
              />
              <Button kind="primary" renderIcon={Email} type="submit" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Complaint'}
              </Button>
            </Stack>
          </Form>
        </Tile>
      </Column>

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

      <Column lg={16} md={8} sm={4}>
        <Tile className="stat-tile">
          <h4>Complaints</h4>
          <Dropdown
            id="filterStatus"
            titleText="Filter by Status"
            label="Select Status"
            items={['All', 'pending', 'solved']}
            selectedItem={filterStatus}
            onChange={handleFilterChange}
          />
          <DatePicker
            datePickerType="range"
            onChange={handleDateRangeChange}
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
                            {cell.info.header === 'reply' ? (
                              cell.value !== 'No reply yet' ? (
                                <Button
                                  kind="ghost"
                                  renderIcon={View}
                                  onClick={() => handleViewReply(row)}
                                >
                                  Show Reply
                                </Button>
                              ) : (
                                'No reply'
                              )
                            ) : cell.info.header === 'status' ? (
                              <Tag type={cell.value === 'solved' ? 'green' : 'red'} size="sm">
                                {cell.value}
                              </Tag>
                            ) : cell.info.header === 'actions' ? (
                              <div className="action-buttons">
                                <Button
                                  kind="ghost"
                                  renderIcon={Edit}
                                  iconDescription="Edit"
                                  onClick={() => handleEditComplaint(row)}
                                  size="sm"
                                >
                                  Edit
                                </Button>
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
      </Column>

      {selectedComplaint && <ReplyModal />}

      {isLoading && <Loading />}
    </Grid>
  );
};

export default DeveloperComplaints;








