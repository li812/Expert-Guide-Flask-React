import React, { useEffect, useState } from "react";
import {
  Grid,
  Column,
  Tile,
  Button,
  InlineNotification,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tag,
  Stack,
  Modal
} from "@carbon/react";
import { TrashCan, UserAvatar, View } from "@carbon/icons-react";
import { useNavigate } from "react-router-dom";
import "./admin.css";

// Modify the ProfilePicture component to accept a size prop
const ProfilePicture = ({ developer, size = "small" }) => {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setLoading(false);
  };

  const handleImageLoad = () => {
    setLoading(false);
  };

  if (!developer.profilePicture || imageError) {
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
        src={`http://localhost:5001/${developer.profilePicture}`}
        alt={`${developer.full_name}'s profile`}
        className={`profile-picture ${loading ? 'hidden' : ''}`}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    </div>
  );
};

const AdminManageDevelopers = ({ username }) => {
  const [developers, setDevelopers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDevelopers();
  }, [navigate]);

  // Update fetchDevelopers function
  const fetchDevelopers = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/admin/developers", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });

      if (response.status === 401) {
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDevelopers(data.developers);
    } catch (error) {
      console.error("Error fetching developers:", error);
      setError("Error fetching developers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (login_id) => {
    if (window.confirm("Are you sure you want to delete this developer?")) {
      try {
        const response = await fetch(
          `http://localhost:5001/api/admin/developers/${login_id}`,
          {
            method: "DELETE",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setDevelopers(developers.filter((dev) => dev.login_id !== login_id));
      } catch (error) {
        console.error("Error deleting developer:", error);
        setError("Error deleting developer");
      }
    }
  };

  const handleViewDetails = (developer) => {
    setSelectedDeveloper(developer);
    setShowDetailsModal(true);
  };

  return (
    <Grid className="dashboard">
      <Column lg={16} md={8} sm={4}>
        <Tile className="stat-tile">
          <h2>Manage Developers</h2>
          <p className="subtitle">View and manage developer accounts</p>

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

          <DataTable
            rows={developers.map((developer) => ({
              id: String(developer.login_id),
              login_id: String(developer.login_id),
              profilePicture: <ProfilePicture developer={developer} size="small" />,
              username: developer.username || "-",
              fullName: developer.full_name || "-",
              email: developer.email || "-",
              type: (
                <Tag type={developer.type === 'Company' ? 'blue' : 'green'}>
                  {developer.type}
                </Tag>
              ),
              company: developer.company || "-",
              created_at: developer.created_at || "-",  // Keep as string
              actions: (
                <Stack orientation="horizontal" gap={4}>
                  <Button
                    kind="ghost"
                    size="sm"
                    renderIcon={View}
                    onClick={() => handleViewDetails(developer)}
                  >
                    View
                  </Button>
                  <Button
                    kind="danger"
                    size="sm"
                    renderIcon={TrashCan}
                    onClick={() => handleDelete(developer.login_id)}
                  >
                    Delete
                  </Button>
                </Stack>
              ),
            }))}
            headers={[
              { key: "login_id", header: "ID" },
              { key: "profilePicture", header: "Profile" },
              { key: "username", header: "Username" },
              { key: "fullName", header: "Full Name" },
              { key: "email", header: "Email" },
              { key: "type", header: "Type" },
              { key: "company", header: "Company" },
              { key: "created_at", header: "Created At" },
              { key: "actions", header: "Actions" }
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
                      placeholder="Search developers..."
                    />
                  </TableToolbarContent>
                </TableToolbar>
                <Table {...getTableProps()} size="lg">
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => {
                        const { key, ...headerProps } = getHeaderProps({ header });
                        return (
                          <TableHeader key={header.key} {...headerProps}>
                            {header.header}
                          </TableHeader>
                        );
                      })}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => {
                      const { key, ...rowProps } = getRowProps({ row });
                      return (
                        <TableRow key={row.id} {...rowProps}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
        </Tile>
      </Column>

      {/* Details Modal */}
      <Modal
        open={showDetailsModal}
        modalHeading="Developer Details"
        primaryButtonText="Close"
        preventCloseOnClickOutside
        onRequestClose={() => {
          setShowDetailsModal(false);
          setSelectedDeveloper(null);
        }}
        onRequestSubmit={() => {
          setShowDetailsModal(false);
          setSelectedDeveloper(null);
        }}
      >
        {selectedDeveloper && (
          <Stack gap={7}>
            <div>
              <h4>Profile Picture</h4>
              <ProfilePicture developer={selectedDeveloper} size="large" />
            </div>
            <div>
              <h4>Full Name</h4>
              <p>{selectedDeveloper.full_name}</p>
            </div>
            <div>
              <h4>Username</h4>
              <p>{selectedDeveloper.username}</p>
            </div>
            <div>
              <h4>Email</h4>
              <p>{selectedDeveloper.email}</p>
            </div>
            <div>
              <h4>Developer Type</h4>
              <Tag type={selectedDeveloper.type === 'Company' ? 'blue' : 'green'}>
                {selectedDeveloper.type}
              </Tag>
            </div>
            {selectedDeveloper.company && (
              <div>
                <h4>Company</h4>
                <p>{selectedDeveloper.company}</p>
              </div>
            )}
            <div>
              <h4>Social Links</h4>
              <Stack gap={2}>
                {selectedDeveloper.github && <p>GitHub: {selectedDeveloper.github}</p>}
                {selectedDeveloper.linkedin && <p>LinkedIn: {selectedDeveloper.linkedin}</p>}
              </Stack>
            </div>
            <div>
              <h4>Registration Date</h4>
              <p>{selectedDeveloper.created_at || "-"}</p>
            </div>
          </Stack>
        )}
      </Modal>
    </Grid>
  );
};

export default AdminManageDevelopers;