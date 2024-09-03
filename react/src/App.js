import React, { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import LinkList from "./components/LinkList";
import axios from "axios";

const GlobalStyle = createGlobalStyle`
  body {
    background-color: #000;
    color: #fff;
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
  }
`;

const AppContainer = styled.div`
  text-align: center;
  padding: 20px;
`;

const Header = styled.h1`
  font-size: 3rem;
  margin-bottom: 20px;
  color: #ffeb3b;
`;

const Separator = styled.hr`
  margin: 20px 0;
  border: none;
  border-top: 1px solid #555;
`;

const Select = styled.select`
  background-color: #333;
  color: #fff;
  border: 1px solid #555;
  padding: 10px;
  font-size: 1rem;
  margin-bottom: 20px;
`;

function App() {
  const [links, setLinks] = useState([]);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    // URL에서 user_uuid 추출
    const urlParams = new URLSearchParams(window.location.search);
    const uuid = urlParams.get("user_uuid");

    if (uuid) {
      // 로컬 IP를 사용하여 API 요청
      const apiUrl = `http://218.209.108.191:8000/api/links/?user_uuid=${uuid}`;

      console.log("Sending request to API:", apiUrl); // 요청 URL을 로그로 출력

      axios
        .get(apiUrl)
        .then((response) => {
          console.log("Received response:", response.data); // 응답 데이터 로그
          setLinks(response.data);
        })
        .catch((error) => {
          console.error("Error fetching data:", error); // 오류 로그
        });
    } else {
      console.error("No UUID found in URL parameters.");
    }
  }, []); // 빈 배열을 사용하여, 컴포넌트가 처음 마운트될 때만 실행되도록 설정

  const handleKeywordRemove = (link, keyword) => {
    const updatedKeywords = link.keywords.filter((kw) => kw !== keyword);
    const updatedLink = { ...link, keywords: updatedKeywords };

    console.log(`Removing keyword ${keyword} from link`, link);

    axios
      .put(`http://218.209.108.191:8000/api/links/${link.id}/`, updatedLink)
      .then((response) => {
        console.log("Keyword removed, updated link:", response.data);
        setLinks(links.map((l) => (l.id === link.id ? response.data : l)));
      })
      .catch((error) => {
        console.error("Error updating link:", error);
      });
  };

  const handleKeywordAdd = (link, newKeyword) => {
    const updatedLink = { ...link, keywords: [...link.keywords, newKeyword] };

    console.log(`Adding keyword ${newKeyword} to link`, link);

    axios
      .put(`http://218.209.108.191:8000/api/links/${link.id}/`, updatedLink)
      .then((response) => {
        console.log("Keyword added, updated link:", response.data);
        setLinks(links.map((l) => (l.id === link.id ? response.data : l)));
      })
      .catch((error) => {
        console.error("Error updating link:", error);
      });
  };

  const handleDelete = (id) => {
    console.log(`Deleting link with ID ${id}`);

    axios
      .delete(`http://218.209.108.191:8000/api/links/${id}/`)
      .then(() => {
        console.log("Link deleted successfully.");
        setLinks(links.filter((link) => link.id !== id));
      })
      .catch((error) => {
        console.error("Error deleting link:", error);
      });
  };

  const filteredLinks =
    keyword === ""
      ? links // "All"을 선택했을 때 모든 링크를 보여줌
      : links.filter((link) => link.keywords.includes(keyword));

  const uniqueKeywords = Array.isArray(links)
    ? [...new Set(links.flatMap((link) => link.keywords))]
    : [];

  return (
    <AppContainer>
      <GlobalStyle />
      <Header>My Links</Header>
      <Select value={keyword} onChange={(e) => setKeyword(e.target.value)}>
        <option value="">All</option>
        {uniqueKeywords.map((kw, index) => (
          <option key={index} value={kw}>
            {kw}
          </option>
        ))}
      </Select>
      <Separator />
      <LinkList
        links={filteredLinks}
        onKeywordRemove={handleKeywordRemove}
        onKeywordAdd={handleKeywordAdd}
        onDelete={handleDelete}
      />
    </AppContainer>
  );
}

export default App;
