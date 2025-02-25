import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Grid,
    Column,
    Tile,
    Search,
    Tag,
    Button,
    Select,
    SelectItem,
    NumberInput,
    ComboBox,
    ClickableTile,
    Stack,
    Pagination,
    AspectRatio,
    FilterableMultiSelect,
    Loading,
    InlineNotification,
    Toggle,
    Slider // Add this import
} from '@carbon/react';
import {
    ViewFilled,
    Education,
    Location,
    Currency,
    Star,
    StarFilled,
    ThumbsUp,
    ThumbsDown
} from '@carbon/icons-react';
import ViewCourseDetailsModal from '../../components/ViewCourseDetailsModal/ViewCourseDetailsModal';
import ViewInstituteDetailsModal from '../../components/ViewInstituteDetailsModal/ViewInstituteDetailsModal';
import './find_course.css';
import { debounce } from 'lodash';
import statesAndDistricts from '../../components/StatesAndDistricts';

const UserFindCourse = () => {
    // States for filters
    const [filters, setFilters] = useState({
        searchQuery: '',
        courseTypes: [],
        careers: [],
        institutionTypes: [],
        feesRange: { min: 0, max: 1000000 },
        sortBy: 'relevance',
        state: null,
        district: null  // Add district filter
    });

    // Data states
    const [courseMappings, setCourseMappings] = useState([]);
    const [courseTypes, setCourseTypes] = useState([]);
    const [careers, setCareers] = useState([]);
    const [locations, setLocations] = useState({
        states: Object.keys(statesAndDistricts),
        districts: []
    });

    // UI states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize, setPageSize] = useState(12);
    const [viewInstituteModalOpen, setViewInstituteModalOpen] = useState(false);
    const [selectedInstitute, setSelectedInstitute] = useState(null);

    // Add optimistic update state
    const [pendingLikes, setPendingLikes] = useState({});

    // Fetch filter options from backend
    const fetchFilterOptions = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/courses/filters', {
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to fetch filter options');

            const data = await response.json();
            setCourseTypes(data.course_types || []);
            setCareers(data.careers || []);
            setLocations({
                states: data.states || [],
                districts: []
            });
        } catch (error) {
            console.error('Error fetching filter options:', error);
            setError('Failed to load filter options');
        }
    };

    // Fetch courses with filters
    const fetchCourses = async (page = currentPage) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: page.toString(),
                per_page: pageSize.toString(),
                search: filters.searchQuery || '',
                course_types: filters.courseTypes.join(','),
                careers: filters.careers.join(','),
                state: filters.state || '',
                district: filters.district || '',
                min_fees: filters.feesRange.min.toString(),
                max_fees: filters.feesRange.max.toString(),
                sort_by: filters.sortBy
            });

            const response = await fetch(`http://localhost:5001/api/courses/search?${queryParams}`, {
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to fetch courses');

            const data = await response.json();
            setCourseMappings(data.courses || []);
            setTotalItems(data.total || 0);
            setError(null);
        } catch (err) {
            setError('Failed to fetch courses');
            console.error('Error fetching courses:', err);
        } finally {
            setLoading(false);
        }
    };

    // Modified handleLikeDislike function
    const handleLikeDislike = async (mappingId, isLike) => {
        try {
            // Optimistically update the UI
            setCourseMappings(prevMappings => prevMappings.map(mapping => {
                if (mapping.course_mapping_id === mappingId) {
                    return {
                        ...mapping,
                        likes: isLike ? mapping.likes + 1 : mapping.likes,
                        dislikes: !isLike ? mapping.dislikes + 1 : mapping.dislikes
                    };
                }
                return mapping;
            }));

            // Track pending like/dislike
            setPendingLikes(prev => ({
                ...prev,
                [mappingId]: true
            }));

            const response = await fetch(`http://localhost:5001/api/courses/${mappingId}/${isLike ? 'like' : 'dislike'}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to update rating');

            const data = await response.json();

            // Update only the specific course's likes/dislikes
            setCourseMappings(prevMappings => prevMappings.map(mapping => {
                if (mapping.course_mapping_id === mappingId) {
                    return {
                        ...mapping,
                        likes: data.likes,
                        dislikes: data.dislikes
                    };
                }
                return mapping;
            }));

        } catch (error) {
            console.error('Error updating rating:', error);
            setError('Failed to update rating');

            // Revert optimistic update on error
            setCourseMappings(prevMappings => prevMappings.map(mapping => {
                if (mapping.course_mapping_id === mappingId) {
                    return {
                        ...mapping,
                        likes: mapping.likes - (isLike ? 1 : 0),
                        dislikes: mapping.dislikes - (!isLike ? 1 : 0)
                    };
                }
                return mapping;
            }));
        } finally {
            // Clear pending state
            setPendingLikes(prev => ({
                ...prev,
                [mappingId]: false
            }));
        }
    };

    // Memoize the debounced search function
    const debouncedSearch = useMemo(
        () =>
            debounce(async (searchTerm) => {
                try {
                    setLoading(true);
                    const queryParams = new URLSearchParams({
                        page: '1',
                        per_page: pageSize.toString(),
                        search: searchTerm,
                        course_types: filters.courseTypes.map(ct => ct.id).join(','),
                        careers: filters.careers.map(c => c.id).join(','),
                        state: filters.state || '',
                        district: filters.district || '',
                        min_fees: filters.feesRange.min.toString(),
                        max_fees: filters.feesRange.max.toString(),
                        sort_by: filters.sortBy
                    });

                    const response = await fetch(
                        `http://localhost:5001/api/courses/search?${queryParams}`,
                        { credentials: 'include' }
                    );

                    if (!response.ok) throw new Error('Search failed');

                    const data = await response.json();
                    setCourseMappings(data.courses || []);
                    setTotalItems(data.total || 0);
                    setCurrentPage(1);
                    setError(null);
                } catch (err) {
                    console.error('Search error:', err);
                    setError('Search failed. Please try again.');
                } finally {
                    setLoading(false);
                }
            }, 500),
        [pageSize, filters.courseTypes, filters.careers, filters.state, filters.district,
            filters.feesRange.min, filters.feesRange.max, filters.sortBy]
    );

    // Enhanced search handler with input validation
    const handleSearchChange = (e) => {
        const searchTerm = e.target.value.trim();

        // Update search query in filters immediately for UI
        setFilters(prev => ({ ...prev, searchQuery: e.target.value }));

        // If search term is empty, reset to first page and fetch all courses
        if (!searchTerm) {
            setCurrentPage(1);
            fetchCourses(1);
            return;
        }

        // If search term is too short, don't trigger search
        if (searchTerm.length < 2) return;

        // Cancel any pending debounced searches
        debouncedSearch.cancel();

        // Trigger debounced search
        debouncedSearch(searchTerm);
    };

    // Cleanup debounced function on unmount
    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    // Modified filter handlers
    const handleCourseTypeChange = ({ selectedItems }) => {
        setFilters(prev => ({ ...prev, courseTypes: selectedItems }));
        setCurrentPage(1);
        fetchCourses(1);
    };

    const handleCareerChange = ({ selectedItems }) => {
        setFilters(prev => ({ ...prev, careers: selectedItems }));
        setCurrentPage(1);
        fetchCourses(1);
    };

    const handleStateChange = ({ selectedItem }) => {
        setFilters(prev => ({
            ...prev,
            state: selectedItem,
            district: null
        }));
        setLocations(prev => ({
            ...prev,
            districts: selectedItem ? statesAndDistricts[selectedItem] || [] : []
        }));
        setCurrentPage(1);
        fetchCourses(1);
    };

    const handleDistrictChange = ({ selectedItem }) => {
        setFilters(prev => ({ ...prev, district: selectedItem }));
        setCurrentPage(1);
        fetchCourses(1);
    };

    const handleSortChange = (e) => {
        setFilters(prev => ({ ...prev, sortBy: e.target.value }));
        fetchCourses(1);
    };

    const handlePagination = ({ page, pageSize: newPageSize }) => {
        if (pageSize !== newPageSize) {
            setPageSize(newPageSize);
        }
        setCurrentPage(page);
        fetchCourses(page);
    };

    // Update fees range handler
    const handleFeesRangeChange = ({ value }) => {
        setFilters(prev => ({
            ...prev,
            feesRange: { min: value[0], max: value[1] }
        }));
        fetchCourses(1);
    };

    // Initial data load
    useEffect(() => {
        fetchFilterOptions();
        fetchCourses(1);
    }, []);

    // Filter handlers
    const handleMinFeesChange = (e) => {
        const value = parseInt(e.target.value || '0', 10);
        setFilters(prev => ({
            ...prev,
            feesRange: { ...prev.feesRange, min: value }
        }));
    };

    const handleMaxFeesChange = (e) => {
        const value = parseInt(e.target.value || '0', 10);
        setFilters(prev => ({
            ...prev,
            feesRange: { ...prev.feesRange, max: value }
        }));
    };

    const handleViewDetails = (mapping) => {
        setSelectedCourse(mapping);
        setViewModalOpen(true);
    };

    const handleViewInstitute = (mapping) => {
        setSelectedInstitute({
            institution_id: mapping.institution.id,
            institution: mapping.institution.name,
            institution_type: mapping.institution.type,
            description: mapping.institution.description,
            accreditation: mapping.institution.accreditation,
            website: mapping.institution.website,
            email: mapping.institution.email,
            phone: mapping.institution.phone,
            address: mapping.institution.address,
            state: mapping.institution.state,
            district: mapping.institution.district,
            postalPinCode: mapping.institution.postalPinCode,
            logoPicture: mapping.institution.logoPicture
        });
        setViewInstituteModalOpen(true);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <Loading description="Loading courses..." withOverlay={false} />
            </div>
        );
    }

    if (error) {
        return (
            <InlineNotification
                kind="error"
                title="Error"
                subtitle={error}
                style={{ maxWidth: '600px', margin: '2rem auto' }}
            />
        );
    }

    return (
        <Grid className="find-course-container">
            {/* Top Filters Section */}


                <Column lg={16} md={8} sm={4}>
                    <h2 className="search-filter-title">Find Courses</h2>
                    <Tile className="filters-section">
                        <Grid narrow>
                            <Column lg={4} md={4} sm={4}>
                                <FilterableMultiSelect
                                    id="course-types-filter"
                                    titleText="Course Types"
                                    items={courseTypes}
                                    itemToString={(item) => (item ? item.course_type : '')}
                                    selectedItems={filters.courseTypes}
                                    onChange={handleCourseTypeChange}
                                />
                            </Column>

                            <Column lg={3} md={4} sm={4}>
                                <FilterableMultiSelect
                                    id="careers-filter"
                                    titleText="Careers"
                                    items={careers}
                                    itemToString={(item) => (item ? item.career : '')}
                                    selectedItems={filters.careers}
                                    onChange={handleCareerChange}
                                />
                            </Column>

                            <Column lg={3} md={4} sm={4}>
                                <ComboBox
                                    id="state-filter"
                                    titleText="State"
                                    items={locations.states}
                                    selectedItem={filters.state}
                                    onChange={handleStateChange}
                                    placeholder="Select state"
                                />
                            </Column>

                            <Column lg={3} md={4} sm={4}>
                                <ComboBox
                                    id="district-filter"
                                    titleText="District"
                                    items={locations.districts}
                                    selectedItem={filters.district}
                                    onChange={handleDistrictChange}
                                    placeholder="Select district"
                                    disabled={!filters.state}  // Disable if no state selected
                                />
                            </Column>

                            <Column lg={3} md={8} sm={4}>
                                <Select
                                    id="sort-by"
                                    labelText="Sort by"
                                    value={filters.sortBy}
                                    onChange={handleSortChange}
                                >
                                    <SelectItem value="relevance" text="Most Relevant" />
                                    <SelectItem value="fees_high" text="Fees: Low to High" />
                                    <SelectItem value="fees_low" text="Fees: High to Low" />
                                    <SelectItem value="rating" text="Rating" />
                                </Select>
                            </Column>
                        </Grid>
                    </Tile>
                </Column>

                <Column lg={16} md={8} sm={4}>

                        <Grid>
                            <Column lg={14} md={6} sm={3}>
                                <Search
                                    id="search-courses"
                                    labelText="Search courses"
                                    placeholder="Search by course name, institution..."
                                    value={filters.searchQuery}
                                    onChange={handleSearchChange}
                                    size="lg"
                                    className="search-input"
                                />
                            </Column>
                            <Column lg={2} md={2} sm={1}>
                                <Button
                                    kind="primary"
                                    size="lg"
                                    renderIcon={ThumbsDown}
                                    className="reset-button"
                                    onClick={() => {
                                        setFilters({
                                            searchQuery: '',
                                            courseTypes: [],
                                            careers: [],
                                            institutionTypes: [],
                                            feesRange: { min: 0, max: 1000000 },
                                            sortBy: 'relevance',
                                            state: null,
                                            district: null
                                        });
                                        fetchCourses(1);
                                    }}
                                >
                                    Reset
                                </Button>
                            </Column>
                        </Grid>

                </Column>


            {/* Main Content */}



            <Column lg={16} md={8} sm={4}>
                {/* Results Header */}
                <div className="results-header">
                    <h2>Found {totalItems} Courses</h2>

                </div>

                {/* Course Grid */}
                <Grid narrow className="course-grid">
                    {courseMappings.map((mapping) => (
                        <Column key={mapping.course_mapping_id} lg={4} md={4} sm={4}>
                            <ClickableTile className="course-tile">
                                <AspectRatio ratio="16x9">
                                    <div className="institution-logo">
                                        <img
                                            src={`http://localhost:5001${mapping.institution.logoPicture}`}
                                            alt={mapping.institution.name}
                                            className="institution-logo-banner"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/placeholder-logo.png';
                                            }}
                                        />
                                    </div>
                                </AspectRatio>

                                <div className="course-info">
                                    <h3>{mapping.course.name}</h3>
                                    <p className="institution-name">
                                        {mapping.institution.name}
                                    </p>

                                    <div className="course-tags">
                                        <Tag type="blue">{mapping.course.type}</Tag>
                                        <Tag type="green">{mapping.institution.type}</Tag>
                                    </div>

                                    <div className="course-stats">
                                        <span className="fees">
                                            ₹{mapping.fees.toLocaleString('en-IN')}
                                        </span>
                                        <span className="duration">{mapping.duration}</span>
                                    </div>

                                    <div className="course-actions">
                                        <Button
                                            kind="ghost"
                                            size="sm"
                                            renderIcon={ViewFilled}
                                            onClick={() => handleViewDetails(mapping)}
                                        >
                                            View Course Details
                                        </Button>
                                        <Button
                                            kind="ghost"
                                            size="sm"
                                            renderIcon={ViewFilled}
                                            onClick={() => handleViewInstitute(mapping)}
                                        >
                                            View Institute Details
                                        </Button>
                                        <div className="like-dislike">
                                            <Button
                                                kind="ghost"
                                                size="sm"
                                                renderIcon={ThumbsUp}
                                                iconDescription="Like"
                                                onClick={() => handleLikeDislike(mapping.course_mapping_id, true)}
                                                disabled={pendingLikes[mapping.course_mapping_id]}
                                            >
                                                {mapping.likes}
                                            </Button>
                                            <Button
                                                kind="ghost"
                                                size="sm"
                                                renderIcon={ThumbsDown}
                                                iconDescription="Dislike"
                                                onClick={() => handleLikeDislike(mapping.course_mapping_id, false)}
                                                disabled={pendingLikes[mapping.course_mapping_id]}
                                            >
                                                {mapping.dislikes}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </ClickableTile>
                        </Column>
                    ))}
                </Grid>

                {/* Pagination */}
                <Pagination
                    id="course-pagination"
                    totalItems={totalItems}
                    pageSize={pageSize}
                    page={currentPage}
                    pageSizes={[12, 24, 48]}
                    onChange={handlePagination}
                />
            </Column>

            {/* Course Details Modal */}
            <ViewCourseDetailsModal
                open={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                mappingId={selectedCourse?.course_mapping_id}
            />
            <ViewInstituteDetailsModal
                open={viewInstituteModalOpen}
                onClose={() => setViewInstituteModalOpen(false)}
                institute={selectedInstitute}
                instituteType={selectedInstitute?.institution_type}
            />
        </Grid>
    );
};
export default UserFindCourse;
