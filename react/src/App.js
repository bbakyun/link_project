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

const UrlInput = styled.input`
  background-color: #333;
  color: #fff;
  border: 1px solid #555;
  padding: 10px;
  font-size: 1rem;
  margin-bottom: 20px;
  width: 60%;
`;

const SubmitButton = styled.button`
  background-color: #ffeb3b;
  color: #000;
  border: none;
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
`;

function App() {
  const [links, setLinks] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/links/")
      .then((response) => {
        setLinks(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const handleKeywordRemove = (link, keyword) => {
    const updatedKeywords = link.keywords.filter((kw) => kw !== keyword);
    const updatedLink = { ...link, keywords: updatedKeywords };

    axios
      .put(`http://localhost:8000/api/links/${link.id}/`, updatedLink)
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
      .put(`http://localhost:8000/api/links/${link.id}/`, updatedLink)
      .then((response) => {
        setLinks(links.map((l) => (l.id === link.id ? response.data : l)));
      })
      .catch((error) => {
        console.error("Error updating link:", error);
      });
  };

  const handleUrlSubmit = () => {
    axios
      .post("http://localhost:8000/api/links/extract_from_url/", { url })
      .then((response) => {
        // URL에서 데이터를 추출하여 바로 저장하지 않고, Add to My Links 버튼 클릭 시 저장하도록 합니다.
        setLinks([...links, response.data]);
        setUrl("");
      })
      .catch((error) => {
        console.error("Error extracting data from URL:", error);
      });
  };

  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:8000/api/links/${id}/`)
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
      <Separator />
      <UrlInput
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL"
      />
      <SubmitButton onClick={handleUrlSubmit}>Submit</SubmitButton>
      <Separator />
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
        onDelete={handleDelete} // 삭제 핸들러를 LinkList로 전달합니다.
      />
    </AppContainer>
  );
}

export default App;
