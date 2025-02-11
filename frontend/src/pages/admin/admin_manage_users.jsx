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
    Tag,
    Stack,
    Modal
} from '@carbon/react';
import { TrashCan, UserAvatar, View } from '@carbon/icons-react';
import { useNavigate } from 'react-router-dom';
import './admin.css';

const ProfilePicture = ({ user, size = "small" }) => {
    const [imageError, setImageError] = useState(false);
    const [loading, setLoading] = useState(true);

    const handleImageError = () => {
        setImageError(true);
        setLoading(false);
    };

    const handleImageLoad = () => {
        setLoading(false);
    };

    if (!user.profilePicture || imageError) {
        return (
            <div className={`profile-picture-container ${size}`}>
                <div className="default-avatar">
                    <UserAvatar size={size === "small" ? 14 : 24} />
                </div>
            </div>
        );
    }

    return (
        <div className={`profile-picture-container ${size}`}>
            {loading && (
                <div className="loading-avatar">
                    <UserAvatar size={size === "small" ? 14 : 24} />
                </div>
            )}
            <img 
                src={`http://localhost:5001${user.profilePicture}`}
                alt={`${user.full_name}'s profile`}
                className={`profile-picture ${loading ? 'hidden' : ''}`}
                onError={handleImageError}
                onLoad={handleImageLoad}
            />
        </div>
    );
};

const AdminManageUsers = ({ username }) => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/admin/users', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
            });
            
            if (response.status === 401) {
                navigate('/login');
                return;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setUsers(data.users);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Error fetching users');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (login_id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const response = await fetch(`http://localhost:5001/api/admin/users/${login_id}`, {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                setUsers(users.filter(user => user.login_id !== login_id));
                setSuccessMessage('User deleted successfully');
            } catch (error) {
                console.error('Error deleting user:', error);
                setError('Error deleting user');
            }
        }
    };

    const handleViewDetails = (user) => {
        setSelectedUser(user);
        setShowDetailsModal(true);
    };

    return (
        <Grid className="dashboard">
            <Column lg={16} md={8} sm={4}>
                <Tile className="stat-tile">
                    <h2>Manage Users</h2>
                    <p className="subtitle">View and manage user accounts</p>

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
                            columnCount={7} 
                            rowCount={5} 
                        />
                    ) : (
                        <DataTable
                            rows={users.map(user => ({
                                id: String(user.login_id),
                                login_id: String(user.login_id),
                                profilePicture: <ProfilePicture user={user} size="small" />,
                                username: user.username || '-',
                                fullName: user.full_name || '-',
                                email: user.email || '-',
                                phone: user.phone || '-',
                                state: <Tag type={user.state === 'active' ? 'green' : 'red'}>{user.state || '-'}</Tag>,
                                actions: (
                                    <Stack orientation="horizontal" gap={4}>
                                        <Button
                                            kind="ghost"
                                            size="sm"
                                            renderIcon={View}
                                            onClick={() => handleViewDetails(user)}
                                        >
                                            View
                                        </Button>
                                        <Button
                                            kind="danger"
                                            size="sm"
                                            renderIcon={TrashCan}
                                            onClick={() => handleDelete(user.login_id)}
                                        >
                                            Delete
                                        </Button>
                                    </Stack>
                                )
                            }))}
                            headers={[
                                { key: 'login_id', header: 'ID' },
                                { key: 'profilePicture', header: 'Profile' },
                                { key: 'username', header: 'Username' },
                                { key: 'fullName', header: 'Full Name' },
                                { key: 'email', header: 'Email' },
                                { key: 'phone', header: 'Phone' },
                                { key: 'state', header: 'State' },
                                { key: 'actions', header: 'Actions' }
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
                                                placeholder="Search users..."
                                            />
                                        </TableToolbarContent>
                                    </TableToolbar>
                                    <Table {...getTableProps()} size="lg">
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
                                                        <TableCell key={cell.id}>{cell.value}</TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </DataTable>
                    )}
                </Tile>
            </Column>

            {/* Details Modal */}
            <Modal
                open={showDetailsModal}
                modalHeading="User Details"
                primaryButtonText="Close"
                preventCloseOnClickOutside
                onRequestClose={() => {
                    setShowDetailsModal(false);
                    setSelectedUser(null);
                }}
                onRequestSubmit={() => {
                    setShowDetailsModal(false);
                    setSelectedUser(null);
                }}
            >
                {selectedUser && (
                    <Stack gap={7}>
                        <div>
                            <h4>Profile Picture</h4>
                            <ProfilePicture user={selectedUser} size="large" />
                        </div>
                        <div>
                            <h4>Full Name</h4>
                            <p>{selectedUser.full_name || '-'}</p>
                        </div>
                        <div>
                            <h4>Username</h4>
                            <p>{selectedUser.username || '-'}</p>
                        </div>
                        <div>
                            <h4>Email</h4>
                            <p>{selectedUser.email || '-'}</p>
                        </div>
                        <div>
                            <h4>Phone</h4>
                            <p>{selectedUser.phone || '-'}</p>
                        </div>
                        <div>
                            <h4>State</h4>
                            <Tag type={selectedUser.state === 'active' ? 'green' : 'red'}>
                                {selectedUser.state || '-'}
                            </Tag>
                        </div>
                        <div>
                            <h4>Registration Date</h4>
                            <p>{selectedUser.created_at || '-'}</p>
                        </div>
                    </Stack>
                )}
            </Modal>
        </Grid>
    );
};

export default AdminManageUsers;