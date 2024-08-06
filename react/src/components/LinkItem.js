import React, { useState } from "react";
import styled from "styled-components";

const ItemContainer = styled.div`
  border: 1px solid #555;
  border-radius: 8px;
  padding: 10px;
  margin: 10px;
  width: 200px;
  text-align: left;
  background-color: #222;
`;

const Thumbnail = styled.img`
  width: 100%;
  height: auto;
  border-radius: 4px;
`;

const Title = styled.h2`
  font-size: 1.2rem;
  color: #ffeb3b;
  margin: 10px 0;
`;

const Description = styled.p`
  font-size: 0.9rem;
  margin: 10px 0;
  color: #fff;
`;

const KeywordsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
`;

const Keyword = styled.span`
  background-color: #ffeb3b;
  color: #000;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  cursor: pointer;
`;

const KeywordInput = styled.input`
  background-color: #333;
  color: #fff;
  border: 1px solid #555;
  padding: 5px;
  border-radius: 8px;
  font-size: 0.8rem;
  margin-top: 10px;
  width: calc(100% - 22px);
`;

const AddKeywordButton = styled.button`
  background-color: #ffeb3b;
  color: #000;
  border: none;
  border-radius: 8px;
  padding: 5px 10px;
  font-size: 0.8rem;
  margin-top: 5px;
  cursor: pointer;
`;

function LinkItem({ link, onKeywordRemove, onKeywordAdd }) {
  const { url, title, description, keywords } = link;
  const [newKeyword, setNewKeyword] = useState("");

  const handleKeywordRemove = (keyword) => {
    if (window.confirm(`해당 키워드를 지우시겠습니까?`)) {
      onKeywordRemove(link, keyword);
    }
  };

  const handleKeywordAdd = () => {
    if (
      newKeyword &&
      !keywords.includes(newKeyword) &&
      window.confirm(`해당 키워드를 추가하시겠습니까?`)
    ) {
      onKeywordAdd(link, newKeyword);
      setNewKeyword("");
    }
  };

  return (
    <ItemContainer>
      <Thumbnail src={url} alt={title} />
      <Title>{title}</Title>
      <Description>{description}</Description>
      <KeywordsContainer>
        {keywords.map((kw, index) => (
          <Keyword key={index} onClick={() => handleKeywordRemove(kw)}>
            {kw}
          </Keyword>
        ))}
      </KeywordsContainer>
      <KeywordInput
        type="text"
        value={newKeyword}
        onChange={(e) => setNewKeyword(e.target.value)}
        placeholder="Add a keyword"
      />
      <AddKeywordButton onClick={handleKeywordAdd}>
        Add Keyword
      </AddKeywordButton>
    </ItemContainer>
  );
}

export default LinkItem;
