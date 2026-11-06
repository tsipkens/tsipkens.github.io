// PUBS.JS (Combined Publications & GitHub Repositories Manager)
// Created by T. A. Sipkens

//--------------------------------------------------------------------//
// 1. PUBLICATIONS & CITATIONS FORMATTING & FETCHING
//--------------------------------------------------------------------//

formatAuthor = function (author, bolder = true) {
  author = author.replace(" and", "")
  authorList = author.split(", ")

  /* If long author list, only show some */
  if (authorList.length > 7) {
    authorList = authorList.slice(0,6)
    author = authorList.join(", ")
    author = author + ", et al."
  }

  if (bolder && author) {
    author = author.replace("T. Sipkens", "<b>T. Sipkens</b>")
      .replace("T. A. Sipkens", "<b>T. A. Sipkens</b>")
      .replace("Timothy A. Sipkens", "<b>Timothy A. Sipkens</b>");
    author = author.replace("*", "<b>*</b>");
  }
  return author || "";
}

printYearHeading = function (data, i, di2, iLastPrinted = i - 1, f_aos = true) {
  let content = null;
  if ((i == 0) || (iLastPrinted === null)) {
    content = data[i].year ? data[i].year.toString() : null;
  } else {
    if (data[iLastPrinted].year !== data[i].year && data[i].year) {
      content = data[i].year.toString();
    }
  }
  if (content !== null) {
    let h3 = document.createElement('h3');
    h3.classList.add('h-year', 'full-width-heading');
    h3.textContent = content;

    if (f_aos) {
      let dih = document.createElement('div');
      dih.setAttribute('data-aos', 'slide-up');
      dih.appendChild(h3);
      di2.appendChild(dih);
    } else {
      di2.appendChild(h3);
    }
  }
}

writeDOI = function (doi) {
  if (!doi) return '';
  const cleanDoi = doi.replace('https://doi.org/', '').toLowerCase();
  return ` <br><a style="display:inline-block;padding-top:5px;" href="${doi}">${cleanDoi}</a><br>`;
}

checkNoItems = function (di2) {
  if (di2.innerHTML.trim() === "") {
    let li = document.createElement('li');
    li.className = 'list-entry';
    li.style.cssText = 'list-style:none;color:#888;';
    let iTag = document.createElement('i');
    iTag.textContent = 'No matching items.';
    li.appendChild(iTag);
    di2.appendChild(li);
  }
}

filterPubs = function (data, st) {
  if (st) {
    st = st.toUpperCase();
    let stq = st.split('"');
    st = [];
    for (let i in stq) {
      if ((i % 2) === 0) {
        st = st.concat(stq[i].split(" "));
      } else {
        st.push(stq[i]);
      }
    }
    st = st.filter(element => element !== "");

    data = data.filter(function (entry) {
      let fl = true;
      for (let i in st) {
        let sti = st[i];
        let se = (entry.author || "") + " " + (entry.title || "") + " (" + (entry.year || "") + ") ";
        if (entry.hasOwnProperty('journal')) se += entry.journal + " ";
        if (entry.hasOwnProperty('booktitle')) se += entry.booktitle + " ";
        if (entry.hasOwnProperty('type')) se += entry.type + " ";
        if (entry.hasOwnProperty('tags')) se += entry.tags + " ";
        se = se.toUpperCase();

        if (!(sti.substr(0, 1) === "-")) {
          fl = fl && se.includes(sti);
        } else {
          sti = sti.substr(1);
          fl = fl && !(se.includes(sti));
        }
      }
      return fl;
    });
  }
  return data;
}

var json2bibtex = function (dataIn) {
  let datai = { ...dataIn };
  let yr = datai['year'] || '';
  let author = datai['author'] || '';
  author = author.replaceAll(', ', ' and ');
  let authorList = author.split(" and ");
  for (let a in authorList) {
    let at = authorList[a].split(" ");
    let authorn = at[at.length - 1] + ",";
    for (var ii = 0; ii < (at.length - 1); ii++) {
      authorn = authorn + " " + at[ii];
    }
    author = author.replace(authorList[a], authorn);
  }
  datai['author'] = author;

  let author1 = authorList[0] ? authorList[0].split(" ") : ['unknown'];
  author1 = author1[author1.length - 1];
  let title1 = datai['title'] ? datai['title'].split(' ')[0].split('-')[0].split(':')[0] : 'pub';

  delete datai['honours'];
  delete datai['tags'];
  delete datai['badge'];

  let res = JSON.stringify(datai);
  res = res.replaceAll('{"', '@article{' + (author1 + yr + title1).toLowerCase() + ', \n ');
  res = res.replaceAll('"}', '}\n}');
  res = res.replaceAll('":"', '={');
  res = res.replaceAll('":', '={');
  res = res.replaceAll('","', '}, \n ');
  res = res.replaceAll(',"', '}, \n ');
  return res;
}

