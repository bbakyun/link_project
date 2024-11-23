import React, { useState } from "react";
import styled from "styled-components";

const ItemContainer = styled.div`
  border: 1px solid #555;
  border-radius: 8px;
  padding: 10px;
  margin: 10px;
  width: 250px; /* 박스의 고정된 너비 설정 */
  text-align: left;
  background-color: #222;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 150px; /* 썸네일 고정 높이 설정 */
  object-fit: cover; /* 썸네일 비율을 유지하며 크기 조정 */
  border-radius: 4px;
`;

const Title = styled.a`
  font-size: 1.2rem;
  color: #ffeb3b;
  margin: 10px 0;
  text-decoration: none;
  white-space: normal; /* 여러 줄로 표시될 수 있도록 설정 */
  &:hover {
    text-decoration: underline;
  }
`;

const Description = styled.p`
  font-size: 0.9rem;
  margin: 10px 0;
  color: #fff;
  overflow: hidden;
`;

const KeywordsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: auto;
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

const DeleteButton = styled.button`
  background-color: #ff0000;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 5px 10px;
  font-size: 0.8rem;
  margin-top: 5px;
  cursor: pointer;
`;

function LinkItem({ link, onKeywordRemove, onKeywordAdd, onDelete }) {
  const { id, image_url, title, description, keywords, url } = link; // `url` 추가
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

  const handleDelete = () => {
    if (window.confirm("이 링크를 삭제하시겠습니까?")) {
      onDelete(id);
    }
  };

  return (
    <ItemContainer>
      {image_url && <Thumbnail src={image_url} alt={title} />}
      {/* 제목을 a 태그로 링크 처리 */}
      <Title href={url} target="_blank" rel="noopener noreferrer">
        {title}
      </Title>
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
      <DeleteButton onClick={handleDelete}>Delete Link</DeleteButton>
    </ItemContainer>
  );
}

export default LinkItem;
