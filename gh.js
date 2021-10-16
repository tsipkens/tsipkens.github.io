
/*
See https://github.com/timmywheels/github-api-tutorial
for more information. 
*/


requestUserRepos('tsipkens');


validRepos = ['atems', 'fmviz', 'cmap', 'mat-2d-aerosol-inversion', 'tfer-pma'];


function formater(txt, num, tafter) {
    if (num==0) {
        out = '';
    } else {
        out = txt + ' ' + num.toString() + tafter;
    }
    return out;
}


function requestUserRepos(username) {

    // Create new XMLHttpRequest object
    const xhr = new XMLHttpRequest();

    // GitHub endpoint, dynamically passing in specified username
    const url = `https://api.github.com/users/${username}/repos`;

    // Open a new connection, using a GET request via URL endpoint
    // Providing 3 arguments (GET/POST, The URL, Async True/False)
    xhr.open('GET', url, true);

    // When request is received
    // Process it here
    xhr.onload = function() {

        // Parse API data into JSON
        const data = JSON.parse(this.response);
        let root = document.getElementById('userRepos');
        while (root.firstChild) {
            root.removeChild(root.firstChild);
        }
        if (data.message === "Not Found") {
            let ul = document.getElementById('userRepos');

            // Create variable that will create li's to be added to ul
            let li = document.createElement('li');

            // Add Bootstrap list item class to each li
            li.classList.add('pub-entry')
                // Create the html markup for each li
            li.innerHTML = (`
                <p><strong>No account exists with username:</strong> ${username}</p>`);
            // Append each li to the ul
            ul.appendChild(li);
        } else {

            // Get the ul with id of of userRepos
            let ul = document.getElementById('userRepos');
            
            // Loop over each object in data array
            for (let i in data) {
                console.log(data[i])
                if (!(validRepos.includes(data[i].name))) {
                    continue;
                }

                // Create variable that will create li's to be added to ul
                let li = document.createElement('li');

                // Add Bootstrap list item class to each li
                li.classList.add('pub-entry')

                // Create the html markup for each li
                tstar = formater('<a class="little-icon" href=' + data[i].html_url + 
                    '/stargazers><i class="far fa-star"></i>', data[i].stargazers_count, '</a>')
                tfork = formater('<a class="little-icon" href=' + data[i].html_url + 
                    '/network/members><i class="fas fa-code-branch"></i>', data[i].forks_count, '</a>')
                console.log(tfork)
                li.innerHTML = (`
                    <p class="no-space"><b><a href="${data[i].html_url}">${data[i].name}</a></b>
                    <span style="font-size:9.5pt;margin-left:10px;">${data[i].language}` + tstar + tfork + `</span></p>
                    <p class="no-space-sub" style="padding-top:0px;"> ${data[i].description}
                    <br><a href="${data[i].html_url}">${data[i].html_url}</a></p>
            `);

                // Append each li to the ul
                ul.appendChild(li);

            }

        }
    }

    // Send the request to the server
    xhr.send();

}