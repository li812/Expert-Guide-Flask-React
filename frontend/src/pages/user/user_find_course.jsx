import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Grid,
    Column,
    Tile,
    Search,
    Button,
    ComboBox,
    FilterableMultiSelect,
    Loading,
    InlineNotification,
    Pagination,
    Select,
    SelectItem
} from '@carbon/react';
import ViewCourseDetailsModal from '../../components/ViewCourseDetailsModal/ViewCourseDetailsModal';
import ViewInstituteDetailsModal from '../../components/ViewInstituteDetailsModal/ViewInstituteDetailsModal';
import CourseGrid from '../../components/CourseGrid/CourseGrid';
import { debounce } from 'lodash';
import statesAndDistricts from '../../components/StatesAndDistricts';
import './find_course.css';

// Filter Components
const CourseTypesFilter = memo(({ courseTypes, selectedTypes, onChange, isLoading, error }) => (
    <FilterableMultiSelect
        id="course-types-filter"
        titleText="Course Types"
        items={courseTypes}
        itemToString={(item) => item?.course_type || ''}
        selectedItems={selectedTypes}
        onChange={onChange}
        disabled={isLoading}
        invalid={!!error}
        invalidText={error}
        light
        size="lg"
    />
));

const CareersFilter = memo(({ careers, selectedCareers, onChange, isLoading, error }) => (
    <FilterableMultiSelect
        id="careers-filter"
        titleText="Careers"
        items={careers}
        itemToString={(item) => item?.career || ''}
        selectedItems={selectedCareers}
        onChange={onChange}
        disabled={isLoading}
        invalid={!!error}
        invalidText={error}
        light
        size="lg"
    />
));

const StateFilter = memo(({ states, selectedState, onChange, isLoading, error }) => (
    <ComboBox
        id="state-filter"
        titleText="State"
        items={states}
        selectedItem={selectedState}
        onChange={onChange}
        disabled={isLoading}
        invalid={!!error}
        invalidText={error}
        light
        size="lg"
    />
));

const DistrictFilter = memo(({ districts, selectedDistrict, onChange, disabled, isLoading, error }) => (
    <ComboBox
        id="district-filter"
        titleText="District"
        items={districts}
        selectedItem={selectedDistrict}
        onChange={onChange}
        disabled={disabled || isLoading}
        invalid={!!error}
        invalidText={error}
        light
        size="lg"
    />
));

const SortByFilter = memo(({ value, onChange, isLoading, error }) => (
    <Select
        id="sort-by"
        labelText="Sort by"
        value={value}
        onChange={onChange}
        disabled={isLoading}
        invalid={!!error}
        invalidText={error}
        light
        size="lg"
    >
        <SelectItem value="relevance" text="Most Relevant" />
        <SelectItem value="fees_high" text="Fees: High to Low" />
        <SelectItem value="fees_low" text="Fees: Low to High" />
        <SelectItem value="rating" text="Rating" />
    </Select>
));

