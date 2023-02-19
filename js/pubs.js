formatAuthor = function (author) {
  author = author.replace('T. Sipkens', '<b>T. Sipkens</b>')
    .replace('T. A. Sipkens', '<b>T. A. Sipkens</b>')
    .replace('Timothy A. Sipkens', '<b>Timothy A. Sipkens</b>');
  author = author.replace('*', '<b>*</b>');
  return author;
}

printYearHeading = function (data, i, di2, iLastPrinted = i - 1, f_aos = true) {
  if ((i == 0) || (iLastPrinted === null)) {
    content = data[i].year.toString()
  } else {
    if (!(data[iLastPrinted].year == data[i].year)) {
      content = data[i].year.toString()
    } else {
      content = null
    }
  }
  if (!(content === null)) {

    // Add Bootstrap list item class to each li
    let h4 = document.createElement('h4');
    h4.classList.add('h-year')

    // Create the html markup for each li
    h4.innerHTML = (content);

    // Append each h4 to the di2\
    if (f_aos) {
      // Create variable that will create li's to be added to di2
      let dih = document.createElement('div');
      dih.setAttribute('data-aos', 'slide-up')

      dih.appendChild(h4);
      di2.appendChild(dih);
    } else {
      di2.appendChild(h4);
    }
  }
}

writeDOI = function (doi) {
  if (doi.includes('https://doi.org/')) { // for pre-prints
    content = ' <a style="display:inline-block;" href="' + doi + '">' + doi.replace('https://doi.org/', '').toLowerCase() + '</a>';
  } else { // otherwise for DOIs
    content = ' <a style="display:inline-block;" href="' + doi + '">' + doi.toLowerCase() + '</a>';
  }
  return content;
}

checkNoItems = function (di2) {
  if (di2.innerHTML === "") {
    di2.innerHTML = "<li class='list-entry' style='list-style:none;color:#888;'><i>No matching items.</i></li>";
  }
}

filterPubs = function (data, st) {

  if (!(st == null)) { // skip is search term (st) is empty

    st = st.toUpperCase();
    stq = st.split('"'); // first, split by quotes

    st = []; // initialize empty array
    for (let i in stq) {
      if ((i % 2) === 0) { // then split based on spaces
        st = st.concat(stq[i].split(" "));
      } else { // then in quotes, add as a block
        st.push(stq[i]);
      }
    }

    // Remove empty elements prior to search.
    st = st.filter(function (element) {
      return element != "";
    });

    // Filter the data by the search term. 
    data = data.filter(function (entry) {
      fl = true; // initialize as true

      for (let i in st) {
        sti = st[i]; // part of what makes search case insensitive

        // Add authors.
        se = entry.author; // create text to search in (se)
        se = se.concat(" ");

        // Add entry titles.
        se = se.concat(entry.title);
        se = se.concat(" ");

        // Add entry years.
        // Add brackets to allow better filtering, if desired.
        se = se.concat("(" + entry.year + ")");
        se = se.concat(" ");

        // Add entry journal (only if exists).
        if (entry.hasOwnProperty('journal')) {
          se = se.concat(entry.journal);
          se = se.concat(" ");
        }

        // Add entry conference name (only if exists).
        if (entry.hasOwnProperty('booktitle')) {
          se = se.concat(entry.booktitle);
          se = se.concat(" ");
        }

        // Add entry type.
        if (entry.hasOwnProperty('type')) {
          se = se.concat(entry.type);
          se = se.concat(" ");
        }

        // Add rags.
        if (entry.hasOwnProperty('tags')) {
          se = se.concat(entry.tags);
          se = se.concat(" ");
        }

        se = se.toUpperCase(); // second part to make case insensitive

        // Search. Combine with an "and" to find/exclude all terms.
        if (!(sti.substr(0, 1) === "-")) {
          fl = fl && se.includes(sti); // if to include search term
        } else {
          sti = sti.substr(1);
          fl = fl && !(se.includes(sti)); // if to exclude search term
        }
      }

      return fl;
    });
  }

  return data;
}

addItems = function (id, di) {
  let di2 = document.getElementById(id);
  di2.innerHTML = " ";
  di2.append(di);
}




