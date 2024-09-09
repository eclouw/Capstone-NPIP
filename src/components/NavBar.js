import React from "react";
import './navBar.css'
import { Link } from "react-router-dom";

//The navbar to navigate between different pages
function NavBar(){
  return (
    <div class="navbar">
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/PageGoogleMaps">Maps</Link></li>
          <li><Link to="/App">Testing</Link></li>
        </ul>
      </nav>
    </div>
    
  )
}

export default NavBar;
