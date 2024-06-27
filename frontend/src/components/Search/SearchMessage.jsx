import React from "react"
import { ListGroupMessage } from "../ListGroup"
import SearchResultsList from "./SearchResultsList"

export default function SearchMessage() {
  return (
    <SearchResultsList>
      <ListGroupMessage
        message={pgettext(
          "search cta",
          "What are you looking for? (at least 3 characters)"
        )}
      />
    </SearchResultsList>
  )
}
