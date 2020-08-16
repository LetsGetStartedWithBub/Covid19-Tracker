import React, { useState, useEffect } from 'react';
import { MenuItem, FormControl, Select, Card, CardContent } from '@material-ui/core';
import './App.css';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import { sortData, prettyPrintStat } from "./util";
import LineGraph from './LineGraph';
import numeral from 'numeral';
import "leaflet/dist/leaflet.css";

function App() {
  const[countries, setCountries] = useState([]);
  const[country, setCountry]=useState(['Worldwide']);
  const [countryInfo, setCountryInfo]=useState({});
  const [tableData, setTableData] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);

  //usestate = How to write variables in react

   useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then(response => response.json())
    .then(data => {
        setCountryInfo(data);
    });
   }, []);

   useEffect(() => {
    //useEffect is used when ever a piece of code is executed based on
    // a particular condition
     const getCountriesData = async () => {
        await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
            //map() loop through the each and every country data
            //and will return the name and value of that particular country back
            const countries = data.map((country) => ({
                name: country.country,
                value: country.countryInfo.iso2,
            }));

            let sortedData = sortData(data);
            setTableData(sortedData);
            setMapCountries(data);
            setCountries(countries);
        });
     };
     getCountriesData();
    }, []);
//This function is going to run ever-time when the country different
//name is selected from the drop-down
  const onCountryChange = async (event) => {
    //This variable will hold the selected country name or is02
    const countryCode = event.target.value;
    //Now the selected location is visible
    setCountry(countryCode);
    // If dropdown is on worldwide then 1st url else fetch info from second url
    const url =
        countryCode === 'worldwide'
            ? 'https://disease.sh/v3/covid-19/all'
            : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    await fetch(url)
    .then(response => response.json())
    .then(data => {
        setCountry(countryCode);
        setCountryInfo(data);
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
    })
  };

  return (
    <div className="app">
      <div className="app_left">
      <div className="app_header">
        <h1> COVID-19-TRACKER </h1>
        {/*Here we are using material-ui for creating containers*/}
        <FormControl className="app_dropdown">
            <Select variant="outlined" onChange={onCountryChange} value = {country}>
                <MenuItem value="Worldwide">Worldwide</MenuItem>
                {countries.map((country) => (
                    <MenuItem value={country.value}>{country.name}</MenuItem>
                ))}
            </Select>
        </FormControl>
      </div>
      <div className="app_stats">
        <InfoBox
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases"
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={numeral(countryInfo.recovered).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            isRed
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={numeral(countryInfo.deaths).format("0.0a")}
          />
      </div>
      <Map
        countries={mapCountries}
        casesType={casesType}
        center={mapCenter}
        zoom={mapZoom}
      />
    </div>
    <Card className="app_right">
        <CardContent >
            <div className="app_information">
            <h3>Live Cases by Country</h3>
            <Table countries={tableData} />
            <h3>Worldwide new {casesType}</h3>
            <LineGraph className="app_graph" casesType={casesType} />
          </div>
        </CardContent>
    </Card>
    </div>
  );
}

export default App;
