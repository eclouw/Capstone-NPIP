import React from "react";
import './navBar.css'
import { Link } from "react-router-dom";

//The navbar to navigate between different pages
//Need to fix the formatting on the NPIP title 
function NavBar(){
  return (
    <div class="navbar">
      <h1>NPIP</h1>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/PageGoogleMaps">Ripe Atlas Data</Link></li>
          <li><Link to="/PageMLAB">MLAB Data</Link></li>
          <li><Link to="/App">Testing</Link></li>
        </ul>
      </nav>
    </div>
    
  )
}

export default NavBar;
