import * as React from 'react';
import { useState, useEffect } from 'react';
import ReactMapGL, { Marker, Popup, NavigationControl } from 'react-map-gl';
import {listLogEntries} from './api';
import LogEntryForm from './components/LogEntryForm';
import useDarkMode from 'use-dark-mode';
import DarkModeToggle from 'react-dark-mode-toggle';

const API_URL = 'http://host.docker.internal:8083';

const light = {
  mapStyle: "mapbox://styles/asgaraliq/cklzl2vj68db717qnf09zg2pu",
}

const dark = {
  mapStyle: "mapbox://styles/asgaraliq/cklfm0y8e3zkx17o0la6s1hk6",
}

const getTheme = (mode) => {
  //console.log(mode);
  return {
    colors: mode === light ? light : dark,
  }
}

const log = (theme) => {
  console.log(theme);
}

const App = () => {
  if(!localStorage.getItem("token")){
    // Action you want to perform if not logged in.
  }
  const [logEntries, setLogEntries] = useState([]);
  const [togglePopup] = React.useState(false);
  const [addEntryLocation, setAddEntryLocation] = useState(null); 
  const [weatherDetail, setWeatherDetail] = useState("Fetching...");
  const [showPopup, setShowPopup] = useState({});
  const darkMode = useDarkMode(false);
  const theme = getTheme(darkMode.value ? dark : light);
  
  const [settings, setSettings] = useState({
    doubleClickZoom: false,
  });

  const [viewport, setViewport] = useState({
    width: '100vw',
    height: '100vh',
    latitude: 21.1458,
    longitude: 79.0882, 
    zoom: 3,
  });


const getEntries = async() => {
  const logEntries = await listLogEntries();
  setLogEntries(logEntries);
};

useEffect(() => {
  getEntries();
}, []);

const updateWeatherDetails = (latitude, longitude) => {
  fetch(`${API_URL}/api/logs/getlocation`, {
    method: "POST",
    body: JSON.stringify({
      "lat": latitude,
      "lon": longitude
    }),
    headers: {
      "Content-Type": "application/json"
    }
  }).then(res => res.json())
  .then(data => {
    setWeatherDetail(data.details)
  })
  .catch(() => setWeatherDetail("Error Fetching Weather Info"))
}

const showAddMarkerPop = (event) =>{
  const [longitude, latitude] = event.lngLat;
  setAddEntryLocation({
    latitude,
    longitude,
  });
};

  return (
      
      
    <ReactMapGL
      {...viewport}
      {...settings}
      
      mapStyle={theme.colors.mapStyle}
    //  {...log(theme)}
      mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
      onViewportChange={nextViewport => setViewport(nextViewport)}
      onDblClick={showAddMarkerPop}
      
      
    >
      <div className="nav" >
        <NavigationControl />
      </div>

      <div className="themeToggle">
        <DarkModeToggle 
            onChange={darkMode.toggle}
            checked={darkMode.value}
            size={50}
        />
      </div>
      

      {
        logEntries.map(entry =>(
        <React.Fragment key={entry._id}>
          <Marker 
            
            latitude={entry.latitude} 
            longitude={entry.longitude} 
          //  offsetLeft={-12} 
          //  offsetTop={-24}
          >
            <div onClick = {() => {
              updateWeatherDetails(entry.latitude, entry.longitude)
              setShowPopup({
                //...showPopup,
                [entry._id]: true,
              })
            }}>
             <svg 
                  className="marker yellow" 
                  style={{
                    height: `${3 * viewport.zoom}px`,
                    width: `${3 * viewport.zoom}px`,
                  }}
                  version="1.1" 
                  id="Layer_1" 
                  x="0px" 
                  y="0px" 
                  viewBox="0 0 511.999 511.999">
                <g>
                  <g>
                    <path d="M255.999,0C152.786,0,68.817,85.478,68.817,190.545c0,58.77,29.724,130.103,88.349,212.017
                      c42.902,59.948,85.178,102.702,86.957,104.494c3.27,3.292,7.572,4.943,11.879,4.943c4.182,0,8.367-1.558,11.611-4.683
                      c1.783-1.717,44.166-42.74,87.149-101.86c58.672-80.701,88.421-153.007,88.421-214.912C443.181,85.478,359.21,0,255.999,0z
                      M255.999,272.806c-50.46,0-91.511-41.052-91.511-91.511s41.052-91.511,91.511-91.511s91.511,41.052,91.511,91.511
                      S306.457,272.806,255.999,272.806z"/>
                  </g>
                </g>
              </svg>
            </div>
          </Marker>

          {
            
            showPopup[entry._id] ? (
              <Popup
                latitude={entry.latitude} 
                longitude={entry.longitude} 
                closeButton={true}
                closeOnClick={false}
                dynamicPosition={true}
                onClose={() => {
                  setShowPopup({})
                  setWeatherDetail("Fetching...")
                }}
                on
                anchor="top" >
                  <div className = "popup">
                    <h3>{entry.title}</h3>
                    <p>{entry.comments}</p>
                    <small>Visited on: {new Date(entry.visitDate).toLocaleDateString()}</small>
                    <hr/>
                    { entry.image && <img src={entry.image} alt={entry.title} /> }
                    <hr/>
                    <div className = "weather">
                      {weatherDetail}
                    </div>
                    
                    
                  </div>
              </Popup>
            ) : null
          } 
          
        </React.Fragment>
        ))
      }

      {
        addEntryLocation ? (
          <>
           <Marker 
              latitude={addEntryLocation.latitude} 
              longitude={addEntryLocation.longitude} 
            //  offsetLeft={-12} 
            //  offsetTop={-24}
            >
              <div>
                <svg 
                  className="marker red" 
                  style={{
                    height: `${3 * viewport.zoom}px`,
                    width: `${3 * viewport.zoom}px`,
                  }}
                  version="1.1" 
                  id="Layer_1" 
                  x="0px" 
                  y="0px" 
                  viewBox="0 0 511.999 511.999">
                <g>
                  <g>
                    <path d="M255.999,0C152.786,0,68.817,85.478,68.817,190.545c0,58.77,29.724,130.103,88.349,212.017
                      c42.902,59.948,85.178,102.702,86.957,104.494c3.27,3.292,7.572,4.943,11.879,4.943c4.182,0,8.367-1.558,11.611-4.683
                      c1.783-1.717,44.166-42.74,87.149-101.86c58.672-80.701,88.421-153.007,88.421-214.912C443.181,85.478,359.21,0,255.999,0z
                      M255.999,272.806c-50.46,0-91.511-41.052-91.511-91.511s41.052-91.511,91.511-91.511s91.511,41.052,91.511,91.511
                      S306.457,272.806,255.999,272.806z"/>
                  </g>
                </g>
                </svg>
              </div>
                
            </Marker>
          
            <Popup
                latitude={addEntryLocation.latitude} 
                longitude={addEntryLocation.longitude} 
                closeButton={true}
                closeOnClick={false}
                dynamicPosition={true}
                onClose={() => setAddEntryLocation(null)}
                anchor="top" >
                  <div className = "popup">
                    <LogEntryForm 
                      onClose={() => {
                      setAddEntryLocation(null);
                      getEntries();
                    }} 
                      location={addEntryLocation}/>
                  </div>
              </Popup>
          </>
        ) : null
      }
      
    </ReactMapGL>
    
    

    
  );
}

export default App;