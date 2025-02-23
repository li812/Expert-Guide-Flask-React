import React, { useState, useEffect } from 'react';
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
    TableToolbar,
    TableToolbarContent,
    TableToolbarSearch,
    Button,
    InlineNotification,
    DataTableSkeleton,
    Stack,
    Modal,
    Form,
    FormGroup,
    TextInput,
    TextArea,
    Select,
    SelectItem,
    NumberInput,
    Tag,
    Pagination
} from '@carbon/react';
import { Add, TrashCan, Edit, View } from '@carbon/icons-react';
import { useNavigate } from 'react-router-dom';
import ViewCourseDetailsModal from '../../components/ViewCourseDetailsModal/ViewCourseDetailsModal';

const AdminCourseMapping = ({ username }) => {
    const [courseMappings, setCourseMappings] = useState([]);
    const [institutes, setInstitutes] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedMapping, setSelectedMapping] = useState(null);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortKey, setSortKey] = useState('course_mapping_id');
    const [sortDirection, setSortDirection] = useState('asc');
    const navigate = useNavigate();
    const [selectedMappingId, setSelectedMappingId] = useState(null);

    const [newMapping, setNewMapping] = useState({
        institution_id: '',
        course_id: '',
        description: '',
        fees: '',
        website: '',
        student_qualification: '',
        course_affliation: '',
        duration: '',
        status: 'active'
    });

    useEffect(() => {
        fetchMappings();
        fetchInstitutes();
        fetchCourses();
    }, [currentPage, pageSize, sortKey, sortDirection]);

    const fetchMappings = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `http://localhost:5001/api/admin/course-mappings?page=${currentPage}&per_page=${pageSize}&sort=${sortKey}&direction=${sortDirection}`,
                {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            if (response.status === 401) {
                navigate('/login');
                return;
            }

            const data = await response.json();
            setCourseMappings(data.mappings || []);
            setTotalItems(data.total || 0);
        } catch (error) {
            setError('Error fetching course mappings');
        } finally {
            setLoading(false);
        }
    };

    const fetchInstitutes = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/admin/institutes', {
                credentials: 'include'
            });
            const data = await response.json();
            setInstitutes(data.institutes || []);
        } catch (error) {
            console.error('Error fetching institutes:', error);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/admin/courses', {
                credentials: 'include'
            });
            const data = await response.json();
            setCourses(data.courses || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const validateMapping = (mapping) => {
        if (!mapping.institution_id) return 'Institution is required';
        if (!mapping.course_id) return 'Course is required';
        if (!mapping.description) return 'Description is required';
        if (!mapping.fees || mapping.fees <= 0) return 'Valid fees amount is required';
        if (!mapping.website) return 'Website is required';
        if (!mapping.student_qualification) return 'Student qualification is required';
        if (!mapping.course_affliation) return 'Course affiliation is required';
        if (!mapping.duration) return 'Duration is required';
        return null;
    };

    const handleAdd = async () => {
        const error = validateMapping(newMapping);
        if (error) {
            setError(error);
            return;
        }

        try {
            const response = await fetch('http://localhost:5001/api/admin/course-mappings', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMapping),
            });

            if (!response.ok) throw new Error('Failed to add mapping');
            
            await fetchMappings();
            setSuccessMessage('Course mapping added successfully');
            setShowAddModal(false);
            setNewMapping({
                institution_id: '',
                course_id: '',
                description: '',
                fees: '',
                website: '',
                student_qualification: '',
                course_affliation: '',
                duration: '',
                status: 'active'
            });
        } catch (error) {
            setError('Error adding course mapping');
        }
    };

    const handleEdit = async () => {
        const error = validateMapping(newMapping);
        if (error) {
            setError(error);
            return;
        }

        try {
            const response = await fetch(`http://localhost:5001/api/admin/course-mappings/${selectedMapping.course_mapping_id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMapping),
            });

            if (!response.ok) throw new Error('Failed to update mapping');
            
            await fetchMappings();
            setSuccessMessage('Course mapping updated successfully');
            setShowEditModal(false);
            setSelectedMapping(null);
        } catch (error) {
            setError('Error updating course mapping');
        }
    };

    const handleDelete = async (mappingId) => {
        if (!window.confirm('Are you sure you want to delete this course mapping?')) return;

        try {
            const response = await fetch(`http://localhost:5001/api/admin/course-mappings/${mappingId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) throw new Error('Failed to delete mapping');
            
            await fetchMappings();
            setSuccessMessage('Course mapping deleted successfully');
        } catch (error) {
            setError('Error deleting course mapping');
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

    const sortRow = (a, b, { sortDirection, sortKey }) => {
        if (sortKey === 'fees') {
            const aFees = parseFloat(a[sortKey].replace('₹', ''));
            const bFees = parseFloat(b[sortKey].replace('₹', ''));
            return sortDirection === 'asc' ? aFees - bFees : bFees - aFees;
        }
        
        if (sortKey === 'course_mapping_id') {
            return sortDirection === 'asc' 
                ? parseInt(a[sortKey]) - parseInt(b[sortKey])
                : parseInt(b[sortKey]) - parseInt(a[sortKey]);
        }
        
        return sortDirection === 'asc'
            ? a[sortKey].toString().localeCompare(b[sortKey].toString())
            : b[sortKey].toString().localeCompare(a[sortKey].toString());
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
                            <h2>Course Mappings</h2>
                            <p className="subtitle">Manage institution-course mappings</p>
                        </div>
                        <Button
                            renderIcon={Add}
                            onClick={() => setShowAddModal(true)}
                        >
                            Add Mapping
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
                        <DataTableSkeleton columnCount={8} rowCount={5} />
                    ) : (
                        <DataTable
                            rows={courseMappings.map(mapping => ({
                                id: String(mapping.course_mapping_id),
                                institution: institutes.find(i => i.institution_id === mapping.institution_id)?.institution || '-',
                                course: courses.find(c => c.course_id === mapping.course_id)?.course || '-',
                                fees: `₹${mapping.fees}`,
                                duration: mapping.duration,
                                status: (
                                    <Tag type={mapping.status === 'active' ? 'green' : 'red'}>
                                        {mapping.status}
                                    </Tag>
                                ),
                                actions: (
                                    <Stack orientation="horizontal" gap={4}>
                                        <Button
                                            kind="ghost"
                                            size="sm"
                                            renderIcon={View}
                                            onClick={() => {
                                                setSelectedMappingId(mapping.course_mapping_id);
                                                setShowViewModal(true);
                                            }}
                                        >
                                            View
                                        </Button>
                                        <Button
                                            kind="ghost"
                                            size="sm"
                                            renderIcon={Edit}
                                            onClick={() => {
                                                setSelectedMapping(mapping);
                                                setNewMapping({...mapping});
                                                setShowEditModal(true);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            kind="danger"
                                            size="sm"
                                            renderIcon={TrashCan}
                                            onClick={() => handleDelete(mapping.course_mapping_id)}
                                        >
                                            Delete
                                        </Button>
                                    </Stack>
                                )
                            }))}
                            headers={[
                                { key: 'institution', header: 'Institution' },
                                { key: 'course', header: 'Course' },
                                { key: 'fees', header: 'Fees' },
                                { key: 'duration', header: 'Duration' },
                                { key: 'status', header: 'Status' },
                                { key: 'actions', header: 'Actions' }
                            ]}
                            isSortable
                            sortRow={sortRow}
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
                                                    placeholder="Search mappings..."
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
                                                                onClick: header.key !== 'actions' ? () => handleSort(
                                                                    header.key,
                                                                    sortDirection === 'asc' ? 'desc' : 'asc'
                                                                ) : undefined
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

            {/* Add/Edit Modal Form */}
            <Modal
                open={showAddModal || showEditModal}
                modalHeading={showAddModal ? "Add New Course Mapping" : "Edit Course Mapping"}
                primaryButtonText={showAddModal ? "Add" : "Save"}
                secondaryButtonText="Cancel"
                size="lg"
                preventCloseOnClickOutside
                onRequestClose={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedMapping(null);
                    setNewMapping({
                        institution_id: '',
                        course_id: '',
                        description: '',
                        fees: '',
                        website: '',
                        student_qualification: '',
                        course_affliation: '',
                        duration: '',
                        status: 'active'
                    });
                }}
                onRequestSubmit={showAddModal ? handleAdd : handleEdit}
            >
                <Form>
                    <Stack gap={7}>
                        <Select
                            id="institution"
                            labelText="Institution"
                            value={newMapping.institution_id}
                            onChange={(e) => setNewMapping({...newMapping, institution_id: e.target.value})}
                            required
                        >
                            <SelectItem value="" text="Choose an institution" />
                            {institutes.map(inst => (
                                <SelectItem
                                    key={inst.institution_id}
                                    value={inst.institution_id}
                                    text={inst.institution}
                                />
                            ))}
                        </Select>

                        <Select
                            id="course"
                            labelText="Course"
                            value={newMapping.course_id}
                            onChange={(e) => setNewMapping({...newMapping, course_id: e.target.value})}
                            required
                        >
                            <SelectItem value="" text="Choose a course" />
                            {courses.map(course => (
                                <SelectItem
                                    key={course.course_id}
                                    value={course.course_id}
                                    text={course.course}
                                />
                            ))}
                        </Select>

                        <TextArea
                            id="description"
                            labelText="Description"
                            value={newMapping.description}
                            onChange={(e) => setNewMapping({...newMapping, description: e.target.value})}
                            rows={4}
                            required
                        />

                        <NumberInput
                            id="fees"
                            label="Fees (₹)" // Add label prop
                            labelText="Fees (₹)"
                            value={newMapping.fees}
                            onChange={(e, { value }) => setNewMapping({...newMapping, fees: value})} // Update onChange handler
                            min={0}
                            required
                            hideSteppers={false} // Add step buttons
                            step={1000} // Set step increment
                            invalidText="Please enter a valid amount" // Add validation message
                        />

                        <TextInput
                            id="website"
                            labelText="Course Website"
                            value={newMapping.website}
                            onChange={(e) => setNewMapping({...newMapping, website: e.target.value})}
                            required
                        />

                        <TextArea
                            id="qualification"
                            labelText="Student Qualification Required"
                            value={newMapping.student_qualification}
                            onChange={(e) => setNewMapping({...newMapping, student_qualification: e.target.value})}
                            rows={2}
                            required
                        />

                        <TextInput
                            id="affliation"
                            labelText="Course Affiliation"
                            value={newMapping.course_affliation}
                            onChange={(e) => setNewMapping({...newMapping, course_affliation: e.target.value})}
                            required
                        />

                        <TextInput
                            id="duration"
                            labelText="Course Duration"
                            value={newMapping.duration}
                            onChange={(e) => setNewMapping({...newMapping, duration: e.target.value})}
                            required
                        />

                        <Select
                            id="status"
                            labelText="Status"
                            value={newMapping.status}
                            onChange={(e) => setNewMapping({...newMapping, status: e.target.value})}
                            required
                        >
                            <SelectItem value="active" text="Active" />
                            <SelectItem value="inactive" text="Inactive" />
                        </Select>
                    </Stack>
                </Form>
            </Modal>

            {/* View Details Modal */}
            <ViewCourseDetailsModal 
                open={showViewModal}
                onClose={() => {
                    setShowViewModal(false);
                    setSelectedMappingId(null);
                }}
                mappingId={selectedMappingId}
                institutes={institutes}
                courses={courses}
            />
        </Grid>
    );
};

export default AdminCourseMapping;