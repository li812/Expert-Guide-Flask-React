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

const AdminManageCourseType = ({ username }) => {
    const [courseTypes, setCourseTypes] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCourseType, setSelectedCourseType] = useState(null);
    const [newCourseType, setNewCourseType] = useState('');
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortKey, setSortKey] = useState('course_type_id');
    const [sortDirection, setSortDirection] = useState('asc');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourseTypes();
    }, [currentPage, pageSize, sortKey, sortDirection]);

    const fetchCourseTypes = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `http://localhost:5001/api/admin/course-types?page=${currentPage}&per_page=${pageSize}&sort=${sortKey}&direction=${sortDirection}`, 
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
            setCourseTypes(data.courseTypes || []);
            setTotalItems(data.total || 0);
        } catch (error) {
            setError('Error fetching course types');
        } finally {
            setLoading(false);
        }
    };

    const validateCourseType = (courseType) => {
        if (!courseType || courseType.trim().length === 0) {
            return 'Course type cannot be empty';
        }
        if (courseType.length > 120) {
            return 'Course type must be less than 120 characters';
        }
        return null;
    };

    const handleAdd = async () => {
        const error = validateCourseType(newCourseType);
        if (error) {
            setError(error);
            return;
        }
        try {
            const response = await fetch('http://localhost:5001/api/admin/course-types', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ course_type: newCourseType }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            await fetchCourseTypes();
            setSuccessMessage('Course type added successfully');
            setShowAddModal(false);
            setNewCourseType('');
        } catch (error) {
            setError('Error adding course type');
        }
    };

    const handleEdit = async () => {
        const error = validateCourseType(newCourseType);
        if (error) {
            setError(error);
            return;
        }
        try {
            const response = await fetch(`http://localhost:5001/api/admin/course-types/${selectedCourseType.course_type_id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ course_type: newCourseType }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            await fetchCourseTypes();
            setSuccessMessage('Course type updated successfully');
            setShowEditModal(false);
            setSelectedCourseType(null);
            setNewCourseType('');
        } catch (error) {
            setError('Error updating course type');
        }
    };

    const handleDelete = async (courseTypeId) => {
        if (window.confirm('Are you sure you want to delete this course type?')) {
            try {
                const response = await fetch(`http://localhost:5001/api/admin/course-types/${courseTypeId}`, {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                await fetchCourseTypes();
                setSuccessMessage('Course type deleted successfully');
            } catch (error) {
                setError('Error deleting course type');
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
                            <h2>Course Types</h2>
                            <p className="subtitle">Manage Course Types</p>
                        </div>
                        <Button
                            renderIcon={Add}
                            onClick={() => setShowAddModal(true)}
                        >
                            Add Course Type
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
                            rows={courseTypes.map(ct => ({
                                id: String(ct.course_type_id),
                                course_type_id: String(ct.course_type_id),
                                course_type: ct.course_type,
                                actions: (
                                    <Stack orientation="horizontal" gap={4}>
                                        <Button
                                            kind="ghost"
                                            size="sm"
                                            renderIcon={Edit}
                                            onClick={() => {
                                                setSelectedCourseType(ct);
                                                setNewCourseType(ct.course_type);
                                                setShowEditModal(true);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            kind="danger"
                                            size="sm"
                                            renderIcon={TrashCan}
                                            onClick={() => handleDelete(ct.course_type_id)}
                                        >
                                            Delete
                                        </Button>
                                    </Stack>
                                )
                            }))}
                            headers={[
                                { key: 'course_type_id', header: 'ID' },
                                { key: 'course_type', header: 'Course Type' },
                                { key: 'actions', header: 'Actions' }
                            ]}
                            isSortable
                            sortRow={(a, b, { sortDirection, sortKey }) => {
                                if (sortKey === 'course_type_id') {
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
                                                    placeholder="Search course types..."
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

            {/* Add Course Type Modal */}
            <Modal
                open={showAddModal}
                modalHeading="Add New Course Type"
                primaryButtonText="Add"
                secondaryButtonText="Cancel"
                preventCloseOnClickOutside
                onRequestClose={() => {
                    setShowAddModal(false);
                    setNewCourseType('');
                }}
                onRequestSubmit={handleAdd}
            >
                <Form>
                    <FormGroup legendText="Course Type">
                        <TextArea
                            id="newCourseType"
                            labelText="Course type"
                            value={newCourseType}
                            onChange={(e) => setNewCourseType(e.target.value)}
                            rows={4}
                        />
                    </FormGroup>
                </Form>
            </Modal>

            {/* Edit Course Type Modal */}
            <Modal
                open={showEditModal}
                modalHeading="Edit Course Type"
                primaryButtonText="Save"
                secondaryButtonText="Cancel"
                preventCloseOnClickOutside
                onRequestClose={() => {
                    setShowEditModal(false);
                    setSelectedCourseType(null);
                    setNewCourseType('');
                }}
                onRequestSubmit={handleEdit}
            >
                <Form>
                    <FormGroup legendText="Course Type">
                        <TextArea
                            id="editCourseType"
                            labelText="Course type"
                            value={newCourseType}
                            onChange={(e) => setNewCourseType(e.target.value)}
                            rows={4}
                        />
                    </FormGroup>
                </Form>
            </Modal>
        </Grid>
    );
};

export default AdminManageCourseType;



