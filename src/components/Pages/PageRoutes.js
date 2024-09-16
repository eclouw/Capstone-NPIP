import NavBar from "../NavBar";
import PageMLAB from "./PageMLAB";
import PageGoogleMaps from "./PageGoogleMaps";
import PageHome from "./PageHome";
import { Route, Routes } from "react-router-dom";
import App from "../../App";
import './styles.css'

//Manages all the routing between pages
//The route to app below is just for testing things
function PageRoutes(){
    return (
        <>
        <NavBar/>
        <div className="container">
            <Routes>
                <Route path="/" element={<PageHome/>} />
                <Route path="/PageGoogleMaps" element={<PageGoogleMaps/>} />
                <Route path="/App" element={<App/>} />
                <Route path="/PageMLAB" element={<PageMLAB/>}/>
            </Routes>
        </div>
        </>
    )
}

export default PageRoutes;