var entry2quote = function (obj, datai0) {
  let datai = json2bibtex(datai0);
  navigator.clipboard.writeText(datai);
  obj.innerHTML = "<i class='fa-solid fa-check'></i>";
  setTimeout(() => { obj.innerHTML = "<i class='fa-solid fa-quote-right'></i>"; }, 1000);
}

var entry2txt = function (obj, datai0) {
  let datai1 = [datai0];
  let datai = writeItem(datai1, ['author', '.', 'title', '.', 'journal', ' ', '(', 'year', ')', ' ', 'volume', ',', 'pages', '.', 'doi_txt'], 0, null, 1);
  navigator.clipboard.writeText(datai);
  obj.innerHTML = "<i class='fa-solid fa-check'></i>";
  setTimeout(() => { obj.innerHTML = "<i class='fa-solid fa-align-left'></i>"; }, 1000);
}

writer = function (data, template, fYear = false, searchTerm = null, isArticles = false) {
  if (searchTerm !== null) {
    data = filterPubs(data, searchTerm);
  }
  data = data.sort((a, b) => (b.year - a.year));

  var iLastPrinted = null;
  let di2 = document.createElement('div');
  di2.classList.add('pub-grid');

  let totalItems = data.length;

  for (let i in data) {
    let indexNum = isArticles ? (totalItems - parseInt(i)) : null;

    if (fYear) {
      printYearHeading(data, i, di2, iLastPrinted, false);
    }
    iLastPrinted = i;
    
    let content = writeItem(data, template, i, indexNum);
    let di = document.createElement('div');
    di.setAttribute('data-aos', 'slide-up');

    let li = document.createElement('li');
    li.classList.add('list-entry');
    li.innerHTML = content;
    di.appendChild(li);
    di2.appendChild(di);
  }

  checkNoItems(di2);
  return di2;
}

var writeItem = function (data, template, i, indexNum = null) {
  let content = '';
  for (let j in template) {
    let templJ = template[j];
    if (data[i][templJ] === null) {
      continue;
    }
    
    if ((templJ === '.') || (templJ === ',')) {
      content += templJ + ' ';
    } else if (templJ.includes('<p class="list-title')) {
      if (indexNum !== null) {
        content += '' + indexNum + '.<br><hr>';
      }
      content += '<p class="list-title">';
    } else if ((templJ === '(') || (templJ === ')') || (templJ === ' ') || (templJ === '<br>') || (templJ.includes('i>')) || (templJ.includes('<b')) || (templJ.includes('</b')) || (templJ.includes('p>'))) {
      content += templJ;
    } else if (templJ === 'author') {
      content += formatAuthor(data[i][templJ]);
    } else if (templJ === 'doi') {
      content += writeDOI(data[i].doi);
    } else if (templJ === 'doi_txt') {
      content += data[i].doi ? data[i].doi.substr(16) : '';
    } else if (templJ == 'quote') {
      content += " <div><a style='margin-left:4px;font-size:9pt;' onclick='entry2quote(this, " + JSON.stringify(data[i]) + ")'><i class='fa-solid fa-quote-right'></i></a>";
      content += " <a style='margin-left:4px;font-size:9pt;' onclick='entry2txt(this, " + JSON.stringify(data[i]) + ")'><i class='fa-solid fa-align-left'></i></a></div>";
    } else if (templJ == 'pdf') {
      if (data[i].hasOwnProperty('pdf') && data[i].pdf) {
        content += '<span class="list-after" style="padding-left:10px;"><a class="little-icon" href="' + data[i].pdf + '"><i class="fas fa-file-pdf"></i></a></span>';
      }
    } else if (templJ === 'honours') {
      if (data[i].hasOwnProperty('honours') && data[i].honours) {
        content += '<p class="list-title"><span class="list-after"><i class="fas fa-award"></i> ' + data[i].honours + '</span></p> ';
      }
    } else {
      content += data[i][templJ];
    }
  }
  return content;
}

writeArticles = function (data, fYear = false, searchTerm = null) {
  let template = [
    '<p class="list-title">', '<b style="font-weight:600;">', 'title', '</b>', '</p>', 
    '<p>', 'author', ',',
    '<i>', 'journal', '</i> ', 'volume', ',', 'pages', ' ', '(', 'year', ')', '.', 
    'doi', '</p>', ' ', 'quote', ' ', 'honours'
  ];
  return writer(data, template, fYear, searchTerm, true);
}

