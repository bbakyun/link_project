import React from "react";
import styled from "styled-components";

const SidebarContainer = styled.div`
  position: fixed;
  left: 20px; /* 화면 왼쪽에서의 간격 */
  top: 50%; /* 화면 중앙 */
  transform: translateY(-50%); /* 세로 정중앙 정렬 */
  background-color: #222;
  color: #fff;
  padding: 20px;
  border-radius: 50px; /* 둥근 타원형 모양 */
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.5); /* 그림자 효과 */
  width: 200px; /* 사이드바 너비 */
  z-index: 1000; /* 다른 요소보다 위에 위치하도록 */
  transition: all 0.3s ease; /* 애니메이션 효과 */
`;

const CategoryHeader = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 20px;
  color: #ffeb3b;
  text-align: center;
`;

const CategoryButton = styled.button`
  background-color: ${(props) => (props.active ? "#87CEFA" : "#555")};
  color: ${(props) => (props.active ? "#000" : "#fff")};
  border: none;
  border-radius: 20px; /* 버튼도 둥근 모양 */
  padding: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  font-weight: ${(props) => (props.active ? "bold" : "normal")};
  width: 100%;
  text-align: center;

  &:hover {
    background-color: ${(props) => (props.active ? "#00BFFF" : "#666")};
  }
`;

function Sidebar({ categories, selectedCategories, onCategorySelect }) {
  const uniqueCategories = Array.from(new Set(categories)); // 중복 제거

  return (
    <SidebarContainer>
      <CategoryHeader>Categories</CategoryHeader>
      {uniqueCategories.map((category) => (
        <CategoryButton
          key={category}
          active={selectedCategories.includes(category)}
          onClick={() => onCategorySelect(category)}
        >
          {category}
        </CategoryButton>
      ))}
    </SidebarContainer>
  );
}

export default Sidebar;
