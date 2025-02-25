import React, { useState, useEffect, useCallback } from 'react';
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
    Pagination,
    Link
} from '@carbon/react';
import { Add, TrashCan, Edit, View, DataViewAlt } from '@carbon/icons-react';
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

    const [courseTypes, setCourseTypes] = useState([]);
    const [selectedCourseType, setSelectedCourseType] = useState('');
    const [filteredCourses, setFilteredCourses] = useState([]);

    const [newMapping, setNewMapping] = useState({
        institution_id: '',
        course_type_id: '',
        course_id: '',
        description: '',
        fees: '',
        website: '',
        student_qualification: '',
        course_affliation: '',
        duration: '',
        status: 'active'
    });

    const [loadingInstitutes, setLoadingInstitutes] = useState(false);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [loadingCourseTypes, setLoadingCourseTypes] = useState(false);

    useEffect(() => {
        fetchMappings();
        fetchInstitutes();
        fetchCourses();
        fetchCourseTypes();
    }, [currentPage, pageSize, sortKey, sortDirection]);

    const fetchMappings = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `http://localhost:5001/api/admin/course-mappings?page=${currentPage}&per_page=${pageSize}&sort=${sortKey}&direction=${sortDirection}`,
                {
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            if (response.status === 401) {
                navigate('/login');
                return;
            }

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }

            setCourseMappings(data.mappings || []);
            setTotalItems(data.total || 0);
        } catch (error) {
            setError('Error fetching course mappings: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, sortKey, sortDirection, navigate]);

    const fetchInstitutes = async () => {
        try {
            setLoadingInstitutes(true);
            const response = await fetch('http://localhost:5001/api/admin/institutes', {
                credentials: 'include'
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setInstitutes(data.institutes || []);
        } catch (error) {
            setError('Error fetching institutes: ' + error.message);
        } finally {
            setLoadingInstitutes(false);
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

    const fetchCourseTypes = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/admin/course-types', {
                credentials: 'include'
            });
            const data = await response.json();
            setCourseTypes(data.courseTypes || []);
        } catch (error) {
            console.error('Error fetching course types:', error);
            setError('Error fetching course types');
        }
    };

    const validateMapping = (mapping) => {
        if (!mapping.institution_id) {
            return 'Please select an institution';
        }
        if (!mapping.course_type_id) {
            return 'Please select a course type';
        }
        if (!mapping.course_id) {
            return 'Please select a course';
        }
        if (!mapping.description?.trim()) {
            return 'Description is required';
        }
        if (!mapping.fees || isNaN(mapping.fees) || parseFloat(mapping.fees) <= 0) {
            return 'Please enter valid fees';
        }
        if (!mapping.website?.trim()) {
            return 'Website URL is required';
        }
        if (!mapping.student_qualification?.trim()) {
            return 'Student qualification is required';
        }
        if (!mapping.course_affliation?.trim()) {
            return 'Course affiliation is required';
        }
        if (!mapping.duration?.trim()) {
            return 'Duration is required';
        }
        return null;
    };

    const handleAdd = async () => {
        const error = validateMapping(newMapping);
        if (error) {
            setError(error);
            return;
        }

        try {
            // Format data before sending
            const mappingData = {
                ...newMapping,
                institution_id: parseInt(newMapping.institution_id),
                course_type_id: parseInt(newMapping.course_type_id),
                course_id: parseInt(newMapping.course_id),
                fees: parseFloat(newMapping.fees)
            };

            const response = await fetch('http://localhost:5001/api/admin/course-mappings', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mappingData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to add mapping');
            }

            await fetchMappings();
            setSuccessMessage('Course mapping added successfully');
            setShowAddModal(false);
            resetForm();
        } catch (error) {
            setError(error.message || 'Error adding course mapping');
        }
    };

    const resetForm = () => {
        setNewMapping({
            institution_id: '',
            course_type_id: '',
            course_id: '',
            description: '',
            fees: '',
            website: '',
            student_qualification: '',
            course_affliation: '',
            duration: '',
            status: 'active'
        });
        setSelectedCourseType('');
        setFilteredCourses([]);
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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newMapping),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            await fetchMappings();
            setSuccessMessage('Course mapping updated successfully');
            setShowEditModal(false);
            setSelectedMapping(null);
            setNewMapping({
                institution_id: '',
                course_type_id: '',
                course_id: '',
                description: '',
                fees: '',
                website: '',
                student_qualification: '',
                course_affliation: '',
                duration: '',
                status: 'active'
            });
            setSelectedCourseType('');
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
        try {
            // Handle fees sorting
            if (sortKey === 'fees') {
                const aFees = parseFloat(a[sortKey].replace('₹', '').replace(/,/g, ''));
                const bFees = parseFloat(b[sortKey].replace('₹', '').replace(/,/g, ''));
                return sortDirection === 'asc' ? aFees - bFees : bFees - aFees;
            }

            // Handle date sorting
            if (sortKey === 'created_at') {
                const aDate = new Date(a[sortKey]);
                const bDate = new Date(b[sortKey]);

                // Handle invalid dates
                if (isNaN(aDate.getTime()) && isNaN(bDate.getTime())) return 0;
                if (isNaN(aDate.getTime())) return sortDirection === 'asc' ? 1 : -1;
                if (isNaN(bDate.getTime())) return sortDirection === 'asc' ? -1 : 1;

                return sortDirection === 'asc'
                    ? aDate.getTime() - bDate.getTime()
                    : bDate.getTime() - aDate.getTime();
            }

            // Handle numeric ID sorting
            if (sortKey === 'course_mapping_id') {
                const aId = parseInt(a[sortKey]);
                const bId = parseInt(b[sortKey]);
                return sortDirection === 'asc' ? aId - bId : bId - aId;
            }

            // Default string sorting
            const aValue = (a[sortKey] || '').toString().toLowerCase();
            const bValue = (b[sortKey] || '').toString().toLowerCase();
            return sortDirection === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        } catch (error) {
            console.error('Sorting error:', error);
            return 0;
        }
    };

    // Improve course type change handler
    const handleCourseTypeChange = (e) => {
        const courseTypeId = e.target.value;
        setSelectedCourseType(courseTypeId);

        // Update newMapping with course_type_id and reset course_id
        setNewMapping(prev => ({
            ...prev,
            course_type_id: courseTypeId ? parseInt(courseTypeId) : '',
            course_id: '' // Reset course selection when course type changes
        }));

        // Filter courses based on selected course type
        if (courseTypeId) {
            const filtered = courses.filter(course =>
                course.course_type_id === parseInt(courseTypeId)
            );
            setFilteredCourses(filtered);
        } else {
            setFilteredCourses([]);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '-';

            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            console.error('Date formatting error:', error);
            return '-';
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
                                course_mapping_id: String(mapping.course_mapping_id),
                                institution: institutes.find(i => i.institution_id === mapping.institution_id)?.institution || '-',
                                course_type: courseTypes.find(ct => ct.course_type_id === mapping.course_type_id)?.course_type || '-',
                                course: courses.find(c => c.course_id === mapping.course_id)?.course || '-',
                                description: mapping.description,
                                fees: `₹${mapping.fees.toLocaleString('en-IN')}`,
                                website: (
                                    <Link href={mapping.website} target="_blank">
                                        {mapping.website}
                                    </Link>
                                ),
                                student_qualification: mapping.student_qualification,
                                course_affliation: mapping.course_affliation,
                                duration: mapping.duration,
                                created_at: formatDate(mapping.created_at),
                                status: (
                                    <Tag type={mapping.status === 'active' ? 'green' : 'red'}>
                                        {mapping.status}
                                    </Tag>
                                ),
                                actions: (
                                    <Stack orientation="horizontal" gap={4}>
                                        <Button
                                            kind="primary"
                                            size="sm"
                                            renderIcon={DataViewAlt} Ç
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
                                                setNewMapping({ ...mapping });
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
                                { key: 'course_mapping_id', header: 'ID', isSortable: true },
                                { key: 'institution', header: 'Institution', isSortable: true },
                                { key: 'course_type', header: 'Course Type', isSortable: true },
                                { key: 'course', header: 'Course', isSortable: true },
                                { key: 'duration', header: 'Duration', isSortable: true },
                                { key: 'created_at', header: 'Created At', isSortable: true },
                                { key: 'fees', header: 'Fees', isSortable: true },
                                { key: 'status', header: 'Status', isSortable: true },
                                { key: 'actions', header: 'Actions', isSortable: false }
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
                                                    {headers.map(header => {
                                                        const headerProps = getHeaderProps({
                                                            header,
                                                            onClick: header.isSortable ? () => handleSort(
                                                                header.key,
                                                                sortDirection === 'asc' ? 'desc' : 'asc'
                                                            ) : undefined
                                                        });
                                                        const { key, ...otherProps } = headerProps;
                                                        return (
                                                            <TableHeader
                                                                key={header.key}
                                                                {...otherProps}
                                                            >
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
                        course_type_id: '',
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
                            onChange={(e) => setNewMapping({ ...newMapping, institution_id: e.target.value })}
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
                            id="courseType"
                            labelText="Course Type"
                            value={selectedCourseType}
                            onChange={handleCourseTypeChange}
                            required
                        >
                            <SelectItem value="" text="Choose a course type" />
                            {courseTypes.map(type => (
                                <SelectItem
                                    key={type.course_type_id}
                                    value={type.course_type_id}
                                    text={type.course_type}
                                />
                            ))}
                        </Select>

                        <Select
                            id="course"
                            labelText="Course"
                            value={newMapping.course_id}
                            onChange={(e) => setNewMapping({ ...newMapping, course_id: e.target.value })}
                            required
                        >
                            <SelectItem value="" text="Choose a course" />
                            {filteredCourses.map(course => (
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
                            onChange={(e) => setNewMapping({ ...newMapping, description: e.target.value })}
                            rows={4}
                            required
                        />

                        <NumberInput
                            id="fees"
                            label="Fees (₹)"
                            value={newMapping.fees}
                            onChange={(e, { value }) => setNewMapping({ ...newMapping, fees: value })} // Update onChange handler
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
                            onChange={(e) => setNewMapping({ ...newMapping, website: e.target.value })}
                            required
                        />

                        <TextArea
                            id="qualification"
                            labelText="Student Qualification Required"
                            value={newMapping.student_qualification}
                            onChange={(e) => setNewMapping({ ...newMapping, student_qualification: e.target.value })}
                            rows={2}
                            required
                        />

                        <TextInput
                            id="affliation"
                            labelText="Course Affiliation"
                            value={newMapping.course_affliation}
                            onChange={(e) => setNewMapping({ ...newMapping, course_affliation: e.target.value })}
                            required
                        />

                        <TextInput
                            id="duration"
                            labelText="Course Duration"
                            value={newMapping.duration}
                            onChange={(e) => setNewMapping({ ...newMapping, duration: e.target.value })}
                            required
                        />

                        <Select
                            id="status"
                            labelText="Status"
                            value={newMapping.status}
                            onChange={(e) => setNewMapping({ ...newMapping, status: e.target.value })}
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