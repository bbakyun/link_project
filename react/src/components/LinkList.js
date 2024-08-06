import React from "react";
import styled from "styled-components";
import LinkItem from "./LinkItem";

const ListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

function LinkList({ links, onKeywordRemove, onKeywordAdd }) {
  return (
    <ListContainer>
      {links.map((link, index) => (
        <LinkItem
          key={index}
          link={link}
          onKeywordRemove={onKeywordRemove}
          onKeywordAdd={onKeywordAdd}
        />
      ))}
    </ListContainer>
  );
}

export default LinkList;
