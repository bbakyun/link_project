import React, { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import LinkList from "./components/LinkList";

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

const sampleLinks = [
  {
    url: "https://via.placeholder.com/200",
    title: "Placeholder Image 1",
    description: "Example Link 1 Description",
    keywords: ["react", "javascript", "web"],
  },
  {
    url: "https://via.placeholder.com/200",
    title: "Placeholder Image 2",
    description: "Example Link 2 Description",
    keywords: ["css", "html", "design"],
  },
  {
    url: "https://via.placeholder.com/200",
    title: "Placeholder Image 3",
    description: "Example Link 3 Description",
    keywords: ["react", "redux", "state management"],
  },
  {
    url: "https://via.placeholder.com/200",
    title: "Placeholder Image 4",
    description: "Example Link 4 Description",
    keywords: ["nodejs", "express", "backend"],
  },
  {
    url: "https://via.placeholder.com/200",
    title: "Placeholder Image 5",
    description: "Example Link 5 Description",
    keywords: ["database", "sql", "nosql"],
  },
  {
    url: "https://via.placeholder.com/200",
    title: "Placeholder Image 6",
    description: "Example Link 6 Description",
    keywords: ["api", "rest", "graphql"],
  },
  {
    url: "https://via.placeholder.com/200",
    title: "Placeholder Image 7",
    description: "Example Link 7 Description",
    keywords: ["testing", "jest", "react"],
  },
  {
    url: "https://via.placeholder.com/200",
    title: "Placeholder Image 8",
    description: "Example Link 8 Description",
    keywords: ["typescript", "javascript", "programming"],
  },
  {
    url: "https://via.placeholder.com/200",
    title: "Placeholder Image 9",
    description: "Example Link 9 Description",
    keywords: ["frontend", "backend", "fullstack"],
  },
  {
    url: "https://via.placeholder.com/200",
    title: "Placeholder Image 10",
    description: "Example Link 10 Description",
    keywords: ["devops", "docker", "kubernetes"],
  },
];

function App() {
  
  const [links, setLinks] = useState([]);
  const [keyword, setKeyword] = useState("");
  //데이터베이스, logic 서버 구현 전까지 샘플 링크와 로컬 스토리지 사용
  
  useEffect(() => {
    const storedLinks = localStorage.getItem("links");
    if (storedLinks) {
      setLinks(JSON.parse(storedLinks));
    } else {
      setLinks(sampleLinks);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("links", JSON.stringify(links));
  }, [links]);

  const handleKeywordRemove = (link, keyword) => {
    setLinks(
      links.map((l) =>
        l === link
          ? { ...l, keywords: l.keywords.filter((kw) => kw !== keyword) }
          : l
      )
    );
  };

  const handleKeywordAdd = (link, newKeyword) => {
    setLinks(
      links.map((l) =>
        l === link ? { ...l, keywords: [...l.keywords, newKeyword] } : l
      )
    );
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
      />
    </AppContainer>
  );
}

export default App;
