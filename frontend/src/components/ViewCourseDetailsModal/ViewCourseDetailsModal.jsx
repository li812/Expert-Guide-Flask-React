import React, { useState, useEffect } from 'react';
import {
    Modal,
    StructuredListWrapper,
    StructuredListBody,
    StructuredListRow,
    StructuredListCell,
    Loading,
    InlineNotification,
    Tag,
    Link,
    Grid,
    Column
} from '@carbon/react';
import { 
    Education,
    Currency,
    Time,
    Document,
    Globe,
    Certificate,
    Calendar
} from '@carbon/icons-react';
import './ViewCourseDetailsModal.css';

const ViewCourseDetailsModal = ({ open, onClose, mappingId }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mappingDetails, setMappingDetails] = useState(null);

    useEffect(() => {
        if (open && mappingId) {
            fetchMappingDetails();
        }
    }, [open, mappingId]);

    const fetchMappingDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5001/api/admin/course-mappings/${mappingId}`, {
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to fetch mapping details');

            const data = await response.json();
            setMappingDetails(data);
            setError(null);
        } catch (error) {
            setError('Error fetching mapping details');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!mappingDetails || loading) {
        return (
            <Modal
                open={open}
                onRequestClose={onClose}
                modalHeading="Course Mapping Details"
                passiveModal
            >
                {loading ? (
                    <Loading description="Loading details..." withOverlay={false} />
                ) : error ? (
                    <InlineNotification
                        kind="error"
                        title="Error"
                        subtitle={error}
                        hideCloseButton
                    />
                ) : null}
            </Modal>
        );
    }

    return (
        <Modal
            open={open}
            onRequestClose={onClose}
            modalHeading={
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Education size={24} />
                    <span>{mappingDetails.course?.course || 'Course Details'}</span>
                </div>
            }
            passiveModal
            size="lg"
        >
            <Grid narrow className="course-details-grid">
                <Column lg={16} md={8} sm={4}>
                    <StructuredListWrapper>
                        <StructuredListBody>
                            <StructuredListRow>
                                <StructuredListCell>Institution</StructuredListCell>
                                <StructuredListCell>
                                    <Tag type="blue">
                                        <Education style={{ marginRight: '0.5rem' }} />
                                        {mappingDetails.institution?.institution}
                                    </Tag>
                                </StructuredListCell>
                            </StructuredListRow>

                            <StructuredListRow>
                                <StructuredListCell>Course Description</StructuredListCell>
                                <StructuredListCell>{mappingDetails.description}</StructuredListCell>
                            </StructuredListRow>

                            <StructuredListRow>
                                <StructuredListCell>Fees</StructuredListCell>
                                <StructuredListCell>
                                    <Tag type="green">
                                        <Currency style={{ marginRight: '0.5rem' }} />
                                        {formatCurrency(mappingDetails.fees)}
                                    </Tag>
                                </StructuredListCell>
                            </StructuredListRow>

                            <StructuredListRow>
                                <StructuredListCell>Duration</StructuredListCell>
                                <StructuredListCell>
                                    <Time style={{ marginRight: '0.5rem' }} />
                                    {mappingDetails.duration}
                                </StructuredListCell>
                            </StructuredListRow>

                            <StructuredListRow>
                                <StructuredListCell>Qualification Required</StructuredListCell>
                                <StructuredListCell>
                                    <Document style={{ marginRight: '0.5rem' }} />
                                    {mappingDetails.student_qualification}
                                </StructuredListCell>
                            </StructuredListRow>

                            <StructuredListRow>
                                <StructuredListCell>Course Website</StructuredListCell>
                                <StructuredListCell>
                                    <Link 
                                        href={mappingDetails.website} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                    >
                                        <Globe style={{ marginRight: '0.5rem' }} />
                                        {mappingDetails.website}
                                    </Link>
                                </StructuredListCell>
                            </StructuredListRow>

                            <StructuredListRow>
                                <StructuredListCell>Affiliation</StructuredListCell>
                                <StructuredListCell>
                                    <Certificate style={{ marginRight: '0.5rem' }} />
                                    {mappingDetails.course_affliation}
                                </StructuredListCell>
                            </StructuredListRow>

                            <StructuredListRow>
                                <StructuredListCell>Last Updated</StructuredListCell>
                                <StructuredListCell>
                                    <Calendar style={{ marginRight: '0.5rem' }} />
                                    {formatDate(mappingDetails.updated_at)}
                                </StructuredListCell>
                            </StructuredListRow>

                            <StructuredListRow>
                                <StructuredListCell>Status</StructuredListCell>
                                <StructuredListCell>
                                    <Tag 
                                        type={mappingDetails.status === 'active' ? 'green' : 'red'}
                                        className="status-tag"
                                    >
                                        {mappingDetails.status}
                                    </Tag>
                                </StructuredListCell>
                            </StructuredListRow>
                        </StructuredListBody>
                    </StructuredListWrapper>
                </Column>
            </Grid>
        </Modal>
    );
};

export default ViewCourseDetailsModal;