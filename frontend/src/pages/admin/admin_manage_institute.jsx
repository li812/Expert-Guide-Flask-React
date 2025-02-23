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
    DatePicker,
    DatePickerInput,
    Pagination
} from '@carbon/react';
import { Add, TrashCan, Edit, Upload } from '@carbon/icons-react';
import { useNavigate } from 'react-router-dom';
import statesAndDistricts from '../../components/StatesAndDistricts';

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
};

const formatDateForApi = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const AdminManageInstitute = ({ username }) => {
    const [institutes, setInstitutes] = useState([]);
    const [instituteTypes, setInstituteTypes] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedInstitute, setSelectedInstitute] = useState(null);
    const [newInstitute, setNewInstitute] = useState({
        institution: '',
        institution_type_id: '',
        description: '',
        accreditation: '',
        since_date: '',
        website: '',
        email: '',
        phone: '',
        address: '',
        state: '',
        district: '',
        postalPinCode: '',
        logoPicture: null
    });
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortKey, setSortKey] = useState('institution_id');
    const [sortDirection, setSortDirection] = useState('asc');
    const [districts, setDistricts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInstitutes();
        fetchInstituteTypes();
    }, [currentPage, pageSize, sortKey, sortDirection]);

    const fetchInstitutes = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `http://localhost:5001/api/admin/institutes?page=${currentPage}&per_page=${pageSize}&sort=${sortKey}&direction=${sortDirection}`,
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
            setInstitutes(data.institutes || []);
            setTotalItems(data.total || 0);
        } catch (error) {
            setError('Error fetching institutions');
        } finally {
            setLoading(false);
        }
    };

    const fetchInstituteTypes = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/admin/institute-types', {
                credentials: 'include'
            });
            const data = await response.json();
            setInstituteTypes(data.instituteTypes || []);
        } catch (error) {
            console.error('Error fetching institute types:', error);
        }
    };

    const validateInstitute = (institute) => {
        if (!institute.institution?.trim()) return 'Institution name is required';
        if (!institute.institution_type_id) return 'Institution type is required';
        if (!institute.description?.trim()) return 'Description is required';
        if (!institute.since_date) return 'Since date is required';
        if (!institute.website?.trim()) return 'Website is required';
        if (!institute.email?.trim()) return 'Email is required';
        if (!institute.phone?.trim()) return 'Phone number is required';
        if (!institute.address?.trim()) return 'Address is required';
        if (!institute.state?.trim()) return 'State is required';
        if (!institute.district?.trim()) return 'District is required';
        if (!institute.postalPinCode?.trim()) return 'Postal/Pin code is required';
        return null;
    };

    const handleFileChange = (event) => {
        setNewInstitute({
            ...newInstitute,
            logoPicture: event.target.files[0]
        });
    };

    const handleAdd = async () => {
        const error = validateInstitute(newInstitute);
        if (error) {
            setError(error);
            return;
        }

        const formData = new FormData();
        Object.keys(newInstitute).forEach(key => {
            if (key === 'logoPicture' && newInstitute[key]) {
                formData.append(key, newInstitute[key]);
            } else if (key !== 'logoPicture') {
                formData.append(key, newInstitute[key]);
            }
        });

        try {
            const response = await fetch('http://localhost:5001/api/admin/institutes', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            await fetchInstitutes();
            setSuccessMessage('Institution added successfully');
            setShowAddModal(false);
            setNewInstitute({
                institution: '',
                institution_type_id: '',
                description: '',
                accreditation: '',
                since_date: '',
                website: '',
                email: '',
                phone: '',
                address: '',
                state: '',
                district: '',
                postalPinCode: '',
                logoPicture: null
            });
        } catch (error) {
            setError('Error adding institution');
        }
    };

    const handleEdit = async () => {
        const error = validateInstitute(newInstitute);
        if (error) {
            setError(error);
            return;
        }

        const formData = new FormData();
        Object.keys(newInstitute).forEach(key => {
            if (key === 'logoPicture' && newInstitute[key]) {
                formData.append(key, newInstitute[key]);
            } else if (key !== 'logoPicture') {
                formData.append(key, newInstitute[key]);
            }
        });

        try {
            const response = await fetch(`http://localhost:5001/api/admin/institutes/${selectedInstitute.institution_id}`, {
                method: 'PUT',
                credentials: 'include',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            await fetchInstitutes();
            setSuccessMessage('Institution updated successfully');
            setShowEditModal(false);
            setSelectedInstitute(null);
            setNewInstitute({
                institution: '',
                institution_type_id: '',
                description: '',
                accreditation: '',
                since_date: '',
                website: '',
                email: '',
                phone: '',
                address: '',
                state: '',
                district: '',
                postalPinCode: '',
                logoPicture: null
            });
        } catch (error) {
            setError('Error updating institution');
        }
    };

    const handleDelete = async (instituteId) => {
        if (window.confirm('Are you sure you want to delete this institution?')) {
            try {
                const response = await fetch(`http://localhost:5001/api/admin/institutes/${instituteId}`, {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                await fetchInstitutes();
                setSuccessMessage('Institution deleted successfully');
            } catch (error) {
                setError('Error deleting institution');
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

    const handleStateChange = (e) => {
        const selectedState = e.target.value;
        setNewInstitute({
            ...newInstitute,
            state: selectedState,
            district: '' // Reset district when state changes
        });
        // Update districts based on selected state
        setDistricts(statesAndDistricts[selectedState] || []);
    };

    const handleDistrictChange = (e) => {
        setNewInstitute({
            ...newInstitute,
            district: e.target.value
        });
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
                            <h2>Institutions</h2>
                            <p className="subtitle">Manage institutions</p>
                        </div>
                        <Button
                            renderIcon={Add}
                            onClick={() => setShowAddModal(true)}
                        >
                            Add Institution
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
                            columnCount={7}
                            rowCount={5}
                        />
                    ) : (
                        <DataTable
                            rows={institutes.map(inst => ({
                                id: String(inst.institution_id),
                                institution_id: String(inst.institution_id),
                                institution_Logo: (
                                    <div className="institution-logo-container" style={{ width: '50px', height: '50px' }}>
                                        {inst.logoPicture ? (
                                            <img
                                                src={`http://localhost:5001${inst.logoPicture}`}
                                                alt={`${inst.institution} logo`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'contain'
                                                }}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "/default-institution-logo.png";
                                                }}
                                            />
                                        ) : (
                                            <div
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: '#f4f4f4',
                                                    borderRadius: '4px'
                                                }}
                                            >
                                                No Logo
                                            </div>
                                        )}
                                    </div>
                                ),
                                institution: inst.institution,
                                type: instituteTypes.find(t => t.institution_type_id === inst.institution_type_id)?.institution_type || '-',
                                email: inst.email,
                                website: inst.website,
                                state: inst.state,
                                actions: (
                                    <Stack orientation="horizontal" gap={4}>
                                        <Button
                                            kind="ghost"
                                            size="sm"
                                            renderIcon={Edit}
                                            onClick={() => {
                                                setSelectedInstitute(inst);
                                                setNewInstitute({
                                                    ...inst,
                                                    logoPicture: null
                                                });
                                                setDistricts(statesAndDistricts[inst.state] || []);
                                                setShowEditModal(true);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            kind="danger"
                                            size="sm"
                                            renderIcon={TrashCan}
                                            onClick={() => handleDelete(inst.institution_id)}
                                        >
                                            Delete
                                        </Button>
                                    </Stack>
                                )
                            }))}
                            headers={[
                                { key: 'institution_id', header: 'ID' },
                                { key: 'institution_Logo', header: 'Logo' },
                                { key: 'institution', header: 'Institution' },
                                { key: 'type', header: 'Type' },
                                { key: 'email', header: 'Email' },
                                { key: 'website', header: 'Website' },
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
                                <>
                                    <TableContainer {...getTableContainerProps()}>
                                        <TableToolbar>
                                            <TableToolbarContent>
                                                <TableToolbarSearch
                                                    onChange={onInputChange}
                                                    placeholder="Search institutions..."
                                                />
                                            </TableToolbarContent>
                                        </TableToolbar>
                                        <Table {...getTableProps()} size="lg">
                                            <TableHead>
                                                <TableRow>
                                                    {headers.map(header => {
                                                        const { key, ...headerProps } = getHeaderProps({
                                                            header,
                                                            onClick: () => {
                                                                if (header.key !== 'actions') {
                                                                    handleSort(
                                                                        header.key,
                                                                        sortDirection === 'asc' ? 'desc' : 'asc'
                                                                    );
                                                                }
                                                            }
                                                        });
                                                        return (
                                                            <TableHeader 
                                                                key={header.key}
                                                                {...headerProps}
                                                            >
                                                                {header.header}
                                                            </TableHeader>
                                                        );
                                                    })}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {rows.map(row => {
                                                    const { key, ...rowProps } = getRowProps({ row });
                                                    return (
                                                        <TableRow
                                                            key={row.id}
                                                            {...rowProps}
                                                        >
                                                            {row.cells.map(cell => (
                                                                <TableCell key={cell.id}>{cell.value}</TableCell>
                                                            ))}
                                                        </TableRow>
                                                    );
                                                })}
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

            {/* Add/Edit Institution Modal */}
            <Modal
                open={showAddModal || showEditModal}
                modalHeading={showAddModal ? "Add New Institution" : "Edit Institution"}
                primaryButtonText={showAddModal ? "Add" : "Save"}
                secondaryButtonText="Cancel"
                size="lg"
                preventCloseOnClickOutside
                onRequestClose={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedInstitute(null);
                    setNewInstitute({
                        institution: '',
                        institution_type_id: '',
                        description: '',
                        accreditation: '',
                        since_date: '',
                        website: '',
                        email: '',
                        phone: '',
                        address: '',
                        state: '',
                        district: '',
                        postalPinCode: '',
                        logoPicture: null
                    });
                }}
                onRequestSubmit={showAddModal ? handleAdd : handleEdit}
            >
                <Form>
                    <Stack gap={7}>
                        <TextInput
                            id="institution"
                            labelText="Institution Name"
                            value={newInstitute.institution}
                            onChange={(e) => setNewInstitute({ ...newInstitute, institution: e.target.value })}
                            required
                        />

                        <Select
                            id="institutionType"
                            labelText="Institution Type"
                            value={newInstitute.institution_type_id}
                            onChange={(e) => setNewInstitute({ ...newInstitute, institution_type_id: e.target.value })}
                            required
                        >
                            <SelectItem value="" text="Choose a type" />
                            {instituteTypes.map(type => (
                                <SelectItem
                                    key={type.institution_type_id}
                                    value={type.institution_type_id}
                                    text={type.institution_type}
                                />
                            ))}
                        </Select>

                        <TextArea
                            id="description"
                            labelText="Description"
                            value={newInstitute.description}
                            onChange={(e) => setNewInstitute({ ...newInstitute, description: e.target.value })}
                            rows={4}
                            required
                        />

                        <TextInput
                            id="accreditation"
                            labelText="Accreditation"
                            value={newInstitute.accreditation}
                            onChange={(e) => setNewInstitute({ ...newInstitute, accreditation: e.target.value })}
                        />

                        <DatePicker
                            datePickerType="single"
                            dateFormat="Y-m-d"
                            value={newInstitute.since_date ? [new Date(newInstitute.since_date)] : []}
                            maxDate={new Date().toISOString()}
                            onChange={(dates) => {
                                if (dates && dates.length > 0) {
                                    const formattedDate = formatDateForApi(dates[0]);
                                    setNewInstitute({
                                        ...newInstitute,
                                        since_date: formattedDate
                                    });
                                }
                            }}
                        >
                            <DatePickerInput
                                id="since_date"
                                placeholder="YYYY-MM-DD"
                                labelText="Since Date"
                                value={formatDateForInput(newInstitute.since_date)}
                                onChange={(e) => setNewInstitute({
                                    ...newInstitute,
                                    since_date: e.target.value
                                })}
                                invalid={!newInstitute.since_date}
                                invalidText="Since date is required"
                                required
                            />
                        </DatePicker>

                        <TextInput
                            id="website"
                            labelText="Website"
                            value={newInstitute.website}
                            onChange={(e) => setNewInstitute({ ...newInstitute, website: e.target.value })}
                            required
                        />

                        <TextInput
                            id="email"
                            labelText="Email"
                            value={newInstitute.email}
                            onChange={(e) => setNewInstitute({ ...newInstitute, email: e.target.value })}
                            required
                        />

                        <TextInput
                            id="phone"
                            labelText="Phone"
                            value={newInstitute.phone}
                            onChange={(e) => setNewInstitute({ ...newInstitute, phone: e.target.value })}
                            required
                        />

                        <TextArea
                            id="address"
                            labelText="Address"
                            value={newInstitute.address}
                            onChange={(e) => setNewInstitute({ ...newInstitute, address: e.target.value })}
                            rows={3}
                            required
                        />

                        <Select
                            id="state"
                            labelText="State"
                            value={newInstitute.state}
                            onChange={handleStateChange}
                            required
                        >
                            <SelectItem value="" text="Choose a state" />
                            {Object.keys(statesAndDistricts).map(state => (
                                <SelectItem
                                    key={state}
                                    value={state}
                                    text={state}
                                />
                            ))}
                        </Select>

                        <Select
                            id="district"
                            labelText="District"
                            value={newInstitute.district}
                            onChange={handleDistrictChange}
                            disabled={!newInstitute.state}
                            required
                        >
                            <SelectItem value="" text="Choose a district" />
                            {districts.map(district => (
                                <SelectItem
                                    key={district}
                                    value={district}
                                    text={district}
                                />
                            ))}
                        </Select>

                        <TextInput
                            id="postalPinCode"
                            labelText="Postal/Pin Code"
                            value={newInstitute.postalPinCode}
                            onChange={(e) => setNewInstitute({ ...newInstitute, postalPinCode: e.target.value })}
                            required
                        />

                        <FormGroup legendText="Logo">
                            <Button
                                kind="tertiary"
                                renderIcon={Upload}
                                onClick={() => document.getElementById('logoInput').click()}
                            >
                                {newInstitute.logoPicture ? 'Change Logo' : 'Upload Logo'}
                            </Button>
                            <input
                                type="file"
                                id="logoInput"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                            {newInstitute.logoPicture && (
                                <p style={{ marginTop: '0.5rem' }}>
                                    Selected file: {newInstitute.logoPicture.name}
                                </p>
                            )}
                        </FormGroup>
                    </Stack>
                </Form>
            </Modal>
        </Grid>
    );
};

export default AdminManageInstitute;