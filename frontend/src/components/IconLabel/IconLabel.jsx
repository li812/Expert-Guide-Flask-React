import React from 'react';
import PropTypes from 'prop-types';

const IconLabel = ({ icon: Icon, label, size = 22 }) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
        <Icon size={size} />
        <span style={{ marginLeft: '8px' }}>{label}</span>
    </div>
);

IconLabel.propTypes = {
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
    size: PropTypes.number
};

export default IconLabel;