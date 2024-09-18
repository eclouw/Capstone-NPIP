import './styles.css'
import { useEffect, useState } from 'react';
import axios from 'axios';
import getMLABDATA from '../Hooks/getMLABDATA';
import { Dropdown, Button } from 'react-bootstrap';

function MLABPage(){
    const[selectedCountries, setSelectedCountries] = useState(['Please Select a Country']);
    const[year, setYear] = useState('2024');
    const[group, setGroup] = useState();
    const[metric, setetric] = useState();
    const[countryListLoaded, setCountryListLoad] = useState(false);
    
    useState(()=>{
        //LOAD A LIST OF COUNTRIES THAT HAVE DATA
        const getCountryList = async()=>{
        const cList = await getMLABDATA('all', '2024', 'country', 'compute')
        setSelectedCountries(cList.data);
        setCountryListLoad(true);
        console.log(selectedCountries.data);
    } 

    getCountryList();
    })
    
    

    return(
        <div class='MLABPage'>
            {countryListLoaded &&(
                <>
                <div class="dropdown">
                <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Select a country
                </button>
                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                {selectedCountries.map((selectedCountries)=>(
                    
                    <a class="dropdown-item" href="#">{selectedCountries.country}</a>
                    
                ))}
                </div>
                </div>
                </>
            )}
        </div>
    )

}

export default MLABPage;