function formatAuthor(author) {
  author = author.replace('T. Sipkens', '<u>T. Sipkens</u>').replace('T. A. Sipkens', '<u>T. A. Sipkens</u>');
  return author;
}

filterPubs = function (data, st) {

  if (!(st == null)) {

    st2 = st.split(" ");

    data = data.filter(function (entry) {
      fl = true;

      for (let i in st2) {
        st3 = st2[i].toUpperCase();
        if (!(st3 === "")) {
          flTemp = entry.Author.toUpperCase().includes(st3);
          flTemp = flTemp || entry.Title.toUpperCase().includes(st3);
          if (entry.hasOwnProperty('Journal')) {
            flTemp = flTemp || entry.Journal.toUpperCase().includes(st3);
          }
          if (entry.hasOwnProperty('Conference')) {
            flTemp = flTemp || entry.Conference.toUpperCase().includes(st3);
          }

          fl = fl && flTemp;
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
      if (!(data[i].Year > yyyy)) {
        continue;
      }
    }

    // Create variable that will create li's to be added to ul
    let di = document.createElement('div');
    di.setAttribute('data-aos', 'slide-up')

    // Add Bootstrap list item class to each li
    let li = document.createElement('li');
    li.classList.add('pub-entry')

    content = '<p class="pub-title"><b><a href="' + data[i].DOI + '">' + data[i].Title + '</a></b></p>';
    content = content + '<p class="no-space-sub" style="padding-top:0px;"> '
    content = content + formatAuthor(data[i].Author);
    content = content + '<span class="no-space-sub">';
    content = content + ' <br> <i>' + data[i].Journal + '</i> (' + data[i].Year + ')';
    content = content + ' <b>&#183</b> <b>' + data[i].Volume + '</b>, ' + data[i].PagesNo + '<br>';
    content = content + '<a href=' + data[i].DOI + '">' + data[i].DOI + '</a>';

    if (!(data[i].Honours == '')) {
      content = content + '<br><span class="pub-honour">';
      content = content + '<i class="fas fa-award"></i> ';
      content = content + data[i].Honours + '</span>';
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
      if (!(data[i].Type == type)) {
        continue;
      }
    }

    // Filter by honours.
    if (hon == true) {
      if (data[i].Honours == '') {
        continue;
      }
    }

    // Create variable that will create li's to be added to ul
    let di = document.createElement('div');
    di.setAttribute('data-aos', 'slide-up')

    // Add Bootstrap list item class to each li
    let li = document.createElement('li');
    li.classList.add('pub-entry')

    content = '<p class="pub-title"><b><a href="' + data[i].DOI + '">' + data[i].Title + '</a></b></p>';
    content = content + '<p class="no-space-sub" style="padding-top:0px;"> '
    content = content + formatAuthor(data[i].Author);
    content = content + '<span class="no-space-sub">';
    content = content + ' <b>&#183</b> <i>' + data[i].Conference + '</i> <b>&#183</b> ' + data[i].Location;
    content = content + ' <b>&#183</b> ' + data[i].Date + ', ' + data[i].Year;

    if (!(data[i].Honours == '')) {
      content = content + '<br><span class="pub-honour">';
      content = content + '<i class="fas fa-award"></i> ';
      content = content + data[i].Honours + '</span>';
    }

    content = content + '</span></p>';

    // Create the html markup for each li
    li.innerHTML = (content);

    // Append each li to the ul
    di.appendChild(li);
    ul.appendChild(di);
  }
}