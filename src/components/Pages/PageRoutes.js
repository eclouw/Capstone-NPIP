import NavBar from "../NavBar";
import PageGoogleMaps from "./PageGoogleMaps";
import PageHome from "./PageHome";
import { Route, Routes } from "react-router-dom";

function PageRoutes(){
    return (
        <>
        <NavBar/>
        <div className="container">
            <Routes>
                <Route path="/" element={<PageHome/>} />
                <Route path="/PageGoogleMaps" element={<PageGoogleMaps/>} />
            </Routes>
        </div>
        </>
    )
}

export default PageRoutes;