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
    let h3 = document.createElement('h3');
    h3.classList.add('h-year')

    // Create the html markup for each li
    h3.innerHTML = (content);

    // Append each h3 to the di2\
    if (f_aos) {
      // Create variable that will create li's to be added to di2
      let dih = document.createElement('div');
      dih.setAttribute('data-aos', 'slide-up')

      dih.appendChild(h3);
      di2.appendChild(dih);
    } else {
      di2.appendChild(h3);
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

checkNoItems = function (di2) {  // if no items to print, print "No matching items."
  if (di2.innerHTML === "") {
    di2.innerHTML = "<li class='list-entry' style='list-style:none;color:#888;'><i>No matching items.</i></li>";
  }
}

filterPubs = function (data, st) {
  // st = searchTerm

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

        // Add tags.
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

/*
General function for writing JSON formatted data. 
Inputs: 
data = JSON formatter data, as above
template = array with fields and separators
fYear = flag of whether to print year headers
searchTerm = search term used to filter results
*/
writer = function (data, template, fYear = false, searchTerm = null) {
  
  if (!(searchTerm == null)) {
    data = filterPubs(data, searchTerm);
  }
  data = data.sort((a, b) => (b.year - a.year)) // sort entries by year

  var iLastPrinted = null

  let di2 = document.createElement('div');  // initialize outer div element

  // Loop over each object in data array
  for (let i in data) {

    // Add year headers.
    if (fYear) {
      printYearHeading(data, i, di2, iLastPrinted, false)
    }
    iLastPrinted = i // copy over current
    
    content = writeItem(data, template, i, content);

    let li = document.createElement('li');
    li.classList.add('list-entry');
    li.innerHTML = (content);
    di2.appendChild(li)
  }

  // If nothing was printed.
  checkNoItems(di2);

  return di2;
}

// Helper to parse write a single item using the given template.
var writeItem = function (data, template, i) {

  content = '';

  // Loop through the items in the proposed template.
  for (let j in template) {
    
    templJ = template[j];  // make local copy of template[j]
    
    if (data[i][templJ] === null) {
      continue; // do nothing as current entry it null
    } else if (!(j == template.length - 1)) {
      if (data[i][template[j - 1]] === null) {
        continue; // do nothing if next is null (skips grammar)
      }
    }
    
    // Start parsing grammar/formatting.
    if ((templJ === '.') || (templJ === ',')) {
      content = content + templJ + ' '

    } else if ((templJ === '(') || (templJ === ')') ||
      (templJ === ' ') || (templJ === '<br>') ||
      (templJ === '<i>') || (templJ === '</i>') || 
      (templJ === '<b>') || (templJ === '</b>')) {
      content = content + templJ

    // Start parsing "special" fields, e.g., format author field.
    } else if (templJ === 'author') {  
      content = content + formatAuthor(data[i][templJ])

    } else if (templJ === 'doi') {  // add DOI as link
      content = content + writeDOI(data[i].doi);

    } else if (templJ == 'quote') {  //  add link to copy BIBTEX info
      content = content + " <a style='margin-left:4px;font-size:9pt;' " + 
        "onclick='entry2quote(this, " + JSON.stringify(data[i]) + 
        ")'><i class='fa-solid fa-quote-right'></i></a>"

    } else if (templJ == 'pdf') {  // if link to PDF is provided
      if (data[i].hasOwnProperty('pdf')) {
        content = content + '<span class="list-after" style="padding-left:10px;"><a class="little-icon" href="' + data[i].pdf + '">';
        content = content + '<i class="fas fa-file-pdf"></i></a></span>';
      }

    } else if (templJ === 'honours') { // add honour/award, if relevant
      if (data[i].hasOwnProperty('honours')) {
        if (data[i].honours == '') {  // then skip (do nothing)
        } else if (data[i].honours == null) {  // then skip (do nothing)
        } else {  // then honours are available
          content = content + '<p class="list-title"><span class="list-after">';
          content = content + '<i class="fas fa-award"></i> ';
          content = content + data[i].honours + '</span></p> ';
        }
      }

    } else {
      content = content + data[i][templJ]  // finally just add the field data itself
    }
  }

  return content;
}

// Filter conferences by the presentation type.
filterConf = function (data, type) {
  if (!(type == null)) {
    // Filter the data by the search term. 
    data = data.filter(function (entry) {
      return entry.type.includes(type);
    });
  }
  return data;
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
  datai = datai.replaceAll('{"', '@article{' + (author1 + yr + title1).toLowerCase() + ', \n ');
  datai = datai.replaceAll('"}', '}\n}');
  datai = datai.replaceAll('":"', '={');
  datai = datai.replaceAll('":', '={');
  datai = datai.replaceAll('","', '}, \n ');
  datai = datai.replaceAll(',"', '}, \n ');
  navigator.clipboard.writeText(datai);

  obj.innerHTML = "<i class='fa-solid fa-check'></i>"
  setTimeout(() => {  obj.innerHTML = "<i class='fa-solid fa-quote-right'></i>"; }, 1000);

  console.log(datai)
}