//== For writing HTML from JSON data. ====================//
writePubs = function (data, yyyy, st = null) {

  data = filterPubs(data, st);
  data = data.sort((a, b) => (b.year - a.year)) // sort entries by year

  let di2 = document.createElement('div');

  var iLastPrinted = null

  // Loop over each object in data array
  for (let i in data) {

    // Filter by the date.
    if (!(yyyy == null)) {
      if (!(((data[i].year > yyyy)) || (data[i].year === 'In press'))) {
        continue;
      }
    }

    // Add year headers.
    printYearHeading(data, i, di2, iLastPrinted)
    iLastPrinted = i // copy over current i

    content = '<p>';
    content = content + formatAuthor(data[i].author) + '. ';
    content = content + '"' + data[i].title + '." ';
    content = content + ' <i>' + data[i].journal + '</i>';

    if (!(data[i].volume === null)) {
      content = content + ', ' + data[i].volume + ', ' + data[i].pages;
    }

    content = content + ' (' + data[i].year + ').';

    content = content + writeDOI(data[i].doi);

    content = content + " <a style='margin-left:4px;font-size:9pt;' onclick='entry2quote(this, " + JSON.stringify(data[i]) + 
                        ")'><i class='fa-solid fa-quote-right'></i></a>"

    if (data[i].hasOwnProperty('honours')) {
      if (!(data[i].honours == '')) {
        content = content + '<p class="pub-title"><span class="list-after">';
        content = content + '<i class="fa-solid fa-award"></i> ';
        content = content + data[i].honours + '</span></p>';
      }
    }

    content = content + '</p>';


    // Create variable that will create li's to be added to di2
    let di = document.createElement('div');
    di.setAttribute('data-aos', 'slide-up')

    // Add Bootstrap list item class to each li
    let li = document.createElement('li');
    li.classList.add('list-entry')

    // Create the html markup for each li
    li.innerHTML = (content);

    // Append each li to the di2
    di.appendChild(li);
    di2.appendChild(di);
  }

  // If nothing was printed.
  checkNoItems(di2);

  return di2;
}



// For writing HTML from JSON data.
writeConf = function (data, type, hon, st = null, ye = true) {

  data = filterPubs(data, st);
  data = data.sort((a, b) => (b.year - a.year)) // sort entries by year

  let di2 = document.createElement('div');

  var iLastPrinted = null

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
      if (!(data[i].hasOwnProperty('honours'))) {
        continue;
      }
      if (data[i].honours == '') {
        continue;
      }
      if (data[i].honours == null) {
        continue;
      }
    }

    // Add year headers.
    if (ye) {
      printYearHeading(data, i, di2, iLastPrinted)
    }
    iLastPrinted = i // copy over current i

    // Create variable that will create li's to be added to di2
    let di = document.createElement('div');
    di.setAttribute('data-aos', 'slide-up')

    // Add Bootstrap list item class to each li
    let li = document.createElement('li');
    li.classList.add('list-entry')

    content = '<p>';
    content = content + formatAuthor(data[i].author) + '. ';
    content = content + '"' + data[i].title;
    if ((data[i].title[data[i].title.length - 1]) === "?") {
      content = content + '"'
    } else {
      content = content + '."'
    }
    content = content + ' <i>' + data[i].booktitle + '</i>. ' + data[i].address + '. ';
    content = content + data[i].date + ', ' + data[i].year + '.';

    content = content + '</span>'; 

    if (data[i].hasOwnProperty('pdf')) {
      content = content + '<span class="list-after" style="padding-left:10px;"><a class="little-icon" href="' + data[i].pdf + '">';
      content = content + '<i class="fas fa-file-pdf"></i></a></span>';
    }

    if (data[i].hasOwnProperty('honours')) {
      if (data[i].honours == '') {  // then skip (do nothing)
      } else if (data[i].honours == null) {  // then skip (do nothing)
      } else {  // then honours are available
        content = content + '<p class="pub-title"><span class="list-after">';
        content = content + '<i class="fas fa-award"></i> ';
        content = content + data[i].honours + '</span></p> ';
      }
    }

    // Create the html markup for each li
    li.innerHTML = (content);

    // Append each li to the di2
    di.appendChild(li);
    di2.appendChild(di);
  }

  // If nothing was printed.
  checkNoItems(di2);

  return di2;
}


