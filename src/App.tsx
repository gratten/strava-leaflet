import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Popup, Polyline } from 'react-leaflet';
import axios from 'axios';
import polyline from '@mapbox/polyline';

interface Activity {
  activityPositions: any;
  activityName: string;
  activityElevation: number;
  activityDate: string;
}

function App() {
  const [activities, setActivities] = useState<Activity[]>([]);

  const clientID = "111871";
  const clientSecret = "918212e247c6fa5ca06f8b25accf5a53e6cf85bd";
  const refreshToken = "e1bd165a4f84d4b5af701935c813daa2ee4ca0a6";
  const auth_link = "https://www.strava.com/oauth/token";
  const activities_link = `https://www.strava.com/api/v3/athlete/activities`;

  const fetchActivities = async (page: number) => {
    const stravaAuthResponse = await axios.post(
      `${auth_link}?client_id=${clientID}&client_secret=${clientSecret}&refresh_token=${refreshToken}&grant_type=refresh_token`
    );

    const stravaActivityResponse = await axios.get(
      `${activities_link}?page=${page}&per_page=200&access_token=${stravaAuthResponse.data.access_token}`
    );

    return stravaActivityResponse.data;
  };

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
      const allActivities: Activity[] = [];

      let page = 1;
      while (true) {
        const stravaActivities = await fetchActivities(page);
        // console.log(stravaActivities)
        if (stravaActivities.length > 0) {
          for (const stravaActivity of stravaActivities) {
            const activity_polyline = stravaActivity.map.summary_polyline;
            const activity_name = stravaActivity.name;
            const activity_elevation = stravaActivity.total_elevation_gain;
            const activity_date = stravaActivity.start_date;
            const decodedPolyline = polyline.decode(activity_polyline);
            allActivities.push({
              activityPositions: decodedPolyline,
              activityName: activity_name,
              activityElevation: activity_elevation,
              activityDate: activity_date
            });
          }
          page++;
        } else {
          break;
        }
      }
      // console.log(allActivities)
      setActivities(allActivities);
      setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }

    fetchData();
  }, []);

  return (
    // <h2>hi</h2>
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
      <MapContainer center={[33.77196, -84.38370]} zoom={12} scrollWheelZoom={true} style={{ width: '100%', height: '100vh' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {activities.map((activity, i) => (
          <Polyline key={i} positions={activity.activityPositions}>
            <Popup>
              <div>
                <h2>{activity.activityName}</h2>
                <p>{activity.activityDate}</p>
              </div>
            </Popup>
          </Polyline>
        ))}
      </MapContainer>
      )}
    </div>
  );
}

export default App;