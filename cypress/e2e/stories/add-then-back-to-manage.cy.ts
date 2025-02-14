import { addItem } from "../../services/add-item.service";

import { time } from "../../data/timer.data";

describe("Add item then go to back to manage", () => {
  it("should have a clear form", () => {
    // ** Arrange
    cy.visit("http://localhost:8080/#list");
    const itemTitle = "goose";

    // ** Act
    addItem(itemTitle);

    cy.wait(time);

    const addButton = cy.get("button#add-button");
    addButton.click();

    cy.wait(time);

    // ** Assert
    const titleField = cy.get("input[name=title]");
    titleField.should("have.value", "");
  });
});
