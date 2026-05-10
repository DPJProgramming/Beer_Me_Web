import validate from './validation.js';

window.onload = function() {    
    const form = document.getElementById("newBeerForm");
    form.addEventListener("submit", validateForm); 
}

function validateForm(event){
    event.preventDefault();
    const beer = new FormData(event.target);
    let spans = getFormSpans(event.target);
    let isValid = validate.formValidate(beer, spans);

    if(isValid){
        addBeer(beer);
    }
}

function getFormSpans(form){
    return {
        name: form.querySelector("#nameValid"),
        type: form.querySelector("#typeValid"),
        rating: form.querySelector("#ratingValid"),
        image: form.querySelector("#imageValid")
    };
}

async function addBeer(newBeer){    
    console.log("reached addBeer");
    // If image file present, request presigned URL and upload directly to S3
    const fileInput = document.querySelector('#image');
    let imageKey = null;
    if(fileInput && fileInput.files && fileInput.files.length > 0){
        const file = fileInput.files[0];
        // request presigned url
        const resp = await fetch('/api/upload-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: file.name, contentType: file.type })
        });

        if(!resp.ok){
            alert('Failed to get upload URL');
            return;
        }

        const { key, url } = await resp.json();
        // upload file directly to S3
        const uploadResp = await fetch(url, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
        if(!uploadResp.ok){
            alert('Failed to upload image to S3');
            return;
        }
        imageKey = key;
    }

    // Build payload (send JSON metadata)
    const payload = {
        name: newBeer.get('name'),
        type: newBeer.get('type'),
        rating: newBeer.get('rating'),
        description: newBeer.get('description') || '',
        image: imageKey || 'placeholder.png'
    };

    const response = await fetch('/api/addBeer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

    if(response.ok){
        alert('Beer added successfully');
        window.location.href = 'index.html';
    } else {
        const err = await response.json().catch(()=>({}));
        alert('Failed to add beer: ' + (err.error || response.statusText));
    }
}

// function validate(event){
//     event.preventDefault();
//     const newBeer = new FormData(event.target);
//     const validator = new Validate();

//     if(validator.validate(newBeer))  
//         {
//             console.log("All validations passed");
//             addBeer(newBeer);
//         }
//     else{
//         return;
//     }
// }
