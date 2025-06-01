//categories structure
//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]
document.addEventListener("DOMContentLoaded", function (e) {
  //How to Play
  //click once to see question
  //double click to see answer
  alert(
    "For areas with a price amount, Click once to see the question and double click to see the corresponding answer!"
  );

  //Setting up DOM manipulation elements
  //create Jeopardy title for game, along with start button, and loader
  const h1 = document.createElement("h1");
  const p = document.createElement("p");
  p.classList.add("loader");
  h1.innerText = "Jeopardy!";
  h1.classList.add("title");
  const start = document.createElement("button");
  start.innerText = "Start!";
  start.classList.add("startButton");
  const body = document.querySelector("body");
  const div = document.createElement("div");
  body.appendChild(h1);
  body.appendChild(start);
  body.appendChild(p);

  //create table elements
  const table = document.createElement("table");
  body.appendChild(div);
  table.classList.add("info");
  div.appendChild(table);
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");
  let tds = document.getElementsByClassName("tds");
  let ths = document.getElementsByClassName("ths");

  //create table once, game board with all ? marks
  for (let i = 0; i < 6; i++) {
    let tr = document.createElement("tr");
    let th = document.createElement("th");
    th.classList.add("ths");
    th.innerText = "?";
    tr.appendChild(th);
    thead.appendChild(tr);
    table.appendChild(thead);
    let price = 100;
    for (let j = 0; j < 5; j++) {
      let bodyTd = document.createElement("td");
      bodyTd.classList.add("tds");
      bodyTd.innerText = "?";
      tr.appendChild(bodyTd);
      tbody.appendChild(tr);
      table.appendChild(tbody);
    }
    div.appendChild(table);
  }
  //at the start of the game hide the table
  table.style.display = "none";

  /** On click of start / restart button, set up game. */
  start.addEventListener("click", function (e) {
    setupAndStart();
  });

  /** Get NUM_CATEGORIES random category from API.
   *
   * Returns an array of category ids
   */

  async function getCategoryIds() {
    const randIdxArr = [];
    let categories = [];
    const res = await axios.get(
      "https://rithm-jeopardy.herokuapp.com/api/categories?count=100"
    );
    while (categories.length < 6) {
      //retrieve a random category
      let randIdx = Math.floor(Math.random() * res.data.length);
      if (randIdxArr.indexOf(randIdx) === -1) {
        categories.push(res.data[randIdx].id);
        randIdxArr.push(randIdx);
      }
    }
    return categories;
  }

  /** Returns an object with data about a category:
   *
   *  Returns { title: "Math", clues: clue-array }
   *
   * Where clue-array is:
   *   [
   *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
   *      {question: "Bell Jar Author", answer: "Plath", showing: null},
   *      ...
   *   ]
   */

  async function getCategory(catId) {
    const res = await axios.get(
      `https://rithm-jeopardy.herokuapp.com/api/category?id=${catId}`
    );
    return {
      title: res.data.title,
      clues: res.data.clues,
    };
  }

  /** Fills the HTML table(jeopardy game board) with the table headers as categories & table body cells for questions/answers.*/
  async function fillTable() {
    let arr = [];
    let count = 0;
    //get an array of random categories
    arr = await getCategoryIds();
    for (let i = 0; i < arr.length; i++) {
      const info = await getCategory(arr[i]);
      const clues = info.clues;
      const title = info.title;
      ths[i].innerText = title;
      // show price on game board
      let price = 100;
      for (let j = 0; j < 5; j++) {
        tds[count].innerText = `$ ${price}`;
        //set attributes for question, answer, and showing property
        tds[count].setAttribute("question", clues[j].question);
        tds[count].setAttribute("answer", clues[j].answer);
        tds[count].setAttribute("showing", clues[j].showing);
        tds[count].style.backgroundColor = "";
        tds[count].addEventListener("click", handleClick);
        count += 1; //loop through all tds
        price += 100;
      }
    }
  }
  //  Handles clicking on a clue: show the question or answer.
  async function handleClick(evt) {
    // if currently null, show question & set .showing to "question"
    if (evt.target.getAttribute("showing") === "undefined") {
      evt.target.innerHTML = evt.target.getAttribute("question");
      evt.target.setAttribute("showing", evt.target.getAttribute("question"));
      //  * - if currently "question", show answer & set .showing to "answer"
    } else if (
      evt.target.getAttribute("showing") === evt.target.getAttribute("question")
    ) {
      evt.target.addEventListener("dblclick", function (e) {
        evt.target.innerHTML = evt.target.getAttribute("answer");
        evt.target.style.backgroundColor = "green";
        evt.target.setAttribute("showing", evt.target.getAttribute("answer"));
      });
    }
    //  * - if currently "answer", ignore click
  }

  /** Wipes the current Jeopardy board, shows the loading spinner,
   * and updates the button used to fetch data.
   */

  function showLoadingView() {
    start.innerText = "Loading...";
    const load = document.querySelector(".loader");
    load.style.display = "block";
  }

  /** Removes the loading spinner and updates the button used to fetch data. */

  function hideLoadingView() {
    const load = document.querySelector(".loader");
    start.innerText = "Restart!";
    load.style.display = "none";
  }

  /** Start game:
   *
   * - get random category Ids
   * - get data for each category
   * - create an HTML table(jeopardy game board)
   * */

  //  simulating loading functionality
  function delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  //function to start up a new game
  async function setupAndStart() {
    table.style.display = "none";
    showLoadingView();
    await delay(1000);
    fillTable();
    table.style.display = "block";
    hideLoadingView();
  }
});
