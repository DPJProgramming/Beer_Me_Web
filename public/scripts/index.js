let allBeers = [];

// Helpers to handle null/undefined/'null' values from the DB
function displayOr(value, fallback) {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string' && (value.trim() === '' || value === 'null')) return fallback;
    return value;
}

function safeString(value) {
    if (value === null || value === undefined) return '';
    if (typeof value !== 'string') return String(value);
    if (value === 'null') return '';
    return value;
}

window.onload = async () => {
    const config = {
        method:"get",
        mode: "cors"
    }
    const response = await fetch('/api/allBeers', config);
    if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
    }

    const beers = await response.json();
    allBeers = beers;

    if (!beers || !Array.isArray(beers) || beers.length === 0) {
        noBeerAlert();
    }
    else{
        displayBeers(beers);

        const sort = document.getElementById("sort");
        sort.addEventListener('change', () => sortBy(allBeers, sort.value));

        const search = document.getElementById("search");
        search.addEventListener('input',() => searchFor(allBeers, search.value));
    }
    
}

function displayBeers(beers){
    const ul = document.getElementById('favorite-beers');
    ul.innerHTML = "";

    beers.forEach(beer => {
        //create elements
        const name = document.createElement("h3");
        name.innerText = beer.name;
        name.setAttribute("id", beer.id);

        const image = document.createElement("img");
        setBeerImage(image, beer.image, beer.name);
        image.alt = beer.name;
        // Add these lines to constrain image size:
        image.style.maxWidth = "200px";
        image.style.maxHeight = "200px";
        image.style.objectFit = "cover";  
        image.style.display = "block";    
        image.style.margin = "10px 0";    

        const rating = document.createElement("span");
        if (beer.rating === null || beer.rating === undefined || beer.rating === 'null' || beer.rating === '') {
            rating.innerText = "Rating: No rating, add one";
        } else {
            rating.innerText = `Rating: ${beer.rating}/5 `;
        }

        const description = document.createElement("p");
        description.innerText = displayOr(beer.description, "No description ");

        const brewery = document.createElement("span");
        brewery.innerText = `Brewery: ${displayOr(beer.brewery, "I don't know ")} `;

        const type = document.createElement("span");
        type.innerText = `Type: ${displayOr(beer.type, "None given ")} `;

        const location = document.createElement("span");
        location.innerText = `Location: ${displayOr(beer.location, "Not specified ")} `;

        const date = document.createElement("span");
        date.innerText = `Added on: ${displayOr(beer.date, "I don't remember ")} `;

        const details = document.createElement("a");
        details.href = `/beerDetails.html?id=${beer.id}`;
        details.innerText = "View Details";

        const editLink = document.createElement("a");
        editLink.href = `/editBeer.html?id=${beer.id}`;
        editLink.innerText = "Edit";
        editLink.style.marginLeft = "10px";

        // delete button: call DELETE and redirect to home on success
        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.innerText = "Delete";
        deleteBtn.style.marginLeft = "10px";

        deleteBtn.onclick = async function(event) {
            event.preventDefault();
            if (!confirm(`Are you sure you want to delete ${beer.name}?`)) return;
            try {
                const res = await fetch(`/api/deleteBeer/${beer.id}`, { method: 'DELETE' });
                if (res.ok) {
                    alert('Beer deleted successfully');
                    window.location.href = 'index.html';
                } else {
                    alert('Failed to delete beer. Please try again.');
                }
            } catch (err) {
                console.error('Delete failed', err);
                alert('Failed to delete beer. Please try again.');
            }
        };

        //line break
        const br = document.createElement("br");

        //append elements
        const li = document.createElement("li");
        // Add these lines to constrain overall beer entry size:
        li.style.maxWidth = "400px";      // Constrain overall width
        li.style.border = "1px solid #ddd"; // Optional: visual boundary
        li.style.padding = "15px";        // Optional: internal spacing
        li.style.marginBottom = "20px";   // Space between beer entries

        li.appendChild(name);
        li.appendChild(rating);
        li.appendChild(image);
        li.appendChild(description);
        li.appendChild(brewery);
        li.appendChild(type);
        li.appendChild(location);
        li.appendChild(date);
        li.appendChild(details);
        li.appendChild(editLink);
        li.appendChild(deleteBtn);
        li.appendChild(br);

        li.setAttribute("class", "beer-item");

        ul.appendChild(li);
    })
}

function setBeerImage(image, beerImage, beerName) {
    const placeholder = '/img/placeholder.png';
    if (!beerImage) {
        image.src = placeholder;
        image.alt = beerName;
        return;
    }

    // Support stored values that are either "img/filename.png" (full key)
    // or just "filename.png" (legacy). Use encodeURI for full paths to
    // preserve the slash when present.
    let imagePath;
    if (typeof beerImage === 'string' && beerImage.startsWith('img/')) {
        imagePath = '/' + encodeURI(beerImage); // becomes /img/xxx
    } else {
        imagePath = '/img/' + encodeURIComponent(beerImage);
    }

    image.onerror = () => {
        image.onerror = null;
        image.src = placeholder;
    };

    image.src = imagePath;
    image.alt = beerName;
}

function sortBy(beers, sortOption){
    let sortedBeers;

    switch(sortOption){
        case "name":
            sortedBeers = beers.sort((a, b) => safeString(a.name).localeCompare(safeString(b.name)));
            break;
        case "rating":
            sortedBeers = beers.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
            break;
        case "date asc":
            sortedBeers = beers.sort((a, b) => (Date.parse(safeString(a.date)) || 0) - (Date.parse(safeString(b.date)) || 0));
            break;
        case "date desc":
            sortedBeers = beers.sort((a, b) => (Date.parse(safeString(b.date)) || 0) - (Date.parse(safeString(a.date)) || 0));
            break;
        case "type":
            sortedBeers = beers.sort((a, b) => safeString(a.type).localeCompare(safeString(b.type)));
            break;
        case "brewery":
            sortedBeers = beers.sort((a, b) => safeString(a.brewery).localeCompare(safeString(b.brewery)));
            break;
        default:
            sortedBeers = beers;
    }

    displayBeers(sortedBeers);
}

function noBeerAlert(){
    const body = document.getElementById("favorite-beers");
    const message = document.createElement("h3");
    message.innerText = "NO BEERS!!!";
    body.appendChild(message);
}

function searchFor(beers, term){
    let message = document.getElementById('searchMessage');
    const searchTerm = term.toLowerCase().trim();

    let filteredBeers = beers.filter((beer) => 
                            safeString(beer.name).toLowerCase().startsWith(searchTerm)
                        || safeString(beer.type).toLowerCase().startsWith(searchTerm)
                        || safeString(beer.brewery).toLowerCase().startsWith(searchTerm));

    if(filteredBeers.length === 0){
        message.innerText = "No results";
        document.getElementById('favorite-beers').innerHTML = "";
    }
    else{
        message.innerText = ""
        const currentSort = document.getElementById('sort').value;
        sortBy(filteredBeers, currentSort);
    }
}

