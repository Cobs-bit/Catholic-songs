// ========== Basic page switch ==========
function showPage(pageId) {
  const pages = document.querySelectorAll(".page");
  pages.forEach(page => page.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
}

// ========== Elements ==========
const adminStatus = document.getElementById("adminStatus");
const adminLogoutBtn = document.getElementById("adminLogout");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminPassInput = document.getElementById("adminPass");
const songForm = document.getElementById("songForm");

// ========== Data (localStorage) ==========
let approvedSongs = JSON.parse(localStorage.getItem("approvedSongs")) || [];
let pendingSongs = JSON.parse(localStorage.getItem("pendingSongs")) || [];

// ========== Utilities ==========
function saveData(){
  localStorage.setItem("approvedSongs", JSON.stringify(approvedSongs));
  localStorage.setItem("pendingSongs", JSON.stringify(pendingSongs));
}

function cleanText(text){
  text = text.trim().replace(/\s+/g, ' ');
  return text.split('\n').map(line => {
    line = line.trim();
    return line ? (line.charAt(0).toUpperCase() + line.slice(1)) : '';
  }).join('\n');
}

// ========== Render functions ==========
function renderApproved() {
  const list = document.getElementById("approvedSongs");
  list.innerHTML = "";
  if(approvedSongs.length === 0){
    list.innerHTML = "<li>Nta ndirimbo zemejwe kugeza ubu</li>";
    return;
  }
  approvedSongs.forEach((song, index) => {
    const li = document.createElement("li");
    const title = document.createElement("h3");
    title.textContent = song.title;
    const pre = document.createElement("pre");
    pre.textContent = song.lyrics;

    li.appendChild(title);
    li.appendChild(pre);

    // show edit/delete only if admin mode on
    if(!adminStatus.classList.contains("hidden")){
      const editBtn = document.createElement("button");
      editBtn.className = "small";
      editBtn.textContent = "Edit";
      editBtn.onclick = () => editSong(index);
      li.appendChild(editBtn);

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "small danger";
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = () => deleteSong(index);
      li.appendChild(deleteBtn);
    }

    list.appendChild(li);
  });
}

function renderPending() {
  const list = document.getElementById("pendingSongs");
  list.innerHTML = "";
  if(pendingSongs.length === 0){
    list.innerHTML = "<li>Nta submissions</li>";
    return;
  }
  pendingSongs.forEach((song,index) => {
    const li = document.createElement("li");

    const title = document.createElement("h3");
    title.textContent = song.title;
    const pre = document.createElement("pre");
    pre.textContent = song.lyrics;

    li.appendChild(title);
    li.appendChild(pre);

    const approveBtn = document.createElement("button");
    approveBtn.className = "small approve";
    approveBtn.textContent = "Approve";
    approveBtn.onclick = () => approveSong(index);
    li.appendChild(approveBtn);

    const rejectBtn = document.createElement("button");
    rejectBtn.className = "small danger";
    rejectBtn.textContent = "Reject";
    rejectBtn.onclick = () => rejectSong(index);
    li.appendChild(rejectBtn);

    list.appendChild(li);
  });
}

// ========== Actions ==========
function approveSong(index){
  approvedSongs.push(pendingSongs[index]);
  pendingSongs.splice(index,1);
  saveData();
  renderApproved();
  renderPending();
}

function rejectSong(index){
  pendingSongs.splice(index,1);
  saveData();
  renderPending();
}

function editSong(index){
  const song = approvedSongs[index];
  let newTitle = prompt("Hindura izina ry'indirimbo:", song.title);
  let newLyrics = prompt("Hindura indirimbo:", song.lyrics);

  if(newTitle !== null && newLyrics !== null){
    newTitle = cleanText(newTitle);
    newLyrics = cleanText(newLyrics);
    approvedSongs[index] = {title: newTitle, lyrics: newLyrics};
    saveData();
    renderApproved();
    alert("Indirimbo yahinduwe neza!");
  }
}

function deleteSong(index){
  if(confirm("Urashaka koko gusiba iyi ndirimbo?")){
    approvedSongs.splice(index,1);
    saveData();
    renderApproved();
    alert("Indirimbo yasibwe neza!");
  }
}

// ========== Submission (users) ==========
songForm.addEventListener("submit", function(e){
  e.preventDefault();
  let title = document.getElementById("title").value;
  let lyrics = document.getElementById("lyrics").value;

  title = cleanText(title);
  lyrics = cleanText(lyrics);

  pendingSongs.push({title,lyrics});
  saveData();
  songForm.reset();
  alert("Indirimbo yoherejwe! Irategereje kwemerwa na Admin.");
});

// ========== Admin login logic (with red input on wrong password) ==========
const ADMIN_PASSWORD = "admin123"; // ushobora guhindura

adminLoginForm.addEventListener("submit", function(e){
  e.preventDefault();
  const pass = adminPassInput.value;

  // clear previous error look
  adminPassInput.classList.remove("input-error");

  if(pass === ADMIN_PASSWORD){
    // success: show pending panel and admin status
    document.getElementById("pendingPanel").classList.remove("hidden");
    adminStatus.classList.remove("hidden");
    renderPending();
    renderApproved();
    // clear input and error state
    adminPassInput.value = "";
    adminPassInput.classList.remove("input-error");
    alert("Admin yinjiye neza!");
  } else {
    // WRONG password -> style input red (no alert)
    adminPassInput.classList.add("input-error");
    // optionally focus the input for quick retry
    adminPassInput.focus();
  }
});

// remove red error style when user starts typing again
adminPassInput.addEventListener("input", function(){
  if(adminPassInput.classList.contains("input-error")){
    adminPassInput.classList.remove("input-error");
  }
});

// ========== Admin logout ==========
adminLogoutBtn.addEventListener("click", function(){
  document.getElementById("pendingPanel").classList.add("hidden");
  adminStatus.classList.add("hidden");
  renderApproved(); // re-render to hide admin-only buttons
  alert("Admin yasohotse!");
});

// ========== Initial render ==========
renderApproved();