writer = function (data, template, nfield = null, fyear = true, st = null) {

  if (!(st == null)) {
    data = filterPubs(data, st);
  }
  data = data.sort((a, b) => (b.year - a.year)) // sort entries by year

  var iLastPrinted = null

  let di2 = document.createElement('div');

  // Loop over each object in data array
  for (let i in data) {

    if (fyear) {
      // Add year headers.
      printYearHeading(data, i, di2, iLastPrinted, false)
    }
    iLastPrinted = i // copy over current

    txt = ''
    if (!(nfield == null)) {
      txt = txt + '<b style="font-size:13pt;">'
      for (let j in nfield) {
        if ((nfield[j] === '.') || (nfield[j] === ',')) {
          txt = txt + nfield[j] + ' '
        } else if ((nfield[j] === '(') || (nfield[j] === ')') ||
          (nfield[j] === ' ') || (nfield[j] === '<br>') ||
          (nfield[j] === '<i>') || (nfield[j] === '</i>')) {
          txt = txt + nfield[j]
        } else if (nfield[j] === 'year') {
          txt = txt + '<span style="font-size:10pt;">' + data[i].year + '</span><br>'
        } else {
          txt = txt + data[i][nfield[j]]
        }
      }
      txt = txt + '</b><br>'
    }

    for (let j in template) {
      if (data[i][template[j]] === null) {
        continue;
        // do nothing as current entry it null
      } else if (!(j == template.length - 1)) {
        if (data[i][template[j - 1]] === null) {
          continue;
          // do nothing if next is null (skips grammar)
        }
      }

      if ((template[j] === '.') || (template[j] === ',')) {
        txt = txt + template[j] + ' '
      } else if ((template[j] === '(') || (template[j] === ')') ||
        (template[j] === ' ') || (template[j] === '<br>') ||
        (template[j] === '<i>') || (template[j] === '</i>')) {
        txt = txt + template[j]
      } else if (template[j] === 'author') {
        txt = txt + formatAuthor(data[i][template[j]])
      } else if (template[j] === 'doi') {
        txt = txt + writeDOI(data[i].doi);
      } else if (template[j] === 'honours') {
        if (data[i].hasOwnProperty('honours')) {
          if (!(data[i].honours === "")) {
            txt = txt + '<br><span class="pub-honour">';
            txt = txt + '<i class="fas fa-award"></i> ';
            txt = txt + data[i].honours + '</span> ';
          }
        }
      } else {
        txt = txt + data[i][template[j]]
      }
    }

    let li = document.createElement('li');
    li.classList.add('list-entry')
    li.innerHTML = (txt);
    di2.appendChild(li)
  }

  // If nothing was printed.
  checkNoItems(di2);

  return di2;
}

var entry2quote = function(obj, datai0) {
  datai = datai0;
  // datai = Object.assign({}, datai0);  // copy data entry for modification
  yr = datai['year'];

  author = datai['author']
  author = author.replaceAll(', ' , ' and ');
  
  // Reformat author.
  authorlist = author.split(" and ");
  for (let a in authorlist) {
    at = authorlist[a].split(" ");
    authorn = at[at.length - 1] + ",";
    for (var i = 0; i < (at.length - 1); i++) {
      authorn = authorn + " " + at[i];
    }
    author = author.replace(authorlist[a], authorn)
    
  }
  datai['author'] = author;

  // Last name of the first author.
  author1 = authorlist[0].split(" ");
  author1 = author1[author1.length - 1];
  
  // First word of title.
  title1 = datai['title'].split(' ');
  title1 = title1[0].split('-');
  title1 = title1[0].split(':');
  title1 = title1[0];

  // Remove inappropriate fields.
  keynames = Object.keys(datai);
  for (let j in datai) {
    if (datai[j] === null) {
      delete datai[j]
    }
  }
  delete datai['honours']
  delete datai['tags']
  delete datai['badge']

  datai = JSON.stringify(datai);
  datai = datai.replaceAll('{"', '@article{' + (author1 + yr + title1).toLowerCase() + ', \n');
  datai = datai.replaceAll('"}', '}\n}');
  datai = datai.replaceAll('":"', '={');
  datai = datai.replaceAll('":', '={');
  datai = datai.replaceAll('","', '}, \n');
  datai = datai.replaceAll(',"', '}, \n');
  navigator.clipboard.writeText(datai);

  obj.innerHTML = "<i class='fa-solid fa-check'></i>"
  setTimeout(() => {  obj.innerHTML = "<i class='fa-solid fa-quote-right'></i>"; }, 1000);

  console.log(datai)
}