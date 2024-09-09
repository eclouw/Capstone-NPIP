import React from "react";
import './navBar.css'
import { Link } from "react-router-dom";

function NavBar(){
  return (
    <div class="navbar">
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/PageGoogleMaps">Maps</Link></li>
        </ul>
      </nav>
    </div>
    
  )
}

export default NavBar;
