fetch('partials/header.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('header').innerHTML = data;
  });

fetch('partials/main.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('main').innerHTML = data;
  });

fetch('partials/footer.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('footer').innerHTML = data;
  });

fetch('partials/search.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('search').innerHTML = data;
  });