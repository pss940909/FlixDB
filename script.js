// ------------------ TMDB API ---------------------
const API_KEY = "api_key=d1aa5d274ad22e0f6238b38b63364e36";
const BASE_URL = "https://api.themoviedb.org/3";
const API_URL = `${BASE_URL}/discover/movie?sort_by=popularity.desc&${API_KEY}`;
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const SEARCH_URL = BASE_URL + "/search/movie?" + API_KEY;
// ------------------ DOM ---------------------
const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");
const tagsEl = document.getElementById("tags");
const overlayContent = document.getElementById("overlay-content");
const leftArrow = document.getElementById("left-arrow");
const rightArrow = document.getElementById("right-arrow");

// -------------------取得類別---------------------
const genres = [
  {
    id: 28,
    name: "Action",
  },
  {
    id: 12,
    name: "Adventure",
  },
  {
    id: 16,
    name: "Animation",
  },
  {
    id: 35,
    name: "Comedy",
  },
  {
    id: 80,
    name: "Crime",
  },
  {
    id: 99,
    name: "Documentary",
  },
  {
    id: 18,
    name: "Drama",
  },
  {
    id: 10751,
    name: "Family",
  },
  {
    id: 14,
    name: "Fantasy",
  },
  {
    id: 36,
    name: "History",
  },
  {
    id: 27,
    name: "Horror",
  },
  {
    id: 10402,
    name: "Music",
  },
  {
    id: 9648,
    name: "Mystery",
  },
  {
    id: 10749,
    name: "Romance",
  },
  {
    id: 878,
    name: "Science Fiction",
  },
  {
    id: 10770,
    name: "TV Movie",
  },
  {
    id: 53,
    name: "Thriller",
  },
  {
    id: 10752,
    name: "War",
  },
  {
    id: 37,
    name: "Western",
  },
];
let activeSlide = 0;
let totalVideos = 0;

let selectedGenre = []; // 篩選器
setGenre();
function setGenre() {
  tagsEl.innerHTML = "";
  genres.forEach((genre) => {
    const t = document.createElement("div");
    t.classList.add("tag");
    t.id = genre.id;
    t.innerText = genre.name;
    t.addEventListener("click", (e) => {
      if (selectedGenre.length == 0) {
        selectedGenre.push(genre.id);
      } else {
        // 已經有此類別就移除
        if (selectedGenre.includes(genre.id)) {
          let itemIndex = selectedGenre.indexOf(genre.id);
          selectedGenre.splice(itemIndex, 1);
        } else {
          selectedGenre.push(genre.id);
        }
      }
      console.log(selectedGenre);
      console.log(selectedGenre.join(","));
      console.log(`${API_URL}&with_genres=${selectedGenre.join(",")}`);
      getMovies(`${API_URL}&with_genres=${selectedGenre.join(",")}`);
      highlightSelection();
    });
    tagsEl.append(t);
  });
}

// ------------highlight選擇到的類別 ---------
function highlightSelection() {
  const tags = document.querySelectorAll(".tag");
  tags.forEach((tag) => {
    tag.classList.remove("highlight");
  });
  clearBtn();
  if (selectedGenre.length !== 0) {
    selectedGenre.forEach((id) => {
      const highlightedTag = document.getElementById(id);
      highlightedTag.classList.add("highlight");
    });
  }
}

// ------------清除類別按鈕 ---------
function clearBtn() {
  let clearBtn = document.getElementById("clear");
  if (clearBtn) {
    clearBtn.classList.add("highlight");
  } else {
    let clear = document.createElement("div");
    clear.classList.add("tag", "highlight");
    clear.id = "clear";
    clear.innerText = "Clear x";
    clear.addEventListener("click", () => {
      selectedGenre = [];
      setGenre();
      getMovies(API_URL);
    });
    tagsEl.append(clear);
  }
}

getMovies(API_URL);

// -------------------取得API資料---------------------

function getMovies(url) {
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (data.results.length !== 0) {
        showMovies(data.results);
      } else {
        console.log(data.results);
        main.innerHTML = `<h1>No results found.</h1>`;
      }
    });
}

// -------------------渲染畫面---------------------
function showMovies(data) {
  main.innerHTML = "";
  data.forEach((movie) => {
    const { title, poster_path, vote_average, overview, id } = movie;
    const movieEl = document.createElement("div");
    movieEl.classList.add("movie");
    movieEl.innerHTML = `<img
    src="${
      poster_path
        ? IMG_URL + poster_path
        : "http://via.placeholder.com/1080x1580"
    }" 
    alt="${title}"
  />
  <div class="movie-info">
    <h3>${title}</h3>
    <span class="${getColor(vote_average)}">${vote_average}</span>
  </div>

  <div class="overview">
    <h3>Overview</h3>
   ${overview}
   <br/>
   <button class='know-more' id=${id}>Know More</button>
  </div>`;

    main.appendChild(movieEl);

    document.getElementById(id).addEventListener("click", () => {
      console.log(id);
      openNav(movie);
    });
  });
}

// -------------------overlay開關---------------------

function openNav(movie) {
  // 取得電影影片資訊
  let movie_id = movie.id;
  fetch(`${BASE_URL}/movie/${movie_id}/videos?${API_KEY}`)
    .then((res) => res.json())
    .then((videoData) => {
      console.log(videoData);
      if (videoData) {
        // opennav
        document.getElementById("myNav").style.width = "100%";
        if (videoData.results.length > 0) {
          let embed = [];
          let dots = [];
          videoData.results.forEach((video, index) => {
            let { name, key, site } = video;
            if (site == "YouTube") {
              embed.push(
                `<iframe width="560" height="315" src="https://www.youtube.com/embed/${key}" title="${name}" class='embed hide' frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
              );

              dots.push(`<span class='dot'>${index + 1}</span>`);
            }
          });

          let content = `<h1 class='video-title'>${
            movie.original_title
          }</h1><br>${embed.join("")}
          <div class='dots'>${dots.join("")}</div>`;
          overlayContent.innerHTML = content;
          showVideos();
        } else {
          overlayContent.innerHTML = `<h1 class='noresult'>No results found.</h1>`;
        }
      }
    });
}

function showVideos() {
  let embedClasses = document.querySelectorAll(".embed");
  let dots = document.querySelectorAll(".dot");
  totalVideos = embedClasses.length;
  embedClasses.forEach((embedTag, index) => {
    if (activeSlide == index) {
      embedTag.classList.add("show");
      embedTag.classList.remove("hide");
    } else {
      embedTag.classList.add("hide");
      embedTag.classList.remove("show");
    }
  });

  dots.forEach((dot, index) => {
    if (activeSlide == index) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });
}

leftArrow.addEventListener("click", () => {
  if (activeSlide > 0) {
    activeSlide--;
  } else {
    activeSlide = totalVideos - 1;
  }
  showVideos();
});

rightArrow.addEventListener("click", () => {
  if (activeSlide == totalVideos - 1) {
    activeSlide = 0;
  } else {
    activeSlide++;
  }
  showVideos();
});

function closeNav() {
  document.getElementById("myNav").style.width = "0%";
}

// -------------------評分字體色彩---------------------
function getColor(vote) {
  if (vote >= 8) {
    return "green";
  } else if (vote >= 5) {
    return "orange";
  } else {
    return "red";
  }
}

// -------------------搜尋功能---------------------
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const searchTerm = search.value;

  if (searchTerm) {
    getMovies(SEARCH_URL + "&query=" + searchTerm);
  } else {
    getMovies(API_URL);
  }
});
