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
    TableToolbarAction,
    Tag,
    Stack,
    Modal,
    TextArea,
    Form,
    FormGroup,
    Pagination
} from '@carbon/react';
import { Add, TrashCan, Edit, Save, View } from '@carbon/icons-react';
import { useNavigate } from 'react-router-dom';

const AdminManageQuestions = ({ username }) => {
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [newQuestion, setNewQuestion] = useState('');
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortKey, setSortKey] = useState('question_id');
    const [sortDirection, setSortDirection] = useState('asc');
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuestions();
    }, [currentPage, pageSize, sortKey, sortDirection]);

    const fetchQuestions = async () => {
        try {
            const response = await fetch(
                `http://localhost:5001/api/admin/questions?page=${currentPage}&per_page=${pageSize}&sort=${sortKey}&direction=${sortDirection}`, 
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
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setQuestions(data.questions || []);
            setTotalItems(data.total || 0);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching questions:', error);
            setError('Error fetching questions');
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/admin/questions', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: newQuestion }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setQuestions([...questions, data.question]);
            setSuccessMessage('Question added successfully');
            setShowAddModal(false);
            setNewQuestion('');
        } catch (error) {
            console.error('Error adding question:', error);
            setError('Error adding question');
        }
    };

    const handleEdit = async () => {
        try {
            const response = await fetch(`http://localhost:5001/api/admin/questions/${selectedQuestion.question_id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: newQuestion }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            setQuestions(questions.map(q => 
                q.question_id === selectedQuestion.question_id 
                    ? { ...q, question: newQuestion }
                    : q
            ));
            setSuccessMessage('Question updated successfully');
            setShowEditModal(false);
            setSelectedQuestion(null);
            setNewQuestion('');
        } catch (error) {
            console.error('Error updating question:', error);
            setError('Error updating question');
        }
    };

    const handleDelete = async (question_id) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            try {
                const response = await fetch(`http://localhost:5001/api/admin/questions/${question_id}`, {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                setQuestions(questions.filter(q => q.question_id !== question_id));
                setSuccessMessage('Question deleted successfully');
            } catch (error) {
                console.error('Error deleting question:', error);
                setError('Error deleting question');
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
            setCurrentPage(1); // Reset to first page when changing page size
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
                            <h2>Career Guidance Questions</h2>
                            <p className="subtitle">Manage assessment questions</p>
                        </div>
                        <Button
                            renderIcon={Add}
                            onClick={() => setShowAddModal(true)}
                        >
                            Add Question
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
                            rows={questions.map(q => ({
                                id: String(q.question_id),
                                question_id: String(q.question_id),
                                question: q.question,
                                actions: (
                                    <Stack orientation="horizontal" gap={4}>
                                        <Button
                                            kind="ghost"
                                            size="sm"
                                            renderIcon={Edit}
                                            onClick={() => {
                                                setSelectedQuestion(q);
                                                setNewQuestion(q.question);
                                                setShowEditModal(true);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            kind="danger"
                                            size="sm"
                                            renderIcon={TrashCan}
                                            onClick={() => handleDelete(q.question_id)}
                                        >
                                            Delete
                                        </Button>
                                    </Stack>
                                )
                            }))}
                            headers={[
                                { key: 'question_id', header: 'ID' },
                                { key: 'question', header: 'Question' },
                                { key: 'actions', header: 'Actions' }
                            ]}
                            isSortable
                            sortRow={(a, b, { sortDirection, sortKey }) => {
                                if (sortKey === 'question_id') {
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
                                                    placeholder="Search questions..."
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

            {/* Add Question Modal */}
            <Modal
                open={showAddModal}
                modalHeading="Add New Question"
                primaryButtonText="Add"
                secondaryButtonText="Cancel"
                preventCloseOnClickOutside
                onRequestClose={() => {
                    setShowAddModal(false);
                    setNewQuestion('');
                }}
                onRequestSubmit={handleAdd}
            >
                <Form>
                    <FormGroup legendText="Question">
                        <TextArea
                            id="newQuestion"
                            labelText="Question text"
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            rows={4}
                        />
                    </FormGroup>
                </Form>
            </Modal>

            {/* Edit Question Modal */}
            <Modal
                open={showEditModal}
                modalHeading="Edit Question"
                primaryButtonText="Save"
                secondaryButtonText="Cancel"
                preventCloseOnClickOutside
                onRequestClose={() => {
                    setShowEditModal(false);
                    setSelectedQuestion(null);
                    setNewQuestion('');
                }}
                onRequestSubmit={handleEdit}
            >
                <Form>
                    <FormGroup legendText="Question">
                        <TextArea
                            id="editQuestion"
                            labelText="Question text"
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            rows={4}
                        />
                    </FormGroup>
                </Form>
            </Modal>
        </Grid>
    );
};

export default AdminManageQuestions;