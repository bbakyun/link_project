document.addEventListener("DOMContentLoaded", () => {
  const addButton = document.getElementById("add-button");
  const mylinksButton = document.getElementById("mylinks-button");

  // 현재 탭의 URL을 가져와 Django 서버에 요청
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0].url;

    fetch("http://127.0.0.1:8000/api/extract_from_url/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    })
      .then((response) => response.json())
      .then((data) => {
        document.getElementById("thumbnail").src =
          data.image_url || "default-thumbnail.png";
        document.getElementById("description").innerText = data.summary;
        document.getElementById("keywords").innerText =
          data.keywords.join(", ");
      })
      .catch((error) => {
        console.error("Error fetching data from server:", error);
      });
  });

  // "Add to My Links" 버튼 클릭 시 데이터 저장
  addButton.addEventListener("click", () => {
    const url = document.getElementById("thumbnail").src;
    const description = document.getElementById("description").innerText;
    const keywords = document.getElementById("keywords").innerText.split(", ");

    fetch("http://127.0.0.1:8000/api/links/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, description, keywords }),
    })
      .then((response) => response.json())
      .then((data) => {
        alert("Link added successfully!");
      })
      .catch((error) => {
        console.error("Error adding link:", error);
      });
  });

  // "My Links" 버튼 클릭 시 React 앱으로 이동
  mylinksButton.addEventListener("click", () => {
    window.open("http://192.168.1.108:3000");
  });
});
