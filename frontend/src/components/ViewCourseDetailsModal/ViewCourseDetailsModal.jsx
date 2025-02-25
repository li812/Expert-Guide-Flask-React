import React, { useState, useEffect } from 'react';
import {
    Modal,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    StructuredListWrapper,
    StructuredListBody,
    StructuredListRow,
    StructuredListCell,
    Tag,
    Link,
    Grid,
    Column,
    Loading,
    InlineNotification
} from '@carbon/react';
import {
    Education,
    Currency,
    Document,
    Calendar,
    Globe,
    Certificate,
    Location,
    PhoneVoice,
    Email,
    Information
} from '@carbon/icons-react';
import './ViewCourseDetailsModal.css';

const ViewCourseDetailsModal = ({ open, onClose, mappingId, institutes, courses, courseTypes }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mapping, setMapping] = useState(null);
    const [selectedTab, setSelectedTab] = useState(0);

    useEffect(() => {
        if (mappingId && open) {
            fetchMappingDetails();
        }
    }, [mappingId, open]);

    const fetchMappingDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `http://localhost:5001/api/admin/course-mappings/${mappingId}`,
                { credentials: 'include' }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch mapping details');
            }

            const data = await response.json();
            setMapping(data);
            setError(null);
        } catch (err) {
            setError('Error loading course details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!open) return null;
    if (loading) return <Loading description="Loading course details..." />;
    if (error) return <InlineNotification kind="error" title="Error" subtitle={error} />;
    if (!mapping) return null;

    return (
        <Modal
            open={open}
            onRequestClose={onClose}
            modalHeading={
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Education size={24} />
                    <span>{mapping.course.name}</span>
                    <Tag type={mapping.status === 'active' ? 'green' : 'red'}>
                        {mapping.status}
                    </Tag>
                </div>
            }
            size="lg"
            passiveModal
        >
            <Tabs selectedIndex={selectedTab} onChange={({ selectedIndex }) => setSelectedTab(selectedIndex)}>
                <TabList aria-label="Course mapping details">
                    <Tab>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Information size={22} />
                            <span style={{ marginLeft: '8px' }}> Overview</span>
                        </div>
                    </Tab>
                    <Tab>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Document size={22} />
                            <span style={{ marginLeft: '8px' }}> Course Details</span>
                        </div>
                    </Tab>
                    <Tab>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Education size={22} />
                            <span style={{ marginLeft: '8px' }}> Institution Details</span>
                        </div>
                    </Tab>
                </TabList>

                <TabPanels>
                    {/* Overview Tab */}
                    <TabPanel>
                        <StructuredListWrapper>
                            <StructuredListBody>
                                <StructuredListRow>
                                    <StructuredListCell>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <Education size={22} />
                                            <span style={{ marginLeft: '8px' }}>Course Name</span>
                                        </div>
                                    </StructuredListCell>
                                    <StructuredListCell>
                                        {mapping.course.name}
                                    </StructuredListCell>
                                </StructuredListRow>

                                <StructuredListRow>
                                    <StructuredListCell>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <Document size={22} />
                                            <span style={{ marginLeft: '8px' }}>Course Type</span>
                                        </div>
                                    </StructuredListCell>
                                    <StructuredListCell>
                                        <Tag type="blue">{mapping.course.type}</Tag>
                                    </StructuredListCell>
                                </StructuredListRow>

                                <StructuredListRow>
                                    <StructuredListCell>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <Information size={22} />
                                            <span style={{ marginLeft: '8px' }}>Description</span>
                                        </div>
                                    </StructuredListCell>
                                    <StructuredListCell>
                                        {mapping.description}
                                    </StructuredListCell>
                                </StructuredListRow>

                                <StructuredListRow>
                                    <StructuredListCell>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <Currency size={22} />
                                            <span style={{ marginLeft: '8px' }}>Course Fees</span>
                                        </div>
                                    </StructuredListCell>
                                    <StructuredListCell>
                                        ₹{mapping.fees.toLocaleString('en-IN')}
                                    </StructuredListCell>
                                </StructuredListRow>

                                <StructuredListRow>
                                    <StructuredListCell>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <Calendar size={22} />
                                            <span style={{ marginLeft: '8px' }}>Created On</span>
                                        </div>
                                    </StructuredListCell>
                                    <StructuredListCell>
                                        {formatDate(mapping.created_at)}
                                    </StructuredListCell>
                                </StructuredListRow>
                            </StructuredListBody>
                        </StructuredListWrapper>
                    </TabPanel>

                    {/* Course Details Tab */}
                    <TabPanel>
                        <StructuredListWrapper>
                            <StructuredListBody>
                                <StructuredListRow>
                                    <StructuredListCell>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <Certificate size={22} />
                                            <span style={{ marginLeft: '8px' }}>Qualification Required</span>
                                        </div>
                                    </StructuredListCell>
                                    <StructuredListCell>
                                        {mapping.student_qualification}
                                    </StructuredListCell>
                                </StructuredListRow>

                                <StructuredListRow>
                                    <StructuredListCell>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <Calendar size={22} />
                                            <span style={{ marginLeft: '8px' }}>Course Duration</span>
                                        </div>
                                    </StructuredListCell>
                                    <StructuredListCell>
                                        {mapping.duration}
                                    </StructuredListCell>
                                </StructuredListRow>

                                <StructuredListRow>
                                    <StructuredListCell>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <Document size={22} />
                                            <span style={{ marginLeft: '8px' }}>Course Affiliation</span>
                                        </div>
                                    </StructuredListCell>
                                    <StructuredListCell>
                                        {mapping.course_affliation}
                                    </StructuredListCell>
                                </StructuredListRow>

                                <StructuredListRow>
                                    <StructuredListCell>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <Globe size={22} />
                                            <span style={{ marginLeft: '8px' }}>Course Website</span>
                                        </div>
                                    </StructuredListCell>
                                    <StructuredListCell>
                                        <Link href={mapping.website} target="_blank">
                                            {mapping.website}
                                        </Link>
                                    </StructuredListCell>
                                </StructuredListRow>
                            </StructuredListBody>
                        </StructuredListWrapper>
                    </TabPanel>

                    {/* Institution Tab */}
                    <TabPanel>
                        <Grid narrow>
                            <Column lg={16}>
                                <StructuredListWrapper>
                                    <StructuredListBody>
                                        <StructuredListRow>
                                            <StructuredListCell>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <Education size={22} />
                                                    <span style={{ marginLeft: '8px' }}>Institution Name</span>
                                                </div>
                                            </StructuredListCell>
                                            <StructuredListCell>
                                                {mapping.institution.name}
                                            </StructuredListCell>
                                        </StructuredListRow>

                                        <StructuredListRow>
                                            <StructuredListCell>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <Location size={22} />
                                                    <span style={{ marginLeft: '8px' }}>Address</span>
                                                </div>
                                            </StructuredListCell>
                                            <StructuredListCell>
                                                {mapping.institution.address}, {mapping.institution.district}, {mapping.institution.state} - {mapping.institution.postalPinCode}
                                            </StructuredListCell>
                                        </StructuredListRow>

                                        <StructuredListRow>
                                            <StructuredListCell>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <PhoneVoice size={22} />
                                                    <span style={{ marginLeft: '8px' }}>Contact</span>
                                                </div>
                                            </StructuredListCell>
                                            <StructuredListCell>
                                                {mapping.institution.phone}
                                            </StructuredListCell>
                                        </StructuredListRow>

                                        <StructuredListRow>
                                            <StructuredListCell>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <Email size={22} />
                                                    <span style={{ marginLeft: '8px' }}>Email</span>
                                                </div>
                                            </StructuredListCell>
                                            <StructuredListCell>
                                                <Link href={`mailto:${mapping.institution.email}`}>
                                                    {mapping.institution.email}
                                                </Link>
                                            </StructuredListCell>
                                        </StructuredListRow>

                                        <StructuredListRow>
                                            <StructuredListCell>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <Globe size={22} />
                                                    <span style={{ marginLeft: '8px' }}>Website</span>
                                                </div>
                                            </StructuredListCell>
                                            <StructuredListCell>
                                                <Link href={mapping.institution.website} target="_blank">
                                                    {mapping.institution.website}
                                                </Link>
                                            </StructuredListCell>
                                        </StructuredListRow>
                                    </StructuredListBody>
                                </StructuredListWrapper>
                            </Column>
                        </Grid>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Modal>
    );
};

export default ViewCourseDetailsModal;