writeConf = function (data, fYear = false, searchTerm = null) {
  let template = [
    'author', '.', 'title', '.', '<i>', 'booktitle', '</i>', '.',
    'address', '.', 'date', ',', 'year', '.', 'pdf', 'honours'
  ];
  return writer(data, template, fYear, searchTerm, false);
}

filterConf = function (data, type) {
  if (type) {
    data = data.filter(entry => entry.type && entry.type.includes(type));
  }
  return data;
}

addItems = function (id, di) {
  let di2 = document.getElementById(id);
  if (di2) {
    di2.innerHTML = " ";
    di2.append(di);
  }
}


//--------------------------------------------------------------------//
// 2. GITHUB REPOSITORIES FETCHING & RENDERING (from gh.js)
//--------------------------------------------------------------------//

const validRepos = ['atems', 'py-atems', 'aerosol-icon-project', 'cmap', 'bidias', 'tfer-pma', 'pydias', 'autils', 'aubos'];

async function requestUserRepos(username) {
    const url = `https://api.github.com/users/${username}/repos`;

    try {
        const response = await fetch(url);
        if (!response.ok) return;
        const data = await response.json();

        let root = document.getElementById('userRepos');
        if (!root) return;
        while (root.firstChild) {
            root.removeChild(root.firstChild);
        }

        for (let i in data) {
            let repo = data[i];
            if (!validRepos.includes(repo.name)) {
                continue;
            }

            let di = document.createElement('div');
            di.setAttribute('data-aos', 'slide-up');

            let li = document.createElement('li');
            li.classList.add('list-entry');

            // 1. Title Section
            let pTitle = document.createElement('p');
            pTitle.className = 'list-title';
            let bTag = document.createElement('b');
            let aTitle = document.createElement('a');
            aTitle.href = repo.html_url;
            aTitle.textContent = repo.name;
            bTag.appendChild(aTitle);
            pTitle.appendChild(bTag);

            // 2. Description & Repository URL Section
            let pDesc = document.createElement('p');
            pDesc.style.paddingTop = '0px';
            pDesc.textContent = repo.description || '';
            pDesc.appendChild(document.createElement('br'));
            let aUrl = document.createElement('a');
            aUrl.href = repo.html_url;
            aUrl.textContent = repo.html_url;
            pDesc.appendChild(aUrl);

            // 3. Metadata Div (Wrapped in a DIV and pushed to bottom)
            let divMeta = document.createElement('div');
            divMeta.className = 'repo-meta';
            divMeta.style.marginTop = 'auto'; // Pins to the bottom of the card

            if (repo.language) {
                let spanLang = document.createElement('span');
                spanLang.className = 'list-after';
                spanLang.textContent = repo.language;
                divMeta.appendChild(spanLang);
            }

            if (repo.stargazers_count > 0) {
                let starSpan = document.createElement('span');
                starSpan.className = 'list-after';
                let starA = document.createElement('a');
                starA.className = 'little-icon';
                starA.href = repo.html_url + '/stargazers';
                let starIcon = document.createElement('i');
                starIcon.className = 'far fa-star';
                starA.appendChild(starIcon);
                starA.append(' ' + repo.stargazers_count);
                starSpan.appendChild(starA);
                divMeta.appendChild(starSpan);
            }

            if (repo.forks_count > 0) {
                let forkSpan = document.createElement('span');
                forkSpan.className = 'list-after';
                let forkA = document.createElement('a');
                forkA.className = 'little-icon';
                forkA.href = repo.html_url + '/network/members';
                let forkIcon = document.createElement('i');
                forkIcon.className = 'fas fa-code-branch';
                forkA.appendChild(forkIcon);
                forkA.append(' ' + repo.forks_count);
                forkSpan.appendChild(forkA);
                divMeta.appendChild(forkSpan);
            }

            if (repo.license) {
                let licSpan = document.createElement('span');
                licSpan.className = 'list-after';
                let licA = document.createElement('a');
                licA.className = 'little-icon';
                licA.href = repo.html_url + '/network/members';
                let licIcon = document.createElement('i');
                licIcon.className = 'fa-solid fa-scale-balanced';
                licIcon.style.paddingRight = '5px';
                licA.appendChild(licIcon);
                licA.append(repo.license.spdx_id);
                licSpan.appendChild(licA);
                divMeta.appendChild(licSpan);
            }

            // Append all top elements and the bottom meta div
            li.appendChild(pTitle);
            li.appendChild(pDesc);
            li.appendChild(divMeta);
            di.appendChild(li);
            root.appendChild(di);
        }
    } catch (error) {
        console.error("Error fetching GitHub repositories:", error);
    }
}

// Automatically trigger GitHub repo request on script load
requestUserRepos('tsipkens');