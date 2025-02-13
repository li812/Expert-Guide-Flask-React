import React, { useEffect, useState } from 'react';
import { 
    Grid, 
    Column, 
    Tile,
    DataTable,
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    TableContainer, 
    Button, 
    InlineNotification,
    DataTableSkeleton,
    TableToolbar,
    TableToolbarContent,
    TableToolbarSearch,
    Stack,
    Modal,
    TextArea,
    Form,
    FormGroup,
    Pagination
} from '@carbon/react';
import { Add, TrashCan, Edit } from '@carbon/icons-react';
import { useNavigate } from 'react-router-dom';

const AdminManageCareers = ({ username }) => {
    const [careers, setCareers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCareer, setSelectedCareer] = useState(null);
    const [newCareer, setNewCareer] = useState('');
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortKey, setSortKey] = useState('career_id');
    const [sortDirection, setSortDirection] = useState('asc');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCareers();
    }, [currentPage, pageSize, sortKey, sortDirection]);

    const fetchCareers = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `http://localhost:5001/api/admin/careers?page=${currentPage}&per_page=${pageSize}&sort=${sortKey}&direction=${sortDirection}`, 
                {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            if (response.status === 401) {
                navigate('/login');
                return;
            }
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server error:', errorData); // Add detailed error logging
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Received careers:', data); // Debug logging
            setCareers(data.careers || []);
            setTotalItems(data.total || 0);
        } catch (error) {
            console.error('Error fetching careers:', error);
            setError('Error fetching careers');
        } finally {
            setLoading(false);
        }
    };

    
    const handleAdd = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/admin/careers', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ career: newCareer }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            await fetchCareers();
            setSuccessMessage('Career added successfully');
            setShowAddModal(false);
            setNewCareer('');
        } catch (error) {
            console.error('Error adding career:', error);
            setError('Error adding career');
        }
    };

    const handleEdit = async () => {
        try {
            const response = await fetch(`http://localhost:5001/api/admin/careers/${selectedCareer.career_id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ career: newCareer }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            await fetchCareers();
            setSuccessMessage('Career updated successfully');
            setShowEditModal(false);
            setSelectedCareer(null);
            setNewCareer('');
        } catch (error) {
            console.error('Error updating career:', error);
            setError('Error updating career');
        }
    };

    const handleDelete = async (career_id) => {
        if (window.confirm('Are you sure you want to delete this career?')) {
            try {
                const response = await fetch(`http://localhost:5001/api/admin/careers/${career_id}`, {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                await fetchCareers();
                setSuccessMessage('Career deleted successfully');
            } catch (error) {
                console.error('Error deleting career:', error);
                setError('Error deleting career');
            }
        }
    };

    const handleSort = (key, direction) => {
        setSortKey(key);
        setSortDirection(direction);
    };

    const handlePagination = ({ page, pageSize: newPageSize }) => {
        setCurrentPage(page);
        if (pageSize !== newPageSize) {
            setPageSize(newPageSize);
            setCurrentPage(1);
        }
    };

    return (
        <Grid className="dashboard">
            <Column lg={16} md={8} sm={4}>
                <Tile className="stat-tile">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem'
                    }}>
                        <div>
                            <h2>Career Options</h2>
                            <p className="subtitle">Manage career options</p>
                        </div>
                        <Button
                            renderIcon={Add}
                            onClick={() => setShowAddModal(true)}
                        >
                            Add Career
                        </Button>
                    </div>

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

                    {loading ? (
                        <DataTableSkeleton 
                            columnCount={3} 
                            rowCount={5} 
                        />
                    ) : (
                        <DataTable
                            rows={careers.map(c => ({
                                id: String(c.career_id),
                                career_id: String(c.career_id),
                                career: c.career,
                                actions: (
                                    <Stack orientation="horizontal" gap={4}>
                                        <Button
                                            kind="ghost"
                                            size="sm"
                                            renderIcon={Edit}
                                            onClick={() => {
                                                setSelectedCareer(c);
                                                setNewCareer(c.career);
                                                setShowEditModal(true);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            kind="danger"
                                            size="sm"
                                            renderIcon={TrashCan}
                                            onClick={() => handleDelete(c.career_id)}
                                        >
                                            Delete
                                        </Button>
                                    </Stack>
                                )
                            }))}
                            headers={[
                                { key: 'career_id', header: 'ID' },
                                { key: 'career', header: 'Career' },
                                { key: 'actions', header: 'Actions' }
                            ]}
                            isSortable
                            sortRow={(a, b, { sortDirection, sortKey }) => {
                                if (sortKey === 'career_id') {
                                    return sortDirection === 'asc' 
                                        ? parseInt(a[sortKey]) - parseInt(b[sortKey])
                                        : parseInt(b[sortKey]) - parseInt(a[sortKey]);
                                }
                                return sortDirection === 'asc'
                                    ? a[sortKey].localeCompare(b[sortKey])
                                    : b[sortKey].localeCompare(a[sortKey]);
                            }}
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
                                <>
                                    <TableContainer {...getTableContainerProps()}>
                                        <TableToolbar>
                                            <TableToolbarContent>
                                                <TableToolbarSearch 
                                                    onChange={onInputChange}
                                                    placeholder="Search careers..."
                                                />
                                            </TableToolbarContent>
                                        </TableToolbar>
                                        <Table {...getTableProps()} size="lg">
                                            <TableHead>
                                                <TableRow>
                                                    {headers.map(header => (
                                                        <TableHeader 
                                                            key={header.key} 
                                                            {...getHeaderProps({ 
                                                                header,
                                                                onClick: () => {
                                                                    if (header.key !== 'actions') {
                                                                        handleSort(
                                                                            header.key,
                                                                            sortDirection === 'asc' ? 'desc' : 'asc'
                                                                        );
                                                                    }
                                                                }
                                                            })}
                                                        >
                                                            {header.header}
                                                        </TableHeader>
                                                    ))}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {rows.map(row => (
                                                    <TableRow key={row.id} {...getRowProps({ row })}>
                                                        {row.cells.map(cell => (
                                                            <TableCell key={cell.id}>{cell.value}</TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                    <Pagination
                                        totalItems={totalItems}
                                        backwardText="Previous page"
                                        forwardText="Next page"
                                        pageSize={pageSize}
                                        pageSizes={[10, 20, 30, 40, 50]}
                                        itemsPerPageText="Items per page:"
                                        onChange={handlePagination}
                                        page={currentPage}
                                    />
                                </>
                            )}
                        </DataTable>
                    )}
                </Tile>
            </Column>

            {/* Add Career Modal */}
            <Modal
                open={showAddModal}
                modalHeading="Add New Career"
                primaryButtonText="Add"
                secondaryButtonText="Cancel"
                preventCloseOnClickOutside
                onRequestClose={() => {
                    setShowAddModal(false);
                    setNewCareer('');
                }}
                onRequestSubmit={handleAdd}
            >
                <Form>
                    <FormGroup legendText="Career">
                        <TextArea
                            id="newCareer"
                            labelText="Career option"
                            value={newCareer}
                            onChange={(e) => setNewCareer(e.target.value)}
                            rows={4}
                        />
                    </FormGroup>
                </Form>
            </Modal>

            {/* Edit Career Modal */}
            <Modal
                open={showEditModal}
                modalHeading="Edit Career"
                primaryButtonText="Save"
                secondaryButtonText="Cancel"
                preventCloseOnClickOutside
                onRequestClose={() => {
                    setShowEditModal(false);
                    setSelectedCareer(null);
                    setNewCareer('');
                }}
                onRequestSubmit={handleEdit}
            >
                <Form>
                    <FormGroup legendText="Career">
                        <TextArea
                            id="editCareer"
                            labelText="Career option"
                            value={newCareer}
                            onChange={(e) => setNewCareer(e.target.value)}
                            rows={4}
                        />
                    </FormGroup>
                </Form>
            </Modal>
        </Grid>
    );
};

export default AdminManageCareers;



