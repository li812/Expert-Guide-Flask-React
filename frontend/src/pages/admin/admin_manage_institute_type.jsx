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
    TextInput,
    Form,
    FormGroup,
    Pagination
} from '@carbon/react';
import { Add, TrashCan, Edit } from '@carbon/icons-react';
import { useNavigate } from 'react-router-dom';

const AdminManageInstituteType = ({ username }) => {
    const [instituteTypes, setInstituteTypes] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedInstituteType, setSelectedInstituteType] = useState(null);
    const [newInstituteType, setNewInstituteType] = useState('');
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortKey, setSortKey] = useState('institution_type_id');
    const [sortDirection, setSortDirection] = useState('asc');
    const navigate = useNavigate();

    useEffect(() => {
        fetchInstituteTypes();
    }, [currentPage, pageSize, sortKey, sortDirection]);

    const fetchInstituteTypes = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `http://localhost:5001/api/admin/institute-types?page=${currentPage}&per_page=${pageSize}&sort=${sortKey}&direction=${sortDirection}`, 
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
            
            const data = await response.json();
            setInstituteTypes(data.instituteTypes || []);
            setTotalItems(data.total || 0);
        } catch (error) {
            setError('Error fetching institution types');
        } finally {
            setLoading(false);
        }
    };

    const validateInstituteType = (instituteType) => {
        if (!instituteType || instituteType.trim().length === 0) {
            return 'Institution type cannot be empty';
        }
        if (instituteType.length > 120) {
            return 'Institution type must be less than 120 characters';
        }
        return null;
    };

    const handleAdd = async () => {
        const error = validateInstituteType(newInstituteType);
        if (error) {
            setError(error);
            return;
        }
        try {
            const response = await fetch('http://localhost:5001/api/admin/institute-types', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ institution_type: newInstituteType }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            await fetchInstituteTypes();
            setSuccessMessage('Institution type added successfully');
            setShowAddModal(false);
            setNewInstituteType('');
        } catch (error) {
            setError('Error adding institution type');
        }
    };

    const handleEdit = async () => {
        const error = validateInstituteType(newInstituteType);
        if (error) {
            setError(error);
            return;
        }
        try {
            const response = await fetch(`http://localhost:5001/api/admin/institute-types/${selectedInstituteType.institution_type_id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ institution_type: newInstituteType }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            await fetchInstituteTypes();
            setSuccessMessage('Institution type updated successfully');
            setShowEditModal(false);
            setSelectedInstituteType(null);
            setNewInstituteType('');
        } catch (error) {
            setError('Error updating institution type');
        }
    };

    const handleDelete = async (instituteTypeId) => {
        if (window.confirm('Are you sure you want to delete this institution type?')) {
            try {
                const response = await fetch(`http://localhost:5001/api/admin/institute-types/${instituteTypeId}`, {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                await fetchInstituteTypes();
                setSuccessMessage('Institution type deleted successfully');
            } catch (error) {
                setError('Error deleting institution type');
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
                            <h2>Institution Types</h2>
                            <p className="subtitle">Manage institution types</p>
                        </div>
                        <Button
                            renderIcon={Add}
                            onClick={() => setShowAddModal(true)}
                        >
                            Add Institution Type
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
                            rows={instituteTypes.map(it => ({
                                id: String(it.institution_type_id),
                                institution_type_id: String(it.institution_type_id),
                                institution_type: it.institution_type,
                                actions: (
                                    <Stack orientation="horizontal" gap={4}>
                                        <Button
                                            kind="ghost"
                                            size="sm"
                                            renderIcon={Edit}
                                            onClick={() => {
                                                setSelectedInstituteType(it);
                                                setNewInstituteType(it.institution_type);
                                                setShowEditModal(true);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            kind="danger"
                                            size="sm"
                                            renderIcon={TrashCan}
                                            onClick={() => handleDelete(it.institution_type_id)}
                                        >
                                            Delete
                                        </Button>
                                    </Stack>
                                )
                            }))}
                            headers={[
                                { key: 'institution_type_id', header: 'ID' },
                                { key: 'institution_type', header: 'Institution Type' },
                                { key: 'actions', header: 'Actions' }
                            ]}
                            isSortable
                            sortRow={(a, b, { sortDirection, sortKey }) => {
                                if (sortKey === 'institution_type_id') {
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
                                                    placeholder="Search institution types..."
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

            {/* Add Institution Type Modal */}
            <Modal
                open={showAddModal}
                modalHeading="Add New Institution Type"
                primaryButtonText="Add"
                secondaryButtonText="Cancel"
                preventCloseOnClickOutside
                onRequestClose={() => {
                    setShowAddModal(false);
                    setNewInstituteType('');
                }}
                onRequestSubmit={handleAdd}
            >
                <Form>
                    <FormGroup legendText="Institution Type">
                        <TextInput
                            id="newInstituteType"
                            value={newInstituteType}
                            onChange={(e) => setNewInstituteType(e.target.value)}
                            rows={4}
                        />
                    </FormGroup>
                </Form>
            </Modal>

            {/* Edit Institution Type Modal */}
            <Modal
                open={showEditModal}
                modalHeading="Edit Institution Type"
                primaryButtonText="Save"
                secondaryButtonText="Cancel"
                preventCloseOnClickOutside
                onRequestClose={() => {
                    setShowEditModal(false);
                    setSelectedInstituteType(null);
                    setNewInstituteType('');
                }}
                onRequestSubmit={handleEdit}
            >
                <Form>
                    <FormGroup legendText="Institution Type">
                        <TextInput
                            id="editInstituteType"
                            labelText="Institution type"
                            value={newInstituteType}
                            onChange={(e) => setNewInstituteType(e.target.value)}
                            rows={4}
                        />
                    </FormGroup>
                </Form>
            </Modal>
        </Grid>
    );
};

export default AdminManageInstituteType;