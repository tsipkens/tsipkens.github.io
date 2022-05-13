function formatAuthor(author) {
  author = author.replace('T. Sipkens', '<u>T. Sipkens</u>').replace('T. A. Sipkens', '<u>T. A. Sipkens</u>');
  return author;
}

filterPubs = function (data, st) {
  
  if (!(st == null)) {  // skip is search term (st) is empty
    
    st = st.toUpperCase();
    stq = st.split('"');  // first, split by quotes
    
    st = [];  // initialize empty array
    for (let i in stq) {
      if ((i % 2) === 0) {  // then split based on spaces
        st = st.concat(stq[i].split(" "));
      } else {  // then in quotes, add as a block
        st.push(stq[i]);
      }
    }

    // Remove empty elements prior to search.
    st = st.filter(function (element) {
      return element != "";
    });

    // Filter the data by the search term. 
    data = data.filter(function (entry) {
      fl = true;  // initialize as true

      for (let i in st) {
        sti = st[i];  // part of what makes search case insensitive
        
        // Add authors.
        se = entry.author;  // create text to search in (se)
        se = se.concat(" ");

        // Add entry titles.
        se = se.concat(entry.title);
        se = se.concat(" ");

        // Add entry journal (only if exists).
        if (entry.hasOwnProperty('journal')) {
          se = se.concat(entry.journal);
          se = se.concat(" ");
        }

        // Add entry conference name (only if exists).
        if (entry.hasOwnProperty('Conference')) {
          se = se.concat(entry.booktitle);
          se = se.concat(" ");
        }
        
        se = se.toUpperCase();  // second part to make case insensitive

        // Search. Combine with an "and" to find/exclude all terms.
        if (!(sti.substr(0, 1) === "-")) {
          fl = fl && se.includes(sti);  // if to include search term
        } else {
          sti = sti.substr(1);
          fl = fl && !(se.includes(sti));  // if to exclude search term
        }
      }

      return fl;
    });
  }

  return data;
}

// For writing HTML from JSON data.
function writePubs(data, id, yyyy, st = null) {

  data = filterPubs(data, st);

  let ul = document.getElementById(id);
  ul.innerHTML = "";

  // Loop over each object in data array
  for (let i in data) {

    // Filter by the date.
    if (!(yyyy == null)) {
      if (!(data[i].year > yyyy)) {
        continue;
      }
    }

    // Create variable that will create li's to be added to ul
    let di = document.createElement('div');
    di.setAttribute('data-aos', 'slide-up')

    // Add Bootstrap list item class to each li
    let li = document.createElement('li');
    li.classList.add('pub-entry')

    content = '<p class="pub-title"><b><a href="' + data[i].doi + '">' + data[i].title + '</a></b></p>';
    content = content + '<p class="no-space-sub" style="padding-top:0px;"> '
    content = content + formatAuthor(data[i].author);
    content = content + '<span class="no-space-sub">';
    content = content + ' <br> <i>' + data[i].journal + '</i> (' + data[i].year + ')';

    if (!(data[i].volume === null)) {
      content = content + ' <b>&#183</b> <b>' + data[i].volume + '</b>, ' + data[i].pages;
    }
    
    if (data[i].doi.includes('arxiv')) {  // for pre-prints
      content = content + '<br><a href="' + data[i].doi + '">' + data[i].doi + '</a>';
    } else {  // otherwise for DOIs
      content = content + '<br><a href="' + data[i].doi + '">' + data[i].doi.replace('https://doi.org/', '') + '</a>';
    }

    if (data[i].hasOwnProperty('field')) {
      if (!(data[i].honours == '')) {
        content = content + '<br><span class="pub-honour">';
        content = content + '<i class="fas fa-award"></i> ';
        content = content + data[i].honours + '</span>';
      }
    }

    content = content + '</span></p>';

    // Create the html markup for each li
    li.innerHTML = (content);

    // Append each li to the ul
    di.appendChild(li);
    ul.appendChild(di);
  }
}



// For writing HTML from JSON data.
function writeConf(data, id, type, hon, st = null) {

  data = filterPubs(data, st);
  let ul = document.getElementById(id);
  ul.innerHTML = "";

  // Loop over each object in data array
  for (let i in data) {

    // Filter by the presentation type.
    if (!(type == null)) {
      if (!(data[i].type == type)) {
        continue;
      }
    }

    // Filter by honours.
    if (hon == true) {
      if (data[i].honours == '') {
        continue;
      }
    }

    // Create variable that will create li's to be added to ul
    let di = document.createElement('div');
    di.setAttribute('data-aos', 'slide-up')

    // Add Bootstrap list item class to each li
    let li = document.createElement('li');
    li.classList.add('pub-entry')

    content = '<p class="pub-title"><b><a href="' + data[i].doi + '">' + data[i].title + '</a></b></p>';
    content = content + '<p class="no-space-sub" style="padding-top:0px;"> '
    content = content + formatAuthor(data[i].author);
    content = content + '<span class="no-space-sub">';
    content = content + ' <b>&#183</b> <i>' + data[i].booktitle + '</i> <b>&#183</b> ' + data[i].address;
    content = content + ' <b>&#183</b> ' + data[i].date + ', ' + data[i].year;

    content = content + '</span></p>';
    
    if ((data[i].hasOwnProperty('honours')) || (data[i].hasOwnProperty('PDF'))) {
      content = content + '<p class="pub-title">';

      if (data[i].hasOwnProperty('honours')) {
        if (!(data[i].honours == '')) {
          content = content + '<span class="pub-honour">';
          content = content + '<i class="fas fa-award"></i> ';
          content = content + data[i].honours + '</span> ';
        }
      }
      
      if (data[i].hasOwnProperty('PDF')) {
        content = content + '<span class="pub-honour">';
        content = content + '<a href="' + data[i].PDF + '" style="text-decoration:none;">';
        content = content + '<i class="fas fa-file-pdf"></i> ';
        content = content + ' PDF</a></span>';
      }

      content = content + '</p>';
    }

    // Create the html markup for each li
    li.innerHTML = (content);

    // Append each li to the ul
    di.appendChild(li);
    ul.appendChild(di);
  }
}