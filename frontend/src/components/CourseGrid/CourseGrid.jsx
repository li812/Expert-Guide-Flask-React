import React, { useState } from 'react';
import { Grid, Column, ClickableTile, Button, Tag, AspectRatio } from '@carbon/react';
import { ThumbsUp, ThumbsDown, ViewFilled } from '@carbon/icons-react';
import './CourseGrid.css';

const CourseGrid = ({ courseMappings, onViewDetails, onViewInstitute, onLikeDislike }) => {
    const [pendingLikes, setPendingLikes] = useState({});

    const handleViewDetails = (mapping) => {
        onViewDetails && onViewDetails(mapping);
    };

    const handleViewInstitute = (mapping) => {
        onViewInstitute && onViewInstitute(mapping);
    };

    const handleLikeDislike = async (mappingId, isLike) => {
        setPendingLikes(prev => ({ ...prev, [mappingId]: true }));
        await onLikeDislike(mappingId, isLike);
        setPendingLikes(prev => ({ ...prev, [mappingId]: false }));
    };

    return (
        <Grid narrow className="course-grid">
            {courseMappings.map((mapping) => (
                <Column key={mapping.course_mapping_id} lg={4} md={4} sm={4}>
                    <ClickableTile className="course-tile">
                        <AspectRatio ratio="16x9">
                            <div className="institution-logo">
                                <img
                                    src={mapping.institution?.logoPicture ? 
                                        `http://localhost:5001${mapping.institution.logoPicture}` : 
                                        '/placeholder-logo.png'}
                                    alt={mapping.institution?.name || 'Institution Logo'}
                                    className="institution-logo-banner"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/placeholder-logo.png';
                                    }}
                                />
                            </div>
                        </AspectRatio>

                        <div className="course-info">
                            <h3>{mapping?.course?.name || 'Course Name Not Available'}</h3>
                            <p className="institution-name">
                                {mapping?.institution?.institution || 'Institution Name Not Available'}
                            </p>

                            <div className="course-tags">
                                <Tag type="blue">
                                    {mapping?.course?.type || 'Course Type Not Available'}
                                </Tag>
                                <Tag type="green">
                                    {mapping?.institution?.type || 'Institution Type Not Available'}
                                </Tag>
                            </div>

                            <div className="course-stats">
                                <span className="fees">
                                    ₹{(mapping?.fees || 0).toLocaleString('en-IN')}
                                </span>
                                <span className="duration">
                                    {mapping?.duration || 'Duration Not Available'}
                                </span>
                            </div>
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
                    </ClickableTile>
                </Column>
            ))}
        </Grid>
    );
};

export default CourseGrid;