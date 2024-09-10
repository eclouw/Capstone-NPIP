import React from "react";

//The home page, need to put things in here
function PageHome(){
    return (
        <>
        <h1>TODO List</h1>
        <p>Home page, not sure what to do with it yet but for now it can be the todo page</p>
        <h2>Google Maps</h2>
        <p>The basics of Google map are set up, need to refine some things listed below and also get the datasets</p>
        <ul>
            <li>Change the formatting of the map so that it looks better than the current block</li>
            <li>Refactor some code to make it easier to recieve data for the POIs</li>
            <li>Get data from ripe atlas for locations of probes</li>
            <li>Get data from MLAB for countries that have data to assign POIs to these countries</li>
        </ul>
        <h2>UI</h2>
        <p>For the time being, the UI components can be set up and a sort of mock-ui can be used and later can be refined</p>
        <ul>
            <li>Create needed components</li>
        </ul>
        <h2>Data retrival</h2>
        <p>This is the big one, will have to try to get the data using react but if that is not possible then flask it is, but will have to optimise that extensively</p>

        </>
    )

}

export default PageHome;