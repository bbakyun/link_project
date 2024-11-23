import React, { useState } from "react";
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

const AddCategoryInput = styled.input`
  background-color: #333;
  color: #fff;
  border: 1px solid #555;
  padding: 8px;
  margin-top: 10px;
  border-radius: 8px;
  width: calc(100% - 16px);
`;

const AddCategoryButton = styled.button`
  background-color: #ffeb3b;
  color: #000;
  border: none;
  padding: 8px;
  margin-top: 5px;
  border-radius: 8px;
  width: 100%;
  cursor: pointer;

  &:hover {
    background-color: #ffd700;
  }
`;

function Sidebar({
  categories,
  selectedCategories,
  onCategorySelect,
  onAddCategory,
}) {
  const [newCategory, setNewCategory] = useState("");

  const handleAddCategory = () => {
    if (newCategory.trim() === "") {
      alert("카테고리를 입력해주세요.");
      return;
    }
    onAddCategory(newCategory.trim());
    setNewCategory("");
  };

  return (
    <SidebarContainer>
      <CategoryHeader>Categories</CategoryHeader>
      {categories.map((category) => (
        <CategoryButton
          key={category.id}
          active={selectedCategories.includes(category.name)}
          onClick={() => onCategorySelect(category.name)}
        >
          {category.name}
        </CategoryButton>
      ))}
      <AddCategoryInput
        type="text"
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
        placeholder="Add new category"
      />
      <AddCategoryButton onClick={handleAddCategory}>
        Add Category
      </AddCategoryButton>
    </SidebarContainer>
  );
}

export default Sidebar;
