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
      axios
        .get(`http://192.168.1.108:8000/api/links/?user_uuid=${uuid}`)
        .then((response) => {
          setLinks(response.data);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    } else {
      console.error("No UUID found in URL parameters.");
    }
  }, []); // 빈 배열을 사용하여, 컴포넌트가 처음 마운트될 때만 실행되도록 설정

  const handleKeywordRemove = (link, keyword) => {
    const updatedKeywords = link.keywords.filter((kw) => kw !== keyword);
    const updatedLink = { ...link, keywords: updatedKeywords };

    axios
      .put(`http://192.168.1.108:8000/api/links/${link.id}/`, updatedLink)
      .then((response) => {
        setLinks(links.map((l) => (l.id === link.id ? response.data : l)));
      })
      .catch((error) => {
        console.error("Error updating link:", error);
      });
  };

  const handleKeywordAdd = (link, newKeyword) => {
    const updatedLink = { ...link, keywords: [...link.keywords, newKeyword] };

    axios
      .put(`http://192.168.1.108:8000/api/links/${link.id}/`, updatedLink)
      .then((response) => {
        setLinks(links.map((l) => (l.id === link.id ? response.data : l)));
      })
      .catch((error) => {
        console.error("Error updating link:", error);
      });
  };

  const handleDelete = (id) => {
    axios
      .delete(`http://192.168.1.108:8000/api/links/${id}/`)
      .then(() => {
        setLinks(links.filter((link) => link.id !== id));
      })
      .catch((error) => {
        console.error("Error deleting link:", error);
      });
  };

  const filteredLinks = keyword
    ? links.filter((link) => link.keywords.includes(keyword))
    : links;

  const uniqueKeywords = [...new Set(links.flatMap((link) => link.keywords))];

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
