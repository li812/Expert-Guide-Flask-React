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
    TextArea,
    Form,
    FormGroup,
    Select,
    SelectItem,
    Pagination
} from '@carbon/react';
import { Add, TrashCan, Edit } from '@carbon/icons-react';
import { useNavigate } from 'react-router-dom';

const AdminManageCourses = ({ username }) => {
    const [courses, setCourses] = useState([]);
    const [courseTypes, setCourseTypes] = useState([]);
    const [careers, setCareers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [newCourse, setNewCourse] = useState({
        course: '',
        course_description: '',
        course_type_id: '',
        career_id: ''
    });
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortKey, setSortKey] = useState('course_id');
    const [sortDirection, setSortDirection] = useState('asc');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourses();
        fetchCourseTypes();
        fetchCareers();
    }, [currentPage, pageSize, sortKey, sortDirection]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `http://localhost:5001/api/admin/courses?page=${currentPage}&per_page=${pageSize}&sort=${sortKey}&direction=${sortDirection}`, 
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
            setCourses(data.courses || []);
            setTotalItems(data.total || 0);
        } catch (error) {
            setError('Error fetching courses');
        } finally {
            setLoading(false);
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
        }
    };

    const fetchCareers = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/admin/careers', {
                credentials: 'include'
            });
            const data = await response.json();
            setCareers(data.careers || []);
        } catch (error) {
            console.error('Error fetching careers:', error);
        }
    };

    const validateCourse = (course) => {
        if (!course.course || course.course.trim().length === 0) {
            return 'Course name cannot be empty';
        }
        if (!course.course_description || course.course_description.trim().length === 0) {
            return 'Course description cannot be empty';
        }
        if (!course.course_type_id) {
            return 'Please select a course type';
        }
        if (!course.career_id) {
            return 'Please select a career';
        }
        return null;
    };

    const handleAdd = async () => {
        const error = validateCourse(newCourse);
        if (error) {
            setError(error);
            return;
        }
        try {
            const response = await fetch('http://localhost:5001/api/admin/courses', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newCourse),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            await fetchCourses();
            setSuccessMessage('Course added successfully');
            setShowAddModal(false);
            setNewCourse({
                course: '',
                course_description: '',
                course_type_id: '',
                career_id: ''
            });
        } catch (error) {
            setError('Error adding course');
        }
    };

    const handleEdit = async () => {
        const error = validateCourse(newCourse);
        if (error) {
            setError(error);
            return;
        }
        try {
            const response = await fetch(`http://localhost:5001/api/admin/courses/${selectedCourse.course_id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newCourse),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            await fetchCourses();
            setSuccessMessage('Course updated successfully');
            setShowEditModal(false);
            setSelectedCourse(null);
            setNewCourse({
                course: '',
                course_description: '',
                course_type_id: '',
                career_id: ''
            });
        } catch (error) {
            setError('Error updating course');
        }
    };

    const handleDelete = async (courseId) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                const response = await fetch(`http://localhost:5001/api/admin/courses/${courseId}`, {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                await fetchCourses();
                setSuccessMessage('Course deleted successfully');
            } catch (error) {
                setError('Error deleting course');
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
                            <h2>Courses</h2>
                            <p className="subtitle">Manage courses</p>
                        </div>
                        <Button
                            renderIcon={Add}
                            onClick={() => setShowAddModal(true)}
                        >
                            Add Course
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
                            columnCount={5} 
                            rowCount={5} 
                        />
                    ) : (
                        <DataTable
                            rows={courses.map(c => ({
                                id: String(c.course_id),
                                course_id: String(c.course_id),
                                course: c.course,
                                course_description: c.course_description,
                                course_type: courseTypes.find(ct => ct.course_type_id === c.course_type_id)?.course_type || '-',
                                career: careers.find(car => car.career_id === c.career_id)?.career || '-',
                                actions: (
                                    <Stack orientation="horizontal" gap={4}>
                                        <Button
                                            kind="ghost"
                                            size="sm"
                                            renderIcon={Edit}
                                            onClick={() => {
                                                setSelectedCourse(c);
                                                setNewCourse({
                                                    course: c.course,
                                                    course_description: c.course_description,
                                                    course_type_id: c.course_type_id,
                                                    career_id: c.career_id
                                                });
                                                setShowEditModal(true);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            kind="danger"
                                            size="sm"
                                            renderIcon={TrashCan}
                                            onClick={() => handleDelete(c.course_id)}
                                        >
                                            Delete
                                        </Button>
                                    </Stack>
                                )
                            }))}
                            headers={[
                                { key: 'course_id', header: 'ID' },
                                { key: 'course', header: 'Course Name' },
                                { key: 'course_description', header: 'Description' },
                                { key: 'course_type', header: 'Course Type' },
                                { key: 'career', header: 'Career' },
                                { key: 'actions', header: 'Actions' }
                            ]}
                            isSortable
                            sortRow={(a, b, { sortDirection, sortKey }) => {
                                if (sortKey === 'course_id') {
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
                                                    placeholder="Search courses..."
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

            {/* Add Course Modal */}
            <Modal
                open={showAddModal}
                modalHeading="Add New Course"
                primaryButtonText="Add"
                secondaryButtonText="Cancel"
                preventCloseOnClickOutside
                onRequestClose={() => {
                    setShowAddModal(false);
                    setNewCourse({
                        course: '',
                        course_description: '',
                        course_type_id: '',
                        career_id: ''
                    });
                }}
                onRequestSubmit={handleAdd}
            >
                <Form>
                    <Stack gap={7}>
                        <TextInput
                            id="newCourse"
                            labelText="Course Name"
                            value={newCourse.course}
                            onChange={(e) => setNewCourse({...newCourse, course: e.target.value})}
                        />
                        <TextArea
                            id="newCourseDescription"
                            labelText="Course Description"
                            value={newCourse.course_description}
                            onChange={(e) => setNewCourse({...newCourse, course_description: e.target.value})}
                            rows={4}
                        />
                        <Select
                            id="newCourseType"
                            labelText="Course Type"
                            value={newCourse.course_type_id}
                            onChange={(e) => setNewCourse({...newCourse, course_type_id: e.target.value})}
                        >
                            <SelectItem value="" text="Choose a course type" />
                            {courseTypes.map(ct => (
                                <SelectItem 
                                    key={ct.course_type_id} 
                                    value={ct.course_type_id} 
                                    text={ct.course_type} 
                                />
                            ))}
                        </Select>
                        <Select
                            id="newCareer"
                            labelText="Career"
                            value={newCourse.career_id}
                            onChange={(e) => setNewCourse({...newCourse, career_id: e.target.value})}
                        >
                            <SelectItem value="" text="Choose a career" />
                            {careers.map(c => (
                                <SelectItem 
                                    key={c.career_id} 
                                    value={c.career_id} 
                                    text={c.career} 
                                />
                            ))}
                        </Select>
                    </Stack>
                </Form>
            </Modal>

            {/* Edit Course Modal */}
            <Modal
                open={showEditModal}
                modalHeading="Edit Course"
                primaryButtonText="Save"
                secondaryButtonText="Cancel"
                preventCloseOnClickOutside
                onRequestClose={() => {
                    setShowEditModal(false);
                    setSelectedCourse(null);
                    setNewCourse({
                        course: '',
                        course_description: '',
                        course_type_id: '',
                        career_id: ''
                    });
                }}
                onRequestSubmit={handleEdit}
            >
                <Form>
                    <Stack gap={7}>
                        <TextInput
                            id="editCourse"
                            labelText="Course Name"
                            value={newCourse.course}
                            onChange={(e) => setNewCourse({...newCourse, course: e.target.value})}
                        />
                        <TextArea
                            id="editCourseDescription"
                            labelText="Course Description"
                            value={newCourse.course_description}
                            onChange={(e) => setNewCourse({...newCourse, course_description: e.target.value})}
                            rows={4}
                        />
                        <Select
                            id="editCourseType"
                            labelText="Course Type"
                            value={newCourse.course_type_id}
                            onChange={(e) => setNewCourse({...newCourse, course_type_id: e.target.value})}
                        >
                            <SelectItem value="" text="Choose a course type" />
                            {courseTypes.map(ct => (
                                <SelectItem 
                                    key={ct.course_type_id} 
                                    value={ct.course_type_id} 
                                    text={ct.course_type} 
                                />
                            ))}
                        </Select>
                        <Select
                            id="editCareer"
                            labelText="Career"
                            value={newCourse.career_id}
                            onChange={(e) => setNewCourse({...newCourse, career_id: e.target.value})}
                        >
                            <SelectItem value="" text="Choose a career" />
                            {careers.map(c => (
                                <SelectItem 
                                    key={c.career_id} 
                                    value={c.career_id} 
                                    text={c.career} 
                                />
                            ))}
                        </Select>
                    </Stack>
                </Form>
            </Modal>
        </Grid>
    );

};

export default AdminManageCourses;