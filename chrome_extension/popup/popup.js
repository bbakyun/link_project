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
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        document.getElementById("title").innerText = data.title || "No Title";
        document.getElementById("description").innerText =
          data.summary || "No Summary";
        document.getElementById("thumbnail").src =
          data.image_url || "default-thumbnail.png";

        const keywordsDiv = document.getElementById("keywords");
        keywordsDiv.innerHTML = ""; // Clear existing content
        data.keywords.forEach((keyword) => {
          const keywordButton = document.createElement("button");
          keywordButton.className = "keyword-button";
          keywordButton.innerText = keyword;
          keywordsDiv.appendChild(keywordButton);
        });

        // 데이터베이스에 저장할 데이터 준비
        addButton.addEventListener("click", () => {
          const title = document.getElementById("title").innerText;
          const description = document.getElementById("description").innerText;
          const image_url = document.getElementById("thumbnail").src;
          const keywords = Array.from(
            document.getElementsByClassName("keyword-button")
          ).map((button) => button.innerText);

          fetch("http://127.0.0.1:8000/api/links/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url,
              title,
              description,
              keywords,
              image_url,
            }),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            })
            .then((data) => {
              alert("Link added successfully!");
            })
            .catch((error) => {
              console.error("Error adding link:", error);
            });
        });
      })
      .catch((error) => {
        console.error("Error fetching data from server:", error);
      });
  });

  // "My Links" 버튼 클릭 시 React 앱으로 이동
  mylinksButton.addEventListener("click", () => {
    window.open("http://localhost:3000");
  });
});
