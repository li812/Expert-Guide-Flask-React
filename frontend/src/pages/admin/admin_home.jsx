import React, { useEffect, useState } from "react";
import { Grid, Column, Heading, Tile, InlineNotification } from "@carbon/react";
import { UserAdmin, UserAvatar, Api } from "@carbon/icons-react";
import { DonutChart, SimpleBarChart } from "@carbon/charts-react";
import "@carbon/charts/styles.css";
import "./admin.css"; // Import the CSS file for styling

const AdminHome = ({ username }) => {
  const [stats, setStats] = useState({
    user_count: 0,
    pending_user_complaints: 0,
  });
  const [serverInfo, setServerInfo] = useState({
    uptime: 0,
    cpu_usage: 0,
    memory_usage: 0,
    total_memory: 0,
    used_memory: 0,
    free_memory: 0,
    total_storage: 0,
    used_storage: 0,
    free_storage: 0,
    ip_address: "",
    mac_address: "",
    network_sent: 0,
    network_received: 0,
    timestamp: "",
    os_info: "",
    processor_info: "",
    gpu_info: "",
  });
  const [networkSentData, setNetworkSentData] = useState([]);
  const [networkReceivedData, setNetworkReceivedData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/admin/stats", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setError("Error fetching stats");
      }
    };

    const fetchServerInfo = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/api/admin/server-info",
          {
            method: "GET",
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

        const data = await response.json();
        setServerInfo(data);
        setNetworkSentData((prevData) => [
          ...prevData,
          {
            group: "Sent",
            date: new Date(data.timestamp),
            value: data.network_sent / 1024 ** 2,
          },
        ]);
        setNetworkReceivedData((prevData) => [
          ...prevData,
          {
            group: "Received",
            date: new Date(data.timestamp),
            value: data.network_received / 1024 ** 2,
          },
        ]);
      } catch (error) {
        console.error("Error fetching server info:", error);
        setError("Error fetching server info");
      }
    };

    fetchStats();
    fetchServerInfo();
    const interval = setInterval(fetchServerInfo, 5000); // Fetch every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const memoryData = [
    { group: "Used Memory", value: serverInfo.used_memory / 1024 ** 3 },
    { group: "Free Memory", value: serverInfo.free_memory / 1024 ** 3 },
  ];

  const cpuData = [
    { group: "CPU Usage", value: serverInfo.cpu_usage },
    { group: "CPU Idle", value: 100 - serverInfo.cpu_usage },
  ];

  const storageData = [
    { group: "Used Storage", value: serverInfo.used_storage / 1024 ** 3 },
    { group: "Free Storage", value: serverInfo.free_storage / 1024 ** 3 },
  ];

  const memoryOptions = {
    title: "Memory Usage (GB)",
    resizable: true,
    donut: {
      center: {
        label: "Memory",
      },
    },
    height: "400px",
  };

  const cpuOptions = {
    title: "CPU Usage (%)",
    resizable: true,
    donut: {
      center: {
        label: "CPU",
      },
    },
    height: "400px",
  };

  const storageOptions = {
    title: "Storage Usage (GB)",
    resizable: true,
    donut: {
      center: {
        label: "Storage",
      },
    },
    height: "400px",
  };

  const networkSentOptions = {
    title: "Network Sent (MB)",
    axes: {
      bottom: {
        title: "Time",
        mapsTo: "date",
        scaleType: "time",
      },
      left: {
        mapsTo: "value",
        title: "Traffic (MB)",
        scaleType: "linear",
      },
    },
    height: "400px",
  };

  const networkReceivedOptions = {
    title: "Network Received (MB)",
    axes: {
      bottom: {
        title: "Time",
        mapsTo: "date",
        scaleType: "time",
      },
      left: {
        mapsTo: "value",
        title: "Traffic (MB)",
        scaleType: "linear",
      },
    },
    height: "400px",
  };

  return (
    <Grid className="dashboard">
      <Column lg={16} md={8} sm={4}>
        <Tile className="stat-tile">
          <Heading className="dashboard-heading">Welcome, {username}!</Heading>
          <p className="dashboard-content">
            This is your admin dashboard. Use the navigation links to manage
            users, developers, APIs, and settings.
            {error && (
              <InlineNotification
                kind="error"
                title="Error"
                subtitle={error}
                onCloseButtonClick={() => setError(null)}
              />
            )}
          </p>
          <br></br>
          <br></br>
        </Tile>
      </Column>
      <br></br>
      <br></br>
      <br></br>
      {/* Statistics Section */}
      <Column lg={7} md={2} sm={1}>
        <Tile className="stat-tile">
          <UserAdmin size={32} />
          <h4>Total<br></br>Users</h4>
          <p>{stats.user_count}</p>
        </Tile>
      </Column>


      <Column lg={7} md={2} sm={1}>
        <Tile className="stat-tile">
          <Api size={32} />
          <h4>New User<br></br>Complaints</h4>
          <p>{stats.pending_user_complaints}</p>
        </Tile>
      </Column>

      {/* Server Information Section */}
      <Column lg={15} md={8} sm={4}>
        <Tile className="stat-tile">
          <h4>Server Information</h4>
          <p>Uptime: {new Date(serverInfo.uptime * 1000).toLocaleString()}</p>
          <p>IP Address: {serverInfo.ip_address}</p>
          <p>MAC Address: {serverInfo.mac_address}</p>
          <p>OS: {serverInfo.os_info}</p>
          <p>Processor: {serverInfo.processor_info}</p>
          <p>GPU: {serverInfo.gpu_info}</p>
        </Tile>
      </Column>
      <Column lg={5} md={4} sm={4}>
        <Tile className="stat-tile">
          <DonutChart data={memoryData} options={memoryOptions} />
        </Tile>
      </Column>
      <Column lg={5} md={4} sm={4}>
        <Tile className="stat-tile">
          <DonutChart data={cpuData} options={cpuOptions} />
        </Tile>
      </Column>
      <Column lg={5} md={4} sm={4}>
        <Tile className="stat-tile">
          <DonutChart data={storageData} options={storageOptions} />
        </Tile>
      </Column>

      {error && (
        <InlineNotification
          kind="error"
          title="Error"
          subtitle={error}
          onCloseButtonClick={() => setError(null)}
        />
      )}
    </Grid>
  );
};

export default AdminHome;