const UserFindCourse = () => {
    const navigate = useNavigate();

    // Core state: note feesRange remains even though no UI is provided (consider adding or removing)
    const [filterState, setFilterState] = useState({
        searchQuery: '',
        courseTypes: [],
        careers: [],
        state: null,
        district: null,
        feesRange: { min: 0, max: 1000000 },
        sortBy: 'relevance'
    });

    // Data state
    const [courseMappings, setCourseMappings] = useState([]);
    const [courseTypes, setCourseTypes] = useState([]);
    const [careers, setCareers] = useState([]);
    const [totalItems, setTotalItems] = useState(0);

    // Separate error states for filter options and course fetch
    const [filterError, setFilterError] = useState(null);
    const [coursesError, setCoursesError] = useState(null);

    // UI state
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);

    // Modal state
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewInstituteModalOpen, setViewInstituteModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedInstitute, setSelectedInstitute] = useState(null);

    // Available districts based on selected state
    const availableDistricts = filterState.state ? (statesAndDistricts[filterState.state] || []) : [];

    // Fetch filter options (course types and careers)
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const [courseTypesResponse, careersResponse] = await Promise.all([
                    fetch('http://localhost:5001/api/course-types', { credentials: 'include' }),
                    fetch('http://localhost:5001/api/careers', { credentials: 'include' })
                ]);

                if (!courseTypesResponse.ok || !careersResponse.ok) {
                    throw new Error('Failed to fetch filter options');
                }

                const courseTypesData = await courseTypesResponse.json();
                const careersData = await careersResponse.json();

                setCourseTypes(courseTypesData.courseTypes || []);
                setCareers(careersData.careers || []);
                setFilterError(null);
            } catch (error) {
                setFilterError('Failed to load filter options');
            }
        };

        fetchFilterOptions();
    }, []);

    // Improved query parameter builder to handle arrays as repeated params
    const buildQueryParams = () => {
        const params = new URLSearchParams();
        params.append('page', currentPage.toString());
        params.append('per_page', pageSize.toString());
        params.append('sort_by', filterState.sortBy);

        if (filterState.searchQuery) {
            params.append('search', filterState.searchQuery);
        }

        if (filterState.courseTypes.length > 0) {
            filterState.courseTypes.forEach(ct => {
                params.append('course_types[]', ct.course_type_id);
            });
        }

        if (filterState.careers.length > 0) {
            filterState.careers.forEach(c => {
                params.append('careers[]', c.career_id);
            });
        }

        if (filterState.state) {
            params.append('state', filterState.state);
        }

        if (filterState.district) {
            params.append('district', filterState.district);
        }

        // Fees range is always sent
        params.append('min_fees', filterState.feesRange.min.toString());
        params.append('max_fees', filterState.feesRange.max.toString());

        return params.toString();
    };

    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true);
            const queryString = buildQueryParams();
            const response = await fetch(`http://localhost:5001/api/courses/search?${queryString}`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch courses');

            const data = await response.json();
            setCourseMappings(data.courses || []);
            setTotalItems(data.total || 0);
            setCoursesError(null);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setCoursesError('Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, filterState]);

    // Filter handlers
    const handleSearchChange = useCallback((e) => {
        setFilterState(prev => ({ ...prev, searchQuery: e.target.value }));
        setCurrentPage(1);
    }, []);

    const handleCourseTypesChange = useCallback(({ selectedItems }) => {
        setFilterState(prev => ({ ...prev, courseTypes: selectedItems }));
        setCurrentPage(1);
    }, []);

    const handleCareersChange = useCallback(({ selectedItems }) => {
        setFilterState(prev => ({ ...prev, careers: selectedItems }));
        setCurrentPage(1);
    }, []);

    const handleStateChange = useCallback(({ selectedItem }) => {
        setFilterState(prev => ({ ...prev, state: selectedItem, district: null }));
        setCurrentPage(1);
    }, []);

    const handleDistrictChange = useCallback(({ selectedItem }) => {
        setFilterState(prev => ({ ...prev, district: selectedItem }));
        setCurrentPage(1);
    }, []);

    const handleSortChange = useCallback((e) => {
        setFilterState(prev => ({ ...prev, sortBy: e.target.value }));
        setCurrentPage(1);
    }, []);

    // Handle pagination
    const handlePagination = useCallback(({ page, pageSize: newPageSize }) => {
        setCurrentPage(page);
        if (pageSize !== newPageSize) {
            setPageSize(newPageSize);
            setCurrentPage(1);
        }
    }, [pageSize]);

    // Modal handlers
    const handleViewCourse = useCallback((course) => {
        setSelectedCourse(course);
        setViewModalOpen(true);
    }, []);

    const handleViewInstitute = useCallback((course) => {
        setSelectedInstitute(course.institution);
        setViewInstituteModalOpen(true);
    }, []);

    // Like/Dislike handler remains unchanged
    const handleLikeDislike = useCallback(async (mappingId, isLike) => {
        try {
            const response = await fetch(`http://localhost:5001/api/courses/${mappingId}/${isLike ? 'like' : 'dislike'}`, {
                method: 'POST',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to update rating');
            }

            // Instead of reloading all courses, just update the specific course's likes/dislikes
            const result = await response.json();
            setCourseMappings(prevMappings => 
                prevMappings.map(mapping => 
                    mapping.course_mapping_id === mappingId 
                        ? {
                            ...mapping,
                            likes: result.likes,
                            dislikes: result.dislikes
                        }
                        : mapping
                )
            );
        } catch (error) {
            console.error('Error updating rating:', error);
        }
    }, []); // Remove fetchCourses from dependencies

    // Debounce fetchCourses on filter changes
    useEffect(() => {
        const debouncedFetch = debounce(fetchCourses, 300);
        debouncedFetch();
        return () => debouncedFetch.cancel();
    }, [fetchCourses]);

    return (
        <div className="find-course-container">
            {/* Filters Section */}
            <h2>Find Courses</h2>
            <br></br>
            <div id="search_sort_filter">
                {/* Filters Section */}
                <Grid>

                    
                    <Column lg={16}>
                    <p>Course Filter</p><br></br>
                        <Grid narrow className="filters-section">
                            <Column lg={4} md={4} sm={4}>
                                <CourseTypesFilter
                                    courseTypes={courseTypes}
                                    selectedTypes={filterState.courseTypes}
                                    onChange={handleCourseTypesChange}
                                    isLoading={loading}
                                    error={filterError}
                                />
                            </Column>
                            <Column lg={3} md={4} sm={4}>
                                <CareersFilter
                                    careers={careers}
                                    selectedCareers={filterState.careers}
                                    onChange={handleCareersChange}
                                    isLoading={loading}
                                    error={filterError}
                                />
                            </Column>
                            <Column lg={3} md={4} sm={4}>
                                <StateFilter
                                    states={Object.keys(statesAndDistricts)}
                                    selectedState={filterState.state}
                                    onChange={handleStateChange}
                                    isLoading={loading}
                                    error={filterError}
                                />
                            </Column>
                            <Column lg={3} md={4} sm={4}>
                                <DistrictFilter
                                    districts={availableDistricts}
                                    selectedDistrict={filterState.district}
                                    onChange={handleDistrictChange}
                                    disabled={!filterState.state}
                                    isLoading={loading}
                                    error={filterError}
                                />
                            </Column>
                            <Column lg={3} md={4} sm={4}>
                                <SortByFilter
                                    value={filterState.sortBy}
                                    onChange={handleSortChange}
                                    isLoading={loading}
                                    error={filterError}
                                />
                            </Column>
                        </Grid>
                    </Column>

                    <Column lg={16}>
                        
                        {/* Search Bar */}
                        <Search
                            labelText="Search courses"
                            placeholder="Search by course name or description..."
                            value={filterState.searchQuery}
                            onChange={handleSearchChange}
                            size="lg"
                        />
                    </Column>
                </Grid>
            </div>

            {/* Display course-fetch error if any */}
            {coursesError && (
                <InlineNotification
                    kind="error"
                    title="Error"
                    subtitle={coursesError}
                    onCloseButtonClick={() => setCoursesError(null)}
                />
            )}

            {loading ? (
                <Loading description="Loading courses..." withOverlay={false} />
            ) : (
                <>
                    <CourseGrid
                        courseMappings={courseMappings}
                        onViewDetails={handleViewCourse}
                        onViewInstitute={handleViewInstitute}
                        onLikeDislike={handleLikeDislike}
                    />
                    <Pagination
                        totalItems={totalItems}
                        pageSize={pageSize}
                        pageSizes={[12, 24, 36, 48]}
                        page={currentPage}
                        onChange={handlePagination}
                    />
                </>
            )}

            {/* Modals */}
            <ViewCourseDetailsModal
                open={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                mappingId={selectedCourse?.course_mapping_id}
            />
            <ViewInstituteDetailsModal
                open={viewInstituteModalOpen}
                onClose={() => setViewInstituteModalOpen(false)}
                institute={selectedInstitute}
                instituteType={selectedInstitute?.type}
            />
        </div>
    );
};

export default UserFindCourse;