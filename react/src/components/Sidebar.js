import React from "react";
import styled from "styled-components";

const SidebarContainer = styled.div`
  position: sticky;
  top: 0;
  background-color: #222;
  color: #fff;
  padding: 20px;
  border-right: 1px solid #555;
  height: 100vh;
  overflow-y: auto;
  min-width: 200px;
`;

const CategoryHeader = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 20px;
  color: #ffeb3b;
`;

const CategoryButton = styled.button`
  background-color: ${(props) => (props.active ? "#87CEFA" : "#555")};
  color: ${(props) => (props.active ? "#000" : "#fff")};
  border: none;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  font-weight: ${(props) => (props.active ? "bold" : "normal")};
  width: 100%;
  text-align: left;

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
