

var json = $.getJSON("https://raw.githubusercontent.com/tsipkens/tsipkens.github.io/main/js/pubs.json", function(data) {
  
  // Get the ul with id of of userRepos
  let ul = document.getElementById('pubs-j');

  // Loop over each object in data array
  for (let i in data) {
      console.log(data[i])

      /*
      if (!(validRepos.includes(data[i].Year))) {
          continue;
      }
      */
      
      var today = new Date();
      var yyyy = today.getFullYear();
      if (!(data[i].Year > (yyyy - 3))) {
        continue;
      }

      // Create variable that will create li's to be added to ul
      let di = document.createElement('div');
      di.setAttribute('data-aos', 'slide-up')

      // Add Bootstrap list item class to each li
      let li = document.createElement('li');
      li.classList.add('pub-entry')

      content = '<p class="pub-title"><b><a href="' + data[i].DOI + '">' + data[i].Title + '</a></b></p>';
      content = content + '<p class="no-space-sub" style="padding-top:0px;"> ' 
      content = content + data[i].Author.replace('T. Sipkens', '<u>T. Sipkens</u>').replace('T. A. Sipkens', '<u>T. A. Sipkens</u>');
      content = content + ' <b>&#183</b> <i>' + data[i].Journal + '</i> (' + data[i].Year + ')';
      content = content + ' <b>&#183</b> <b>' + data[i].Volume + '</b>, ' + data[i].PagesNo + '<br>';
      content = content + '<a href=' + data[i].DOI + '">' + data[i].DOI + '</a></p>';

      // Create the html markup for each li
      li.innerHTML = (content);
            
      // Append each li to the ul
      di.appendChild(li);
      ul.appendChild(di);
  }
  
});
