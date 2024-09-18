import NavBar from "../NavBar";
import PageMLAB from "./PageMLAB";
import PageHome from "./PageHome";
import { Route, Routes } from "react-router-dom";
import PageRipeAtlas from "./PageRipeAtlas.js";
import './styles.css'
import MLABPage from "./MLABPage.js";

//Manages all the routing between pages
//The route to app below is just for testing things
function PageRoutes(){
    return (
        <>
        <NavBar/>
        <div className="container">
            <Routes>
                <Route path="/" element={<PageHome/>} />
                <Route path="/PageRipeAtlas" element={<PageRipeAtlas/>} />
                <Route path="/PageMLAB" element={<MLABPage/>}/>
            </Routes>
        </div>
        </>
    )
}

export default PageRoutes;