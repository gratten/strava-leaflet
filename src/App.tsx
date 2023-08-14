import React, {useEffect, useState} from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup, Polyline } from 'react-leaflet'
import './App.css';
import axios from 'axios'
import polyline from '@mapbox/polyline'


function App() {

  interface Activity {
    activityPositions: any;
    activityName: string;
    activityElevation: number;
  }

  const [activities, setActivities] = useState<Activity[]>([]);



  const clientID = "111871";
  const clientSecret = "918212e247c6fa5ca06f8b25accf5a53e6cf85bd";
  const refreshToken = "e1bd165a4f84d4b5af701935c813daa2ee4ca0a6"
  const auth_link = "https://www.strava.com/oauth/token"
  const activities_link = `https://www.strava.com/api/v3/athlete/activities`

  useEffect(() => {
    async function fetchData() {
      const stravaAuthResponse = await axios.all([
        axios.post(`${auth_link}?client_id=${clientID}&client_secret=${clientSecret}&refresh_token=${refreshToken}&grant_type=refresh_token`)
      ]);

      // let req_pg_num: number = 1

      // while (true) {

      // const stravaActivityResponse = await axios.get(`${activities_link}?page=${req_pg_num}&per_page=201&access_token=${stravaAuthResponse[0].data.access_token}`)
      const stravaActivityResponse = await axios.get(`${activities_link}?page=1&per_page=200&access_token=${stravaAuthResponse[0].data.access_token}`)
        // if (stravaActivityResponse.data.length > 0) {
        //   console.log(stravaActivityResponse.data.length)
        //   req_pg_num += 1
        // } else {
        //   break
        // }


      // }

      const polylines = [];
      for (let i = 0; i < stravaActivityResponse.data.length; i += 1) {
        const activity_polyline = stravaActivityResponse.data[i].map.summary_polyline;
        const activity_name = stravaActivityResponse.data[i].name;
        const activity_elevation = stravaActivityResponse.data[i].total_elevation_gain
        polylines.push({ activityPositions: polyline.decode(activity_polyline), activityName: activity_name, activityElevation: activity_elevation });
      }
      console.log(polylines)
      setActivities(polylines)
    }

    fetchData();
  }, []);

  return (
    <MapContainer center={[42.585444, 13.257684]} zoom={6} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
       {activities.map((activity, i) => (
        <Polyline key = {i} positions = {activity.activityPositions}>
            <Popup>
              <div>
                <h2>{activity.activityName}</h2>
                <p>{activity.activityElevation}</p>
              </div>
            </Popup>
        </Polyline>
       ))} 
    </MapContainer>
  );
}

export default App;
