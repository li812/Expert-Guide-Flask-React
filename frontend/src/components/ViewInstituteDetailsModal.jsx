import React from 'react';
import {
    Modal,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    StructuredListWrapper,
    StructuredListHead,
    StructuredListRow,
    StructuredListCell,
    StructuredListBody,
    Tag,
    Link,
    Grid,
    Column
} from '@carbon/react';
import { Calendar, Email, Phone, Globe, Location, Education, Document } from '@carbon/icons-react';

const ViewInstituteDetailsModal = ({ open, onClose, institute, instituteType }) => {
    if (!institute) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Modal
            open={open}
            modalHeading={`${institute.institution} Details`}
            passiveModal
            onRequestClose={onClose}
            size="lg"
        >
            <Tabs>
                <TabList aria-label="Institute details tabs">
                    <Tab>Basic Info</Tab>
                    <Tab>Contact Details</Tab>
                    <Tab>Location</Tab>
                </TabList>
                <TabPanels>
                    {/* Basic Info Tab */}
                    <TabPanel>
                        <Grid>
                            <Column lg={4} md={2} sm={4}>
                                <div className="institute-logo-container" style={{ width: '100px', height: '100px', margin: '1rem 0' }}>
                                    {institute.logoPicture ? (
                                        <img
                                            src={`http://localhost:5001${institute.logoPicture}`}
                                            alt={`${institute.institution} logo`}
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
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: '#f4f4f4',
                                            borderRadius: '4px'
                                        }}>
                                            No Logo
                                        </div>
                                    )}
                                </div>
                            </Column>
                            <Column lg={12} md={6} sm={4}>
                                <StructuredListWrapper>
                                    <StructuredListBody>
                                        <StructuredListRow>
                                            <StructuredListCell>Institution Type</StructuredListCell>
                                            <StructuredListCell>
                                                <Tag type="blue" title="Institution Type">
                                                    <Education style={{ marginRight: '0.5rem' }} />
                                                    {instituteType}
                                                </Tag>
                                            </StructuredListCell>
                                        </StructuredListRow>
                                        <StructuredListRow>
                                            <StructuredListCell>Description</StructuredListCell>
                                            <StructuredListCell>{institute.description}</StructuredListCell>
                                        </StructuredListRow>
                                        <StructuredListRow>
                                            <StructuredListCell>Accreditation</StructuredListCell>
                                            <StructuredListCell>
                                                <Tag type="green" title="Accreditation">
                                                    <Document style={{ marginRight: '0.5rem' }} />
                                                    {institute.accreditation || 'N/A'}
                                                </Tag>
                                            </StructuredListCell>
                                        </StructuredListRow>
                                        <StructuredListRow>
                                            <StructuredListCell>Established Date</StructuredListCell>
                                            <StructuredListCell>
                                                <Tag type="purple" title="Established Date">
                                                    <Calendar style={{ marginRight: '0.5rem' }} />
                                                    {formatDate(institute.since_date)}
                                                </Tag>
                                            </StructuredListCell>
                                        </StructuredListRow>
                                    </StructuredListBody>
                                </StructuredListWrapper>
                            </Column>
                        </Grid>
                    </TabPanel>

                    {/* Contact Details Tab */}
                    <TabPanel>
                        <StructuredListWrapper>
                            <StructuredListBody>
                                <StructuredListRow>
                                    <StructuredListCell>Email</StructuredListCell>
                                    <StructuredListCell>
                                        <Link href={`mailto:${institute.email}`}>
                                            <Email style={{ marginRight: '0.5rem' }} />
                                            {institute.email}
                                        </Link>
                                    </StructuredListCell>
                                </StructuredListRow>
                                <StructuredListRow>
                                    <StructuredListCell>Phone</StructuredListCell>
                                    <StructuredListCell>
                                        <Link href={`tel:${institute.phone}`}>
                                            <Phone style={{ marginRight: '0.5rem' }} />
                                            {institute.phone}
                                        </Link>
                                    </StructuredListCell>
                                </StructuredListRow>
                                <StructuredListRow>
                                    <StructuredListCell>Website</StructuredListCell>
                                    <StructuredListCell>
                                        <Link href={institute.website} target="_blank" rel="noopener noreferrer">
                                            <Globe style={{ marginRight: '0.5rem' }} />
                                            {institute.website}
                                        </Link>
                                    </StructuredListCell>
                                </StructuredListRow>
                            </StructuredListBody>
                        </StructuredListWrapper>
                    </TabPanel>

                    {/* Location Tab */}
                    <TabPanel>
                        <StructuredListWrapper>
                            <StructuredListBody>
                                <StructuredListRow>
                                    <StructuredListCell>Address</StructuredListCell>
                                    <StructuredListCell>
                                        <Location style={{ marginRight: '0.5rem' }} />
                                        {institute.address}
                                    </StructuredListCell>
                                </StructuredListRow>
                                <StructuredListRow>
                                    <StructuredListCell>State</StructuredListCell>
                                    <StructuredListCell>{institute.state}</StructuredListCell>
                                </StructuredListRow>
                                <StructuredListRow>
                                    <StructuredListCell>District</StructuredListCell>
                                    <StructuredListCell>{institute.district}</StructuredListCell>
                                </StructuredListRow>
                                <StructuredListRow>
                                    <StructuredListCell>Postal/Pin Code</StructuredListCell>
                                    <StructuredListCell>{institute.postalPinCode}</StructuredListCell>
                                </StructuredListRow>
                            </StructuredListBody>
                        </StructuredListWrapper>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Modal>
    );
};

export default ViewInstituteDetailsModal;