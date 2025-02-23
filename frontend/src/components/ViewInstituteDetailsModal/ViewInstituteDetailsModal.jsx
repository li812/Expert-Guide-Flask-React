import React from 'react';
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
    Tile,
    AspectRatio,
    Loading,
    InlineNotification
} from '@carbon/react';
import {
    Calendar,
    Email,
    Phone,
    Globe,
    Location,
    Education,
    Document,
    Certificate,
    Time,
    Information
} from '@carbon/icons-react';



import './ViewInstituteDetailsModal.css';

const ViewInstituteDetailsModal = ({ open, onClose, institute, instituteType }) => {
    const [imageLoading, setImageLoading] = React.useState(true);
    const [selectedTab, setSelectedTab] = React.useState(0);

    // Enhanced validation with detailed logging
    React.useEffect(() => {
        console.log("ViewInstituteDetailsModal received props:", {
            open,
            institute: JSON.stringify(institute, null, 2),
            instituteType
        });
    }, [open, institute, instituteType]);

    // Validate required data
    if (!institute || !instituteType) {
        console.warn("Missing required data:", { institute, instituteType });
        return null;
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Create a reusable logo component
    const InstituteLogo = () => (
        <Column lg={4} md={2} sm={4}>
            <Tile style={{ height: '100%' }}>
                <AspectRatio ratio="1x1">
                    <div className="institute-logo-container">
                        {imageLoading && (
                            <Loading 
                                description="Loading image" 
                                withOverlay={false}
                                small 
                            />
                        )}
                        {institute.logoPicture ? (
                            <img
                                src={`http://localhost:5001${institute.logoPicture}`}
                                alt={`${institute.institution} logo`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain'
                                }}
                                onLoad={() => setImageLoading(false)}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/default-institution-logo.png";
                                    setImageLoading(false);
                                }}
                            />
                        ) : (
                            <div className="no-logo-placeholder">
                                <Education size={32} />
                                <span>No Logo</span>
                            </div>
                        )}
                    </div>
                </AspectRatio>
            </Tile>
        </Column>
    );

    return (
        <Modal
            open={open}
            onRequestClose={onClose}
            modalHeading={
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Education size={24} />
                    <span>{institute.institution}</span>
                    <Tag type="blue">{instituteType}</Tag>
                </div>
            }
            passiveModal
            size="lg"
        >
            <Tabs 
                selectedIndex={selectedTab} 
                onChange={({ selectedIndex }) => setSelectedTab(selectedIndex)}
            >
                <TabList aria-label="Institute details tabs" contained>
                    <Tab>
                        <Information size={16} /> Basic Info
                    </Tab>
                    <Tab>
                        <Email size={16} /> Contact
                    </Tab>
                    <Tab>
                        <Location size={16} /> Location
                    </Tab>
                </TabList>

                <TabPanels>
                    {/* Basic Info Tab */}
                    <TabPanel>
                        <Grid narrow>
                            <InstituteLogo />
                            <Column lg={12} md={6} sm={4}>
                                <StructuredListWrapper>
                                    <StructuredListBody>
                                        <StructuredListRow>
                                            <StructuredListCell>Institution Type</StructuredListCell>
                                            <StructuredListCell>
                                                <Tag type="blue">
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
                                            <StructuredListCell>
                                                <Certificate style={{ marginRight: '0.5rem' }} />
                                                Accreditation
                                            </StructuredListCell>
                                            <StructuredListCell>
                                                <Tag type="green" >
                                                    {institute.accreditation || 'N/A'}
                                                </Tag>
                                            </StructuredListCell>
                                        </StructuredListRow>

                                        <StructuredListRow>
                                            <StructuredListCell>
                                                <Calendar style={{ marginRight: '0.5rem' }} />
                                                Established Date
                                            </StructuredListCell>
                                            <StructuredListCell>
                                                <Tag type="purple" >
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
                        <Grid narrow>
                            <InstituteLogo />
                            <Column lg={12} md={6} sm={4}>
                                <StructuredListWrapper>
                                    <StructuredListBody>
                                        <StructuredListRow>
                                            <StructuredListCell>Email</StructuredListCell>
                                            <StructuredListCell>
                                                <Link 
                                                    href={`mailto:${institute.email}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
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
                                                <Link 
                                                    href={institute.website} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                >
                                                    <Globe style={{ marginRight: '0.5rem' }} />
                                                    {institute.website}
                                                </Link>
                                            </StructuredListCell>
                                        </StructuredListRow>
                                    </StructuredListBody>
                                </StructuredListWrapper>
                            </Column>
                        </Grid>
                    </TabPanel>

                    {/* Location Tab */}
                    <TabPanel>
                        <Grid narrow>
                            <InstituteLogo />
                            <Column lg={12} md={6} sm={4}>
                                <StructuredListWrapper>
                                    <StructuredListBody>
                                        <StructuredListRow>
                                            <StructuredListCell>Full Address</StructuredListCell>
                                            <StructuredListCell>
                                                <Location style={{ marginRight: '0.5rem' }} />
                                                {institute.address}
                                            </StructuredListCell>
                                        </StructuredListRow>

                                        <StructuredListRow>
                                            <StructuredListCell>State</StructuredListCell>
                                            <StructuredListCell>
                                                
                                                    {institute.state}
                                                
                                            </StructuredListCell>
                                        </StructuredListRow>

                                        <StructuredListRow>
                                            <StructuredListCell>District</StructuredListCell>
                                            <StructuredListCell>
                                                    {institute.district}
                                                
                                            </StructuredListCell>
                                        </StructuredListRow>

                                        <StructuredListRow>
                                            <StructuredListCell>Postal/Pin Code</StructuredListCell>
                                            <StructuredListCell>
                                                    {institute.postalPinCode}
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

export default ViewInstituteDetailsModal;