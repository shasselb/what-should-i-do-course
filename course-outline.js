const COURSE_VIDEOS_KEY = "what-should-i-do-course-videos-v1";
const defaultVideos = [{ id: "HW19Q6F3-3Q", title: "Course Introduction" }];
const frame = document.getElementById("youtubeFrame");
const player = document.getElementById("videoPlayer");
const playlist = document.getElementById("videoPlaylist");

function loadVideos() {
  try {
    const saved = JSON.parse(localStorage.getItem(COURSE_VIDEOS_KEY));
    return Array.isArray(saved) ? saved : defaultVideos;
  } catch { return defaultVideos; }
}

function escapeHtml(value) { const div = document.createElement("div"); div.textContent = value; return div.innerHTML; }

function playVideo(video, button) {
  frame.src = `https://www.youtube-nocookie.com/embed/${video.id}`;
  frame.title = video.title;
  player.hidden = false;
  document.querySelectorAll(".video-playlist button").forEach(item => item.classList.remove("active"));
  if (button) button.classList.add("active");
}

const videos = loadVideos();
playlist.innerHTML = videos.map((video, index) => `<button type="button" data-video-index="${index}"><span>${String(index + 1).padStart(2,"0")}</span>${escapeHtml(video.title)}</button>`).join("");
playlist.addEventListener("click", event => {
  const button = event.target.closest("[data-video-index]");
  if (button) playVideo(videos[Number(button.dataset.videoIndex)], button);
});
if (videos.length) playVideo(videos[0], playlist.querySelector("button"));
